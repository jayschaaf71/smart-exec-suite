import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, TrendingUp, ExternalLink, Bookmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface IndustryUpdate {
  id: string;
  role_type: string;
  industry_category: string;
  week_of: string;
  topic_1_title: string;
  topic_1_content: string;
  topic_2_title: string;
  topic_2_content: string;
  topic_3_title: string;
  topic_3_content: string;
  sources: any;
}

export function IndustryUpdates() {
  const [updates, setUpdates] = useState<IndustryUpdate[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIndustryUpdates();
  }, []);

  const loadIndustryUpdates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setUserProfile(profile);

      // For now, use mock data until database is properly set up
      const mockUpdates = generateMockUpdates(profile?.role || 'CEO', profile?.industry || 'Technology');
      setUpdates(mockUpdates);

    } catch (error) {
      console.error('Error loading industry updates:', error);
      // Final fallback to mock data
      const mockUpdates = generateMockUpdates('CEO', 'Technology');
      setUpdates(mockUpdates);
    } finally {
      setLoading(false);
    }
  };

  const generateMockUpdates = (role: string, industry: string): IndustryUpdate[] => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    const updateTemplates = {
      'CEO': {
        'Technology': [
          {
            id: '1',
            role_type: 'CEO',
            industry_category: 'Technology',
            week_of: today.toISOString().split('T')[0],
            topic_1_title: 'AI Infrastructure Investment Trends',
            topic_1_content: 'Major tech companies are increasing AI infrastructure spending by 40% in Q4 2024. Cloud providers are reporting unprecedented demand for GPU clusters, with waiting times extending to 6+ months. This trend indicates a fundamental shift in how enterprises are approaching AI implementation.',
            topic_2_title: 'Regulatory Landscape Changes',
            topic_2_content: 'The EU AI Act implementation timeline has been accelerated, with compliance requirements now expected by Q2 2025. Technology leaders should begin immediate assessment of AI systems for classification and compliance preparation.',
            topic_3_title: 'Talent Market Dynamics',
            topic_3_content: 'AI engineering salaries have increased 25% year-over-year, with prompt engineers commanding $200K+ salaries. Companies are investing heavily in AI training programs for existing workforce to address the talent gap.',
            sources: { count: 5, urls: ['techcrunch.com', 'reuters.com', 'bloomberg.com'] }
          },
          {
            id: '2',
            role_type: 'CEO',
            industry_category: 'Technology',
            week_of: lastWeek.toISOString().split('T')[0],
            topic_1_title: 'Open Source AI Model Ecosystem',
            topic_1_content: 'Meta\'s latest Llama release and Google\'s Gemma models are reshaping the competitive landscape. Open source alternatives are achieving performance parity with closed models, reducing dependency on proprietary solutions.',
            topic_2_title: 'Edge AI Deployment Acceleration',
            topic_2_content: 'Manufacturing and automotive sectors are leading edge AI adoption, with 60% of implementations moving from cloud to edge for latency and privacy benefits. This shift requires new architectural considerations.',
            topic_3_title: 'AI Safety and Alignment Progress',
            topic_3_content: 'Constitutional AI and RLHF techniques are becoming standard practice. Industry leaders are establishing AI safety boards and implementing governance frameworks ahead of regulatory requirements.',
            sources: { count: 7, urls: ['venturebeat.com', 'wired.com', 'hbr.org'] }
          }
        ],
        'Healthcare': [
          {
            id: '3',
            role_type: 'CEO',
            industry_category: 'Healthcare',
            week_of: today.toISOString().split('T')[0],
            topic_1_title: 'FDA AI/ML Guidance Updates',
            topic_1_content: 'The FDA has released new guidance for AI/ML-based medical devices, streamlining the 510(k) pathway for certain AI applications. This reduces time-to-market for diagnostic AI tools by an estimated 6-12 months.',
            topic_2_title: 'Clinical AI Implementation Success Metrics',
            topic_2_content: 'Leading health systems report 30% reduction in diagnostic errors and 25% improvement in workflow efficiency with AI integration. Mayo Clinic and Cleveland Clinic case studies provide implementation blueprints.',
            topic_3_title: 'AI in Drug Discovery Breakthroughs',
            topic_3_content: 'AI-discovered drugs are entering Phase II trials 40% faster than traditional methods. Partnerships between pharma giants and AI companies are accelerating, with deal values reaching record highs.',
            sources: { count: 4, urls: ['nejm.org', 'statnews.com', 'biopharmadive.com'] }
          }
        ]
      },
      'CFO': {
        'Technology': [
          {
            id: '4',
            role_type: 'CFO',
            industry_category: 'Technology',
            week_of: today.toISOString().split('T')[0],
            topic_1_title: 'AI ROI Measurement Frameworks',
            topic_1_content: 'Leading SaaS companies are reporting 15-30% EBITDA improvements from AI automation. New accounting standards for AI asset capitalization are being proposed by FASB, requiring updated financial reporting procedures.',
            topic_2_title: 'AI Infrastructure Cost Optimization',
            topic_2_content: 'Cloud AI costs are becoming a significant P&L line item, with some companies spending 20%+ of revenue on AI infrastructure. Multi-cloud strategies and reserved instance planning are critical for cost management.',
            topic_3_title: 'AI Investment Prioritization Models',
            topic_3_content: 'Best-in-class technology CFOs are using NPV models with AI-specific risk adjustments. Customer LTV improvements from AI personalization are showing 25% increases in key metrics.',
            sources: { count: 6, urls: ['cfo.com', 'mckinsey.com', 'pwc.com'] }
          }
        ],
        'Manufacturing': [
          {
            id: '5',
            role_type: 'CFO',
            industry_category: 'Manufacturing',
            week_of: today.toISOString().split('T')[0],
            topic_1_title: 'Predictive Maintenance ROI Analytics',
            topic_1_content: 'Manufacturing companies implementing AI-driven predictive maintenance report 20-25% reduction in unplanned downtime costs. The average payback period is 18 months with 300% ROI over 3 years.',
            topic_2_title: 'Supply Chain AI Investment Trends',
            topic_2_content: 'Supply chain optimization AI tools are showing 15% inventory cost reductions and 10% logistics savings. CFOs are prioritizing these investments given supply chain volatility impacts on cash flow.',
            topic_3_title: 'Quality Control Automation Benefits',
            topic_3_content: 'Computer vision quality control systems reduce defect rates by 60% and inspection costs by 40%. The financial impact includes reduced warranty claims and improved customer satisfaction scores.',
            sources: { count: 5, urls: ['industryweek.com', 'manufacturingdive.com', 'supplychaindive.com'] }
          }
        ]
      }
    };

    const roleUpdates = updateTemplates[role as keyof typeof updateTemplates];
    const industryUpdates = roleUpdates?.[industry as keyof typeof roleUpdates];
    
    return industryUpdates || updateTemplates['CEO']['Technology'];
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading industry updates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Industry Knowledge Updates</h1>
        <p className="text-muted-foreground">
          Weekly insights for {userProfile?.role}s in {userProfile?.industry}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{updates.length}</div>
            <div className="text-sm text-muted-foreground">Recent Updates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">15</div>
            <div className="text-sm text-muted-foreground">Topics Covered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ExternalLink className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">25+</div>
            <div className="text-sm text-muted-foreground">Source Articles</div>
          </CardContent>
        </Card>
      </div>

      {/* Updates */}
      <div className="space-y-6">
        {updates.map((update) => (
          <Card key={update.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">
                  Week of {new Date(update.week_of).toLocaleDateString()}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    Latest
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                  {update.topic_1_title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {update.topic_1_content}
                </p>
              </div>

              {/* Topic 2 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  {update.topic_2_title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {update.topic_2_content}
                </p>
              </div>

              {/* Topic 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                  {update.topic_3_title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {update.topic_3_content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  5 min read
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {userProfile?.role} • {userProfile?.industry}
                  </Badge>
                  {update.sources && (
                    <Badge variant="outline">
                      {update.sources.count || 5} sources
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Stay Ahead of Industry Trends</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get personalized weekly updates delivered to your inbox and join industry-specific 
              discussion groups to share insights with peers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Subscribe to Updates
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/community'}>
                Join Industry Groups
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}