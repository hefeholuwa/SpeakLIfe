import { supabase } from '../supabaseClient';

// Public VAPID Key (Note: In production, this should be an environment variable)
// You need to generate your own keys using `npx web-push generate-vapid-keys`
// Public VAPID Key - Generated via npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'BPH94Y0Ag6JPz4YRz-Vw2nRvdv5EGxH7Septgl12tQ9IH7Phh5zKqCsJe1aAW7nLNKNNP7X4hh8hdrXq5P8fFag';

class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    this.permission = 'Notification' in window ? Notification.permission : 'denied';
    this.registration = null;
  }

  // Helper to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Initialize service worker
  async init() {
    if (this.isSupported) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        return true;
      } catch (e) {
        console.error('SW not ready:', e);
        return false;
      }
    }
    return false;
  }

  // Subscribe to Push Notifications
  async subscribeToPush(userId) {
    if (!this.isSupported) return false;

    // 1. Ensure permission
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    // Prevent concurrent attempts
    if (this._isSubscribing) {
      console.log('Subscription already in progress, skipping...');
      return false;
    }
    this._isSubscribing = true;

    try {
      console.log('Starting push subscription process...');
      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      const targetKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      // Check if existing subscription is valid
      if (subscription) {
        const existingKey = subscription.options.applicationServerKey;

        // Compare keys (simple byte comparison)
        const isSameKey = existingKey &&
          new Uint8Array(existingKey).toString() === targetKey.toString();

        if (isSameKey) {
          console.log('Existing subscription is valid and uses correct VAPID key. Skipping re-subscribe.');
        } else {
          console.log('Existing subscription uses old key. Unsubscribing...');
          await subscription.unsubscribe();
          subscription = null;
          // Give the browser a moment to clean up
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Subscribe if needed
      if (!subscription) {
        console.log('Creating new subscription...');
        if (targetKey.length === 0) throw new Error('VAPID key conversion failed (empty key)');

        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: targetKey
          });
          console.log('New subscription created.');
        } catch (subscribeError) {
          // Specific handling for AbortError (common in Brave or offline)
          if (subscribeError.name === 'AbortError') {
            console.error('Push Service Aborted. If using Brave/Arc, enable Google Services for Push. If offline, check connection.');
            alert('Push notifications failed to start. If you are using Brave/Arc browser, please enable "Google Services for Push Messaging" in settings, or check your internet connection.');
            return false;
          }
          throw subscribeError;
        }
      }

      // 5. Save to Database (Always ensure DB is in sync)
      console.log('Syncing subscription to database...');
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
          user_agent: navigator.userAgent
        }, { onConflict: 'endpoint' });

      if (error) throw error;
      console.log('Database sync successful.');

      return true;

    } catch (error) {
      console.error('Subscription failed:', error);
      return false;
    } finally {
      this._isSubscribing = false;
    }
  }

  // --- In-App Notifications (Database) ---

  async getUserNotifications(userId) {
    try {
      // 1. Fetch all relevant notifications (global or targeted to user)
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`is_global.eq.true,user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // 2. Fetch read receipts for this user
      const { data: reads, error: readError } = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', userId);

      if (readError) throw readError;

      const readIds = new Set(reads.map(r => r.notification_id));

      // 3. Merge read status
      return notifications.map(n => ({
        ...n,
        is_read: readIds.has(n.id)
      }));
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  async markAsRead(userId, notificationId) {
    try {
      const { error } = await supabase
        .from('notification_reads')
        .upsert(
          [{ user_id: userId, notification_id: notificationId }],
          { onConflict: 'user_id, notification_id', ignoreDuplicates: true }
        )

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(userId, notificationIds) {
    try {
      const reads = notificationIds.map(id => ({
        user_id: userId,
        notification_id: id
      }));

      const { error } = await supabase
        .from('notification_reads')
        .upsert(reads, { onConflict: 'user_id, notification_id', ignoreDuplicates: true });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Register service worker for background notifications
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  // Simple local notification (deprecated mostly, but useful for testing)
  async sendNotification(title, options = {}) {
    if (this.permission === 'granted') {
      new Notification(title, options);
    }
  }

  // Schedule notification for later (Local)
  async scheduleNotification(title, options = {}, scheduledTime) {
    if (!this.isSupported || this.permission !== 'granted') {
      return false;
    }

    try {
      const delay = scheduledTime.getTime() - Date.now();

      if (delay <= 0) {
        return await this.sendNotification(title, options);
      }

      setTimeout(() => {
        this.sendNotification(title, options);
      }, delay);

      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  // Set up daily notifications
  async setupDailyNotifications() {
    // ... logic kept for legacy reminders if needed
    return true;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
