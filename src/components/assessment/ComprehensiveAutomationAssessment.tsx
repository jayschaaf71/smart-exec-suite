import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Building, 
  Users, 
  DollarSign, 
  Target, 
  Zap, 
  Clock, 
  BarChart, 
  Shield,
  Globe,
  Cpu,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ComprehensiveAssessmentData {
  // Company Profile
  companyName: string;
  industry: string;
  companySize: string;
  revenue: string;
  website: string;
  businessModel: string;
  
  // Current State
  currentAutomationLevel: number;
  existingTools: string[];
  techStack: string[];
  dataMaturity: string;
  
  // Business Objectives
  primaryGoals: string[];
  timeFrame: string;
  budget: string;
  successMetrics: string[];
  
  // Pain Points
  operationalChallenges: string[];
  processInefficiencies: string;
  competitiveThreats: string;
  
  // Technical Infrastructure
  cloudReadiness: string;
  dataQuality: number;
  securityRequirements: string[];
  integrationNeeds: string[];
  
  // Team & Change Management
  teamSize: string;
  technicalExpertise: string;
  changeReadiness: number;
  trainingBudget: string;
  
  // Industry-Specific Context
  regulatoryRequirements: string[];
  customerExpectations: string;
  seasonality: string;
  
  // Strategic Vision
  longTermVision: string;
  innovationPriority: number;
  riskTolerance: string;
}

const ComprehensiveAutomationAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ComprehensiveAssessmentData>({
    companyName: '',
    industry: '',
    companySize: '',
    revenue: '',
    website: '',
    businessModel: '',
    currentAutomationLevel: 5,
    existingTools: [],
    techStack: [],
    dataMaturity: '',
    primaryGoals: [],
    timeFrame: '',
    budget: '',
    successMetrics: [],
    operationalChallenges: [],
    processInefficiencies: '',
    competitiveThreats: '',
    cloudReadiness: '',
    dataQuality: 5,
    securityRequirements: [],
    integrationNeeds: [],
    teamSize: '',
    technicalExpertise: '',
    changeReadiness: 5,
    trainingBudget: '',
    regulatoryRequirements: [],
    customerExpectations: '',
    seasonality: '',
    longTermVision: '',
    innovationPriority: 5,
    riskTolerance: ''
  });

  const totalSteps = 8;
  const progress = (currentStep / totalSteps) * 100;

  const industries = [
    'Financial Services', 'Healthcare', 'Manufacturing', 'Retail/E-commerce', 
    'Technology', 'Professional Services', 'Real Estate', 'Education',
    'Government', 'Non-profit', 'Media & Entertainment', 'Transportation & Logistics',
    'Energy & Utilities', 'Agriculture', 'Hospitality', 'Construction', 'Other'
  ];

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees', 
    '201-1000 employees', '1000+ employees'
  ];

  const revenueRanges = [
    'Under $1M', '$1M-$10M', '$10M-$50M', '$50M-$200M', 
    '$200M-$1B', 'Over $1B', 'Prefer not to say'
  ];

  const businessModels = [
    'B2B SaaS', 'B2C Subscription', 'E-commerce', 'Marketplace',
    'Professional Services', 'Manufacturing', 'Retail', 
    'Consulting', 'Agency', 'Non-profit', 'Other'
  ];

  const automationGoals = [
    'Reduce operational costs', 'Improve customer experience', 'Increase revenue',
    'Enhance data-driven decision making', 'Streamline workflows', 'Reduce manual errors',
    'Scale operations efficiently', 'Improve compliance', 'Accelerate time-to-market',
    'Enhance competitive advantage', 'Improve employee productivity', 'Better resource allocation'
  ];

  const operationalChallenges = [
    'Manual data entry', 'Repetitive task burden', 'Poor data visibility',
    'Inconsistent processes', 'High error rates', 'Slow decision making',
    'Customer service delays', 'Inventory management', 'Financial reporting complexity',
    'Compliance tracking', 'Resource planning', 'Quality control issues'
  ];

  const techStackOptions = [
    'Microsoft 365', 'Google Workspace', 'Salesforce', 'HubSpot',
    'SAP', 'Oracle', 'QuickBooks', 'Xero', 'Slack', 'Microsoft Teams',
    'Zoom', 'Asana', 'Monday.com', 'Jira', 'AWS', 'Azure', 'GCP'
  ];

  const securityRequirements = [
    'SOC 2 compliance', 'GDPR compliance', 'HIPAA compliance', 'PCI DSS',
    'ISO 27001', 'Multi-factor authentication', 'Single sign-on', 
    'Data encryption', 'Regular security audits', 'Access controls'
  ];

  const updateFormData = (field: keyof ComprehensiveAssessmentData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof ComprehensiveAssessmentData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFormData(field, newArray);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your assessment.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to AI assessment endpoint
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-assessment', {
        body: {
          assessmentType: 'comprehensive_automation',
          userProfile: {
            userId: user.id,
            assessmentData: formData
          }
        }
      });

      if (aiError) throw aiError;

      toast({
        title: "Assessment Submitted Successfully!",
        description: "Your comprehensive automation assessment is being analyzed. You'll receive detailed recommendations shortly.",
      });

      // Navigate to results or dashboard
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Profile
              </CardTitle>
              <CardDescription>
                Help us understand your organization's context and current position in the market.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Company Size *</Label>
                  <Select value={formData.companySize} onValueChange={(value) => updateFormData('companySize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Annual Revenue</Label>
                  <Select value={formData.revenue} onValueChange={(value) => updateFormData('revenue', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select revenue range" />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueRanges.map(range => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Business Model</Label>
                  <Select value={formData.businessModel} onValueChange={(value) => updateFormData('businessModel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business model" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessModels.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Current Automation State
              </CardTitle>
              <CardDescription>
                Let's assess your current level of automation and existing technology infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Current Automation Level (1-10)</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.currentAutomationLevel]}
                    onValueChange={(value) => updateFormData('currentAutomationLevel', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Mostly Manual</span>
                    <span>{formData.currentAutomationLevel}/10</span>
                    <span>Highly Automated</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Current Technology Stack (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {techStackOptions.map(tech => (
                    <div key={tech} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.techStack.includes(tech)}
                        onCheckedChange={() => handleArrayToggle('techStack', tech)}
                      />
                      <Label className="text-sm">{tech}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Data Maturity Level</Label>
                <RadioGroup
                  value={formData.dataMaturity}
                  onValueChange={(value) => updateFormData('dataMaturity', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" />
                    <Label>Basic - Limited data collection and analysis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" />
                    <Label>Intermediate - Some analytics and reporting in place</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" />
                    <Label>Advanced - Comprehensive data strategy and analytics</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expert" />
                    <Label>Expert - AI/ML capabilities and predictive analytics</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Business Objectives
              </CardTitle>
              <CardDescription>
                What are your primary goals for implementing AI automation solutions?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Primary Automation Goals (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {automationGoals.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.primaryGoals.includes(goal)}
                        onCheckedChange={() => handleArrayToggle('primaryGoals', goal)}
                      />
                      <Label className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Implementation Timeline</Label>
                  <Select value={formData.timeFrame} onValueChange={(value) => updateFormData('timeFrame', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (0-3 months)</SelectItem>
                      <SelectItem value="short">Short-term (3-6 months)</SelectItem>
                      <SelectItem value="medium">Medium-term (6-12 months)</SelectItem>
                      <SelectItem value="long">Long-term (1+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Available Budget</Label>
                  <Select value={formData.budget} onValueChange={(value) => updateFormData('budget', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-10k">Under $10K</SelectItem>
                      <SelectItem value="10k-50k">$10K - $50K</SelectItem>
                      <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                      <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                      <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                      <SelectItem value="over-1m">Over $1M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Success Metrics (How will you measure success?)</Label>
                <Textarea
                  value={formData.successMetrics.join('\n')}
                  onChange={(e) => updateFormData('successMetrics', e.target.value.split('\n').filter(Boolean))}
                  placeholder="e.g., 30% reduction in processing time, 50% decrease in errors, $100K annual savings"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Pain Points & Challenges
              </CardTitle>
              <CardDescription>
                Help us understand your current operational challenges and bottlenecks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Current Operational Challenges (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {operationalChallenges.map(challenge => (
                    <div key={challenge} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.operationalChallenges.includes(challenge)}
                        onCheckedChange={() => handleArrayToggle('operationalChallenges', challenge)}
                      />
                      <Label className="text-sm">{challenge}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Process Inefficiencies</Label>
                <Textarea
                  value={formData.processInefficiencies}
                  onChange={(e) => updateFormData('processInefficiencies', e.target.value)}
                  placeholder="Describe specific processes that are slow, error-prone, or resource-intensive..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Competitive Threats & Market Pressures</Label>
                <Textarea
                  value={formData.competitiveThreats}
                  onChange={(e) => updateFormData('competitiveThreats', e.target.value)}
                  placeholder="What competitive or market pressures are driving your need for automation?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Technical Infrastructure
              </CardTitle>
              <CardDescription>
                Assess your technical readiness and infrastructure requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Cloud Readiness</Label>
                <RadioGroup
                  value={formData.cloudReadiness}
                  onValueChange={(value) => updateFormData('cloudReadiness', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="on-premise" />
                    <Label>Primarily on-premise infrastructure</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hybrid" />
                    <Label>Hybrid cloud/on-premise setup</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cloud-first" />
                    <Label>Cloud-first strategy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cloud-native" />
                    <Label>Fully cloud-native</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Data Quality Rating (1-10)</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.dataQuality]}
                    onValueChange={(value) => updateFormData('dataQuality', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Poor Quality</span>
                    <span>{formData.dataQuality}/10</span>
                    <span>Excellent Quality</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Security & Compliance Requirements</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {securityRequirements.map(req => (
                    <div key={req} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.securityRequirements.includes(req)}
                        onCheckedChange={() => handleArrayToggle('securityRequirements', req)}
                      />
                      <Label className="text-sm">{req}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Integration Needs</Label>
                <Textarea
                  value={formData.integrationNeeds.join('\n')}
                  onChange={(e) => updateFormData('integrationNeeds', e.target.value.split('\n').filter(Boolean))}
                  placeholder="List systems that need to integrate with automation solutions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team & Change Management
              </CardTitle>
              <CardDescription>
                Understanding your team's capacity and readiness for change is crucial for successful implementation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Team Size Involved in Automation</Label>
                  <Select value={formData.teamSize} onValueChange={(value) => updateFormData('teamSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 people</SelectItem>
                      <SelectItem value="6-15">6-15 people</SelectItem>
                      <SelectItem value="16-50">16-50 people</SelectItem>
                      <SelectItem value="50+">50+ people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Technical Expertise Level</Label>
                  <Select value={formData.technicalExpertise} onValueChange={(value) => updateFormData('technicalExpertise', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expertise level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Limited technical knowledge</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Some technical skills</SelectItem>
                      <SelectItem value="advanced">Advanced - Strong technical capabilities</SelectItem>
                      <SelectItem value="expert">Expert - Deep technical expertise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Change Readiness (1-10)</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.changeReadiness]}
                    onValueChange={(value) => updateFormData('changeReadiness', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Resistant to Change</span>
                    <span>{formData.changeReadiness}/10</span>
                    <span>Embraces Change</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Training Budget</Label>
                <Select value={formData.trainingBudget} onValueChange={(value) => updateFormData('trainingBudget', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select training budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-5k">Under $5K</SelectItem>
                    <SelectItem value="5k-25k">$5K - $25K</SelectItem>
                    <SelectItem value="25k-100k">$25K - $100K</SelectItem>
                    <SelectItem value="over-100k">Over $100K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Industry Context
              </CardTitle>
              <CardDescription>
                Industry-specific factors that influence your automation strategy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Regulatory Requirements</Label>
                <Textarea
                  value={formData.regulatoryRequirements.join('\n')}
                  onChange={(e) => updateFormData('regulatoryRequirements', e.target.value.split('\n').filter(Boolean))}
                  placeholder="List any regulatory requirements that impact your automation choices..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Customer Expectations</Label>
                <Textarea
                  value={formData.customerExpectations}
                  onChange={(e) => updateFormData('customerExpectations', e.target.value)}
                  placeholder="How do customer expectations influence your automation needs?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Seasonality & Business Cycles</Label>
                <Textarea
                  value={formData.seasonality}
                  onChange={(e) => updateFormData('seasonality', e.target.value)}
                  placeholder="Describe any seasonal patterns or business cycles that affect your operations..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Strategic Vision
              </CardTitle>
              <CardDescription>
                Share your long-term vision and strategic priorities for AI automation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Long-term Vision</Label>
                <Textarea
                  value={formData.longTermVision}
                  onChange={(e) => updateFormData('longTermVision', e.target.value)}
                  placeholder="Describe your 3-5 year vision for AI automation in your organization..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Innovation Priority (1-10)</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.innovationPriority]}
                    onValueChange={(value) => updateFormData('innovationPriority', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Conservative</span>
                    <span>{formData.innovationPriority}/10</span>
                    <span>Cutting-edge</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Risk Tolerance</Label>
                <RadioGroup
                  value={formData.riskTolerance}
                  onValueChange={(value) => updateFormData('riskTolerance', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" />
                    <Label>Low - Prefer proven, stable solutions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" />
                    <Label>Medium - Balance between innovation and stability</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" />
                    <Label>High - Willing to adopt cutting-edge technologies</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Comprehensive AI Automation Assessment
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Get a detailed, business-specific automation strategy tailored to your organization's unique needs and context.
        </p>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {renderStep()}

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        
        {currentStep < totalSteps ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Submit Assessment'
            )}
          </Button>
        )}
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          What You'll Receive
        </h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Comprehensive automation roadmap specific to your industry</li>
          <li>• Prioritized tool recommendations with ROI projections</li>
          <li>• Implementation timeline with quick wins identified</li>
          <li>• Risk assessment and mitigation strategies</li>
          <li>• Team training and change management plan</li>
          <li>• Budget allocation recommendations</li>
        </ul>
      </div>
    </div>
  );
};

export default ComprehensiveAutomationAssessment;