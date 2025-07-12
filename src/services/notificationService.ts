export interface NotificationPermission {
  granted: boolean;
  supported: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private checkInterval: number | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return { granted: false, supported: false };
    }

    if (Notification.permission === 'granted') {
      return { granted: true, supported: true };
    }

    if (Notification.permission === 'denied') {
      return { granted: false, supported: true };
    }

    try {
      const permission = await Notification.requestPermission();
      return { 
        granted: permission === 'granted', 
        supported: true 
      };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { granted: false, supported: true };
    }
  }

  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    const permission = await this.requestPermission();
    
    if (!permission.granted) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  startReminderCheck(dates: any[]): void {
    // Clear existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every minute
    this.checkInterval = window.setInterval(() => {
      this.checkReminders(dates);
    }, 60000);

    // Initial check
    this.checkReminders(dates);
  }

  stopReminderCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkReminders(dates: any[]): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    dates.forEach(dateEntry => {
      if (!dateEntry.reminderDays || dateEntry.reminderDays.length === 0) {
        return;
      }

      const eventDate = new Date(dateEntry.date);
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

      dateEntry.reminderDays.forEach((reminderDays: number) => {
        const reminderDate = new Date(eventDateOnly);
        reminderDate.setDate(reminderDate.getDate() - reminderDays);

        // Check if today is the reminder date
        if (reminderDate.getTime() === today.getTime()) {
          const daysUntilEvent = Math.ceil((eventDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let reminderText = '';
          if (daysUntilEvent === 0) {
            reminderText = 'Heute!';
          } else if (daysUntilEvent === 1) {
            reminderText = 'Morgen!';
          } else {
            reminderText = `In ${daysUntilEvent} Tagen`;
          }

          const priorityEmoji = dateEntry.priority === 'high' ? '🔴' : 
                               dateEntry.priority === 'medium' ? '🟡' : '🟢';

          this.showNotification(
            `${priorityEmoji} Erinnerung: ${dateEntry.title}`,
            {
              body: `${reminderText} - ${dateEntry.category}`,
              tag: `reminder-${dateEntry.id}-${reminderDays}`,
              requireInteraction: dateEntry.priority === 'high',
              silent: false
            }
          );
        }
      });
    });
  }

  async scheduleRecurringReminders(dateEntry: any): Promise<void> {
    if (!dateEntry.recurringType || dateEntry.recurringType === 'none') {
      return;
    }

    // This would typically integrate with a service worker for persistent notifications
    // For now, we'll just show immediate notifications for demo purposes
    console.log('Scheduling recurring reminders for:', dateEntry.title);
  }
}

export const notificationService = NotificationService.getInstance(); 