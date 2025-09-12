import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Clock, DollarSign, Zap, ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import { RecommendationEngine, ToolRecommendation } from '@/utils/recommendationEngine';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Analytics } from '@/utils/analytics';
import { SmartRecommendations } from '@/components/personalization/SmartRecommendations';

export function RecommendedTools() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user profile first
      let profile;
      if (user.id === '550e8400-e29b-41d4-a716-446655440000') {
        // Mock profile for test user
        profile = {
          role: 'manager',
          industry: 'technology',
          company_size: 'startup',
          ai_experience: 'chatgpt',
          goals: ['Increase personal productivity', 'Improve team efficiency'],
          time_availability: 'few_hours_week',
          implementation_timeline: 'This month'
        };
      } else {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        profile = data;
      }

      if (!profile) {
        setLoading(false);
        return;
      }

      // Generate fresh recommendations using the recommendation engine
      const newRecommendations = await RecommendationEngine.generateRecommendations(user.id, profile);
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToolInteraction = async (toolId: string, interactionType: 'interested' | 'dismissed' | 'implementing') => {
    if (!user) return;

    try {
      await supabase
        .from('user_tool_interactions')
        .upsert({
          user_id: user.id,
          tool_id: toolId,
          interaction_type: interactionType,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,tool_id'
        });

      // Update local state
      if (interactionType === 'dismissed') {
        setRecommendations(prev => prev.filter(rec => rec.tool.id !== toolId));
      }

      toast({
        title: "Feedback recorded",
        description: `Tool marked as ${interactionType}`,
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const getPricingDisplay = (tool: any) => {
    if (tool.pricing_model === 'free') return 'Free';
    if (tool.pricing_model === 'freemium') return 'Freemium';
    if (tool.pricing_amount) return `$${tool.pricing_amount}/month`;
    return 'Contact for pricing';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No recommendations available. Please complete your profile first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.map((recommendation) => (
        <Card key={recommendation.tool.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl">{recommendation.tool.name}</CardTitle>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {Math.round(recommendation.score)}% match
                  </Badge>
                </div>
                <CardDescription className="text-base mb-3">
                  {recommendation.tool.description}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {getPricingDisplay(recommendation.tool)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {recommendation.tool.time_to_value} to value
                  </div>
                  <Badge className={getDifficultyColor(recommendation.tool.setup_difficulty)}>
                    {recommendation.tool.setup_difficulty} setup
                  </Badge>
                  {recommendation.tool.user_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {recommendation.tool.user_rating}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Why this is recommended:</strong> {recommendation.reason}
                </p>
              </div>

              {recommendation.tool.features && recommendation.tool.features.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.tool.features.slice(0, 4).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {recommendation.tool.pros && recommendation.tool.pros.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Pros:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {recommendation.tool.pros.slice(0, 3).map((pro, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/tools/${recommendation.tool.id}`)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleToolInteraction(recommendation.tool.id, 'interested')}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Interested
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleToolInteraction(recommendation.tool.id, 'implementing')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Start Setup
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToolInteraction(recommendation.tool.id, 'dismissed')}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* AI-Powered Smart Recommendations */}
      <div className="mt-8">
        <SmartRecommendations 
          context={{ contextType: 'general' }}
          showHeader={true}
          maxRecommendations={3}
        />
      </div>
    </div>
  );
}