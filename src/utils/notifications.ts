import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  type: 'achievement' | 'recommendation' | 'reminder' | 'system' | 'progress';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_types: {
    achievements: boolean;
    recommendations: boolean;
    reminders: boolean;
    progress: boolean;
    system: boolean;
  };
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
}

export class NotificationManager {
  static async getUserNotifications(userId: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  static async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    notificationData: Record<string, any> = {},
    priority: Notification['priority'] = 'normal',
    expiresAt?: Date
  ) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data: notificationData,
          priority,
          expires_at: expiresAt?.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  static async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  static async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  static async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return null;
    }
  }

  // Helper methods for specific notification types
  static async notifyNewRecommendation(userId: string, toolName: string, toolId: string) {
    return this.createNotification(
      userId,
      'recommendation',
      '🎯 New Tool Recommendation',
      `We found a perfect match for you: ${toolName}. Check it out!`,
      { tool_id: toolId, tool_name: toolName },
      'high'
    );
  }

  static async notifyImplementationMilestone(userId: string, guideName: string, step: number) {
    return this.createNotification(
      userId,
      'progress',
      '🚀 Implementation Progress',
      `You completed step ${step} of "${guideName}". Keep going!`,
      { guide_name: guideName, step },
      'normal'
    );
  }

  static async notifyLearningCompletion(userId: string, moduleName: string, moduleId: string) {
    return this.createNotification(
      userId,
      'progress',
      '📚 Learning Complete',
      `Congratulations! You completed "${moduleName}".`,
      { module_id: moduleId, module_name: moduleName },
      'high'
    );
  }

  static async notifySystemUpdate(userId: string, title: string, message: string) {
    return this.createNotification(
      userId,
      'system',
      title,
      message,
      {},
      'normal'
    );
  }

  static async notifyReminder(userId: string, title: string, message: string, data: Record<string, any> = {}) {
    return this.createNotification(
      userId,
      'reminder',
      title,
      message,
      data,
      'normal'
    );
  }

  // Subscribe to real-time notifications
  static subscribeToNotifications(userId: string, onNotification: (notification: Notification) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}