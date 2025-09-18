import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, DollarSign, TrendingUp, Zap, CheckCircle, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ToolRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  setup_time: string;
  roi_percentage: number;
  complexity: string;
  reason: string;
  priority: number;
}

export function PersonalProductivity() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonalizedRecommendations();
  }, []);

  const loadPersonalizedRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user assessment data from localStorage for now
      // TODO: Replace with actual database query once types are updated
      const assessmentDataStr = localStorage.getItem('assessmentData');
      if (!assessmentDataStr) {
        window.location.href = '/assessment';
        return;
      }
      const assessment = JSON.parse(assessmentDataStr);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile({ ...assessment, ...profile });

      // Generate personalized recommendations
      const recommendations = await generateRecommendations(assessment, profile);
      setRecommendations(recommendations);

    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error loading recommendations",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (assessment: any, profile: any) => {
    // Role and industry specific recommendations
    const roleIndustryMap: { [key: string]: { [key: string]: ToolRecommendation[] } } = {
      'CFO': {
        'Manufacturing': [
          {
            id: 'power-bi-ai',
            name: 'Power BI with AI Insights',
            description: 'Advanced financial analytics with predictive modeling for manufacturing costs',
            category: 'Analytics',
            setup_time: '2-4 hours',
            roi_percentage: 35,
            complexity: 'Medium',
            reason: 'Perfect for manufacturing CFOs needing cost analysis and supply chain insights',
            priority: 1
          },
          {
            id: 'sap-ariba-ai',
            name: 'SAP Ariba AI',
            description: 'AI-powered procurement and supply chain financial management',
            category: 'Procurement',
            setup_time: '1-2 weeks',
            roi_percentage: 45,
            complexity: 'High',
            reason: 'Essential for manufacturing supply chain cost optimization',
            priority: 2
          },
          {
            id: 'tableau-ai',
            name: 'Tableau AI Analytics',
            description: 'Automated financial dashboards with machine learning insights',
            category: 'Visualization',
            setup_time: '3-5 hours',
            roi_percentage: 28,
            complexity: 'Medium',
            reason: 'Streamlines financial reporting with automated insights',
            priority: 3
          }
        ],
        'Technology': [
          {
            id: 'tableau-ai',
            name: 'Tableau AI Analytics',
            description: 'Real-time financial dashboards with predictive SaaS metrics',
            category: 'Analytics',
            setup_time: '2-3 hours',
            roi_percentage: 42,
            complexity: 'Medium',
            reason: 'Essential for tech CFOs tracking SaaS metrics and burn rates',
            priority: 1
          },
          {
            id: 'notion-ai',
            name: 'Notion AI for Finance',
            description: 'AI-powered financial planning and board report automation',
            category: 'Documentation',
            setup_time: '1-2 hours',
            roi_percentage: 25,
            complexity: 'Easy',
            reason: 'Streamlines board prep and financial documentation',
            priority: 2
          }
        ]
      },
      'CEO': {
        'Technology': [
          {
            id: 'cb-insights-ai',
            name: 'CB Insights AI',
            description: 'Market intelligence and competitive analysis with AI insights',
            category: 'Market Intelligence',
            setup_time: '30 minutes',
            roi_percentage: 50,
            complexity: 'Easy',
            reason: 'Essential for technology CEOs tracking market trends and competition',
            priority: 1
          },
          {
            id: 'productboard-ai',
            name: 'Productboard AI',
            description: 'AI-powered product strategy and roadmap planning',
            category: 'Product Strategy',
            setup_time: '2-4 hours',
            roi_percentage: 45,
            complexity: 'Medium',
            reason: 'Perfect for technology CEOs managing product portfolios',
            priority: 2
          },
          {
            id: 'otter-ai',
            name: 'Otter.ai for Meetings',
            description: 'AI meeting transcription and action item extraction',
            category: 'Productivity',
            setup_time: '15 minutes',
            roi_percentage: 30,
            complexity: 'Easy',
            reason: 'Saves hours on meeting notes and follow-ups',
            priority: 3
          }
        ],
        'Healthcare': [
          {
            id: 'epic-ai',
            name: 'Epic AI Modules',
            description: 'AI-enhanced clinical operations and patient management',
            category: 'Clinical Operations',
            setup_time: '1-2 weeks',
            roi_percentage: 55,
            complexity: 'High',
            reason: 'Essential for healthcare CEOs optimizing clinical operations',
            priority: 1
          },
          {
            id: 'salesforce-health',
            name: 'Salesforce Health Cloud AI',
            description: 'AI-powered patient experience and care coordination',
            category: 'Patient Experience',
            setup_time: '3-5 days',
            roi_percentage: 40,
            complexity: 'Medium',
            reason: 'Critical for healthcare CEOs improving patient outcomes',
            priority: 2
          }
        ]
      }
    };

    const role = profile?.role || 'CEO';
    const industry = assessment?.industry_category || 'Technology';
    
    const specificRecs = roleIndustryMap[role]?.[industry] || roleIndustryMap['CEO']['Technology'];
    
    // Add universal productivity tools
    const universalTools: ToolRecommendation[] = [
      {
        id: 'claude-ai',
        name: 'Claude AI for Executives',
        description: 'Advanced AI assistant for strategic analysis and communication',
        category: 'AI Assistant',
        setup_time: '5 minutes',
        roi_percentage: 35,
        complexity: 'Easy',
        reason: 'Excellent for executive-level analysis and decision support',
        priority: 1
      },
      {
        id: 'grammarly-business',
        name: 'Grammarly Business',
        description: 'AI-powered writing assistant for professional communication',
        category: 'Communication',
        setup_time: '10 minutes',
        roi_percentage: 20,
        complexity: 'Easy',
        reason: 'Improves all written communication quality and efficiency',
        priority: 2
      }
    ];

    return [...specificRecs, ...universalTools].slice(0, 6);
  };

  const handleImplementTool = async (toolId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, store in localStorage until database types are updated
      // TODO: Replace with actual database save once types are updated
      const existingProgress = JSON.parse(localStorage.getItem('userToolProgress') || '[]');
      const newProgress = {
        user_id: user.id,
        tool_id: toolId,
        status: 'interested',
        progress_percentage: 0,
        created_at: new Date().toISOString()
      };
      
      const updatedProgress = [...existingProgress.filter((p: any) => p.tool_id !== toolId), newProgress];
      localStorage.setItem('userToolProgress', JSON.stringify(updatedProgress));

      // Error handling removed since we're using localStorage

      toast({
        title: "Tool added to your list!",
        description: "You can track your progress in the dashboard."
      });
      
    } catch (err) {
      console.error('Error adding tool:', err);
      toast({
        title: "Error adding tool",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your personalized recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Your Personal AI Productivity Toolkit</h1>
        <p className="text-muted-foreground">
          Based on your role as a {userProfile?.role} in {userProfile?.industry || userProfile?.industry_category}, 
          here are the most impactful AI tools for your specific needs.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              {Math.round(recommendations.reduce((sum, tool) => sum + tool.roi_percentage, 0) / recommendations.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg ROI Expected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
            <div className="text-sm text-muted-foreground">Tools Recommended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">
              {recommendations.filter(t => t.complexity === 'Easy').length}
            </div>
            <div className="text-sm text-muted-foreground">Quick Wins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <div className="text-2xl font-bold text-amber-600">
              {recommendations.filter(t => t.priority === 1).length}
            </div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {recommendations.map((tool, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                <Badge variant={tool.priority === 1 ? "default" : "secondary"}>
                  {tool.priority === 1 ? "High Priority" : "Medium Priority"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Setup Time:</span>
                  <span className="font-medium">{tool.setup_time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expected ROI:</span>
                  <span className="font-medium text-green-600">{tool.roi_percentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Complexity:</span>
                  <Badge variant="outline" className="text-xs">
                    {tool.complexity}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Category:</span>
                  <Badge variant="secondary" className="text-xs">
                    {tool.category}
                  </Badge>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Why this tool:</strong> {tool.reason}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleImplementTool(tool.id)}
                  className="flex-1"
                >
                  Add to My Tools
                </Button>
                <Button size="sm" variant="outline">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Timeline */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recommended Implementation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Week 1: Quick Wins</h4>
                <p className="text-sm text-muted-foreground">
                  Start with {recommendations.filter(t => t.complexity === 'Easy').length} easy-to-implement tools
                </p>
                <Progress value={25} className="mt-2" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Week 2-3: Medium Complexity</h4>
                <p className="text-sm text-muted-foreground">
                  Implement {recommendations.filter(t => t.complexity === 'Medium').length} medium complexity tools
                </p>
                <Progress value={60} className="mt-2" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Week 4+: Advanced Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Deploy high-impact, complex solutions with dedicated support
                </p>
                <Progress value={100} className="mt-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-6">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Productivity?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Your personalized toolkit is ready. Start with the high-priority tools and track your progress 
            as you implement each solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = '/dashboard'}>
              Continue to Dashboard
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/consulting'}>
              Get Implementation Help
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}