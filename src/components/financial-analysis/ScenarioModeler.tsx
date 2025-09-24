import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Calculator, Brain, Loader2, Settings, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ScenarioAssumption {
  category: string;
  parameter: string;
  baseValue: number;
  scenarioValue: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

interface ScenarioMetric {
  metric: string;
  baseCase: number;
  scenarioValue: number;
  change: number;
  changePercent: number;
}

interface FinancialScenario {
  id: string;
  scenario_name: string;
  scenario_type: 'best_case' | 'worst_case' | 'custom';
  assumptions: {
    revenue_growth: number;
    expense_growth: number;
    market_conditions: string;
    assumptions_list: ScenarioAssumption[];
  };
  projections: {
    quarterly_revenue: number[];
    quarterly_expenses: number[];
    quarterly_profit: number[];
    annual_summary: {
      total_revenue: number;
      total_expenses: number;
      net_profit: number;
      profit_margin: number;
    };
  };
  key_metrics: {
    metrics: ScenarioMetric[];
    risk_factors: string[];
    opportunities: string[];
  };
  ai_insights: string;
  created_at: string;
  updated_at: string;
}

export function ScenarioModeler() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<FinancialScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('scenarios');

  // Scenario creation form state
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioType, setScenarioType] = useState<'best_case' | 'worst_case' | 'custom'>('custom');
  const [revenueGrowth, setRevenueGrowth] = useState('10');
  const [expenseGrowth, setExpenseGrowth] = useState('5');
  const [marketConditions, setMarketConditions] = useState('stable');
  const [customDescription, setCustomDescription] = useState('');

  useEffect(() => {
    if (user) {
      loadScenarios();
    }
  }, [user]);

  const loadScenarios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_scenarios')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScenarios((data || []) as unknown as FinancialScenario[]);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      toast({
        title: "Error",
        description: "Failed to load financial scenarios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateScenario = async () => {
    if (!scenarioName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a scenario name",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate AI analysis for scenario modeling
      const analysisPrompt = `
        Create a detailed financial scenario analysis with the following parameters:
        
        Scenario Name: ${scenarioName}
        Scenario Type: ${scenarioType}
        Revenue Growth: ${revenueGrowth}%
        Expense Growth: ${expenseGrowth}%
        Market Conditions: ${marketConditions}
        Description: ${customDescription}
        
        Please provide:
        1. Detailed quarterly projections for revenue, expenses, and profit
        2. Key assumptions and their potential impact
        3. Risk factors and mitigation strategies
        4. Opportunities for optimization
        5. Strategic recommendations for this scenario
        6. Comparison with baseline scenario
        
        Focus on realistic projections and actionable insights for CFO decision-making.
      `;

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai', {
        body: { message: analysisPrompt }
      });

      if (aiError) throw aiError;

      // Generate scenario data
      const baseRevenue = 2000000; // $2M quarterly base
      const baseExpenses = 1500000; // $1.5M quarterly base
      
      const revenueMultiplier = 1 + (parseFloat(revenueGrowth) / 100);
      const expenseMultiplier = 1 + (parseFloat(expenseGrowth) / 100);
      
      // Apply scenario-specific adjustments
      let scenarioRevenueAdj = 1;
      let scenarioExpenseAdj = 1;
      
      if (scenarioType === 'best_case') {
        scenarioRevenueAdj = 1.2;
        scenarioExpenseAdj = 0.9;
      } else if (scenarioType === 'worst_case') {
        scenarioRevenueAdj = 0.8;
        scenarioExpenseAdj = 1.1;
      }

      const quarterlyRevenue = [1, 2, 3, 4].map(q => 
        Math.round(baseRevenue * revenueMultiplier * scenarioRevenueAdj * (1 + (q * 0.02)))
      );
      
      const quarterlyExpenses = [1, 2, 3, 4].map(q => 
        Math.round(baseExpenses * expenseMultiplier * scenarioExpenseAdj * (1 + (q * 0.01)))
      );
      
      const quarterlyProfit = quarterlyRevenue.map((rev, i) => rev - quarterlyExpenses[i]);
      
      const totalRevenue = quarterlyRevenue.reduce((sum, q) => sum + q, 0);
      const totalExpenses = quarterlyExpenses.reduce((sum, q) => sum + q, 0);
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = (netProfit / totalRevenue) * 100;

      // Generate key assumptions
      const assumptionsList: ScenarioAssumption[] = [
        {
          category: 'Revenue',
          parameter: 'Growth Rate',
          baseValue: 5,
          scenarioValue: parseFloat(revenueGrowth),
          impact: Math.abs(parseFloat(revenueGrowth) - 5) > 10 ? 'high' : 'medium',
          description: `Revenue growth adjusted to ${revenueGrowth}% based on ${marketConditions} market conditions`
        },
        {
          category: 'Expenses',
          parameter: 'Cost Inflation',
          baseValue: 3,
          scenarioValue: parseFloat(expenseGrowth),
          impact: Math.abs(parseFloat(expenseGrowth) - 3) > 5 ? 'high' : 'medium',
          description: `Expense growth set to ${expenseGrowth}% accounting for operational scaling and inflation`
        },
        {
          category: 'Market',
          parameter: 'Conditions',
          baseValue: 0,
          scenarioValue: marketConditions === 'favorable' ? 1 : marketConditions === 'challenging' ? -1 : 0,
          impact: marketConditions !== 'stable' ? 'high' : 'low',
          description: `Market conditions assumed to be ${marketConditions} affecting both revenue and cost structures`
        }
      ];

      // Generate key metrics comparison
      const baseNetProfit = (baseRevenue * 4) - (baseExpenses * 4);
      const keyMetrics: ScenarioMetric[] = [
        {
          metric: 'Annual Revenue',
          baseCase: baseRevenue * 4,
          scenarioValue: totalRevenue,
          change: totalRevenue - (baseRevenue * 4),
          changePercent: ((totalRevenue - (baseRevenue * 4)) / (baseRevenue * 4)) * 100
        },
        {
          metric: 'Annual Expenses',
          baseCase: baseExpenses * 4,
          scenarioValue: totalExpenses,
          change: totalExpenses - (baseExpenses * 4),
          changePercent: ((totalExpenses - (baseExpenses * 4)) / (baseExpenses * 4)) * 100
        },
        {
          metric: 'Net Profit',
          baseCase: baseNetProfit,
          scenarioValue: netProfit,
          change: netProfit - baseNetProfit,
          changePercent: ((netProfit - baseNetProfit) / Math.abs(baseNetProfit)) * 100
        },
        {
          metric: 'Profit Margin',
          baseCase: (baseNetProfit / (baseRevenue * 4)) * 100,
          scenarioValue: profitMargin,
          change: profitMargin - ((baseNetProfit / (baseRevenue * 4)) * 100),
          changePercent: 0
        }
      ];

      const riskFactors = [
        'Market volatility could impact revenue projections',
        'Supply chain disruptions may increase costs',
        'Competition could pressure pricing and margins',
        'Economic downturn could reduce customer spending'
      ];

      const opportunities = [
        'Digital transformation could improve efficiency',
        'New market segments offer growth potential',
        'Process automation could reduce operational costs',
        'Strategic partnerships could accelerate growth'
      ];

      // Save to database
      const { error: insertError } = await supabase
        .from('financial_scenarios')
        .insert({
          user_id: user?.id,
          scenario_name: scenarioName,
          scenario_type: scenarioType,
          assumptions: {
            revenue_growth: parseFloat(revenueGrowth),
            expense_growth: parseFloat(expenseGrowth),
            market_conditions: marketConditions,
            assumptions_list: assumptionsList
          } as any,
          projections: {
            quarterly_revenue: quarterlyRevenue,
            quarterly_expenses: quarterlyExpenses,
            quarterly_profit: quarterlyProfit,
            annual_summary: {
              total_revenue: totalRevenue,
              total_expenses: totalExpenses,
              net_profit: netProfit,
              profit_margin: profitMargin
            }
          } as any,
          key_metrics: {
            metrics: keyMetrics,
            risk_factors: riskFactors,
            opportunities: opportunities
          } as any,
          ai_insights: aiResponse.response
        });

      if (insertError) throw insertError;

      // Reset form
      setScenarioName('');
      setScenarioType('custom');
      setRevenueGrowth('10');
      setExpenseGrowth('5');
      setMarketConditions('stable');
      setCustomDescription('');
      setActiveTab('scenarios');

      await loadScenarios();
      
      toast({
        title: "Success",
        description: "Scenario generated successfully",
      });
    } catch (error) {
      console.error('Error generating scenario:', error);
      toast({
        title: "Error",
        description: "Failed to generate financial scenario",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'best_case': return 'default';
      case 'worst_case': return 'destructive';
      case 'custom': return 'secondary';
      default: return 'default';
    }
  };

  const formatChartData = (scenario: FinancialScenario) => {
    return [1, 2, 3, 4].map(quarter => ({
      quarter: `Q${quarter}`,
      Revenue: scenario.projections.quarterly_revenue[quarter - 1],
      Expenses: scenario.projections.quarterly_expenses[quarter - 1],
      Profit: scenario.projections.quarterly_profit[quarter - 1]
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Scenario Modeler
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
            <Calculator className="h-5 w-5" />
            AI-Powered Scenario Modeling
          </CardTitle>
          <CardDescription>
            Create and analyze what-if scenarios for strategic financial planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Scenario</TabsTrigger>
              <TabsTrigger value="scenarios">View Scenarios ({scenarios.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scenarioName">Scenario Name</Label>
                    <Input
                      id="scenarioName"
                      placeholder="e.g., Economic Downturn Impact"
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="scenarioType">Scenario Type</Label>
                    <Select value={scenarioType} onValueChange={(value: any) => setScenarioType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="best_case">Best Case</SelectItem>
                        <SelectItem value="worst_case">Worst Case</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="revenueGrowth">Revenue Growth (%)</Label>
                    <Input
                      id="revenueGrowth"
                      type="number"
                      step="0.1"
                      value={revenueGrowth}
                      onChange={(e) => setRevenueGrowth(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expenseGrowth">Expense Growth (%)</Label>
                    <Input
                      id="expenseGrowth"
                      type="number"
                      step="0.1"
                      value={expenseGrowth}
                      onChange={(e) => setExpenseGrowth(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="marketConditions">Market Conditions</Label>
                    <Select value={marketConditions} onValueChange={setMarketConditions}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="favorable">Favorable</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="challenging">Challenging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Scenario Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the key assumptions and context for this scenario..."
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={generateScenario}
                    disabled={isGenerating || !scenarioName.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Scenario...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Scenario
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              {scenarios.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Scenarios Created Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first financial scenario to explore different what-if situations.
                      </p>
                      <Button onClick={() => setActiveTab('create')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Create First Scenario
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {scenarios.map((scenario) => (
                    <Card key={scenario.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            {scenario.scenario_name}
                            <Badge variant={getScenarioColor(scenario.scenario_type)}>
                              {scenario.scenario_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </CardTitle>
                          <span className="text-sm text-muted-foreground">
                            Created {new Date(scenario.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="summary" className="w-full">
                          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                            <TabsTrigger value="projections">Projections</TabsTrigger>
                            <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
                            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                            <TabsTrigger value="insights">AI Insights</TabsTrigger>
                          </TabsList>

                          <TabsContent value="summary" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <Card>
                                <CardContent className="p-4">
                                  <div className="text-sm text-muted-foreground">Annual Revenue</div>
                                  <div className="text-2xl font-bold">
                                    ${scenario.projections.annual_summary.total_revenue.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-green-600">
                                    +{scenario.assumptions.revenue_growth}% growth
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4">
                                  <div className="text-sm text-muted-foreground">Annual Expenses</div>
                                  <div className="text-2xl font-bold">
                                    ${scenario.projections.annual_summary.total_expenses.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-red-600">
                                    +{scenario.assumptions.expense_growth}% growth
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4">
                                  <div className="text-sm text-muted-foreground">Net Profit</div>
                                  <div className={`text-2xl font-bold ${scenario.projections.annual_summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${scenario.projections.annual_summary.net_profit.toLocaleString()}
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4">
                                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                                  <div className={`text-2xl font-bold ${scenario.projections.annual_summary.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {scenario.projections.annual_summary.profit_margin.toFixed(1)}%
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="projections" className="space-y-4">
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={formatChartData(scenario)}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="quarter" />
                                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                                  <Tooltip 
                                    formatter={(value: number, name: string) => [
                                      `$${value.toLocaleString()}`,
                                      name
                                    ]}
                                  />
                                  <Bar dataKey="Revenue" fill="#10b981" />
                                  <Bar dataKey="Expenses" fill="#ef4444" />
                                  <Bar dataKey="Profit" fill="#3b82f6" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </TabsContent>

                          <TabsContent value="assumptions" className="space-y-4">
                            {scenario.assumptions.assumptions_list.map((assumption, index) => (
                              <Card key={index}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold">{assumption.category}: {assumption.parameter}</span>
                                    <Badge variant={assumption.impact === 'high' ? 'destructive' : assumption.impact === 'medium' ? 'secondary' : 'default'}>
                                      {assumption.impact.toUpperCase()} IMPACT
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-2">
                                    Base: {assumption.baseValue}% → Scenario: {assumption.scenarioValue}%
                                  </div>
                                  <div className="text-sm">{assumption.description}</div>
                                </CardContent>
                              </Card>
                            ))}
                          </TabsContent>

                          <TabsContent value="metrics" className="space-y-4">
                            <div className="space-y-4">
                              {scenario.key_metrics.metrics.map((metric, index) => (
                                <Card key={index}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-semibold">{metric.metric}</span>
                                      <div className={`flex items-center gap-1 ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {metric.change >= 0 ? (
                                          <TrendingUp className="h-4 w-4" />
                                        ) : (
                                          <TrendingDown className="h-4 w-4" />
                                        )}
                                        {metric.changePercent !== 0 && (
                                          <span>{Math.abs(metric.changePercent).toFixed(1)}%</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <div className="text-muted-foreground">Base Case</div>
                                        <div className="font-medium">
                                          {metric.metric.includes('Margin') ? 
                                            `${metric.baseCase.toFixed(1)}%` : 
                                            `$${metric.baseCase.toLocaleString()}`
                                          }
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground">Scenario</div>
                                        <div className="font-medium">
                                          {metric.metric.includes('Margin') ? 
                                            `${metric.scenarioValue.toFixed(1)}%` : 
                                            `$${metric.scenarioValue.toLocaleString()}`
                                          }
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground">Change</div>
                                        <div className={`font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {metric.change >= 0 ? '+' : ''}
                                          {metric.metric.includes('Margin') ? 
                                            `${metric.change.toFixed(1)}%` : 
                                            `$${metric.change.toLocaleString()}`
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Risk Factors</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {scenario.key_metrics.risk_factors.map((risk, index) => (
                                      <li key={index} className="flex items-start gap-2 text-sm">
                                        <TrendingDown className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        {risk}
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Opportunities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {scenario.key_metrics.opportunities.map((opportunity, index) => (
                                      <li key={index} className="flex items-start gap-2 text-sm">
                                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        {opportunity}
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="insights" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Brain className="h-5 w-5" />
                                  AI Strategic Analysis
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {scenario.ai_insights}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}