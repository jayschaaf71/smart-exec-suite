import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Target, 
  Plus,
  BarChart3,
  Calendar,
  Award
} from 'lucide-react';

interface Metric {
  id: string;
  metric_name: string;
  metric_value: number;
  measurement_date: string;
  tool_id?: string;
  notes?: string;
}

interface Implementation {
  id: string;
  tool_id: string;
  status: string;
  progress_percentage: number;
  roi_achieved_percentage: number;
  tools: {
    name: string;
  };
}

interface SuccessMetricsProps {
  metrics: Metric[];
  implementations: Implementation[];
  onRefresh: () => void;
}

export function SuccessMetrics({ metrics, implementations, onRefresh }: SuccessMetricsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newMetric, setNewMetric] = useState({
    metric_name: '',
    metric_value: 0,
    notes: '',
    tool_id: ''
  });

  const metricTypes = [
    { id: 'time_saved_weekly', name: 'Weekly Time Saved (hours)', icon: Clock, color: 'text-blue-600' },
    { id: 'cost_savings', name: 'Cost Savings ($)', icon: DollarSign, color: 'text-green-600' },
    { id: 'process_efficiency', name: 'Process Efficiency (%)', icon: TrendingUp, color: 'text-purple-600' },
    { id: 'accuracy_improvement', name: 'Accuracy Improvement (%)', icon: Target, color: 'text-orange-600' },
    { id: 'team_productivity', name: 'Team Productivity (%)', icon: Award, color: 'text-red-600' }
  ];

  const addMetric = async () => {
    if (!user || !newMetric.metric_name || newMetric.metric_value === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_success_metrics')
        .insert({
          user_id: user.id,
          metric_name: newMetric.metric_name,
          metric_value: newMetric.metric_value,
          notes: newMetric.notes,
          tool_id: newMetric.tool_id || null
        });

      if (error) throw error;

      toast({
        title: "Metric Added",
        description: "Success metric has been recorded",
      });

      setNewMetric({
        metric_name: '',
        metric_value: 0,
        notes: '',
        tool_id: ''
      });
      setShowAddMetric(false);
      onRefresh();
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Error",
        description: "Failed to add metric. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMetricsByType = (type: string) => {
    return metrics.filter(m => m.metric_name === type);
  };

  const getLatestMetricValue = (type: string) => {
    const typeMetrics = getMetricsByType(type);
    if (typeMetrics.length === 0) return 0;
    
    const latest = typeMetrics.sort((a, b) => 
      new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime()
    )[0];
    
    return Number(latest.metric_value);
  };

  const getTrend = (type: string) => {
    const typeMetrics = getMetricsByType(type).sort((a, b) => 
      new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
    );
    
    if (typeMetrics.length < 2) return 0;
    
    const latest = Number(typeMetrics[typeMetrics.length - 1].metric_value);
    const previous = Number(typeMetrics[typeMetrics.length - 2].metric_value);
    
    return ((latest - previous) / previous) * 100;
  };

  const getOverallProgress = () => {
    const totalImplementations = implementations.length;
    const completedImplementations = implementations.filter(impl => impl.status === 'completed').length;
    const avgROI = implementations
      .filter(impl => impl.roi_achieved_percentage > 0)
      .reduce((sum, impl, index, arr) => sum + impl.roi_achieved_percentage / arr.length, 0);

    return {
      implementationRate: totalImplementations > 0 ? (completedImplementations / totalImplementations) * 100 : 0,
      avgROI: Math.round(avgROI || 0),
      totalTimeSaved: getLatestMetricValue('time_saved_weekly'),
      totalCostSavings: getLatestMetricValue('cost_savings')
    };
  };

  const progress = getOverallProgress();

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>Success Metrics Dashboard</span>
          </CardTitle>
          <CardDescription>
            Track the measurable impact of your AI tool implementations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{progress.implementationRate.toFixed(0)}%</div>
              <p className="text-sm text-muted-foreground">Implementation Rate</p>
              <Progress value={progress.implementationRate} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{progress.avgROI}%</div>
              <p className="text-sm text-muted-foreground">Average ROI</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{progress.totalTimeSaved}h</div>
              <p className="text-sm text-muted-foreground">Weekly Time Saved</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">${progress.totalCostSavings.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Cost Savings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricTypes.map((metricType) => {
          const IconComponent = metricType.icon;
          const latestValue = getLatestMetricValue(metricType.id);
          const trend = getTrend(metricType.id);
          const metricCount = getMetricsByType(metricType.id).length;
          
          return (
            <Card key={metricType.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-5 w-5 ${metricType.color}`} />
                    <CardTitle className="text-base">{metricType.name}</CardTitle>
                  </div>
                  <Badge variant="outline">{metricCount} records</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${metricType.color}`}>
                      {metricType.id === 'cost_savings' ? `$${latestValue.toLocaleString()}` : latestValue}
                      {metricType.id.includes('percentage') || metricType.id.includes('efficiency') || metricType.id.includes('productivity') ? '%' : ''}
                    </div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                  </div>
                  
                  {trend !== 0 && (
                    <div className="text-center">
                      <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">vs. previous period</p>
                    </div>
                  )}
                  
                  {metricCount === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No data recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Metric Updates</CardTitle>
              <CardDescription>Latest success measurements and progress updates</CardDescription>
            </div>
            <Button onClick={() => setShowAddMetric(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Metric
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {metrics.length > 0 ? (
            <div className="space-y-4">
              {metrics
                .sort((a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime())
                .slice(0, 10)
                .map((metric) => {
                  const metricType = metricTypes.find(mt => mt.id === metric.metric_name);
                  const IconComponent = metricType?.icon || BarChart3;
                  const tool = implementations.find(impl => impl.tool_id === metric.tool_id);
                  
                  return (
                    <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <IconComponent className={`h-5 w-5 ${metricType?.color || 'text-gray-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{metricType?.name || metric.metric_name}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(metric.measurement_date).toLocaleDateString()}</span>
                            {tool && (
                              <>
                                <span>•</span>
                                <span>{tool.tools.name}</span>
                              </>
                            )}
                          </div>
                          {metric.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{metric.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {metric.metric_name === 'cost_savings' ? `$${Number(metric.metric_value).toLocaleString()}` : metric.metric_value}
                          {metric.metric_name.includes('percentage') || metric.metric_name.includes('efficiency') || metric.metric_name.includes('productivity') ? '%' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No metrics recorded yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your success by adding your first metric
              </p>
              <Button onClick={() => setShowAddMetric(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Metric
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Metric Modal */}
      {showAddMetric && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Add Success Metric</CardTitle>
            <CardDescription>Record a new measurement of your AI tool success</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metricType">Metric Type</Label>
                <select
                  id="metricType"
                  value={newMetric.metric_name}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, metric_name: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select metric type...</option>
                  {metricTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metricValue">Value</Label>
                <Input
                  id="metricValue"
                  type="number"
                  value={newMetric.metric_value}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, metric_value: Number(e.target.value) }))}
                  placeholder="Enter value..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toolId">Related Tool (Optional)</Label>
                <select
                  id="toolId"
                  value={newMetric.tool_id}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, tool_id: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">No specific tool</option>
                  {implementations.map(impl => (
                    <option key={impl.id} value={impl.tool_id}>{impl.tools.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newMetric.notes}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add context or details about this measurement..."
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={addMetric} disabled={loading || !newMetric.metric_name || newMetric.metric_value === 0}>
                {loading ? 'Adding...' : 'Add Metric'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddMetric(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}