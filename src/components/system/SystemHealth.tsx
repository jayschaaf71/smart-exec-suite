import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Shield, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  unit: string;
  description: string;
  lastChecked: Date;
  trend: 'up' | 'down' | 'stable';
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function SystemHealth() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemHealth = async () => {
    try {
      // Simulate API calls to check system health
      const mockMetrics: HealthMetric[] = [
        {
          name: 'API Response Time',
          status: Math.random() > 0.8 ? 'warning' : 'healthy',
          value: Math.floor(Math.random() * 200) + 50,
          unit: 'ms',
          description: 'Average API response time',
          lastChecked: new Date(),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        {
          name: 'Database Performance',
          status: Math.random() > 0.9 ? 'critical' : 'healthy',
          value: Math.floor(Math.random() * 30) + 70,
          unit: '%',
          description: 'Database query performance',
          lastChecked: new Date(),
          trend: 'stable'
        },
        {
          name: 'Server Uptime',
          status: 'healthy',
          value: 99.9,
          unit: '%',
          description: 'System availability',
          lastChecked: new Date(),
          trend: 'stable'
        },
        {
          name: 'Memory Usage',
          status: Math.random() > 0.7 ? 'warning' : 'healthy',
          value: Math.floor(Math.random() * 40) + 40,
          unit: '%',
          description: 'Server memory utilization',
          lastChecked: new Date(),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        {
          name: 'Active Users',
          status: 'healthy',
          value: Math.floor(Math.random() * 100) + 200,
          unit: 'users',
          description: 'Currently active users',
          lastChecked: new Date(),
          trend: 'up'
        },
        {
          name: 'Security Score',
          status: Math.random() > 0.95 ? 'warning' : 'healthy',
          value: Math.floor(Math.random() * 10) + 90,
          unit: '/100',
          description: 'Overall security rating',
          lastChecked: new Date(),
          trend: 'stable'
        }
      ];

      // Generate alerts based on metrics
      const mockAlerts: SystemAlert[] = [];
      
      mockMetrics.forEach((metric, index) => {
        if (metric.status === 'warning') {
          mockAlerts.push({
            id: `alert-${index}`,
            type: 'warning',
            title: `${metric.name} Performance Warning`,
            message: `${metric.name} is showing degraded performance: ${metric.value}${metric.unit}`,
            timestamp: new Date(Date.now() - Math.random() * 3600000),
            resolved: Math.random() > 0.7
          });
        } else if (metric.status === 'critical') {
          mockAlerts.push({
            id: `alert-${index}`,
            type: 'error',
            title: `${metric.name} Critical Issue`,
            message: `${metric.name} requires immediate attention: ${metric.value}${metric.unit}`,
            timestamp: new Date(Date.now() - Math.random() * 1800000),
            resolved: false
          });
        }
      });

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading system health:', error);
      toast({
        title: "Error",
        description: "Failed to load system health data",
        variant: "destructive"
      });
    }
  };

  const refreshHealth = async () => {
    setLoading(true);
    await loadSystemHealth();
    setLoading(false);
    
    toast({
      title: "Success",
      description: "System health data refreshed"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="secondary" className="text-green-600 bg-green-100">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const overallStatus = metrics.some(m => m.status === 'critical') ? 'critical' :
                      metrics.some(m => m.status === 'warning') ? 'warning' : 'healthy';

  const healthyCount = metrics.filter(m => m.status === 'healthy').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const criticalCount = metrics.filter(m => m.status === 'critical').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={refreshHealth} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={`border-2 ${
        overallStatus === 'healthy' ? 'border-green-200 bg-green-50' :
        overallStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(overallStatus)}
              <div>
                <CardTitle>System Status: {getStatusBadge(overallStatus)}</CardTitle>
                <CardDescription>
                  {healthyCount} healthy, {warningCount} warnings, {criticalCount} critical
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Overall Health Score</div>
              <div className="text-2xl font-bold">
                {Math.round(((healthyCount * 100 + warningCount * 60) / metrics.length) || 0)}%
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Alerts */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span>Active Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.filter(a => !a.resolved).map((alert) => (
              <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                {alert.type === 'error' ? <XCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>
                  {alert.message}
                  <div className="text-xs text-muted-foreground mt-1">
                    {alert.timestamp.toLocaleString()}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">{metric.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                  {getStatusIcon(metric.status)}
                </div>
              </div>
              <CardDescription>{metric.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-muted-foreground">{metric.unit}</span>
                </div>
                
                {metric.unit === '%' && (
                  <Progress 
                    value={metric.value} 
                    className={`h-2 ${
                      metric.status === 'healthy' ? 'text-green-500' :
                      metric.status === 'warning' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}
                  />
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last checked: {metric.lastChecked.toLocaleTimeString()}</span>
                  {getStatusBadge(metric.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Services */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Status of core system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Server className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium">Web Server</div>
                <div className="text-sm text-green-600">Online</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Database className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium">Database</div>
                <div className="text-sm text-green-600">Healthy</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Wifi className="w-6 h-6 text-yellow-500" />
              <div>
                <div className="font-medium">Cache</div>
                <div className="text-sm text-yellow-600">Degraded</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Shield className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium">Security</div>
                <div className="text-sm text-green-600">Active</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}