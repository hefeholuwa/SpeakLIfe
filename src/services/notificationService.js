import { supabase } from '../supabaseClient';

// Push Notification Service
// Handles browser notifications, service worker registration, and notification management

class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.registration = null;
  }

  // ... existing push notification methods ...

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
        .insert([{ user_id: userId, notification_id: notificationId }])
        .onConflict('user_id, notification_id')
        .ignore(); // If already exists, do nothing

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

  // ... existing methods ...

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission has been denied');
      return false;
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

  // Send immediate notification
  async sendNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot send notification: permission not granted');
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/sl-icon.ico',
        badge: '/sl-icon.ico',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Schedule notification for later
  async scheduleNotification(title, options = {}, scheduledTime) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot schedule notification: permission not granted');
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

  // Send daily verse notification
  async sendDailyVerseNotification(verse, confession) {
    const title = '📖 Daily Verse - SpeakLife';
    const options = {
      body: `${verse}\n\n${confession}`,
      tag: 'daily-verse',
      requireInteraction: true,
      actions: [
        {
          action: 'read',
          title: 'Read More',
          icon: '/sl-icon.ico'
        },
        {
          action: 'confess',
          title: 'Confess',
          icon: '/sl-icon.ico'
        }
      ]
    };

    return await this.sendNotification(title, options);
  }

  // Send confession reminder
  async sendConfessionReminder() {
    const title = '🙏 Confession Reminder - SpeakLife';
    const options = {
      body: 'Take a moment to reflect and confess your thoughts to God.',
      tag: 'confession-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'confess',
          title: 'Start Confessing',
          icon: '/sl-icon.ico'
        }
      ]
    };

    return await this.sendNotification(title, options);
  }

  // Send reading plan reminder
  async sendReadingPlanReminder(planName, reading) {
    const title = '📚 Reading Plan Reminder - SpeakLife';
    const options = {
      body: `${planName}\n\nToday's reading: ${reading}`,
      tag: 'reading-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'read',
          title: 'Start Reading',
          icon: '/sl-icon.ico'
        }
      ]
    };

    return await this.sendNotification(title, options);
  }

  // Send achievement notification
  async sendAchievementNotification(achievement) {
    const title = '🎉 Achievement Unlocked - SpeakLife';
    const options = {
      body: achievement,
      tag: 'achievement',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Achievement',
          icon: '/sl-icon.ico'
        }
      ]
    };

    return await this.sendNotification(title, options);
  }

  // Set up daily notifications
  async setupDailyNotifications() {
    if (!this.isSupported || this.permission !== 'granted') {
      return false;
    }

    try {
      // Schedule daily verse at 7 AM
      const dailyVerseTime = new Date();
      dailyVerseTime.setHours(7, 0, 0, 0);

      if (dailyVerseTime.getTime() <= Date.now()) {
        dailyVerseTime.setDate(dailyVerseTime.getDate() + 1);
      }

      // Schedule confession reminder at 8 PM
      const confessionTime = new Date();
      confessionTime.setHours(20, 0, 0, 0);

      if (confessionTime.getTime() <= Date.now()) {
        confessionTime.setDate(confessionTime.getDate() + 1);
      }

      // Schedule notifications
      await this.scheduleNotification(
        '📖 Daily Verse - SpeakLife',
        {
          body: 'Your daily verse and confession are ready!',
          tag: 'daily-verse-scheduled'
        },
        dailyVerseTime
      );

      await this.scheduleNotification(
        '🙏 Confession Reminder - SpeakLife',
        {
          body: 'Take a moment to reflect and confess your thoughts to God.',
          tag: 'confession-reminder-scheduled'
        },
        confessionTime
      );

      return true;
    } catch (error) {
      console.error('Error setting up daily notifications:', error);
      return false;
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    if (this.registration && this.registration.getNotifications) {
      try {
        const notifications = await this.registration.getNotifications();
        notifications.forEach(notification => notification.close());
        return true;
      } catch (error) {
        console.error('Error clearing notifications:', error);
        return false;
      }
    }
    return false;
  }

  // Get notification settings
  getSettings() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      hasServiceWorker: !!this.registration
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
