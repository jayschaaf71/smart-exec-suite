import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Building, Cog, Users, Target, BarChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BusinessAssessmentData {
  businessContext: {
    industry: string;
    companySize: string;
    revenueModel: string;
    techInfrastructure: string;
    digitalMaturity: number;
  };
  processAnalysis: {
    coreProcesses: string;
    operationalChallenges: string;
    manualEffortAreas: string[];
    dataQuality: number;
    integrationComplexity: number;
  };
  organizationalReadiness: {
    leadershipBuyIn: number;
    teamCapabilities: string[];
    changeManagement: number;
    budgetAllocation: string;
    implementationTimeline: string;
  };
  strategicObjectives: {
    businessOutcomes: string;
    roiExpectations: string;
    riskTolerance: number;
    competitiveAdvantages: string[];
    scalabilityNeeds: string;
  };
  currentState: {
    existingStack: string[];
    aiToolsInUse: string[];
    dataInfrastructure: string;
    skillsGaps: string[];
    transformationExperience: string;
  };
}

const BusinessTransformationAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<BusinessAssessmentData>({
    businessContext: {
      industry: '',
      companySize: '',
      revenueModel: '',
      techInfrastructure: '',
      digitalMaturity: 3
    },
    processAnalysis: {
      coreProcesses: '',
      operationalChallenges: '',
      manualEffortAreas: [],
      dataQuality: 3,
      integrationComplexity: 3
    },
    organizationalReadiness: {
      leadershipBuyIn: 3,
      teamCapabilities: [],
      changeManagement: 3,
      budgetAllocation: '',
      implementationTimeline: ''
    },
    strategicObjectives: {
      businessOutcomes: '',
      roiExpectations: '',
      riskTolerance: 3,
      competitiveAdvantages: [],
      scalabilityNeeds: ''
    },
    currentState: {
      existingStack: [],
      aiToolsInUse: [],
      dataInfrastructure: '',
      skillsGaps: [],
      transformationExperience: ''
    }
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Convert assessment data to profile format using correct property structure
      const profile = {
        role: 'Business Leader',
        industry: assessmentData.businessContext.industry,
        company_size: assessmentData.businessContext.companySize,
        ai_experience: assessmentData.currentState.aiToolsInUse.length > 0 ? 'multiple' : 'never',
        goals: assessmentData.strategicObjectives.competitiveAdvantages,
        time_availability: assessmentData.organizationalReadiness.implementationTimeline,
        implementation_timeline: assessmentData.organizationalReadiness.implementationTimeline,
        primary_focus_areas: assessmentData.processAnalysis.manualEffortAreas,
        display_name: 'Business Transformation Lead'
      };

      // Save assessment data to AI assessments table
      const { error: assessmentError } = await supabase
        .from('ai_assessments')
        .insert({
          user_id: userData.user.id,
          assessment_type: 'business_transformation',
          assessment_data: assessmentData as any,
          ai_recommendations: {},
          status: 'completed'
        });

      if (assessmentError) throw assessmentError;

      // Update user profile with enhanced data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userData.user.id,
          ...profile
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (profileError) throw profileError;

      console.log('Business Assessment Complete:', assessmentData);
      alert('Assessment completed successfully! Your personalized recommendations are being generated.');
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment. Please try again.');
    }
  };

  const renderBusinessContext = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">What industry does your company operate in?</Label>
        <RadioGroup>
          {['Technology', 'Finance/Banking', 'Healthcare', 'Manufacturing', 'Retail/E-commerce', 'Professional Services', 'Real Estate', 'Other'].map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <RadioGroupItem value={industry} id={industry} />
              <Label htmlFor={industry}>{industry}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Company size by employees</Label>
        <RadioGroup>
          {['1-10', '11-50', '51-200', '201-1000', '1000+'].map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <RadioGroupItem value={size} id={size} />
              <Label htmlFor={size}>{size} employees</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What's your primary revenue model?</Label>
        <RadioGroup>
          {['SaaS/Subscription', 'Product Sales', 'Service-based', 'Marketplace/Commission', 'Advertising', 'Mixed Model'].map((model) => (
            <div key={model} className="flex items-center space-x-2">
              <RadioGroupItem value={model} id={model} />
              <Label htmlFor={model}>{model}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Describe your current technology infrastructure</Label>
        <Textarea placeholder="What systems, platforms, and tools does your company currently use? Include CRM, ERP, communication tools, etc." className="min-h-[80px]" />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Rate your company's digital maturity (1-5)</Label>
        <RadioGroup defaultValue="3">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level.toString()} id={`maturity-${level}`} />
              <Label htmlFor={`maturity-${level}`}>
                {level} - {level === 1 ? 'Paper-based' : level === 2 ? 'Basic Digital' : level === 3 ? 'Integrated Systems' : level === 4 ? 'Data-Driven' : 'AI-Enhanced'}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderProcessAnalysis = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">Map your core business processes and identify bottlenecks</Label>
        <Textarea placeholder="Describe your main business workflows (sales, operations, customer service, etc.) and where you see the biggest inefficiencies..." className="min-h-[100px]" />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What are your biggest operational challenges?</Label>
        <Textarea placeholder="Be specific about problems that cost time, money, or cause customer/employee frustration..." className="min-h-[100px]" />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Which areas require the most manual effort?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Data entry', 'Report generation', 'Customer communication', 'Inventory management', 'Scheduling', 'Quality control', 'Financial processing', 'Document management'].map((area) => (
            <div key={area} className="flex items-center space-x-2">
              <Checkbox id={area} />
              <Label htmlFor={area} className="text-sm">{area}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Rate your data quality and accessibility (1-5)</Label>
        <RadioGroup defaultValue="3">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level.toString()} id={`data-${level}`} />
              <Label htmlFor={`data-${level}`}>
                {level} - {level === 1 ? 'Poor/Siloed' : level === 2 ? 'Basic' : level === 3 ? 'Good' : level === 4 ? 'Very Good' : 'Excellent/Unified'}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">How complex would system integration be? (1-5)</Label>
        <RadioGroup defaultValue="3">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level.toString()} id={`integration-${level}`} />
              <Label htmlFor={`integration-${level}`}>
                {level} - {level === 1 ? 'Very Simple' : level === 2 ? 'Simple' : level === 3 ? 'Moderate' : level === 4 ? 'Complex' : 'Very Complex'}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderOrganizationalReadiness = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">Rate leadership buy-in for AI initiatives (1-5)</Label>
        <RadioGroup defaultValue="3">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level.toString()} id={`leadership-${level}`} />
              <Label htmlFor={`leadership-${level}`}>
                {level} - {level === 1 ? 'Resistant' : level === 2 ? 'Skeptical' : level === 3 ? 'Neutral' : level === 4 ? 'Supportive' : 'Champion'}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What technical capabilities does your team have?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Software development', 'Data analysis', 'System administration', 'Project management', 'Process optimization', 'Change management', 'Training & development', 'Vendor management'].map((capability) => (
            <div key={capability} className="flex items-center space-x-2">
              <Checkbox id={capability} />
              <Label htmlFor={capability} className="text-sm">{capability}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Rate your organization's change management capacity (1-5)</Label>
        <RadioGroup defaultValue="3">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level.toString()} id={`change-${level}`} />
              <Label htmlFor={`change-${level}`}>
                {level} - {level === 1 ? 'Very Poor' : level === 2 ? 'Poor' : level === 3 ? 'Average' : level === 4 ? 'Good' : 'Excellent'}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What's your annual budget for AI/automation initiatives?</Label>
        <RadioGroup>
          {['$0-10K', '$10K-50K', '$50K-100K', '$100K-500K', '$500K+', 'Not determined yet'].map((budget) => (
            <div key={budget} className="flex items-center space-x-2">
              <RadioGroupItem value={budget} id={budget} />
              <Label htmlFor={budget}>{budget}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What's your implementation timeline?</Label>
        <RadioGroup>
          {['3 months', '6 months', '12 months', '18+ months', 'Flexible'].map((timeline) => (
            <div key={timeline} className="flex items-center space-x-2">
              <RadioGroupItem value={timeline} id={timeline} />
              <Label htmlFor={timeline}>{timeline}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderStrategicObjectives = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">What specific business outcomes do you want to achieve?</Label>
        <Textarea placeholder="Be specific about revenue growth, cost reduction, efficiency gains, customer satisfaction improvements, etc." className="min-h-[100px]" />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What are your ROI expectations and how will you measure success?</Label>
        <Textarea placeholder="Include timeframes, percentage improvements, cost savings, revenue targets, etc." className="min-h-[100px]" />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Rate your risk tolerance for new technology (1-5)</Label>
        <RadioGroup defaultValue="3">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level.toString()} id={`risk-${level}`} />
              <Label htmlFor={`risk-${level}`}>
                {level} - {level === 1 ? 'Very Conservative' : level === 2 ? 'Conservative' : level === 3 ? 'Moderate' : level === 4 ? 'Aggressive' : 'Very Aggressive'}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What competitive advantages are you seeking?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Faster time-to-market', 'Lower operational costs', 'Better customer experience', 'Higher quality products', 'Data-driven insights', 'Automated processes', 'Scalability', 'Innovation capability'].map((advantage) => (
            <div key={advantage} className="flex items-center space-x-2">
              <Checkbox id={advantage} />
              <Label htmlFor={advantage} className="text-sm">{advantage}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Describe your scalability needs</Label>
        <Textarea placeholder="How do you expect your business to grow? What scaling challenges do you anticipate?" className="min-h-[80px]" />
      </div>
    </div>
  );

  const renderCurrentState = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">What's your existing technology stack?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['CRM (Salesforce, HubSpot)', 'ERP (SAP, Oracle)', 'Communication (Slack, Teams)', 'Analytics (Tableau, Power BI)', 'Cloud (AWS, Azure, GCP)', 'Database (SQL, NoSQL)', 'Development (GitHub, Jira)', 'Marketing (Mailchimp, Marketo)'].map((tech) => (
            <div key={tech} className="flex items-center space-x-2">
              <Checkbox id={tech} />
              <Label htmlFor={tech} className="text-sm">{tech}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Which AI/automation tools are you currently using?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['ChatGPT/OpenAI', 'Microsoft Copilot', 'Google AI', 'Zapier', 'RPA tools', 'Chatbots', 'Predictive analytics', 'None currently'].map((tool) => (
            <div key={tool} className="flex items-center space-x-2">
              <Checkbox id={tool} />
              <Label htmlFor={tool} className="text-sm">{tool}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Describe your data infrastructure and accessibility</Label>
        <Textarea placeholder="How is data stored, accessed, and managed in your organization? What are the challenges?" className="min-h-[80px]" />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What are your team's biggest skills gaps?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['AI/ML understanding', 'Data analysis', 'Process automation', 'Change management', 'Technical implementation', 'Project management', 'Vendor management', 'Training & adoption'].map((gap) => (
            <div key={gap} className="flex items-center space-x-2">
              <Checkbox id={gap} />
              <Label htmlFor={gap} className="text-sm">{gap}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Describe your previous digital transformation experience</Label>
        <Textarea placeholder="What technology implementations have you done before? What worked well? What challenges did you face?" className="min-h-[80px]" />
      </div>
    </div>
  );

  const stepComponents = {
    1: renderBusinessContext,
    2: renderProcessAnalysis,
    3: renderOrganizationalReadiness,
    4: renderStrategicObjectives,
    5: renderCurrentState
  };

  const stepTitles = {
    1: 'Business Context',
    2: 'Process Analysis',
    3: 'Organizational Readiness',
    4: 'Strategic Objectives',
    5: 'Current State Assessment'
  };

  const stepIcons = {
    1: Building,
    2: Cog,
    3: Users,
    4: Target,
    5: BarChart
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Business AI Transformation Assessment</h1>
            <p className="text-muted-foreground">Strategic assessment to create your customized AI implementation roadmap</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <Progress value={progress} className="flex-1" />
          <Badge variant="outline">{currentStep} of {totalSteps}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {React.createElement(stepIcons[currentStep as keyof typeof stepIcons], { className: "w-5 h-5 text-primary" })}
            <CardTitle>{stepTitles[currentStep as keyof typeof stepTitles]}</CardTitle>
          </div>
          <CardDescription>
            {currentStep === 1 && "Help us understand your business environment and competitive landscape"}
            {currentStep === 2 && "Identify your core processes and operational bottlenecks"}
            {currentStep === 3 && "Evaluate your team's readiness for AI transformation"}
            {currentStep === 4 && "Define your strategic goals and success metrics"}
            {currentStep === 5 && "Assess your current technology foundation and capabilities"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stepComponents[currentStep as keyof typeof stepComponents]()}
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {currentStep === totalSteps ? (
              <Button onClick={handleSubmit} className="flex items-center gap-2">
                Complete Assessment
                <Target className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessTransformationAssessment;