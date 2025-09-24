import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  Quote
} from 'lucide-react';

interface CaseStudy {
  id: string;
  companyName: string;
  industry: string;
  companySize: string;
  revenue: string;
  challenge: string;
  solution: string[];
  results: {
    timeSaved: string;
    costSavings: string;
    roiPercentage: number;
    efficiency: string;
  };
  testimonial: {
    quote: string;
    author: string;
    title: string;
  };
  toolsUsed: string[];
  implementationTime: string;
  featured: boolean;
}

const caseStudies: CaseStudy[] = [
  {
    id: '1',
    companyName: 'TechFlow Manufacturing',
    industry: 'Manufacturing',
    companySize: '1,200 employees',
    revenue: '$350M',
    challenge: 'Manual financial reporting took 40+ hours per month, board presentations required 3 weeks of preparation, and variance analysis was always delayed.',
    solution: [
      'Implemented automated dashboard with real-time KPI tracking',
      'Created self-updating board presentation templates',
      'Set up automated variance analysis with exception reporting',
      'Integrated ERP data feeds for instant financial updates'
    ],
    results: {
      timeSaved: '32 hours/month',
      costSavings: '$180,000/year',
      roiPercentage: 420,
      efficiency: '75% faster reporting'
    },
    testimonial: {
      quote: 'This transformation gave me back my weekends and allowed our team to focus on strategic analysis instead of data compilation.',
      author: 'Sarah Mitchell',
      title: 'CFO, TechFlow Manufacturing'
    },
    toolsUsed: ['Power BI', 'Alteryx', 'Excel Power Query'],
    implementationTime: '6 weeks',
    featured: true
  },
  {
    id: '2',
    companyName: 'HealthCare Plus',
    industry: 'Healthcare',
    companySize: '800 employees',
    revenue: '$120M',
    challenge: 'Complex regulatory reporting, manual cash flow forecasting, and difficulty tracking KPIs across multiple departments.',
    solution: [
      'Deployed automated compliance reporting system',
      'Built 13-week rolling cash flow model',
      'Created departmental KPI dashboards',
      'Implemented automated month-end close process'
    ],
    results: {
      timeSaved: '28 hours/month',
      costSavings: '$95,000/year',
      roiPercentage: 310,
      efficiency: '60% faster close'
    },
    testimonial: {
      quote: 'The automated compliance reporting alone saved us countless hours and eliminated the stress of regulatory deadlines.',
      author: 'Michael Chen',
      title: 'CFO, HealthCare Plus'
    },
    toolsUsed: ['Tableau', 'SQL Server', 'Python Scripts'],
    implementationTime: '8 weeks',
    featured: true
  },
  {
    id: '3',
    companyName: 'RetailMax Corp',
    industry: 'Retail',
    companySize: '2,500 employees',
    revenue: '$850M',
    challenge: 'Inventory forecasting was inaccurate, profitability analysis by location was manual, and budget vs actual reporting was time-intensive.',
    solution: [
      'Implemented AI-powered inventory forecasting',
      'Created automated store profitability dashboards',
      'Built real-time budget tracking system',
      'Deployed predictive analytics for seasonal planning'
    ],
    results: {
      timeSaved: '45 hours/month',
      costSavings: '$320,000/year',
      roiPercentage: 280,
      efficiency: '85% improvement in forecast accuracy'
    },
    testimonial: {
      quote: 'The AI forecasting transformed our inventory management and freed up our team to focus on strategic initiatives.',
      author: 'Jennifer Lopez',
      title: 'CFO, RetailMax Corp'
    },
    toolsUsed: ['Microsoft Fabric', 'Azure ML', 'Power BI'],
    implementationTime: '12 weeks',
    featured: false
  },
  {
    id: '4',
    companyName: 'FinTech Innovations',
    industry: 'Financial Services',
    companySize: '450 employees',
    revenue: '$75M',
    challenge: 'Regulatory reporting complexity, manual risk calculations, and time-consuming investor updates.',
    solution: [
      'Automated regulatory report generation',
      'Built real-time risk monitoring dashboards',
      'Created investor update templates with auto-population',
      'Implemented automated stress testing models'
    ],
    results: {
      timeSaved: '38 hours/month',
      costSavings: '$145,000/year',
      roiPercentage: 385,
      efficiency: '90% reduction in report errors'
    },
    testimonial: {
      quote: 'The automation gave us confidence in our numbers and dramatically improved our response time to regulatory requests.',
      author: 'David Park',
      title: 'CFO, FinTech Innovations'
    },
    toolsUsed: ['R', 'Shiny', 'PostgreSQL'],
    implementationTime: '10 weeks',
    featured: false
  }
];

export function SuccessCaseStudies() {
  const featuredCases = caseStudies.filter(cs => cs.featured);
  const otherCases = caseStudies.filter(cs => !cs.featured);

  const getIndustryColor = (industry: string) => {
    const colors = {
      'Manufacturing': 'text-blue-600 bg-blue-50',
      'Healthcare': 'text-green-600 bg-green-50',
      'Retail': 'text-purple-600 bg-purple-50',
      'Financial Services': 'text-orange-600 bg-orange-50',
      'Technology': 'text-red-600 bg-red-50'
    };
    return colors[industry as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const getROIColor = (roi: number) => {
    if (roi >= 400) return 'text-green-600';
    if (roi >= 300) return 'text-blue-600';
    if (roi >= 200) return 'text-yellow-600';
    return 'text-purple-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-6 w-6" />
            <span>CFO Success Stories</span>
          </CardTitle>
          <CardDescription>
            Real-world results from CFOs who transformed their operations with AI automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(caseStudies.reduce((sum, cs) => sum + cs.results.roiPercentage, 0) / caseStudies.length)}%
              </div>
              <p className="text-sm text-muted-foreground">Average ROI</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {Math.round(caseStudies.reduce((sum, cs) => sum + parseInt(cs.results.timeSaved), 0) / caseStudies.length)}h
              </div>
              <p className="text-sm text-muted-foreground">Avg. Monthly Time Saved</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">
                ${Math.round(caseStudies.reduce((sum, cs) => sum + parseInt(cs.results.costSavings.replace(/[,$]/g, '')), 0) / caseStudies.length / 1000)}K
              </div>
              <p className="text-sm text-muted-foreground">Avg. Annual Savings</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{caseStudies.length}</div>
              <p className="text-sm text-muted-foreground">Success Stories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Case Studies */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Featured Success Stories</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredCases.map((caseStudy) => (
            <Card key={caseStudy.id} className="border-2 border-primary/20 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">{caseStudy.companyName}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline"
                        className={getIndustryColor(caseStudy.industry)}
                      >
                        {caseStudy.industry}
                      </Badge>
                      <Badge variant="secondary">{caseStudy.companySize}</Badge>
                      <Badge variant="outline">{caseStudy.revenue} revenue</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getROIColor(caseStudy.results.roiPercentage)}`}>
                      {caseStudy.results.roiPercentage}%
                    </div>
                    <p className="text-sm text-muted-foreground">ROI</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Challenge */}
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">The Challenge</h4>
                  <p className="text-sm text-muted-foreground">{caseStudy.challenge}</p>
                </div>

                {/* Solution */}
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">The Solution</h4>
                  <div className="space-y-1">
                    {caseStudy.solution.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">The Results</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{caseStudy.results.timeSaved}</p>
                        <p className="text-xs text-green-600">Time Saved</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{caseStudy.results.costSavings}</p>
                        <p className="text-xs text-green-600">Annual Savings</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{caseStudy.results.roiPercentage}%</p>
                        <p className="text-xs text-green-600">ROI</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{caseStudy.results.efficiency}</p>
                        <p className="text-xs text-green-600">Efficiency Gain</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Quote className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm italic text-blue-900 mb-2">
                        "{caseStudy.testimonial.quote}"
                      </p>
                      <div className="text-xs text-blue-700">
                        <p className="font-medium">{caseStudy.testimonial.author}</p>
                        <p>{caseStudy.testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tools Used */}
                <div>
                  <h4 className="font-semibold mb-2">Tools Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {caseStudy.toolsUsed.map((tool, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Implementation time: {caseStudy.implementationTime}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Other Case Studies */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">More Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherCases.map((caseStudy) => (
            <Card key={caseStudy.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{caseStudy.companyName}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline"
                        className={getIndustryColor(caseStudy.industry)}
                      >
                        {caseStudy.industry}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">{caseStudy.revenue}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getROIColor(caseStudy.results.roiPercentage)}`}>
                      {caseStudy.results.roiPercentage}%
                    </div>
                    <p className="text-xs text-muted-foreground">ROI</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {caseStudy.challenge}
                </p>

                <div className="grid grid-cols-2 gap-4 py-3 bg-accent/5 rounded-lg px-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Time Saved</p>
                    <p className="text-sm font-medium">{caseStudy.results.timeSaved}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cost Savings</p>
                    <p className="text-sm font-medium">{caseStudy.results.costSavings}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm italic text-blue-900">
                    "{caseStudy.testimonial.quote}"
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    — {caseStudy.testimonial.author}
                  </p>
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  View Full Case Study
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="text-center py-12">
          <h3 className="text-2xl font-bold mb-4">Ready to Create Your Success Story?</h3>
          <p className="text-muted-foreground mb-6">
            Join these CFOs who transformed their operations and achieved exceptional ROI
          </p>
          <Button size="lg" className="mr-4">
            Start Your Assessment
          </Button>
          <Button variant="outline" size="lg">
            Schedule Consultation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
