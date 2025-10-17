// Notification Service for Push Notifications
class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.registration = null;
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications not supported in this browser');
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      throw new Error('Notification permission denied');
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  // Register service worker
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI8F7X7h3P8b7w4c8y7n2x5Q1W8E9R6T3Y4U7I0O5P2A9S6D1F4G7H2J5K8L3M6N9Q2R5T8U1V4W7X0Y3Z6A9B2C5D8E1F4G7H2J5K8L3M6N9Q2R5T8U1V4W7X0Y3Z6'
        )
      });

      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  // Send local notification
  async sendLocalNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const defaultOptions = {
      body: 'Time for your daily confession',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      tag: 'speaklife-reminder',
      actions: [
        {
          action: 'open',
          title: 'Open SpeakLife',
          icon: '/logo192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/logo192.png'
        }
      ]
    };

    const notification = new Notification(title, { ...defaultOptions, ...options });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Schedule daily reminder
  scheduleDailyReminder(time = '20:00') {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      this.sendLocalNotification('Daily Confession Reminder', {
        body: 'It\'s time for your daily spiritual reflection and confession.',
        data: { type: 'daily-reminder' }
      });
      
      // Schedule next day's reminder
      this.scheduleDailyReminder(time);
    }, timeUntilReminder);

    console.log(`Daily reminder scheduled for ${reminderTime.toLocaleString()}`);
  }

  // Schedule weekly reflection reminder
  scheduleWeeklyReminder(dayOfWeek = 0) { // 0 = Sunday
    const now = new Date();
    const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntilTarget);
    targetDate.setHours(19, 0, 0, 0); // 7 PM

    const timeUntilReminder = targetDate.getTime() - now.getTime();

    setTimeout(() => {
      this.sendLocalNotification('Weekly Spiritual Reflection', {
        body: 'Time for your weekly spiritual review and growth assessment.',
        data: { type: 'weekly-reflection' }
      });
      
      // Schedule next week's reminder
      this.scheduleWeeklyReminder(dayOfWeek);
    }, timeUntilReminder);

    console.log(`Weekly reminder scheduled for ${targetDate.toLocaleString()}`);
  }

  // Cancel all scheduled notifications
  cancelAllNotifications() {
    if (this.registration) {
      this.registration.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      });
    }
  }

  // Check if notifications are supported and enabled
  isNotificationEnabled() {
    return this.isSupported && this.permission === 'granted';
  }

  // Get notification status
  getStatus() {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.isNotificationEnabled()
    };
  }

  // Utility function to convert VAPID key
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
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
