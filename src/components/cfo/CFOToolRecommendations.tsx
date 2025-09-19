import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Star, 
  ExternalLink, 
  Play,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  pricing_model?: string;
  setup_difficulty?: string;
  website_url?: string;
  features?: string[];
  target_industries?: string[];
}

interface Recommendation {
  id: string;
  tool_id: string;
  industry_relevance_score: number;
  implementation_priority: number;
  estimated_roi_percentage: number;
  setup_complexity: string;
  recommended_timeline: string;
  implementation_guide: string;
  tools: Tool;
}

interface CFOToolRecommendationsProps {
  recommendations: Recommendation[];
  onRefresh: () => void;
}

export function CFOToolRecommendations({ recommendations, onRefresh }: CFOToolRecommendationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'all', name: 'All Tools', count: recommendations.length },
    { id: 'reporting', name: 'Financial Reporting', count: 0 },
    { id: 'budgeting', name: 'Budgeting & Forecasting', count: 0 },
    { id: 'compliance', name: 'Compliance & Risk', count: 0 },
    { id: 'automation', name: 'Process Automation', count: 0 }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'complex': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'text-red-600 bg-red-50';
    if (priority <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const handleStartImplementation = async (recommendation: Recommendation) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tool_implementations')
        .insert({
          user_id: user.id,
          tool_id: recommendation.tool_id,
          status: 'planned',
          progress_percentage: 0,
          implementation_notes: `Started implementation for ${recommendation.tools.name}`
        });

      if (error) throw error;

      toast({
        title: "Implementation Started",
        description: `Added ${recommendation.tools.name} to your implementation queue`,
      });

      onRefresh();
    } catch (error) {
      console.error('Error starting implementation:', error);
      toast({
        title: "Error",
        description: "Failed to start implementation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getImplementationTimeEstimate = (complexity: string, timeline: string) => {
    if (timeline) return timeline;
    
    switch (complexity.toLowerCase()) {
      case 'easy': return '1-2 weeks';
      case 'medium': return '2-4 weeks';
      case 'complex': return '4-8 weeks';
      default: return '2-3 weeks';
    }
  };

  const getIndustrySpecificTools = () => {
    // This would normally be filtered based on user's industry from their assessment
    return recommendations.sort((a, b) => {
      // Sort by priority first, then by ROI
      if (a.implementation_priority !== b.implementation_priority) {
        return a.implementation_priority - b.implementation_priority;
      }
      return b.estimated_roi_percentage - a.estimated_roi_percentage;
    });
  };

  const filteredRecommendations = getIndustrySpecificTools();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6" />
            <span>Personalized CFO Tool Recommendations</span>
          </CardTitle>
          <CardDescription>
            AI-curated tools based on your industry, company size, and specific pain points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{recommendations.length}</div>
              <p className="text-sm text-muted-foreground">Recommended Tools</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.round(recommendations.reduce((sum, r) => sum + r.estimated_roi_percentage, 0) / recommendations.length || 0)}%
              </div>
              <p className="text-sm text-muted-foreground">Avg. Expected ROI</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {recommendations.filter(r => r.setup_complexity === 'easy').length}
              </div>
              <p className="text-sm text-muted-foreground">Quick Wins Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecommendations.map((recommendation) => (
              <Card key={recommendation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        {recommendation.tools.logo_url ? (
                          <img 
                            src={recommendation.tools.logo_url} 
                            alt={recommendation.tools.name}
                            className="w-8 h-8"
                          />
                        ) : (
                          <span className="text-lg font-bold text-accent">
                            {recommendation.tools.name[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{recommendation.tools.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="outline"
                            className={getPriorityColor(recommendation.implementation_priority)}
                          >
                            Priority {recommendation.implementation_priority}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={getComplexityColor(recommendation.setup_complexity)}
                          >
                            {recommendation.setup_complexity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {recommendation.industry_relevance_score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {recommendation.tools.description}
                  </p>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 py-3 bg-accent/5 rounded-lg px-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {recommendation.estimated_roi_percentage}% ROI
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Expected return</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          {getImplementationTimeEstimate(recommendation.setup_complexity, recommendation.recommended_timeline)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Setup time</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">
                          {recommendation.tools.pricing_model || 'Custom'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Pricing</p>
                    </div>
                  </div>

                  {/* Features */}
                  {recommendation.tools.features && recommendation.tools.features.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                      <div className="space-y-1">
                        {recommendation.tools.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Implementation Guide Preview */}
                  {recommendation.implementation_guide && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Implementation Guide Available</p>
                          <p className="text-xs text-blue-700">
                            Step-by-step setup instructions included
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      onClick={() => handleStartImplementation(recommendation)}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Implementation
                    </Button>
                    
                    {recommendation.tools.website_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={recommendation.tools.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </a>
                    )}
                  </div>

                  {/* Progress indicator if implementation exists */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Relevance Score</span>
                      <span>{recommendation.industry_relevance_score}%</span>
                    </div>
                    <Progress value={recommendation.industry_relevance_score} className="h-1 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecommendations.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete your CFO assessment to get personalized tool recommendations
                </p>
                <Button onClick={() => window.location.href = '/assessment'}>
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}