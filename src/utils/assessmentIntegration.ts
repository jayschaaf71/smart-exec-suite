import { supabase } from '@/integrations/supabase/client';
import { RecommendationEngine, UserProfile } from './recommendationEngine';

export interface EnhancedUserProfile extends UserProfile {
  assessmentType?: 'personal_productivity' | 'business_transformation' | 'cfo';
  assessmentData?: any;
  painPoints?: string[];
  currentTools?: string[];
  implementationReadiness?: number;
  budgetRange?: string;
}

export class AssessmentIntegration {
  
  static async loadEnhancedUserProfile(userId: string): Promise<EnhancedUserProfile | null> {
    try {
      // Load basic profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profile) return null;

      // Load latest assessment data
      const { data: assessments } = await supabase
        .from('ai_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      // Load CFO-specific assessment if available
      const { data: cfoAssessment } = await supabase
        .from('cfo_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Enhance profile with assessment data
      let enhancedProfile: EnhancedUserProfile = {
        role: profile.role || 'individual',
        industry: profile.industry || 'technology',
        company_size: profile.company_size || 'medium',
        ai_experience: profile.ai_experience || 'never',
        goals: profile.goals || [],
        time_availability: profile.time_availability || '3-5 hours/week',
        implementation_timeline: profile.implementation_timeline || '2-3 months'
      };

      // Integrate assessment data
      if (assessments && assessments.length > 0) {
        const latestAssessment = assessments[0];
        enhancedProfile.assessmentType = latestAssessment.assessment_type as any;
        enhancedProfile.assessmentData = latestAssessment.assessment_data;

        // Extract specific insights based on assessment type
        if (latestAssessment.assessment_type === 'personal_productivity') {
          const data = latestAssessment.assessment_data as any;
          enhancedProfile.painPoints = data?.productivityChallenges?.insightNeeds || [];
          enhancedProfile.currentTools = data?.currentAIUsage?.toolsUsed || [];
          enhancedProfile.budgetRange = data?.implementation?.budget || '';
          enhancedProfile.implementationReadiness = data?.implementation?.comfortLevel || 3;
        } else if (latestAssessment.assessment_type === 'business_transformation') {
          const data = latestAssessment.assessment_data as any;
          enhancedProfile.painPoints = data?.processAnalysis?.manualEffortAreas || [];
          enhancedProfile.currentTools = data?.currentState?.aiToolsInUse || [];
          enhancedProfile.budgetRange = data?.organizationalReadiness?.budgetAllocation || '';
          enhancedProfile.implementationReadiness = data?.organizationalReadiness?.changeManagement || 3;
        }
      }

      // Integrate CFO assessment data
      if (cfoAssessment) {
        enhancedProfile.assessmentType = 'cfo';
        const cfoData = cfoAssessment as any;
        enhancedProfile.industry = cfoData.company_profile?.industry || enhancedProfile.industry;
        enhancedProfile.company_size = cfoData.company_profile?.employees || enhancedProfile.company_size;
        enhancedProfile.painPoints = cfoData.pain_points?.manualProcesses || [];
        enhancedProfile.currentTools = [
          cfoData.current_stack?.erp,
          cfoData.current_stack?.bi,
          cfoData.current_stack?.spreadsheets
        ].filter(Boolean);
      }

      return enhancedProfile;
    } catch (error) {
      console.error('Error loading enhanced user profile:', error);
      return null;
    }
  }

  static async generateEnhancedRecommendations(userId: string): Promise<any[]> {
    try {
      const enhancedProfile = await this.loadEnhancedUserProfile(userId);
      if (!enhancedProfile) return [];

      // Use enhanced scoring for better recommendations
      const recommendations = await RecommendationEngine.generateRecommendations(
        userId, 
        enhancedProfile
      );

      // Apply assessment-specific filters and boosts
      const enhancedRecommendations = recommendations.map(rec => {
        let adjustedScore = rec.score;

        // Boost scores based on assessment-specific data
        if (enhancedProfile.assessmentType === 'cfo') {
          // Boost finance-related tools
          if (rec.category.toLowerCase().includes('finance') || 
              rec.category.toLowerCase().includes('analytics')) {
            adjustedScore += 15;
          }
          
          // Boost based on current pain points
          if (enhancedProfile.painPoints?.some(pain => 
            rec.tool.description.toLowerCase().includes(pain.toLowerCase()))) {
            adjustedScore += 10;
          }
        }

        if (enhancedProfile.assessmentType === 'business_transformation') {
          // Boost automation and productivity tools
          if (rec.category.toLowerCase().includes('automation') || 
              rec.category.toLowerCase().includes('productivity')) {
            adjustedScore += 10;
          }
        }

        if (enhancedProfile.assessmentType === 'personal_productivity') {
          // Boost individual productivity tools
          if (rec.tool.target_roles?.includes('individual') || 
              rec.category.toLowerCase().includes('productivity')) {
            adjustedScore += 10;
          }
        }

        // Adjust for current tools (avoid duplicates)
        if (enhancedProfile.currentTools?.some(tool => 
          rec.tool.name.toLowerCase().includes(tool.toLowerCase()))) {
          adjustedScore -= 20; // Reduce score for tools they already use
        }

        // Adjust for implementation readiness
        if (enhancedProfile.implementationReadiness && enhancedProfile.implementationReadiness < 3) {
          if (rec.tool.setup_difficulty === 'hard') {
            adjustedScore -= 15;
          }
        }

        return {
          ...rec,
          score: Math.min(100, Math.max(0, adjustedScore)),
          enhancedReason: this.generateEnhancedReason(rec, enhancedProfile)
        };
      })
      .sort((a, b) => b.score - a.score);

      return enhancedRecommendations;
    } catch (error) {
      console.error('Error generating enhanced recommendations:', error);
      return [];
    }
  }

  private static generateEnhancedReason(rec: any, profile: EnhancedUserProfile): string {
    const reasons = [rec.reason];

    // Add assessment-specific reasons
    if (profile.assessmentType === 'cfo') {
      if (profile.painPoints?.some(pain => 
        rec.tool.description.toLowerCase().includes(pain.toLowerCase()))) {
        reasons.push('Addresses your specific CFO pain points');
      }
      
      if (rec.tool.target_roles?.some(role => role.toLowerCase().includes('cfo'))) {
        reasons.push('Designed specifically for CFO workflows');
      }
    }

    if (profile.assessmentType === 'business_transformation') {
      if (profile.painPoints?.includes('Data collection from multiple systems') &&
          rec.tool.features?.some(feature => feature.toLowerCase().includes('integration'))) {
        reasons.push('Solves your data integration challenges');
      }
    }

    if (profile.assessmentType === 'personal_productivity') {
      if (profile.painPoints?.includes('Time tracking') &&
          rec.tool.features?.some(feature => feature.toLowerCase().includes('time'))) {
        reasons.push('Helps with time management goals');
      }
    }

    // Add implementation readiness reasons
    if (profile.implementationReadiness && profile.implementationReadiness < 3 && 
        rec.tool.setup_difficulty === 'easy') {
      reasons.push('Easy setup matches your comfort level');
    }

    return reasons.join('. ') + '.';
  }

  static async trackAssessmentCompletion(userId: string, assessmentType: string, assessmentData: any) {
    try {
      // Store assessment completion analytics
      await supabase
        .from('user_analytics_events')
        .insert({
          user_id: userId,
          event_type: 'assessment_completed',
          event_data: {
            assessment_type: assessmentType,
            completion_date: new Date().toISOString(),
            data_quality: this.calculateDataQuality(assessmentData)
          }
        });

      // Generate fresh recommendations after assessment
      const enhancedProfile = await this.loadEnhancedUserProfile(userId);
      if (enhancedProfile) {
        await RecommendationEngine.generateRecommendations(userId, enhancedProfile);
      }

    } catch (error) {
      console.error('Error tracking assessment completion:', error);
    }
  }

  private static calculateDataQuality(assessmentData: any): number {
    // Simple data quality score based on completeness
    const fields = JSON.stringify(assessmentData);
    const emptyFields = (fields.match(/:""|:\[\]|:null/g) || []).length;
    const totalFields = (fields.match(/:/g) || []).length;
    
    return Math.round(((totalFields - emptyFields) / totalFields) * 100);
  }
}