import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Zap, Target, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Analytics } from '@/utils/analytics';

interface QuickWin {
  tool: {
    id: string;
    name: string;
    description: string;
    setup_difficulty: string;
    time_to_value: string;
    pricing_model: string;
    pricing_amount: number;
    website_url: string;
    features: string[];
  };
  score: number;
  reason: string;
  timeToImplement: string;
  businessImpact: string;
}

export function QuickWins() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [implementedTools, setImplementedTools] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadQuickWins();
      loadImplementedTools();
    }
  }, [user]);

  const loadImplementedTools = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_tool_progress')
        .select('tool_id')
        .eq('user_id', user.id)
        .eq('status', 'completed');
        
      setImplementedTools(data?.map(d => d.tool_id) || []);
    } catch (error) {
      console.error('Error loading implemented tools:', error);
    }
  };

  const loadQuickWins = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user profile with fallback to mock data for demo
      let profile;
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (userProfile) {
        profile = userProfile;
      } else {
        // Mock profile for demo user or when no profile exists
        profile = {
          role: 'CEO',
          industry: 'Technology',
          ai_experience: 'beginner',
          company_size: '50-250',
          goals: ['increase_productivity', 'improve_team_efficiency']
        };
      }

      // Get active tools suitable for quick wins (expanded criteria for better results)
      const { data: tools } = await supabase
        .from('tools')
        .select('*')
        .eq('status', 'active')
        .in('setup_difficulty', ['easy', 'beginner'])
        .in('time_to_value', ['minutes', 'hours', 'fast']);

      if (!tools?.length) {
        // If no tools match strict criteria, get any active tools
        const { data: allTools } = await supabase
          .from('tools')
          .select('*')
          .eq('status', 'active')
          .limit(10);
        
        if (allTools?.length) {
          const quickWinItems = allTools
            .slice(0, 3)
            .map(tool => ({
              tool,
              score: 75, // Default good score
              reason: 'Recommended AI tool for your role',
              timeToImplement: getTimeToImplement(tool),
              businessImpact: getBusinessImpact(tool, profile)
            }));
          setQuickWins(quickWinItems);
        }
        return;
      }
      
      // Filter and score tools based on user profile
      const quickWinItems = tools
        .filter(tool => {
          // Filter by role compatibility (more permissive)
          const roleMatch = !tool.target_roles?.length || 
                           tool.target_roles?.includes(profile.role) || 
                           tool.target_roles?.includes('all') ||
                           tool.target_roles?.includes('CEO') ||
                           tool.target_roles?.includes('Manager');
          
          return roleMatch;
        })
        .map(tool => ({
          tool,
          score: calculateQuickWinScore(tool, profile),
          reason: generateQuickWinReason(tool, profile),
          timeToImplement: getTimeToImplement(tool),
          businessImpact: getBusinessImpact(tool, profile)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      setQuickWins(quickWinItems);
    } catch (error) {
      console.error('Error loading quick wins:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateQuickWinScore = (tool: any, profile: any): number => {
    let score = 50;

    // Easy setup bonus
    if (tool.setup_difficulty === 'easy') score += 20;
    
    // Fast time to value bonus
    if (tool.time_to_value === 'minutes') score += 25;
    else if (tool.time_to_value === 'hours') score += 15;

    // Role relevance
    if (tool.target_roles?.includes(profile.role)) score += 20;

    // Pricing model (favor freemium/free for quick wins)
    if (tool.pricing_model === 'free') score += 15;
    else if (tool.pricing_model === 'freemium') score += 10;
    else if (tool.pricing_amount && tool.pricing_amount <= 20) score += 5;

    // Experience level adjustment
    if (profile.ai_experience === 'never' && tool.setup_difficulty === 'easy') score += 10;

    return Math.min(100, score);
  };

  const generateQuickWinReason = (tool: any, profile: any): string => {
    const reasons = [];
    
    if (tool.time_to_value === 'minutes') {
      reasons.push('See results in minutes');
    }
    
    if (tool.setup_difficulty === 'easy') {
      reasons.push('Simple setup process');
    }
    
    if (tool.pricing_model === 'free') {
      reasons.push('Free to start');
    } else if (tool.pricing_model === 'freemium') {
      reasons.push('Free trial available');
    }
    
    if (tool.target_roles?.includes(profile.role)) {
      reasons.push(`Perfect for ${profile.role}s`);
    }

    return reasons.join(' • ');
  };

  const getTimeToImplement = (tool: any): string => {
    if (tool.time_to_value === 'minutes') return '15-30 minutes';
    if (tool.time_to_value === 'hours') return '1-2 hours';
    return '< 1 day';
  };

  const getBusinessImpact = (tool: any, profile: any): string => {
    const impactMap = {
      'Perplexity Pro': 'Save 2+ hours on research weekly',
      'Otter.ai': 'Eliminate manual note-taking',
      'Grammarly Business': 'Improve communication quality',
      'Calendly AI': 'Reduce scheduling back-and-forth',
      'ChatGPT Plus': 'Accelerate writing and analysis',
      'Gamma': 'Create presentations 5x faster'
    };
    
    return impactMap[tool.name] || 'Immediate productivity boost';
  };

  const handleStartImplementation = async (toolId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_tool_progress')
        .upsert({
          user_id: user.id,
          tool_id: toolId,
          status: 'started',
          progress_percentage: 10,
          started_at: new Date().toISOString(),
          notes: 'Started implementation from Quick Wins'
        }, { 
          onConflict: 'user_id,tool_id' 
        });
      
      // Track analytics
      await supabase
        .from('user_analytics')
        .insert({
          user_id: user.id,
          metric_name: 'tool_started',
          metric_value: 1,
          tool_id: toolId,
          metadata: { source: 'quick_wins' }
        });
      
      toast({
        title: "Implementation Started",
        description: "You've started implementing this tool. Track your progress in the Progress section.",
      });
    } catch (error) {
      console.error('Error starting implementation:', error);
      toast({
        title: "Error",
        description: "Failed to start implementation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = async (toolId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_tool_progress')
        .upsert({
          user_id: user.id,
          tool_id: toolId,
          status: 'completed',
          progress_percentage: 100,
          completed_at: new Date().toISOString(),
          notes: 'Completed implementation from Quick Wins'
        }, { 
          onConflict: 'user_id,tool_id' 
        });
      
      // Track analytics
      await supabase
        .from('user_analytics')
        .insert({
          user_id: user.id,
          metric_name: 'tool_completed',
          metric_value: 1,
          tool_id: toolId,
          metadata: { source: 'quick_wins' }
        });
      
      setImplementedTools([...implementedTools, toolId]);
      
      toast({
        title: "Congratulations!",
        description: "You've successfully implemented this tool!",
      });
    } catch (error) {
      console.error('Error marking complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark as complete. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Quick Wins 🚀</h2>
        <p className="text-gray-600">
          Get started with these AI tools you can implement today for immediate impact.
        </p>
      </div>

      {quickWins.map((quickWin) => (
        <Card key={quickWin.tool.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl">{quickWin.tool.name}</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Quick Win
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {quickWin.score}% match
                  </Badge>
                </div>
                <CardDescription className="text-base mb-3">
                  {quickWin.tool.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Quick Win Metrics */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                <div className="text-center">
                  <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-800">Time to Setup</p>
                  <p className="text-xs text-green-600">{quickWin.timeToImplement}</p>
                </div>
                <div className="text-center">
                  <Zap className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-800">Impact</p>
                  <p className="text-xs text-green-600">{quickWin.businessImpact}</p>
                </div>
                <div className="text-center">
                  <Target className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-800">Difficulty</p>
                  <p className="text-xs text-green-600 capitalize">{quickWin.tool.setup_difficulty}</p>
                </div>
              </div>

              {/* Why This is a Quick Win */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Why this is a quick win:</strong> {quickWin.reason}
                </p>
              </div>

              {/* Features */}
              {quickWin.tool.features && quickWin.tool.features.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {quickWin.tool.features.slice(0, 4).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Implementation Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Implementation Progress</span>
                  <span>{implementedTools.includes(quickWin.tool.id) ? '100%' : '0%'}</span>
                </div>
                <Progress 
                  value={implementedTools.includes(quickWin.tool.id) ? 100 : 0} 
                  className="h-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {implementedTools.includes(quickWin.tool.id) ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Implemented!</span>
                  </div>
                ) : (
                  <>
                    <Button 
                      className="flex-1"
                      onClick={() => window.open(quickWin.tool.website_url, '_blank')}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Start Now ({quickWin.timeToImplement})
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleStartImplementation(quickWin.tool.id)}
                    >
                      Track Progress
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleMarkComplete(quickWin.tool.id)}
                    >
                      Mark Complete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {quickWins.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Quick Wins Available</h3>
            <p className="text-muted-foreground">
              Complete your profile assessment to get personalized quick win recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}