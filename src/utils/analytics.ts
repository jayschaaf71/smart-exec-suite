import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  page_url?: string;
}

export class Analytics {
  private static sessionId: string = Math.random().toString(36).substring(2, 15);
  private static userId: string | null = null;

  static async init(userId: string) {
    this.userId = userId;
    await this.track('session_start', {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
    });
  }

  static async track(eventType: string, eventData: Record<string, any> = {}) {
    if (!this.userId) return;

    try {
      await supabase.from('user_analytics_events').insert({
        user_id: this.userId,
        event_type: eventType,
        event_data: eventData,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        session_id: this.sessionId,
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  static async trackToolInteraction(toolId: string, interactionType: string, additionalData: Record<string, any> = {}) {
    await this.track('tool_interaction', {
      tool_id: toolId,
      interaction_type: interactionType,
      ...additionalData,
    });
  }

  static async trackPageView(pageName: string) {
    await this.track('page_view', {
      page: pageName,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackLearningProgress(moduleId: string, pathId: string, progressData: Record<string, any>) {
    await this.track('learning_progress', {
      module_id: moduleId,
      path_id: pathId,
      ...progressData,
    });
  }

  static async trackImplementationProgress(guideId: string, step: number, status: string) {
    await this.track('implementation_progress', {
      guide_id: guideId,
      step: step,
      status: status,
      timestamp: new Date().toISOString(),
    });
  }

  static async getAnalyticsSummary(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_analytics_summary')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      return null;
    }
  }

  static async getUserInsights(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_behavior_insights')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user insights:', error);
      return [];
    }
  }

  static async getToolEffectiveness() {
    try {
      const { data, error } = await supabase
        .from('tool_effectiveness_metrics')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tool effectiveness:', error);
      return [];
    }
  }
}