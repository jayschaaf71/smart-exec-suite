import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Heart,
  AlertCircle,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  pricing_model: string;
  pricing_amount: number;
  setup_difficulty: string;
  time_to_value: string;
  target_roles: string[];
  target_industries: string[];
  features: string[];
  pros: string[];
  cons: string[];
  website_url: string;
  user_rating: number;
  expert_rating: number;
  popularity_score: number;
}

interface UserInteraction {
  status: 'interested' | 'implementing' | 'completed' | null;
}

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [userInteraction, setUserInteraction] = useState<UserInteraction>({ status: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTool();
      if (user) {
        loadUserInteraction();
      }
    }
  }, [id, user]);

  const loadTool = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTool(data);
    } catch (error) {
      console.error('Error loading tool:', error);
      toast({
        title: "Error",
        description: "Failed to load tool details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserInteraction = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('user_tool_interactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('tool_id', id)
        .maybeSingle();

      if (error) throw error;
      setUserInteraction({ status: data?.interaction_type as any || null });
    } catch (error) {
      console.error('Error loading user interaction:', error);
    }
  };

  const handleStatusChange = async (status: 'interested' | 'implementing' | 'completed') => {
    if (!user || !tool) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('user_tool_interactions')
        .upsert({
          user_id: user.id,
          tool_id: tool.id,
          interaction_type: status,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,tool_id'
        });

      if (error) throw error;

      setUserInteraction({ status });
      
      const statusMessages = {
        interested: 'Added to your interested tools!',
        implementing: 'Marked as implementing!',
        completed: 'Congratulations on implementing this tool!'
      };

      toast({
        title: "Success",
        description: statusMessages[status]
      });

      // Update user stats for completed tools
      if (status === 'completed') {
        // Get current stats first
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('tools_implemented, total_points')
          .eq('user_id', user.id)
          .single();

        if (currentStats) {
          const { error: statsError } = await supabase
            .from('user_stats')
            .update({
              tools_implemented: currentStats.tools_implemented + 1,
              total_points: currentStats.total_points + 50,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (statsError) console.error('Error updating stats:', statsError);
        }
      }
    } catch (error) {
      console.error('Error updating interaction:', error);
      toast({
        title: "Error",
        description: "Failed to update tool status",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPricingColor = (model: string) => {
    switch (model) {
      case 'free': return 'text-green-600 bg-green-100';
      case 'freemium': return 'text-blue-600 bg-blue-100';
      case 'paid': return 'text-orange-600 bg-orange-100';
      case 'enterprise': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderActionButton = () => {
    if (!user) return null;

    const currentStatus = userInteraction.status;
    
    if (currentStatus === 'completed') {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Implemented ✨</span>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          variant={currentStatus === 'interested' ? 'default' : 'outline'}
          onClick={() => handleStatusChange('interested')}
          disabled={actionLoading}
          className="flex items-center gap-2"
        >
          <Heart className="w-4 h-4" />
          {currentStatus === 'interested' ? 'Interested' : 'Mark Interested'}
        </Button>
        
        <Button
          variant={currentStatus === 'implementing' ? 'default' : 'outline'}
          onClick={() => handleStatusChange('implementing')}
          disabled={actionLoading}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {currentStatus === 'implementing' ? 'Implementing' : 'Start Implementing'}
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => handleStatusChange('completed')}
          disabled={actionLoading}
          className="flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Mark Complete
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tool Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The tool you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{tool.name}</h1>
              <p className="text-muted-foreground">{tool.description}</p>
            </div>
            {renderActionButton()}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{tool.user_rating}</div>
                  <div className="text-xs text-muted-foreground">User Rating</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-bold">{tool.time_to_value}</div>
                  <div className="text-xs text-muted-foreground">Time to Value</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Badge className={`${getDifficultyColor(tool.setup_difficulty)} mb-2`}>
                    {tool.setup_difficulty}
                  </Badge>
                  <div className="text-xs text-muted-foreground">Setup Difficulty</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Progress value={tool.popularity_score} className="mb-2" />
                  <div className="text-xs text-muted-foreground">Popularity</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Who Is This For?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Target Roles:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tool.target_roles.map(role => (
                          <Badge key={role} variant="outline">{role}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Best For Industries:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tool.target_industries.map(industry => (
                          <Badge key={industry} variant="secondary">{industry}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">✅ Pros</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tool.pros.map((pro, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-orange-600">⚠️ Considerations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tool.cons.map((con, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                    <CardDescription>
                      What makes {tool.name} powerful for your workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {tool.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="implementation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Implementation Guide</CardTitle>
                    <CardDescription>
                      Step-by-step guide to get started with {tool.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold">Create Account</h4>
                          <p className="text-sm text-muted-foreground">
                            Visit {tool.name} website and create your account
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold">Initial Setup</h4>
                          <p className="text-sm text-muted-foreground">
                            Configure your preferences and connect necessary integrations
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold">Start Small</h4>
                          <p className="text-sm text-muted-foreground">
                            Begin with simple tasks to learn the interface and capabilities
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          4
                        </div>
                        <div>
                          <h4 className="font-semibold">Scale Usage</h4>
                          <p className="text-sm text-muted-foreground">
                            Gradually integrate into your daily workflow and explore advanced features
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
                      <p className="text-sm text-blue-800">
                        Most users see value within {tool.time_to_value}. Start with the most common use case for your role to see immediate benefits.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Reviews</CardTitle>
                    <CardDescription>
                      What other users are saying about {tool.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4" />
                      <p>User reviews coming soon!</p>
                      <p className="text-sm">Be the first to share your experience with this tool.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className={getPricingColor(tool.pricing_model)}>
                    {tool.pricing_model.charAt(0).toUpperCase() + tool.pricing_model.slice(1)}
                  </Badge>
                </div>
                
                {tool.pricing_amount > 0 && (
                  <div>
                    <div className="text-2xl font-bold">
                      ${tool.pricing_amount}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={() => window.open(tool.website_url, '_blank')}
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>Ratings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Rating</span>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{tool.user_rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expert Rating</span>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold">{tool.expert_rating}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Popularity</span>
                    <span className="text-sm font-semibold">{tool.popularity_score}%</span>
                  </div>
                  <Progress value={tool.popularity_score} />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" size="sm">
                  Save for Later
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Share Tool
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Compare Tools
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}