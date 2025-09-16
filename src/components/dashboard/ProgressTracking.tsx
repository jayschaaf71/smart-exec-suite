import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, 
  TrendingUp,
  ExternalLink,
  Clock,
  Zap,
  CheckCircle,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function ProgressTracking() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    toolsStarted: 0,
    toolsCompleted: 0,
    totalTimeInvested: 0,
    productivityGain: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get user tool progress with tool details
      const { data: progressData } = await supabase
        .from('user_tool_progress')
        .select(`
          *,
          tools (
            name,
            description,
            category,
            pricing_model,
            website_url,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      setProgressData(progressData || []);
      
      // Calculate stats
      const completed = progressData?.filter(p => p.status === 'completed').length || 0;
      const started = progressData?.filter(p => p.status !== 'interested').length || 0;
      const totalTime = progressData?.reduce((sum, p) => sum + (p.time_invested || 0), 0) || 0;
      
      setStats({
        toolsStarted: started,
        toolsCompleted: completed,
        totalTimeInvested: Math.round(totalTime / 60), // Convert to hours
        productivityGain: Math.min(completed * 15, 100) // Estimate 15% gain per tool
      });

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateToolProgress = async (toolId: string, updates: any) => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_tool_progress')
        .upsert({
          user_id: user.id,
          tool_id: toolId,
          ...updates
        }, { 
          onConflict: 'user_id,tool_id' 
        });
      
      // Reload data
      await loadProgressData();
      
      toast({
        title: "Progress Updated",
        description: "Your progress has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.toolsStarted}</div>
          <div className="text-sm text-muted-foreground">Tools Started</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.toolsCompleted}</div>
          <div className="text-sm text-muted-foreground">Tools Mastered</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.totalTimeInvested}h</div>
          <div className="text-sm text-muted-foreground">Time Invested</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.productivityGain}%</div>
          <div className="text-sm text-muted-foreground">Productivity Gain</div>
        </Card>
      </div>

      {/* Progress List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Tool Implementation Progress
        </h3>
        <div className="space-y-4">
          {progressData.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Start implementing AI tools to track your progress!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check out the Quick Wins section for easy tools to get started.
              </p>
            </div>
          ) : (
            progressData.map((progress) => (
              <div key={progress.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {progress.tools?.logo_url && (
                      <img 
                        src={progress.tools.logo_url} 
                        alt={progress.tools.name}
                        className="w-8 h-8 rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{progress.tools?.name}</h4>
                      <p className="text-sm text-muted-foreground">{progress.tools?.category}</p>
                    </div>
                  </div>
                  <Badge variant={
                    progress.status === 'completed' ? 'default' :
                    progress.status === 'implementing' ? 'secondary' :
                    progress.status === 'started' ? 'outline' : 'destructive'
                  }>
                    {progress.status}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress.progress_percentage || 0}%</span>
                  </div>
                  <Progress value={progress.progress_percentage || 0} />
                </div>

                {progress.notes && (
                  <p className="text-sm text-muted-foreground mb-3">{progress.notes}</p>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateToolProgress(progress.tool_id, { 
                      status: progress.status === 'completed' ? 'implementing' : 'completed',
                      progress_percentage: progress.status === 'completed' ? 50 : 100,
                      completed_at: progress.status === 'completed' ? null : new Date().toISOString()
                    })}
                  >
                    {progress.status === 'completed' ? 'Mark In Progress' : 'Mark Complete'}
                  </Button>
                  
                  {progress.tools?.website_url && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => window.open(progress.tools.website_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit Tool
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Progress Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progress Insights
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm">
              <strong>Keep it up!</strong> You're making great progress. Consistency is key to mastering AI tools.
            </p>
          </div>
          {stats.toolsCompleted === 0 && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm">
                <strong>Ready for your first implementation?</strong> Check out the Quick Wins section for easy-to-implement AI tools.
              </p>
            </div>
          )}
          {stats.toolsCompleted > 0 && stats.toolsCompleted < 3 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm">
                <strong>Great start!</strong> You've completed {stats.toolsCompleted} tool{stats.toolsCompleted > 1 ? 's' : ''}. 
                Try implementing 2-3 more tools this month to see compound productivity gains.
              </p>
            </div>
          )}
          {stats.productivityGain > 30 && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm">
                <strong>Excellent progress!</strong> Your estimated {stats.productivityGain}% productivity gain shows you're 
                getting real value from AI tools. Consider sharing your success with your team.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}