import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CFOToolRecommendations } from './CFOToolRecommendations';
import { ImplementationWizard } from './ImplementationWizard';
import { ROICalculator } from './ROICalculator';
import { SuccessMetrics } from './SuccessMetrics';
import { CFOAssessment } from './CFOAssessment';
import { EnhancedRecommendations } from '@/components/recommendations/EnhancedRecommendations';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Clock, Target, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface CFODashboardData {
  assessment: any;
  recommendations: any[];
  implementations: any[];
  metrics: any[];
}

export function CFODashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<CFODashboardData>({
    assessment: null,
    recommendations: [],
    implementations: [],
    metrics: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssessment, setShowAssessment] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadAIAssessment();
    }
  }, [user]);

  const loadAIAssessment = async () => {
    if (!user) return;
    
    try {
      const { data: assessmentData } = await supabase
        .from('ai_assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('assessment_type', 'cfo')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      setAiAssessment(assessmentData);
    } catch (error) {
      console.error('Error loading AI assessment:', error);
    }
  };

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load assessment data
      const { data: assessment } = await supabase
        .from('cfo_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Load recommendations
      const { data: recommendations } = await supabase
        .from('cfo_tool_recommendations')
        .select(`
          *,
          tools (
            name,
            description,
            logo_url,
            pricing_model,
            setup_difficulty
          )
        `)
        .eq('user_id', user.id)
        .order('implementation_priority', { ascending: true });

      // Load implementations
      const { data: implementations } = await supabase
        .from('tool_implementations')
        .select(`
          *,
          tools (
            name,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load success metrics
      const { data: metrics } = await supabase
        .from('user_success_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false });

      setData({
        assessment,
        recommendations: recommendations || [],
        implementations: implementations || [],
        metrics: metrics || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = async (assessmentData: any) => {
    setData(prev => ({ ...prev, assessment: assessmentData }));
    setShowAssessment(false);
    
    // Generate AI assessment after CFO assessment is complete
    try {
      const { data: aiData, error } = await supabase.functions.invoke('ai-assessment', {
        body: {
          assessmentType: 'cfo',
          userProfile: {
            role: 'CFO',
            industry: assessmentData.companyProfile.industry,
            companySize: assessmentData.companyProfile.employees,
            currentStack: assessmentData.currentStack,
            painPoints: assessmentData.painPoints,
            goals: assessmentData.goals
          }
        }
      });

      if (error) throw error;
      
      setAiAssessment(aiData.assessment);
      toast({
        title: "AI Assessment Complete!",
        description: "Your personalized CFO recommendations are ready.",
      });
    } catch (error) {
      console.error('Error generating AI assessment:', error);
      toast({
        title: "Assessment Complete!",
        description: "Your CFO recommendations have been updated.",
      });
    }
    
    // Reload dashboard data
    loadDashboardData();
  };

  const getProgressStats = () => {
    const totalRecommendations = data.recommendations.length;
    const completedImplementations = data.implementations.filter(imp => imp.status === 'completed').length;
    const inProgressImplementations = data.implementations.filter(imp => imp.status === 'in_progress').length;
    const plannedImplementations = data.implementations.filter(imp => imp.status === 'planned').length;

    const completionRate = totalRecommendations > 0 ? (completedImplementations / totalRecommendations) * 100 : 0;

    return {
      totalRecommendations,
      completedImplementations,
      inProgressImplementations,
      plannedImplementations,
      completionRate
    };
  };

  const getROIStats = () => {
    const totalTimeSaved = data.metrics
      .filter(m => m.metric_name === 'time_saved_weekly')
      .reduce((sum, m) => sum + Number(m.metric_value), 0);

    const totalCostSavings = data.metrics
      .filter(m => m.metric_name === 'cost_savings')
      .reduce((sum, m) => sum + Number(m.metric_value), 0);

    const avgROI = data.implementations
      .filter(imp => imp.roi_achieved_percentage > 0)
      .reduce((sum, imp, index, arr) => sum + imp.roi_achieved_percentage / arr.length, 0);

    return {
      totalTimeSaved,
      totalCostSavings,
      avgROI: Math.round(avgROI || 0)
    };
  };

  const getIndustrySpecificInsights = () => {
    if (!data.assessment) return [];

    const industry = data.assessment.company_profile?.industry;
    const insights = {
      manufacturing: [
        "Focus on cost accounting automation for 30% time savings",
        "Supply chain finance tools can improve working capital by 15%",
        "Predictive maintenance finance reduces unplanned costs by 20%"
      ],
      saas: [
        "Revenue recognition automation can cut month-end close by 60%",
        "Unit economics analytics improve customer profitability insights by 25%",
        "Cash flow forecasting accuracy can improve by 40%"
      ],
      healthcare: [
        "Compliance automation reduces workload by 50%",
        "Patient cost analytics improve cost management by 15%",
        "Payer contract optimization improves negotiations by 10%"
      ],
      retail: [
        "Inventory optimization reduces carrying costs by 20%",
        "Seasonal forecasting improves cash management by 25%",
        "Category profitability analysis increases margins by 15%"
      ]
    };

    return insights[industry as keyof typeof insights] || [
      "AI-powered financial reporting can save 40-60% of reporting time",
      "Automated variance analysis improves accuracy and speed",
      "Predictive analytics enable proactive decision making"
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showAssessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CFOAssessment onComplete={handleAssessmentComplete} />
      </div>
    );
  }

  if (!data.assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Welcome to CFO Dashboard</CardTitle>
            <CardDescription>
              Complete your assessment to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowAssessment(true)} className="w-full">
              Start CFO Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressStats = getProgressStats();
  const roiStats = getROIStats();
  const industryInsights = getIndustrySpecificInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-text">CFO Command Center</h1>
          <p className="text-xl text-muted-foreground">
            Your AI-Powered Financial Leadership Hub
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              Assessment Score: {data.assessment.assessment_score}/100
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Industry: {data.assessment.company_profile?.industry || 'General'}
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Implementation Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(progressStats.completionRate)}%</div>
              <p className="text-xs text-muted-foreground">
                {progressStats.completedImplementations} of {progressStats.totalRecommendations} tools deployed
              </p>
              <Progress value={progressStats.completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roiStats.totalTimeSaved}h</div>
              <p className="text-xs text-muted-foreground">
                ${Math.round(roiStats.totalTimeSaved * 200)} value per week
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${roiStats.totalCostSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Annualized savings
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roiStats.avgROI}%</div>
              <p className="text-xs text-muted-foreground">
                Across implemented tools
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Industry Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Industry-Specific Opportunities</span>
            </CardTitle>
            <CardDescription>
              Tailored insights for {data.assessment.company_profile?.industry} CFOs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {industryInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-accent/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tools">Tool Recommendations</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="metrics">Success Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Implementations */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Implementations</CardTitle>
                  <CardDescription>Track your tool deployment progress</CardDescription>
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
                          <p className="font-medium">{impl.tools?.name}</p>
                          <Badge variant={
                            impl.status === 'completed' ? 'default' :
                            impl.status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {impl.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{impl.progress_percentage}%</p>
                        <Progress value={impl.progress_percentage} className="w-20" />
                      </div>
                    </div>
                  ))}
                  {data.implementations.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No implementations started yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* ROI Calculator Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>ROI Calculator</CardTitle>
                  <CardDescription>Estimate your potential returns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ROICalculator compact={true} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="space-y-6">
              <EnhancedRecommendations 
                assessmentType="cfo" 
                maxRecommendations={8}
              />
              <CFOToolRecommendations 
                recommendations={data.recommendations}
                onRefresh={loadDashboardData}
              />
            </div>
          </TabsContent>

          <TabsContent value="implementation">
            <ImplementationWizard 
              implementations={data.implementations}
              onRefresh={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="metrics">
            <SuccessMetrics 
              metrics={data.metrics}
              implementations={data.implementations}
              onRefresh={loadDashboardData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}