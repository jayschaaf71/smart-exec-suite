import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedRecommendations } from '@/components/recommendations/EnhancedRecommendations';
import { AssessmentIntegration } from '@/utils/assessmentIntegration';
import { 
  User, 
  Building, 
  Target, 
  TrendingUp, 
  Clock, 
  Star,
  Zap,
  CheckCircle
} from 'lucide-react';

interface DashboardData {
  profile: any;
  assessments: any[];
  implementations: any[];
  metrics: any[];
}

export function AssessmentIntegratedDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    profile: null,
    assessments: [],
    implementations: [],
    metrics: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load enhanced user profile
      const enhancedProfile = await AssessmentIntegration.loadEnhancedUserProfile(user.id);

      // Load assessments
      const { data: assessments } = await supabase
        .from('ai_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load CFO assessment if available
      const { data: cfoAssessment } = await supabase
        .from('cfo_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Load implementations
      const { data: implementations } = await supabase
        .from('user_tool_progress')
        .select(`
          *,
          tools (
            name,
            logo_url,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load metrics
      const { data: metrics } = await supabase
        .from('user_success_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false });

      setData({
        profile: enhancedProfile,
        assessments: [...(assessments || []), ...(cfoAssessment ? [cfoAssessment] : [])],
        implementations: implementations || [],
        metrics: metrics || []
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentStats = () => {
    const hasPersonal = data.assessments.some(a => a.assessment_type === 'personal_productivity');
    const hasBusiness = data.assessments.some(a => a.assessment_type === 'business_transformation');
    const hasCFO = data.assessments.some(a => a.assessment_score !== undefined);
    
    return {
      completed: [hasPersonal, hasBusiness, hasCFO].filter(Boolean).length,
      total: 3,
      hasPersonal,
      hasBusiness,
      hasCFO
    };
  };

  const getImplementationStats = () => {
    const total = data.implementations.length;
    const completed = data.implementations.filter(i => i.status === 'completed').length;
    const inProgress = data.implementations.filter(i => i.status === 'in_progress').length;
    const avgProgress = total > 0 ? 
      data.implementations.reduce((sum, i) => sum + (i.progress_percentage || 0), 0) / total : 0;

    return { total, completed, inProgress, avgProgress: Math.round(avgProgress) };
  };

  const getRecommendationType = () => {
    if (data.profile?.assessmentType === 'cfo') return 'cfo';
    if (data.profile?.assessmentType === 'business_transformation') return 'business';
    return 'personal';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data.profile || data.assessments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
        <Card className="max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="w-6 h-6" />
              Welcome to Your AI Journey
            </CardTitle>
            <CardDescription>
              Let's start with an assessment to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button 
                onClick={() => window.location.href = '/assessment'} 
                className="w-full flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Personal Productivity Assessment
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/assessment'} 
                className="w-full flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                Business Transformation Assessment
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/cfo'} 
                className="w-full flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                CFO Executive Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assessmentStats = getAssessmentStats();
  const implementationStats = getImplementationStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-text">
            {data.profile.assessmentType === 'cfo' ? 'CFO Command Center' :
             data.profile.assessmentType === 'business_transformation' ? 'Business Transformation Hub' :
             'Personal AI Dashboard'}
          </h1>
          <p className="text-xl text-muted-foreground">
            Your AI-Powered Productivity Journey
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              {data.profile.role} • {data.profile.industry}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {data.profile.assessmentType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessmentStats.completed}/3</div>
              <p className="text-xs text-muted-foreground">
                {assessmentStats.completed === 3 ? 'All assessments complete!' : 
                 `${3 - assessmentStats.completed} remaining`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tools Implemented</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{implementationStats.completed}</div>
              <p className="text-xs text-muted-foreground">
                {implementationStats.inProgress} in progress
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{implementationStats.avgProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Across all implementations
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Metrics</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.metrics.length}</div>
              <p className="text-xs text-muted-foreground">
                Tracked measurements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="implementations">Implementations</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Recommendations</CardTitle>
                  <CardDescription>Based on your latest assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <EnhancedRecommendations 
                    assessmentType={getRecommendationType() as any}
                    maxRecommendations={3}
                  />
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions and progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.implementations.slice(0, 5).map((impl) => (
                    <div key={impl.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {impl.tools?.name?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{impl.tools?.name}</p>
                          <Badge variant={
                            impl.status === 'completed' ? 'default' :
                            impl.status === 'in_progress' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {impl.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{impl.progress_percentage || 0}%</p>
                      </div>
                    </div>
                  ))}
                  {data.implementations.length === 0 && (
                    <p className="text-center text-muted-foreground py-8 text-sm">
                      No implementations started yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <EnhancedRecommendations 
              assessmentType={getRecommendationType() as any}
              maxRecommendations={12}
            />
          </TabsContent>

          <TabsContent value="implementations">
            <div className="grid gap-6">
              {data.implementations.map((impl) => (
                <Card key={impl.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <span className="font-medium">
                            {impl.tools?.name?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{impl.tools?.name}</CardTitle>
                          <CardDescription>{impl.tools?.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={
                        impl.status === 'completed' ? 'default' :
                        impl.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {impl.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{impl.progress_percentage || 0}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${impl.progress_percentage || 0}%` }}
                          />
                        </div>
                      </div>
                      {impl.notes && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm">{impl.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {data.implementations.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No implementations yet</p>
                    <p className="text-sm text-muted-foreground text-center">
                      Visit the recommendations tab to start implementing AI tools
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => setActiveTab('recommendations')}
                    >
                      View Recommendations
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assessments">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment History</CardTitle>
                  <CardDescription>Your completed assessments and scores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.assessments.map((assessment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {assessment.assessment_type === 'personal_productivity' && <User className="w-5 h-5" />}
                          {assessment.assessment_type === 'business_transformation' && <Building className="w-5 h-5" />}
                          {assessment.assessment_score !== undefined && <TrendingUp className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium">
                            {assessment.assessment_type === 'personal_productivity' && 'Personal Productivity'}
                            {assessment.assessment_type === 'business_transformation' && 'Business Transformation'}
                            {assessment.assessment_score !== undefined && 'CFO Executive Assessment'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Completed {new Date(assessment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {assessment.assessment_score !== undefined && (
                          <div className="text-2xl font-bold text-primary">
                            {assessment.assessment_score}/100
                          </div>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {assessment.status || 'completed'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Assessment Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Complete More Assessments</CardTitle>
                  <CardDescription>Get better recommendations with additional assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {!assessmentStats.hasPersonal && (
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/assessment'} 
                        className="w-full justify-start gap-2"
                      >
                        <User className="w-4 h-4" />
                        Complete Personal Productivity Assessment
                      </Button>
                    )}
                    {!assessmentStats.hasBusiness && (
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/assessment'} 
                        className="w-full justify-start gap-2"
                      >
                        <Building className="w-4 h-4" />
                        Complete Business Transformation Assessment
                      </Button>
                    )}
                    {!assessmentStats.hasCFO && (
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/cfo'} 
                        className="w-full justify-start gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Complete CFO Executive Assessment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}