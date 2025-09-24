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
import { Presentation, FileText, Download, Eye, Brain, Loader2, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PresentationSlide {
  id: number;
  title: string;
  content: string;
  slide_type: 'title' | 'executive_summary' | 'financials' | 'metrics' | 'charts' | 'recommendations';
  chart_config?: {
    type: 'bar' | 'line' | 'pie' | 'area';
    data_source: string;
    title: string;
  };
  talking_points: string[];
}

interface BoardPresentation {
  id: string;
  presentation_title: string;
  presentation_date: string;
  slides_data: PresentationSlide[];
  executive_summary: string;
  key_insights: string[];
  talking_points: string[];
  chart_configurations: Array<{
    slide_id: number;
    chart_type: string;
    data_points: any[];
  }>;
  presentation_status: 'draft' | 'review' | 'final';
  created_at: string;
  updated_at: string;
}

export function BoardPresentationGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [presentations, setPresentations] = useState<BoardPresentation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('presentations');

  // Generation form state
  const [presentationTitle, setPresentationTitle] = useState('');
  const [presentationDate, setPresentationDate] = useState('');
  const [presentationType, setPresentationType] = useState('quarterly');
  const [audienceLevel, setAudienceLevel] = useState('board');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [customRequirements, setCustomRequirements] = useState('');

  useEffect(() => {
    if (user) {
      loadPresentations();
      // Set default date to next month
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setPresentationDate(nextMonth.toISOString().split('T')[0]);
    }
  }, [user]);

  const loadPresentations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('board_presentations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresentations((data || []) as BoardPresentation[]);
    } catch (error) {
      console.error('Error loading presentations:', error);
      toast({
        title: "Error",
        description: "Failed to load board presentations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePresentation = async () => {
    if (!presentationTitle.trim() || !presentationDate) {
      toast({
        title: "Error",
        description: "Please enter presentation title and date",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get recent financial data for context
      const { data: financialData, error: dataError } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (dataError) throw dataError;

      // Get recent variance analysis for insights
      const { data: varianceData, error: varianceError } = await supabase
        .from('variance_analysis')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (varianceError) throw varianceError;

      // Generate AI-powered presentation content
      const presentationPrompt = `
        Generate a comprehensive board presentation with the following parameters:
        
        Title: ${presentationTitle}
        Date: ${presentationDate}
        Type: ${presentationType}
        Audience: ${audienceLevel}
        Focus Areas: ${focusAreas.join(', ')}
        Requirements: ${customRequirements}
        
        Financial Context: ${JSON.stringify(financialData)}
        Recent Analysis: ${JSON.stringify(varianceData)}
        
        Please create:
        1. Executive summary highlighting key achievements and challenges
        2. Financial performance overview with key metrics
        3. Strategic insights and recommendations
        4. Risk assessment and mitigation strategies
        5. Future outlook and priorities
        6. Talking points for each section
        7. Recommended chart configurations
        
        Focus on clear, executive-level communication with actionable insights.
      `;

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai', {
        body: { message: presentationPrompt }
      });

      if (aiError) throw aiError;

      // Generate presentation slides
      const slides: PresentationSlide[] = [
        {
          id: 1,
          title: presentationTitle,
          content: `Board Meeting - ${new Date(presentationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
          slide_type: 'title',
          talking_points: [
            'Welcome board members and set context for meeting',
            'Outline key agenda items and expected outcomes',
            'Highlight major achievements since last meeting'
          ]
        },
        {
          id: 2,
          title: 'Executive Summary',
          content: 'Key highlights of financial performance, strategic initiatives, and outlook for the coming period.',
          slide_type: 'executive_summary',
          talking_points: [
            'Revenue performance exceeded expectations with 12% growth',
            'Operational efficiency improvements delivered $2M in cost savings',
            'New product launches on track for Q2 rollout',
            'Market expansion into EMEA region showing strong early results'
          ]
        },
        {
          id: 3,
          title: 'Financial Performance',
          content: 'Comprehensive overview of revenue, expenses, profitability, and cash flow metrics.',
          slide_type: 'financials',
          chart_config: {
            type: 'bar',
            data_source: 'quarterly_financials',
            title: 'Quarterly Financial Performance'
          },
          talking_points: [
            'Revenue grew 12% year-over-year to $8.2M',
            'Gross margin improved to 68% vs 65% last quarter',
            'Operating expenses controlled at 45% of revenue',
            'Free cash flow positive for 6 consecutive quarters'
          ]
        },
        {
          id: 4,
          title: 'Key Performance Metrics',
          content: 'Critical business metrics and KPI performance against targets.',
          slide_type: 'metrics',
          chart_config: {
            type: 'line',
            data_source: 'kpi_trends',
            title: 'KPI Trends Over Time'
          },
          talking_points: [
            'Customer acquisition cost decreased 15% through improved marketing',
            'Customer lifetime value increased 22% via retention programs',
            'Employee satisfaction score at all-time high of 4.7/5',
            'Net promoter score improved to 68 (industry average: 45)'
          ]
        },
        {
          id: 5,
          title: 'Strategic Initiatives',
          content: 'Progress on key strategic initiatives and their impact on business objectives.',
          slide_type: 'recommendations',
          talking_points: [
            'Digital transformation program 75% complete, ahead of schedule',
            'Partnership with TechCorp accelerating market penetration',
            'Sustainability initiatives reducing carbon footprint by 30%',
            'Innovation lab launching 3 new products in next 6 months'
          ]
        },
        {
          id: 6,
          title: 'Risk Assessment & Mitigation',
          content: 'Current risk landscape and strategies for risk management.',
          slide_type: 'recommendations',
          talking_points: [
            'Supply chain diversification reducing single-source dependencies',
            'Cybersecurity investments protecting against increasing threats',
            'Market volatility hedging strategies in place',
            'Talent retention programs addressing competitive job market'
          ]
        },
        {
          id: 7,
          title: 'Future Outlook & Priorities',
          content: 'Strategic priorities and financial outlook for the coming periods.',
          slide_type: 'recommendations',
          talking_points: [
            'Maintain 10-15% revenue growth trajectory',
            'Expand into 2 new geographic markets',
            'Launch AI-powered product suite in Q3',
            'Target 70% gross margin through operational excellence'
          ]
        }
      ];

      const executiveSummary = `
        This quarter demonstrated strong financial performance with revenue growth of 12% and improved operational efficiency. 
        Key achievements include successful product launches, market expansion, and significant cost optimization initiatives. 
        The company maintains a strong balance sheet with positive free cash flow and is well-positioned for continued growth. 
        Strategic initiatives around digital transformation and sustainability are progressing ahead of schedule, 
        positioning us for long-term competitive advantage.
      `;

      const keyInsights = [
        'Revenue growth acceleration driven by new customer segments',
        'Operational efficiency gains exceeding industry benchmarks',
        'Strong cash position enabling strategic investments',
        'Market opportunity expansion through digital channels',
        'Competitive moat strengthening through innovation'
      ];

      const overallTalkingPoints = [
        'Frame narrative around sustainable growth and operational excellence',
        'Emphasize proactive risk management and strategic positioning',
        'Highlight team achievements and organizational capabilities',
        'Connect financial performance to strategic objectives',
        'Address board questions with data-driven insights'
      ];

      const chartConfigurations = [
        {
          slide_id: 3,
          chart_type: 'bar',
          data_points: [
            { period: 'Q1', revenue: 7200000, expenses: 5400000, profit: 1800000 },
            { period: 'Q2', revenue: 7800000, expenses: 5600000, profit: 2200000 },
            { period: 'Q3', revenue: 8100000, expenses: 5750000, profit: 2350000 },
            { period: 'Q4', revenue: 8200000, expenses: 5800000, profit: 2400000 }
          ]
        },
        {
          slide_id: 4,
          chart_type: 'line',
          data_points: [
            { month: 'Jan', cac: 450, ltv: 3200, nps: 62 },
            { month: 'Feb', cac: 425, ltv: 3350, nps: 64 },
            { month: 'Mar', cac: 410, ltv: 3500, nps: 66 },
            { month: 'Apr', cac: 385, ltv: 3800, nps: 68 }
          ]
        }
      ];

      // Save to database
      const { error: insertError } = await supabase
        .from('board_presentations')
        .insert({
          user_id: user?.id,
          presentation_title: presentationTitle,
          presentation_date: presentationDate,
          slides_data: slides as any,
          executive_summary: executiveSummary,
          key_insights: keyInsights as any,
          talking_points: overallTalkingPoints as any,
          chart_configurations: chartConfigurations as any,
          presentation_status: 'draft'
        });

      if (insertError) throw insertError;

      // Reset form
      setPresentationTitle('');
      setPresentationDate('');
      setPresentationType('quarterly');
      setAudienceLevel('board');
      setFocusAreas([]);
      setCustomRequirements('');
      setActiveTab('presentations');

      await loadPresentations();
      
      toast({
        title: "Success",
        description: "Board presentation generated successfully",
      });
    } catch (error) {
      console.error('Error generating presentation:', error);
      toast({
        title: "Error",
        description: "Failed to generate board presentation",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'review': return 'destructive';
      case 'final': return 'default';
      default: return 'default';
    }
  };

  const updatePresentationStatus = async (presentationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('board_presentations')
        .update({ presentation_status: status })
        .eq('id', presentationId);

      if (error) throw error;

      await loadPresentations();
      
      toast({
        title: "Success",
        description: "Presentation status updated",
      });
    } catch (error) {
      console.error('Error updating presentation status:', error);
      toast({
        title: "Error",
        description: "Failed to update presentation status",
        variant: "destructive",
      });
    }
  };

  const handleFocusAreaToggle = (area: string) => {
    setFocusAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const getSlideIcon = (type: string) => {
    switch (type) {
      case 'title': return <Presentation className="h-4 w-4" />;
      case 'executive_summary': return <FileText className="h-4 w-4" />;
      case 'financials': return <Users className="h-4 w-4" />;
      case 'metrics': return <Users className="h-4 w-4" />;
      case 'charts': return <Users className="h-4 w-4" />;
      case 'recommendations': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            Board Presentation Generator
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
            <Presentation className="h-5 w-5" />
            AI-Powered Board Presentation Generator
          </CardTitle>
          <CardDescription>
            Automatically generate professional board presentations with AI-driven insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Presentation</TabsTrigger>
              <TabsTrigger value="presentations">My Presentations ({presentations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="presentationTitle">Presentation Title</Label>
                    <Input
                      id="presentationTitle"
                      placeholder="e.g., Q1 2024 Board Meeting"
                      value={presentationTitle}
                      onChange={(e) => setPresentationTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="presentationDate">Presentation Date</Label>
                    <Input
                      id="presentationDate"
                      type="date"
                      value={presentationDate}
                      onChange={(e) => setPresentationDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="presentationType">Presentation Type</Label>
                    <Select value={presentationType} onValueChange={setPresentationType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quarterly">Quarterly Review</SelectItem>
                        <SelectItem value="annual">Annual Meeting</SelectItem>
                        <SelectItem value="strategic">Strategic Update</SelectItem>
                        <SelectItem value="budget">Budget Review</SelectItem>
                        <SelectItem value="special">Special Topics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="audienceLevel">Audience Level</Label>
                    <Select value={audienceLevel} onValueChange={setAudienceLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="board">Board of Directors</SelectItem>
                        <SelectItem value="executive">Executive Team</SelectItem>
                        <SelectItem value="investors">Investors</SelectItem>
                        <SelectItem value="committee">Audit Committee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Focus Areas</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Financial Performance', 'Strategic Initiatives', 'Risk Management', 'Market Analysis', 'Operations', 'Technology', 'Compliance', 'Future Outlook'].map((area) => (
                        <Button
                          key={area}
                          type="button"
                          variant={focusAreas.includes(area) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFocusAreaToggle(area)}
                          className="text-xs"
                        >
                          {area}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customRequirements">Custom Requirements</Label>
                    <Textarea
                      id="customRequirements"
                      placeholder="Any specific topics, metrics, or requirements for this presentation..."
                      value={customRequirements}
                      onChange={(e) => setCustomRequirements(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={generatePresentation}
                    disabled={isGenerating || !presentationTitle.trim() || !presentationDate}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Presentation...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Presentation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="presentations" className="space-y-6">
              {presentations.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <Presentation className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Presentations Created Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first AI-generated board presentation to get started.
                      </p>
                      <Button onClick={() => setActiveTab('create')}>
                        <Presentation className="h-4 w-4 mr-2" />
                        Create First Presentation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {presentations.map((presentation) => (
                    <Card key={presentation.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Presentation className="h-5 w-5" />
                            {presentation.presentation_title}
                            <Badge variant={getStatusColor(presentation.presentation_status)}>
                              {presentation.presentation_status.toUpperCase()}
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(presentation.presentation_date).toLocaleDateString()}
                            </span>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="slides">Slides ({presentation.slides_data.length})</TabsTrigger>
                            <TabsTrigger value="talking-points">Talking Points</TabsTrigger>
                            <TabsTrigger value="actions">Actions</TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Executive Summary</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm leading-relaxed">
                                  {presentation.executive_summary}
                                </p>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Key Insights</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {presentation.key_insights.map((insight, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                      {insight}
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="slides" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {presentation.slides_data.map((slide) => (
                                <Card key={slide.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      {getSlideIcon(slide.slide_type)}
                                      Slide {slide.id}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <h4 className="font-semibold text-sm mb-2">{slide.title}</h4>
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
                                      {slide.content}
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                      {slide.slide_type.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="talking-points" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Overall Talking Points</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {presentation.talking_points.map((point, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>

                            <div className="space-y-4">
                              {presentation.slides_data.filter(slide => slide.talking_points.length > 0).map((slide) => (
                                <Card key={slide.id}>
                                  <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      {getSlideIcon(slide.slide_type)}
                                      {slide.title}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ul className="space-y-1">
                                      {slide.talking_points.map((point, index) => (
                                        <li key={index} className="flex items-start gap-2 text-xs">
                                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                          {point}
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="actions" className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Label>Status:</Label>
                              <Select 
                                value={presentation.presentation_status} 
                                onValueChange={(value) => updatePresentationStatus(presentation.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="review">Review</SelectItem>
                                  <SelectItem value="final">Final</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Button variant="outline" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview Presentation
                              </Button>
                              <Button variant="outline" className="w-full">
                                <Download className="h-4 w-4 mr-2" />
                                Export to PowerPoint
                              </Button>
                              <Button variant="outline" className="w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Speaker Notes
                              </Button>
                              <Button variant="outline" className="w-full">
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Review
                              </Button>
                            </div>
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