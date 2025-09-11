import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { PersonalizationEngine, type PersonalizedRecommendation, type RecommendationContext } from '@/utils/personalization';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Star, 
  TrendingUp, 
  Clock, 
  Target,
  Lightbulb,
  Zap,
  CheckCircle,
  X,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface SmartRecommendationsProps {
  context?: RecommendationContext;
  showHeader?: boolean;
  maxRecommendations?: number;
}

export function SmartRecommendations({ 
  context = { contextType: 'general' }, 
  showHeader = true,
  maxRecommendations = 5 
}: SmartRecommendationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user, context]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const recs = await PersonalizationEngine.generatePersonalizedRecommendations(user.id, context);
      setRecommendations(recs.slice(0, maxRecommendations));
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load personalized recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
    toast({
      title: "Recommendations Updated",
      description: "Your personalized recommendations have been refreshed",
    });
  };

  const handleRecommendationAction = async (
    recommendation: PersonalizedRecommendation, 
    action: 'viewed' | 'dismissed' | 'implemented'
  ) => {
    if (!user) return;

    try {
      await PersonalizationEngine.updateRecommendationInteraction(
        user.id, 
        recommendation.toolId, 
        action
      );

      if (action === 'dismissed') {
        setRecommendations(prev => prev.filter(r => r.toolId !== recommendation.toolId));
        toast({
          title: "Recommendation Dismissed",
          description: `${recommendation.toolName} has been removed from your recommendations`,
        });
      } else if (action === 'implemented') {
        await PersonalizationEngine.trackRecommendationPerformance(
          user.id, 
          recommendation.toolId, 
          'implemented'
        );
        toast({
          title: "Great Choice!",
          description: `You've implemented ${recommendation.toolName}. This helps us improve your recommendations.`,
        });
      }
    } catch (error) {
      console.error('Error handling recommendation action:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Zap className="h-4 w-4" />;
      case 'medium': return <Target className="h-4 w-4" />;
      case 'low': return <Clock className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getContextTitle = (contextType: string) => {
    switch (contextType) {
      case 'onboarding': return 'Getting Started Recommendations';
      case 'learning': return 'Learning-Based Recommendations';
      case 'implementation': return 'Implementation Recommendations';
      case 'progress': return 'Progress-Based Recommendations';
      default: return 'AI-Powered Recommendations';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 animate-pulse text-primary" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{getContextTitle(context.contextType)}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Personalized recommendations powered by AI analysis of your behavior and preferences
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No personalized recommendations available yet.</p>
            <p className="text-sm">Complete more activities to get AI-powered suggestions.</p>
          </div>
        ) : (
          recommendations.map((recommendation, index) => (
            <Card key={recommendation.toolId} className="border-l-4 border-l-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(recommendation.priority)}
                        <h3 className="font-semibold text-foreground">
                          {recommendation.toolName}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-white text-xs ${getPriorityColor(recommendation.priority)}`}
                        >
                          {recommendation.priority.toUpperCase()}
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">
                            {recommendation.score}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    <Progress value={recommendation.score} className="h-2" />
                    
                    <p className="text-sm text-muted-foreground">
                      {recommendation.reason}
                    </p>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {recommendation.category}
                      </Badge>
                      {recommendation.generated_at && (
                        <span className="text-xs text-muted-foreground">
                          Generated {new Date(recommendation.generated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRecommendationAction(recommendation, 'viewed')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Tool
                    </Button>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecommendationAction(recommendation, 'implemented')}
                        className="px-2"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecommendationAction(recommendation, 'dismissed')}
                        className="px-2 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}