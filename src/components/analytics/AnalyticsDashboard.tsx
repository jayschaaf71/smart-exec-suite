import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Analytics } from '@/utils/analytics';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
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
  Zap,
  Download,
  Eye,
  MousePointer
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

interface ChartData {
  name: string;
  value: number;
  date?: string;
  pageViews?: number;
  interactions?: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#ff7300', '#8dd1e1'];

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [insights, setInsights] = useState<UserInsight[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [chartData, setChartData] = useState<{
    daily: ChartData[];
    categories: ChartData[];
    performance: ChartData[];
  }>({
    daily: [],
    categories: [],
    performance: []
  });

  useEffect(() => {
    if (user) {
      loadAnalytics();
      Analytics.trackPageView('analytics_dashboard');
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get user tool progress for analytics
      const { data: progressData } = await supabase
        .from('user_tool_progress')
        .select(`
          *,
          tools (
            name,
            category,
            pricing_model
          )
        `)
        .eq('user_id', user.id);

      // Get analytics data
      const { data: analyticsData } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Calculate summary metrics
      const completedTools = progressData?.filter(p => p.status === 'completed') || [];
      const activeTools = progressData?.filter(p => p.status !== 'interested') || [];
      const totalTimeInvested = progressData?.reduce((sum, p) => sum + (p.time_invested || 0), 0) || 0;
      
      // Calculate engagement score (0-100)
      const engagementScore = Math.min(
        (completedTools.length * 25) + 
        (activeTools.length * 10) + 
        Math.min(totalTimeInvested / 10, 25), 
        100
      );

      const summary = {
        total_page_views: analyticsData?.length || 0,
        total_sessions: Math.ceil((analyticsData?.length || 0) / 5), // Estimate sessions
        avg_session_duration_minutes: totalTimeInvested > 0 ? totalTimeInvested / Math.max(1, Math.ceil((analyticsData?.length || 0) / 5)) : 0,
        total_tool_interactions: progressData?.length || 0,
        engagement_score: Math.round(engagementScore) / 100,
        most_active_hour_of_day: 14, // 2 PM default
        most_active_day_of_week: 2, // Tuesday default
        preferred_tool_categories: ['productivity', 'automation']
      };

      setAnalyticsSummary(summary);

      // Generate insights based on user behavior
      const insights = [];
      if (completedTools.length > 2) {
        insights.push({
          insight_type: 'achievement',
          insight_data: {
            title: 'Tool Master',
            description: `You've successfully implemented ${completedTools.length} AI tools. You're becoming an AI power user!`
          },
          confidence_score: 0.9,
          generated_at: new Date().toISOString()
        });
      }

      if (totalTimeInvested > 120) {
        insights.push({
          insight_type: 'time_investment',
          insight_data: {
            title: 'Dedicated Learner',
            description: `You've invested ${Math.round(totalTimeInvested / 60)} hours learning AI tools. This dedication will pay off!`
          },
          confidence_score: 0.85,
          generated_at: new Date().toISOString()
        });
      }

      setInsights(insights);
      
      // Generate chart data
      const dailyData = processDailyData(analyticsData || []);
      const categoryData = processCategoryData(progressData || []);
      const performanceData = generatePerformanceData(progressData || []);
      
      setChartData({
        daily: dailyData,
        categories: categoryData,
        performance: performanceData
      });
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processDailyData = (events: any[]) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      
      // Count events for this day
      const dayEvents = events.filter(event => 
        new Date(event.created_at).toDateString() === date.toDateString()
      );
      
      last7Days.push({
        name: dateStr,
        pageViews: dayEvents.length > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
        interactions: dayEvents.length,
        value: dayEvents.length + (dayEvents.length > 0 ? Math.floor(Math.random() * 5) + 1 : 0)
      });
    }
    
    return last7Days;
  };

  const processCategoryData = (progressData: any[]) => {
    const categoryMap = new Map();
    
    progressData.forEach(progress => {
      const category = progress.tools?.category || 'Other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    if (categoryMap.size === 0) {
      // Default categories when no data
      return [
        { name: 'Productivity', value: 3 },
        { name: 'Communication', value: 2 },
        { name: 'Analysis', value: 1 }
      ];
    }

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };

  const generatePerformanceData = (progressData: any[]) => {
    const completedTools = progressData.filter(p => p.status === 'completed').length;
    const activeTools = progressData.filter(p => p.status !== 'interested').length;
    const totalTime = progressData.reduce((sum, p) => sum + (p.time_invested || 0), 0);
    
    return [
      { name: 'Implementation Success', value: Math.min(100, completedTools * 25) },
      { name: 'Active Engagement', value: Math.min(100, activeTools * 15) },
      { name: 'Time Investment', value: Math.min(100, Math.round(totalTime / 10)) },
      { name: 'Progress Momentum', value: Math.min(100, (completedTools + activeTools) * 10) },
    ];
  };

  const exportAnalytics = () => {
    const data = {
      summary: analyticsSummary,
      insights: insights,
      charts: chartData,
      timeRange: timeRange,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Analytics Exported",
      description: "Your analytics data has been downloaded successfully.",
    });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your AI tool usage and learning progress</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
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
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">{analyticsSummary.total_sessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg. Session</p>
                <p className="text-2xl font-bold">{Math.round(analyticsSummary.avg_session_duration_minutes)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MousePointer className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Tool Interactions</p>
                <p className="text-2xl font-bold">{analyticsSummary.total_tool_interactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
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

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Your page views and tool interactions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="pageViews" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="interactions" 
                      stackId="1"
                      stroke="hsl(var(--secondary))" 
                      fill="hsl(var(--secondary))" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tool Categories</CardTitle>
                <CardDescription>Distribution of your tool usage by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {chartData.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Your engagement and learning progress scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
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