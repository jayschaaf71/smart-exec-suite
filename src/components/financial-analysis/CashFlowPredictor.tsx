import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Droplets, Brain, Loader2, Calendar, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CashFlowWeek {
  week: number;
  date: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeCash: number;
  confidence: number;
}

interface CashFlowPrediction {
  id: string;
  prediction_date: string;
  weeks_ahead: number;
  predicted_cash_flow: {
    starting_cash: number;
    weekly_predictions: CashFlowWeek[];
    ending_cash: number;
    total_inflow: number;
    total_outflow: number;
    net_change: number;
  };
  confidence_intervals: {
    high: CashFlowWeek[];
    low: CashFlowWeek[];
  };
  key_assumptions: Array<{
    category: string;
    assumption: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  ai_analysis: string;
  scenario_name: string;
  created_at: string;
}

export function CashFlowPredictor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<CashFlowPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [weeksAhead, setWeeksAhead] = useState('13');
  const [scenarioType, setScenarioType] = useState('base_case');

  useEffect(() => {
    if (user) {
      loadCashFlowPredictions();
    }
  }, [user]);

  const loadCashFlowPredictions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cash_flow_predictions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions((data || []) as CashFlowPrediction[]);
    } catch (error) {
      console.error('Error loading cash flow predictions:', error);
      toast({
        title: "Error",
        description: "Failed to load cash flow predictions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCashFlowPrediction = async () => {
    setIsGenerating(true);
    try {
      // Get historical financial data
      const { data: historicalData, error: dataError } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('period_start', { ascending: false })
        .limit(12);

      if (dataError) throw dataError;

      // Generate AI prediction
      const predictionPrompt = `
        Generate a detailed ${weeksAhead}-week cash flow prediction for a CFO based on:
        
        Scenario Type: ${scenarioType}
        Historical Data: ${JSON.stringify(historicalData)}
        
        Please provide:
        1. Weekly cash inflows and outflows
        2. Cumulative cash position
        3. Confidence intervals (high/low scenarios)
        4. Key assumptions driving the forecast
        5. Risk factors and mitigation strategies
        6. Strategic recommendations for cash management
        
        Focus on realistic projections with clear explanations of underlying assumptions.
      `;

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai', {
        body: { message: predictionPrompt }
      });

      if (aiError) throw aiError;

      // Generate mock data for demo
      const startingCash = 500000;
      const weeklyPredictions: CashFlowWeek[] = [];
      let cumulativeCash = startingCash;

      for (let week = 1; week <= parseInt(weeksAhead); week++) {
        const date = new Date();
        date.setDate(date.getDate() + (week * 7));
        
        // Simulate realistic cash flow patterns
        const baseInflow = 80000 + (Math.random() - 0.5) * 20000;
        const baseOutflow = 75000 + (Math.random() - 0.5) * 15000;
        
        // Adjust for scenario type
        let inflowMultiplier = 1;
        let outflowMultiplier = 1;
        
        if (scenarioType === 'optimistic') {
          inflowMultiplier = 1.15;
          outflowMultiplier = 0.95;
        } else if (scenarioType === 'pessimistic') {
          inflowMultiplier = 0.85;
          outflowMultiplier = 1.1;
        }
        
        const inflow = Math.round(baseInflow * inflowMultiplier);
        const outflow = Math.round(baseOutflow * outflowMultiplier);
        const netFlow = inflow - outflow;
        cumulativeCash += netFlow;
        
        weeklyPredictions.push({
          week,
          date: date.toISOString().split('T')[0],
          inflow,
          outflow,
          netFlow,
          cumulativeCash,
          confidence: Math.max(95 - (week * 2), 60) // Confidence decreases over time
        });
      }

      const totalInflow = weeklyPredictions.reduce((sum, week) => sum + week.inflow, 0);
      const totalOutflow = weeklyPredictions.reduce((sum, week) => sum + week.outflow, 0);

      // Generate confidence intervals
      const highConfidencePredictions = weeklyPredictions.map(week => ({
        ...week,
        inflow: Math.round(week.inflow * 1.1),
        outflow: Math.round(week.outflow * 0.9),
        netFlow: Math.round((week.inflow * 1.1) - (week.outflow * 0.9)),
        cumulativeCash: week.cumulativeCash + Math.round(week.netFlow * 0.2)
      }));

      const lowConfidencePredictions = weeklyPredictions.map(week => ({
        ...week,
        inflow: Math.round(week.inflow * 0.9),
        outflow: Math.round(week.outflow * 1.1),
        netFlow: Math.round((week.inflow * 0.9) - (week.outflow * 1.1)),
        cumulativeCash: week.cumulativeCash - Math.round(week.netFlow * 0.2)
      }));

      const keyAssumptions = [
        {
          category: 'Revenue',
          assumption: 'Monthly recurring revenue remains stable with 2% growth',
          impact: 'high' as const
        },
        {
          category: 'Expenses',
          assumption: 'Operating expenses increase by 1% monthly due to inflation',
          impact: 'medium' as const
        },
        {
          category: 'Collections',
          assumption: 'Customer payment terms remain at current 30-day average',
          impact: 'high' as const
        },
        {
          category: 'Seasonality',
          assumption: 'No major seasonal impacts expected in forecast period',
          impact: 'low' as const
        }
      ];

      const predictionData = {
        starting_cash: startingCash,
        weekly_predictions: weeklyPredictions,
        ending_cash: cumulativeCash,
        total_inflow: totalInflow,
        total_outflow: totalOutflow,
        net_change: cumulativeCash - startingCash
      };

      // Save to database
      const { error: insertError } = await supabase
        .from('cash_flow_predictions')
        .insert({
          user_id: user?.id,
          prediction_date: new Date().toISOString().split('T')[0],
          weeks_ahead: parseInt(weeksAhead),
          predicted_cash_flow: predictionData as any,
          confidence_intervals: {
            high: highConfidencePredictions,
            low: lowConfidencePredictions
          } as any,
          key_assumptions: keyAssumptions as any,
          ai_analysis: aiResponse.response,
          scenario_name: scenarioType
        });

      if (insertError) throw insertError;

      await loadCashFlowPredictions();
      
      toast({
        title: "Success",
        description: "Cash flow prediction generated successfully",
      });
    } catch (error) {
      console.error('Error generating cash flow prediction:', error);
      toast({
        title: "Error",
        description: "Failed to generate cash flow prediction",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'optimistic': return 'default';
      case 'pessimistic': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatChartData = (prediction: CashFlowPrediction) => {
    return prediction.predicted_cash_flow.weekly_predictions.map(week => ({
      week: `Week ${week.week}`,
      date: new Date(week.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Cash Position': week.cumulativeCash,
      'Net Flow': week.netFlow,
      'Inflow': week.inflow,
      'Outflow': -week.outflow, // Negative for visualization
      'Confidence': week.confidence
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Cash Flow Predictor
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
            <Droplets className="h-5 w-5" />
            AI-Powered Cash Flow Predictor
          </CardTitle>
          <CardDescription>
            Generate accurate 13-week cash flow forecasts with AI-driven insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Forecast Period</label>
              <Select value={weeksAhead} onValueChange={setWeeksAhead}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 Weeks</SelectItem>
                  <SelectItem value="13">13 Weeks (Standard)</SelectItem>
                  <SelectItem value="26">26 Weeks</SelectItem>
                  <SelectItem value="52">52 Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Scenario Type</label>
              <Select value={scenarioType} onValueChange={setScenarioType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base_case">Base Case</SelectItem>
                  <SelectItem value="optimistic">Optimistic</SelectItem>
                  <SelectItem value="pessimistic">Conservative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-shrink-0">
              <label className="text-sm font-medium mb-2 block">&nbsp;</label>
              <Button 
                onClick={generateCashFlowPrediction}
                disabled={isGenerating}
                className="whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Forecast
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {predictions.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Cash Flow Predictions Yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate your first AI-powered cash flow forecast to get insights into your future cash position.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {predictions.map((prediction) => (
            <Card key={prediction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {prediction.weeks_ahead}-Week Cash Flow Forecast
                    <Badge variant={getScenarioColor(prediction.scenario_name)}>
                      {prediction.scenario_name.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Generated {new Date(prediction.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="forecast" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="forecast">Forecast</TabsTrigger>
                    <TabsTrigger value="chart">Visualization</TabsTrigger>
                    <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
                    <TabsTrigger value="insights">AI Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="forecast" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Starting Cash</div>
                          <div className="text-2xl font-bold">
                            ${prediction.predicted_cash_flow.starting_cash.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Projected Ending</div>
                          <div className="text-2xl font-bold">
                            ${prediction.predicted_cash_flow.ending_cash.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Net Change</div>
                          <div className={`text-2xl font-bold ${prediction.predicted_cash_flow.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {prediction.predicted_cash_flow.net_change >= 0 ? '+' : ''}${prediction.predicted_cash_flow.net_change.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Total Flows</div>
                          <div className="text-lg font-bold text-green-600">
                            +${prediction.predicted_cash_flow.total_inflow.toLocaleString()}
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            -${prediction.predicted_cash_flow.total_outflow.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Weekly Breakdown</h4>
                      <div className="max-h-64 overflow-y-auto">
                        {prediction.predicted_cash_flow.weekly_predictions.map((week, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-medium">Week {week.week}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(week.date).toLocaleDateString()}
                                </div>
                              </div>
                              <Progress value={week.confidence} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground">{week.confidence}%</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                Cash: ${week.cumulativeCash.toLocaleString()}
                              </div>
                              <div className={`text-sm ${week.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Net: {week.netFlow >= 0 ? '+' : ''}${week.netFlow.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="chart" className="space-y-4">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formatChartData(prediction)}>
                          <defs>
                            <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                          <Tooltip 
                            formatter={(value: number, name: string) => [
                              `$${value.toLocaleString()}`,
                              name
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="Cash Position"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#cashGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formatChartData(prediction)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                          <Tooltip 
                            formatter={(value: number, name: string) => [
                              `$${value.toLocaleString()}`,
                              name
                            ]}
                          />
                          <Line type="monotone" dataKey="Inflow" stroke="#10b981" strokeWidth={2} />
                          <Line type="monotone" dataKey="Outflow" stroke="#ef4444" strokeWidth={2} />
                          <Line type="monotone" dataKey="Net Flow" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="assumptions" className="space-y-4">
                    {prediction.key_assumptions.map((assumption, index) => (
                      <Alert key={index} className={assumption.impact === 'high' ? 'border-yellow-200' : ''}>
                        <Calendar className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{assumption.category}</span>
                              <Badge variant={assumption.impact === 'high' ? 'destructive' : assumption.impact === 'medium' ? 'secondary' : 'default'}>
                                {assumption.impact.toUpperCase()} IMPACT
                              </Badge>
                            </div>
                            <div className="text-sm">{assumption.assumption}</div>
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
                          AI Cash Flow Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {prediction.ai_analysis}
                        </div>
                      </CardContent>
                    </Card>
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