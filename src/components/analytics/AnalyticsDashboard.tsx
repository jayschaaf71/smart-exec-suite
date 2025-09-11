import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { Analytics } from '@/utils/analytics';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Activity,
  Calendar,
  Star,
  Lightbulb,
  Zap
} from 'lucide-react';

interface AnalyticsSummary {
  total_sessions: number;
  total_page_views: number;
  total_tool_interactions: number;
  avg_session_duration_minutes: number;
  most_active_day_of_week: number;
  most_active_hour_of_day: number;
  preferred_tool_categories: string[];
  engagement_score: number;
}

interface UserInsight {
  insight_type: string;
  insight_data: any;
  confidence_score: number;
  generated_at: string;
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [insights, setInsights] = useState<UserInsight[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
      Analytics.trackPageView('analytics_dashboard');
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const [summary, userInsights] = await Promise.all([
        Analytics.getAnalyticsSummary(user.id),
        Analytics.getUserInsights(user.id)
      ]);

      setAnalyticsSummary(summary);
      setInsights(userInsights);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex] || 'Unknown';
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'engagement_pattern': return <Activity className="h-4 w-4" />;
      case 'learning_style': return <Star className="h-4 w-4" />;
      case 'tool_preference': return <Lightbulb className="h-4 w-4" />;
      case 'success_factor': return <Zap className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'engagement_pattern': return 'Engagement Pattern';
      case 'learning_style': return 'Learning Style';
      case 'tool_preference': return 'Tool Preference';
      case 'success_factor': return 'Success Factor';
      default: return 'Insight';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsSummary) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No analytics data available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start using the platform to see your insights!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{analyticsSummary.total_sessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{analyticsSummary.total_page_views}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Tool Interactions</p>
                <p className="text-2xl font-bold">{analyticsSummary.total_tool_interactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold">{Math.round(analyticsSummary.avg_session_duration_minutes)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Engagement Score
                </CardTitle>
                <CardDescription>
                  Your overall platform engagement level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score</span>
                    <span className="text-2xl font-bold">{Math.round(analyticsSummary.engagement_score * 100)}%</span>
                  </div>
                  <Progress value={analyticsSummary.engagement_score * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Activity Patterns
                </CardTitle>
                <CardDescription>
                  When you're most active
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Most Active Day</p>
                  <p className="text-lg font-semibold">{getDayName(analyticsSummary.most_active_day_of_week)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Most Active Time</p>
                  <p className="text-lg font-semibold">{formatHour(analyticsSummary.most_active_hour_of_day)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Preferred Tool Categories</CardTitle>
              <CardDescription>
                The types of tools you interact with most
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analyticsSummary.preferred_tool_categories?.map((category, index) => (
                  <Badge key={index} variant="secondary" className="capitalize">
                    {category}
                  </Badge>
                )) || <p className="text-muted-foreground">No preferences identified yet</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getInsightIcon(insight.insight_type)}
                      {getInsightTitle(insight.insight_type)}
                    </CardTitle>
                    <CardDescription>
                      Confidence: {Math.round(insight.confidence_score * 100)}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insight.insight_data && typeof insight.insight_data === 'object' ? 
                        Object.entries(insight.insight_data).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        )) :
                        <p className="text-sm text-muted-foreground">No detailed data available</p>
                      }
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No insights generated yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Keep using the platform to get personalized insights!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Patterns</CardTitle>
              <CardDescription>
                Detailed breakdown of your platform usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Session Distribution</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{day}</div>
                        <div 
                          className={`h-8 rounded ${
                            index === analyticsSummary.most_active_day_of_week 
                              ? 'bg-primary' 
                              : 'bg-muted'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Hourly Activity</h4>
                  <div className="grid grid-cols-12 gap-1">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{hour}</div>
                        <div 
                          className={`h-6 rounded ${
                            hour === analyticsSummary.most_active_hour_of_day 
                              ? 'bg-primary' 
                              : 'bg-muted'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}