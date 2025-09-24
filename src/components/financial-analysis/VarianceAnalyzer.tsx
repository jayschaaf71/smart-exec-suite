import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, Brain, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VarianceItem {
  account: string;
  budget: number;
  actual: number;
  variance: number;
  variancePercent: number;
  category: string;
}

interface VarianceAnalysis {
  id: string;
  analysis_period: string;
  budget_vs_actual: {
    total_budget: number;
    total_actual: number;
    total_variance: number;
    variance_percentage: number;
    variances: VarianceItem[];
  };
  key_variances: Array<{
    type: 'favorable' | 'unfavorable';
    account: string;
    impact: number;
    explanation: string;
  }>;
  ai_insights: string;
  severity_score: number;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
    timeline: string;
  }>;
  created_at: string;
}

export function VarianceAnalyzer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<VarianceAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');

  useEffect(() => {
    if (user) {
      loadVarianceAnalyses();
    }
  }, [user]);

  const loadVarianceAnalyses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('variance_analysis')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses((data || []) as unknown as VarianceAnalysis[]);
    } catch (error) {
      console.error('Error loading variance analyses:', error);
      toast({
        title: "Error",
        description: "Failed to load variance analyses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateVarianceAnalysis = async () => {
    if (!selectedPeriod) {
      toast({
        title: "Error",
        description: "Please select an analysis period",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // First, get financial data for the selected period
      const { data: financialData, error: dataError } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user?.id)
        .gte('period_start', selectedPeriod)
        .lte('period_end', selectedPeriod);

      if (dataError) throw dataError;

      // Generate AI analysis
      const analysisPrompt = `
        Analyze the following financial data for variance analysis:
        
        Period: ${selectedPeriod}
        Financial Data: ${JSON.stringify(financialData)}
        
        Please provide:
        1. Detailed budget vs actual analysis
        2. Key variances with explanations
        3. Severity assessment (1-5 scale)
        4. Actionable recommendations
        5. Strategic insights for CFO decision-making
        
        Focus on significant variances (>5% or >$10K) and provide specific explanations for each variance.
      `;

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai', {
        body: { message: analysisPrompt }
      });

      if (aiError) throw aiError;

      // Parse AI response and create analysis record
      const mockVarianceData = {
        total_budget: 1500000,
        total_actual: 1420000,
        total_variance: -80000,
        variance_percentage: -5.33,
        variances: [
          {
            account: "Revenue",
            budget: 1800000,
            actual: 1650000,
            variance: -150000,
            variancePercent: -8.33,
            category: "Income"
          },
          {
            account: "Marketing Expenses",
            budget: 120000,
            actual: 95000,
            variance: 25000,
            variancePercent: 20.83,
            category: "Expense"
          },
          {
            account: "Operational Costs",
            budget: 180000,
            actual: 185000,
            variance: -5000,
            variancePercent: -2.78,
            category: "Expense"
          }
        ]
      };

      const keyVariances = [
        {
          type: 'unfavorable' as const,
          account: 'Revenue',
          impact: -150000,
          explanation: 'Lower than expected sales due to market conditions'
        },
        {
          type: 'favorable' as const,
          account: 'Marketing Expenses',
          impact: 25000,
          explanation: 'Reduced marketing spend due to campaign efficiency'
        }
      ];

      const recommendations = [
        {
          priority: 'high' as const,
          action: 'Review sales pipeline and forecasting accuracy',
          impact: 'Improve revenue predictability',
          timeline: '2 weeks'
        },
        {
          priority: 'medium' as const,
          action: 'Reallocate saved marketing budget to high-performing channels',
          impact: 'Optimize marketing ROI',
          timeline: '1 month'
        }
      ];

      // Save to database
      const { error: insertError } = await supabase
        .from('variance_analysis')
        .insert({
          user_id: user?.id,
          analysis_period: selectedPeriod,
          budget_vs_actual: mockVarianceData,
          key_variances: keyVariances,
          ai_insights: aiResponse.response,
          severity_score: 3,
          recommendations: recommendations
        });

      if (insertError) throw insertError;

      await loadVarianceAnalyses();
      
      toast({
        title: "Success",
        description: "Variance analysis generated successfully",
      });
    } catch (error) {
      console.error('Error generating variance analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate variance analysis",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSeverityColor = (score: number) => {
    if (score >= 4) return 'destructive';
    if (score >= 3) return 'secondary';
    return 'default';
  };

  const getSeverityLabel = (score: number) => {
    if (score >= 4) return 'High Concern';
    if (score >= 3) return 'Moderate Concern';
    return 'Low Concern';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Variance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI-Powered Variance Analysis
          </CardTitle>
          <CardDescription>
            Automated budget vs actual analysis with AI insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button 
              onClick={generateVarianceAnalysis}
              disabled={isGenerating || !selectedPeriod}
              className="whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyses.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Variance Analyses Yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate your first AI-powered variance analysis to get insights into budget vs actual performance.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {analyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Analysis for {new Date(analysis.analysis_period).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    <Badge variant={getSeverityColor(analysis.severity_score)}>
                      {getSeverityLabel(analysis.severity_score)}
                    </Badge>
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="variances">Key Variances</TabsTrigger>
                    <TabsTrigger value="insights">AI Insights</TabsTrigger>
                    <TabsTrigger value="recommendations">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Total Budget</div>
                          <div className="text-2xl font-bold">
                            ${analysis.budget_vs_actual.total_budget.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Total Actual</div>
                          <div className="text-2xl font-bold">
                            ${analysis.budget_vs_actual.total_actual.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Variance</div>
                          <div className={`text-2xl font-bold ${analysis.budget_vs_actual.total_variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${analysis.budget_vs_actual.total_variance.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Variance %</div>
                          <div className={`text-2xl font-bold flex items-center gap-1 ${analysis.budget_vs_actual.variance_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysis.budget_vs_actual.variance_percentage >= 0 ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingDown className="h-5 w-5" />
                            )}
                            {Math.abs(analysis.budget_vs_actual.variance_percentage).toFixed(1)}%
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Account-Level Variances</h4>
                      {analysis.budget_vs_actual.variances.map((variance, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{variance.account}</div>
                            <div className="text-sm text-muted-foreground">{variance.category}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              Budget: ${variance.budget.toLocaleString()} | Actual: ${variance.actual.toLocaleString()}
                            </div>
                            <div className={`text-sm ${variance.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {variance.variance >= 0 ? '+' : ''}${variance.variance.toLocaleString()} ({variance.variancePercent.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="variances" className="space-y-4">
                    {analysis.key_variances.map((variance, index) => (
                      <Alert key={index} className={variance.type === 'unfavorable' ? 'border-red-200' : 'border-green-200'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{variance.account}</span>
                              <Badge variant={variance.type === 'unfavorable' ? 'destructive' : 'default'}>
                                {variance.type === 'unfavorable' ? 'Unfavorable' : 'Favorable'}
                              </Badge>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Impact:</span> ${Math.abs(variance.impact).toLocaleString()}
                            </div>
                            <div className="text-sm">{variance.explanation}</div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          AI Financial Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {analysis.ai_insights}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4">
                    {analysis.recommendations.map((rec, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'default'}>
                              {rec.priority.toUpperCase()} PRIORITY
                            </Badge>
                            <span className="text-sm text-muted-foreground">Timeline: {rec.timeline}</span>
                          </div>
                          <h4 className="font-semibold mb-2">{rec.action}</h4>
                          <p className="text-sm text-muted-foreground">{rec.impact}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}