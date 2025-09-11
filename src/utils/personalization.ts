import { supabase } from '@/integrations/supabase/client';

export interface PersonalizedRecommendation {
  toolId: string;
  toolName: string;
  score: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  generated_at?: string;
}

export interface RecommendationContext {
  contextType: 'general' | 'onboarding' | 'learning' | 'implementation' | 'progress';
  currentActivity?: string;
  focusArea?: string;
}

export class PersonalizationEngine {
  static async generatePersonalizedRecommendations(
    userId: string,
    context: RecommendationContext = { contextType: 'general' }
  ): Promise<PersonalizedRecommendation[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-personalized-recommendations', {
        body: {
          userId,
          ...context
        }
      });

      if (error) {
        console.error('Error generating recommendations:', error);
        return this.getFallbackRecommendations(userId);
      }

      return data?.recommendations || [];
    } catch (error) {
      console.error('Error calling recommendation service:', error);
      return this.getFallbackRecommendations(userId);
    }
  }

  static async getFallbackRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    try {
      // Get user profile for basic filtering
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, industry, ai_experience')
        .eq('user_id', userId)
        .single();

      // Get existing recommendations from database
      const { data: existingRecs } = await supabase
        .from('tool_recommendations')
        .select(`
          *,
          tool:tools(id, name, category_id, user_rating)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('recommendation_score', { ascending: false })
        .limit(5);

      if (existingRecs && existingRecs.length > 0) {
        return existingRecs.map(rec => ({
          toolId: rec.tool_id,
          toolName: rec.tool?.name || 'Unknown Tool',
          score: rec.recommendation_score,
          reason: rec.reason || 'Recommended based on your profile',
          priority: rec.recommendation_score > 80 ? 'high' : rec.recommendation_score > 60 ? 'medium' : 'low',
          category: rec.tool?.category_id || 'general'
        }));
      }

      // Last resort: popular tools for user's role/industry
      const { data: popularTools } = await supabase
        .from('tools')
        .select('*')
        .eq('status', 'active')
        .order('user_rating', { ascending: false })
        .limit(3);

      return popularTools?.map((tool, index) => ({
        toolId: tool.id,
        toolName: tool.name,
        score: 70 - (index * 5),
        reason: `Popular tool for ${profile?.role || 'professionals'} in ${profile?.industry || 'your industry'}`,
        priority: index === 0 ? 'high' : 'medium' as const,
        category: tool.category_id || 'general'
      })) || [];

    } catch (error) {
      console.error('Error getting fallback recommendations:', error);
      return [];
    }
  }

  static async updateRecommendationInteraction(
    userId: string,
    toolId: string,
    interactionType: 'viewed' | 'dismissed' | 'implemented' | 'rated'
  ): Promise<void> {
    try {
      // Record the interaction
      await supabase.from('user_tool_interactions').insert({
        user_id: userId,
        tool_id: toolId,
        interaction_type: interactionType
      });

      // Update recommendation score based on interaction
      let scoreAdjustment = 0;
      switch (interactionType) {
        case 'viewed':
          scoreAdjustment = 5;
          break;
        case 'dismissed':
          scoreAdjustment = -20;
          break;
        case 'implemented':
          scoreAdjustment = 30;
          break;
        case 'rated':
          scoreAdjustment = 10;
          break;
      }

      if (scoreAdjustment !== 0) {
        await supabase.rpc('update_recommendation_score', {
          p_user_id: userId,
          p_tool_id: toolId,
          p_score_change: scoreAdjustment
        });
      }

      // If dismissed, mark as inactive
      if (interactionType === 'dismissed') {
        await supabase
          .from('tool_recommendations')
          .update({ status: 'dismissed' })
          .eq('user_id', userId)
          .eq('tool_id', toolId);
      }

    } catch (error) {
      console.error('Error updating recommendation interaction:', error);
    }
  }

  static async getRecommendationInsights(userId: string) {
    try {
      const { data: insights } = await supabase
        .from('user_behavior_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('insight_type', 'recommendation_patterns')
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      return insights?.insight_data || {};
    } catch (error) {
      console.error('Error fetching recommendation insights:', error);
      return {};
    }
  }

  static async trackRecommendationPerformance(userId: string, toolId: string, outcome: string) {
    try {
      await supabase.from('user_analytics_events').insert({
        user_id: userId,
        event_type: 'recommendation_outcome',
        event_data: {
          tool_id: toolId,
          outcome: outcome,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error tracking recommendation performance:', error);
    }
  }

  // Context-specific recommendation methods
  static async getOnboardingRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    return this.generatePersonalizedRecommendations(userId, {
      contextType: 'onboarding',
      currentActivity: 'getting_started'
    });
  }

  static async getLearningRecommendations(userId: string, currentModule?: string): Promise<PersonalizedRecommendation[]> {
    return this.generatePersonalizedRecommendations(userId, {
      contextType: 'learning',
      currentActivity: currentModule
    });
  }

  static async getImplementationRecommendations(userId: string, currentGuide?: string): Promise<PersonalizedRecommendation[]> {
    return this.generatePersonalizedRecommendations(userId, {
      contextType: 'implementation',
      currentActivity: currentGuide
    });
  }

  static async getProgressBasedRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    return this.generatePersonalizedRecommendations(userId, {
      contextType: 'progress'
    });
  }
}