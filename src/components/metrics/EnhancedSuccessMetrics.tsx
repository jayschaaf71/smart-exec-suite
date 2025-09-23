import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target, 
  BarChart,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SuccessMetricsProps {
  metrics: any[];
  implementations: any[];
  onRefresh: () => void;
}

interface MetricEntry {
  metric_name: string;
  metric_value: number;
  notes?: string;
  tool_id?: string;
}

export function SuccessMetrics({ metrics, implementations, onRefresh }: SuccessMetricsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMetric, setNewMetric] = useState<MetricEntry>({
    metric_name: '',
    metric_value: 0,
    notes: '',
    tool_id: ''
  });
  const [isAddingMetric, setIsAddingMetric] = useState(false);

  const predefinedMetrics = [
    { 
      name: 'time_saved_weekly', 
      label: 'Time Saved per Week',
      unit: 'hours',
      description: 'Hours saved per week through AI automation',
      icon: Clock,
      color: 'text-blue-600'
    },
    { 
      name: 'cost_savings_monthly', 
      label: 'Monthly Cost Savings',
      unit: 'dollars',
      description: 'Monthly cost reduction from efficiency gains',
      icon: DollarSign,
      color: 'text-green-600'
    },
    { 
      name: 'productivity_increase', 
      label: 'Productivity Increase',
      unit: 'percentage',
      description: 'Overall productivity improvement percentage',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    { 
      name: 'error_reduction', 
      label: 'Error Reduction',
      unit: 'percentage',
      description: 'Reduction in manual errors and mistakes',
      icon: Target,
      color: 'text-orange-600'
    },
    { 
      name: 'customer_satisfaction', 
      label: 'Customer Satisfaction',
      unit: 'score',
      description: 'Customer satisfaction score (1-10)',
      icon: BarChart,
      color: 'text-indigo-600'
    }
  ];

  const handleAddMetric = async () => {
    if (!user || !newMetric.metric_name || newMetric.metric_value === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_success_metrics')
        .insert({
          user_id: user.id,
          metric_name: newMetric.metric_name,
          metric_value: newMetric.metric_value,
          notes: newMetric.notes,
          tool_id: newMetric.tool_id || null,
          measurement_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Metric Added!",
        description: "Your success metric has been recorded.",
      });

      setNewMetric({
        metric_name: '',
        metric_value: 0,
        notes: '',
        tool_id: ''
      });
      setIsAddingMetric(false);
      onRefresh();
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Error",
        description: "Failed to add metric. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMetricStats = () => {
    const timeSaved = metrics
      .filter(m => m.metric_name === 'time_saved_weekly')
      .reduce((sum, m) => sum + Number(m.metric_value), 0);

    const costSavings = metrics
      .filter(m => m.metric_name === 'cost_savings_monthly')
      .reduce((sum, m) => sum + Number(m.metric_value), 0);

    const productivityIncrease = metrics
      .filter(m => m.metric_name === 'productivity_increase')
      .reduce((sum, m, _, arr) => sum + Number(m.metric_value) / arr.length, 0);

    const errorReduction = metrics
      .filter(m => m.metric_name === 'error_reduction')
      .reduce((sum, m, _, arr) => sum + Number(m.metric_value) / arr.length, 0);

    return {
      timeSaved,
      costSavings,
      productivityIncrease: Math.round(productivityIncrease || 0),
      errorReduction: Math.round(errorReduction || 0),
      annualSavings: costSavings * 12
    };
  };

  const getImplementationROI = () => {
    return implementations.map(impl => {
      const toolMetrics = metrics.filter(m => m.tool_id === impl.tool_id);
      const timeSaved = toolMetrics
        .filter(m => m.metric_name === 'time_saved_weekly')
        .reduce((sum, m) => sum + Number(m.metric_value), 0);
      
      const costSavings = toolMetrics
        .filter(m => m.metric_name === 'cost_savings_monthly')
        .reduce((sum, m) => sum + Number(m.metric_value), 0);

      const estimatedValue = (timeSaved * 200 * 4) + costSavings; // $200/hour * 4 weeks
      
      return {
        ...impl,
        timeSaved,
        costSavings,
        estimatedValue,
        hasMetrics: toolMetrics.length > 0
      };
    });
  };

  const stats = getMetricStats();
  const implementationROI = getImplementationROI();

  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.timeSaved}h</div>
            <p className="text-xs text-muted-foreground">
              ${(stats.timeSaved * 200).toLocaleString()} value/week
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.costSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.annualSavings.toLocaleString()} annually
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Boost</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productivityIncrease}%</div>
            <p className="text-xs text-muted-foreground">
              Average improvement
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Reduction</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errorReduction}%</div>
            <p className="text-xs text-muted-foreground">
              Fewer mistakes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tool-Specific ROI */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation ROI Breakdown</CardTitle>
          <CardDescription>
            Value generated by each implemented tool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {implementationROI.map((impl) => (
              <div key={impl.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <span className="font-medium">
                      {impl.tools?.name?.[0] || '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{impl.tools?.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{impl.timeSaved}h/week saved</span>
                      <span>${impl.costSavings}/month saved</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ${impl.estimatedValue.toLocaleString()}/month
                  </div>
                  <div className="flex items-center gap-1">
                    {impl.hasMetrics ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {impl.hasMetrics ? 'Metrics tracked' : 'No metrics yet'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {implementationROI.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No implementations to track yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Metric */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Track New Metric</CardTitle>
              <CardDescription>
                Record your success metrics to measure AI implementation impact
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsAddingMetric(!isAddingMetric)}
              variant={isAddingMetric ? "outline" : "default"}
            >
              {isAddingMetric ? 'Cancel' : 'Add Metric'}
            </Button>
          </div>
        </CardHeader>
        {isAddingMetric && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="metric-type">Metric Type</Label>
                <select
                  id="metric-type"
                  className="w-full p-2 border rounded-md"
                  value={newMetric.metric_name}
                  onChange={(e) => setNewMetric(prev => ({
                    ...prev,
                    metric_name: e.target.value
                  }))}
                >
                  <option value="">Select a metric...</option>
                  {predefinedMetrics.map((metric) => (
                    <option key={metric.name} value={metric.name}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="metric-value">Value</Label>
                <Input
                  id="metric-value"
                  type="number"
                  placeholder="Enter value"
                  value={newMetric.metric_value || ''}
                  onChange={(e) => setNewMetric(prev => ({
                    ...prev,
                    metric_value: Number(e.target.value)
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="related-tool">Related Tool (Optional)</Label>
              <select
                id="related-tool"
                className="w-full p-2 border rounded-md"
                value={newMetric.tool_id}
                onChange={(e) => setNewMetric(prev => ({
                  ...prev,
                  tool_id: e.target.value
                }))}
              >
                <option value="">Not tool-specific</option>
                {implementations.map((impl) => (
                  <option key={impl.tool_id} value={impl.tool_id}>
                    {impl.tools?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional context or details about this measurement..."
                value={newMetric.notes}
                onChange={(e) => setNewMetric(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddMetric}>
                Save Metric
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingMetric(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Measurements</CardTitle>
          <CardDescription>
            Your latest success metric entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.slice(0, 10).map((metric, index) => {
              const metricConfig = predefinedMetrics.find(m => m.name === metric.metric_name);
              const relatedTool = implementations.find(impl => impl.tool_id === metric.tool_id);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {metricConfig && (
                      <metricConfig.icon className={`w-5 h-5 ${metricConfig.color}`} />
                    )}
                    <div>
                      <p className="font-medium">
                        {metricConfig?.label || metric.metric_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{new Date(metric.measurement_date).toLocaleDateString()}</span>
                        {relatedTool && (
                          <Badge variant="outline" className="text-xs">
                            {relatedTool.tools?.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {metric.metric_value}
                      {metricConfig?.unit === 'percentage' && '%'}
                      {metricConfig?.unit === 'dollars' && '$'}
                      {metricConfig?.unit === 'hours' && 'h'}
                    </div>
                  </div>
                </div>
              );
            })}
            {metrics.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No metrics recorded yet. Start tracking your success!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}