import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RecommendationEngine, UserProfile, ToolRecommendation } from '@/utils/recommendationEngine';
import { PersonalizationEngine } from '@/utils/personalization';
import { AssessmentIntegration } from '@/utils/assessmentIntegration';
import { Sparkles, TrendingUp, Clock, Star, ExternalLink } from 'lucide-react';

interface EnhancedRecommendationsProps {
  assessmentType?: 'personal' | 'business' | 'cfo';
  maxRecommendations?: number;
}

export function EnhancedRecommendations({ 
  assessmentType = 'personal', 
  maxRecommendations = 6 
}: EnhancedRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProfileAndRecommendations();
    }
  }, [user, assessmentType]);

  const loadUserProfileAndRecommendations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        console.log('No profile found, redirecting to assessment');
        return;
      }

      const userProfile: UserProfile = {
        role: profile.role || 'individual',
        industry: profile.industry || 'technology',
        company_size: profile.company_size || 'medium',
        ai_experience: profile.ai_experience || 'never',
        goals: profile.goals || [],
        time_availability: profile.time_availability || '3-5 hours/week',
        implementation_timeline: profile.implementation_timeline || '2-3 months'
      };

      setUserProfile(userProfile);

      // Try to get enhanced recommendations
      let existingRecs = await AssessmentIntegration.generateEnhancedRecommendations(user.id);

      // If no enhanced recommendations, fall back to basic ones
      if (existingRecs.length === 0) {
        console.log('Generating basic recommendations for user profile:', userProfile);
        existingRecs = await RecommendationEngine.generateRecommendations(user.id, userProfile);
      }

      // Filter recommendations based on assessment type
      const filteredRecs = filterRecommendationsByType(existingRecs);
      setRecommendations(filteredRecs.slice(0, maxRecommendations));

    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRegenerateForAssessmentType = () => {
    // Check if we have recent assessment data that should trigger new recommendations
    return assessmentType === 'cfo' || assessmentType === 'business';
  };

  const filterRecommendationsByType = (recs: ToolRecommendation[]): ToolRecommendation[] => {
    if (assessmentType === 'cfo') {
      return recs.filter(rec => 
        rec.category.toLowerCase().includes('finance') ||
        rec.category.toLowerCase().includes('analytics') ||
        rec.category.toLowerCase().includes('reporting') ||
        rec.tool.target_roles?.some(role => role.toLowerCase().includes('cfo'))
      );
    }
    
    if (assessmentType === 'business') {
      return recs.filter(rec =>
        rec.category.toLowerCase().includes('productivity') ||
        rec.category.toLowerCase().includes('automation') ||
        rec.category.toLowerCase().includes('collaboration')
      );
    }

    return recs; // Return all for personal
  };

  const handleImplementTool = async (toolId: string) => {
    if (!user) return;

    try {
      // Track tool interaction
      await PersonalizationEngine.updateRecommendationInteraction(
        user.id, 
        toolId, 
        'implemented'
      );

      // Create implementation progress entry
      await supabase
        .from('user_tool_progress')
        .insert({
          user_id: user.id,
          tool_id: toolId,
          status: 'interested',
          progress_percentage: 0,
          started_at: new Date().toISOString()
        });

      // Refresh recommendations
      loadUserProfileAndRecommendations();
    } catch (error) {
      console.error('Error tracking implementation:', error);
    }
  };

  const getRecommendationPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getRecommendationPriorityLabel = (score: number) => {
    if (score >= 80) return 'High Priority';
    if (score >= 60) return 'Recommended';
    if (score >= 40) return 'Good Fit';
    return 'Consider';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            No Recommendations Yet
          </CardTitle>
          <CardDescription>
            Complete your assessment to get personalized AI tool recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/assessment'}>
            Take Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">
            {assessmentType === 'cfo' ? 'CFO-Specific Recommendations' :
             assessmentType === 'business' ? 'Business Transformation Tools' :
             'Personalized Recommendations'}
          </h3>
        </div>
        {userProfile && (
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {userProfile.role} • {userProfile.industry}
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {recommendations.map((rec, index) => (
          <Card key={rec.tool.id} className="relative overflow-hidden">
            <div 
              className={`absolute top-0 left-0 w-1 h-full ${getRecommendationPriorityColor(rec.score)}`}
            />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {rec.tool.logo_url && (
                    <img 
                      src={rec.tool.logo_url} 
                      alt={rec.tool.name}
                      className="w-8 h-8 rounded"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">{rec.tool.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getRecommendationPriorityColor(rec.score)} text-white`}
                      >
                        {getRecommendationPriorityLabel(rec.score)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                      {rec.tool.user_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {rec.tool.user_rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{rec.score}</div>
                  <div className="text-xs text-muted-foreground">Match Score</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {rec.tool.description}
              </p>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  Why this recommendation:
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {rec.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Setup Time:</div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {rec.tool.time_to_value || 'Not specified'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Pricing:</div>
                  <div>${rec.tool.pricing_amount || 'Free'}/{rec.tool.pricing_model || 'month'}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleImplementTool(rec.tool.id)}
                  className="flex-1"
                >
                  Start Implementation
                </Button>
                {rec.tool.website_url && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(rec.tool.website_url, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length < maxRecommendations && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              More recommendations will appear as you interact with tools and complete assessments.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}