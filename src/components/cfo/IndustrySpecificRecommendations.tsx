import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Star,
  Target,
  ArrowRight,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  setup_difficulty: string;
  setup_time_estimate_weeks: number;
  industry_specific_score: any;
  pricing_model: string;
  website_url: string;
  features: string[];
}

interface IndustryRecommendation {
  tool: Tool;
  relevanceScore: number;
  industryReason: string;
  quickWins: string[];
  implementationPriority: number;
  expectedROI: number;
}

interface IndustrySpecificRecommendationsProps {
  userIndustry: string;
  companySize: string;
  maxRecommendations?: number;
}

const industryInsights = {
  manufacturing: {
    painPoints: ['Production cost tracking', 'Inventory management', 'Supply chain visibility', 'Regulatory compliance'],
    keyMetrics: ['OEE', 'Cost per unit', 'Inventory turnover', 'Quality metrics'],
    recommendedTools: ['ERP Analytics', 'Production Dashboards', 'Cost Management', 'Supply Chain Analytics']
  },
  healthcare: {
    painPoints: ['Regulatory reporting', 'Cost per patient', 'Revenue cycle', 'Quality metrics'],
    keyMetrics: ['Patient cost', 'Revenue per bed', 'Days in AR', 'Quality scores'],
    recommendedTools: ['Healthcare Analytics', 'Revenue Cycle Management', 'Compliance Reporting', 'Quality Dashboards']
  },
  retail: {
    painPoints: ['Inventory optimization', 'Store profitability', 'Seasonal planning', 'Customer analytics'],
    keyMetrics: ['Same-store sales', 'Inventory turns', 'Margin by category', 'Customer LTV'],
    recommendedTools: ['Retail Analytics', 'Inventory Planning', 'Store Performance', 'Customer Insights']
  },
  financial_services: {
    painPoints: ['Risk management', 'Regulatory compliance', 'Customer profitability', 'Operational efficiency'],
    keyMetrics: ['ROE', 'Risk ratios', 'Customer acquisition cost', 'Operational leverage'],
    recommendedTools: ['Risk Analytics', 'Compliance Automation', 'Customer Analytics', 'Operational Dashboards']
  },
  technology: {
    painPoints: ['Burn rate analysis', 'Unit economics', 'Growth metrics', 'R&D efficiency'],
    keyMetrics: ['CAC/LTV', 'Burn rate', 'ARR growth', 'R&D productivity'],
    recommendedTools: ['SaaS Analytics', 'Financial Planning', 'Growth Tracking', 'R&D Metrics']
  }
};

export function IndustrySpecificRecommendations({ 
  userIndustry, 
  companySize, 
  maxRecommendations = 6 
}: IndustrySpecificRecommendationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<IndustryRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userIndustry) {
      loadIndustryRecommendations();
    }
  }, [user, userIndustry, companySize]);

  const loadIndustryRecommendations = async () => {
    try {
      setLoading(true);
      
      // Fetch tools with industry-specific scoring
      const { data: tools, error } = await supabase
        .from('tools')
        .select('*')
        .eq('status', 'active')
        .not('industry_specific_score', 'is', null);

      if (error) throw error;

      // Calculate industry-specific recommendations
      const industryRecs = tools
        .map(tool => calculateIndustryRecommendation(tool, userIndustry, companySize))
        .filter(rec => rec.relevanceScore >= 60)
        .sort((a, b) => {
          // Sort by implementation priority first, then relevance score
          if (a.implementationPriority !== b.implementationPriority) {
            return a.implementationPriority - b.implementationPriority;
          }
          return b.relevanceScore - a.relevanceScore;
        })
        .slice(0, maxRecommendations);

      setRecommendations(industryRecs);
    } catch (error) {
      console.error('Error loading industry recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load industry recommendations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateIndustryRecommendation = (tool: Tool, industry: string, size: string): IndustryRecommendation => {
    const industryScores = tool.industry_specific_score || {};
    const baseScore = industryScores[industry] || industryScores['all'] || 50;
    
    // Adjust score based on company size
    let sizeMultiplier = 1;
    if (size === 'enterprise' && tool.name.toLowerCase().includes('enterprise')) sizeMultiplier = 1.2;
    if (size === 'small' && tool.setup_difficulty === 'easy') sizeMultiplier = 1.1;
    
    const relevanceScore = Math.min(100, Math.round(baseScore * sizeMultiplier));
    
    // Generate industry-specific reasoning
    const industryReason = generateIndustryReason(tool, industry);
    const quickWins = generateQuickWins(tool, industry);
    
    // Calculate implementation priority (1-5, lower is higher priority)
    const implementationPriority = calculateImplementationPriority(tool, relevanceScore);
    
    // Estimate ROI based on industry and tool type
    const expectedROI = estimateROI(tool, industry, size);

    return {
      tool,
      relevanceScore,
      industryReason,
      quickWins,
      implementationPriority,
      expectedROI
    };
  };

  const generateIndustryReason = (tool: Tool, industry: string): string => {
    const reasons = {
      manufacturing: `Optimizes production costs and supply chain visibility critical for manufacturing operations`,
      healthcare: `Addresses regulatory compliance and patient cost tracking requirements`,
      retail: `Improves inventory management and store-level profitability analysis`,
      financial_services: `Enhances risk management and regulatory reporting capabilities`,
      technology: `Tracks key SaaS metrics and burn rate analysis for tech companies`
    };
    
    return reasons[industry as keyof typeof reasons] || `Provides valuable insights for ${industry} operations`;
  };

  const generateQuickWins = (tool: Tool, industry: string): string[] => {
    const insights = industryInsights[industry as keyof typeof industryInsights];
    if (!insights) return ['Improved reporting efficiency', 'Better data visibility'];
    
    return insights.painPoints.slice(0, 3).map(pain => `Addresses ${pain.toLowerCase()}`);
  };

  const calculateImplementationPriority = (tool: Tool, relevanceScore: number): number => {
    if (relevanceScore >= 90 && tool.setup_difficulty === 'easy') return 1;
    if (relevanceScore >= 80) return 2;
    if (relevanceScore >= 70) return 3;
    if (relevanceScore >= 60) return 4;
    return 5;
  };

  const estimateROI = (tool: Tool, industry: string, size: string): number => {
    let baseROI = 200; // Base 200% ROI
    
    // Industry multipliers
    const industryMultipliers = {
      manufacturing: 1.3,
      healthcare: 1.1,
      retail: 1.2,
      financial_services: 1.4,
      technology: 1.5
    };
    
    baseROI *= industryMultipliers[industry as keyof typeof industryMultipliers] || 1;
    
    // Size multipliers
    if (size === 'enterprise') baseROI *= 1.2;
    if (size === 'small') baseROI *= 0.9;
    
    return Math.round(baseROI);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-50';
      case 2: return 'text-orange-600 bg-orange-50';
      case 3: return 'text-yellow-600 bg-yellow-50';
      case 4: return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: number) => {
    const labels = { 1: 'High', 2: 'Medium-High', 3: 'Medium', 4: 'Medium-Low', 5: 'Low' };
    return labels[priority as keyof typeof labels] || 'Medium';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading industry recommendations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentIndustry = industryInsights[userIndustry as keyof typeof industryInsights];

  return (
    <div className="space-y-6">
      {/* Industry Context */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>{userIndustry} Industry Insights</span>
          </CardTitle>
          <CardDescription>
            Tailored recommendations based on {userIndustry} industry best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentIndustry && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 text-red-600">Common Pain Points</h4>
                <ul className="space-y-1">
                  {currentIndustry.painPoints.map((pain, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <Target className="h-3 w-3 mr-2 text-red-500" />
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-blue-600">Key Metrics to Track</h4>
                <ul className="space-y-1">
                  {currentIndustry.keyMetrics.map((metric, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <TrendingUp className="h-3 w-3 mr-2 text-blue-500" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((rec, index) => (
          <Card key={rec.tool.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{rec.tool.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline"
                      className={getPriorityColor(rec.implementationPriority)}
                    >
                      {getPriorityLabel(rec.implementationPriority)} Priority
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {rec.tool.setup_time_estimate_weeks}w setup
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{rec.relevanceScore}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Industry fit</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{rec.tool.description}</p>

              {/* Industry-specific reasoning */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Why this fits your industry:</p>
                    <p className="text-sm text-blue-700">{rec.industryReason}</p>
                  </div>
                </div>
              </div>

              {/* Quick wins */}
              <div>
                <h4 className="text-sm font-medium mb-2">Quick Wins:</h4>
                <div className="space-y-1">
                  {rec.quickWins.map((win, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-muted-foreground">{win}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-4 py-3 bg-accent/5 rounded-lg px-3">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{rec.expectedROI}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Expected ROI</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{rec.tool.setup_time_estimate_weeks}w</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Setup time</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">{rec.tool.setup_difficulty}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Complexity</p>
                </div>
              </div>

              {/* Progress indicator */}
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Industry Relevance</span>
                  <span>{rec.relevanceScore}%</span>
                </div>
                <Progress value={rec.relevanceScore} className="h-2" />
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2 pt-2">
                <Button className="flex-1" size="sm">
                  Start Implementation
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={rec.tool.website_url} target="_blank" rel="noopener noreferrer">
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No industry-specific recommendations</h3>
            <p className="text-muted-foreground mb-4">
              Complete your assessment to get personalized recommendations for {userIndustry}
            </p>
            <Button>Complete Assessment</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}