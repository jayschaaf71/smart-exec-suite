import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Target, Building, CheckCircle } from 'lucide-react';

interface AssessmentData {
  aiKnowledge: {
    currentTools: string[];
    usageFrequency: string;
    confidenceLevel: number;
    challenges: string[];
    previousTraining: boolean;
  };
  roleActivities: {
    publicSpeaking: number;
    teamMeetings: number;
    boardPrep: number;
    earningsCalls: number;
    strategicPlanning: number;
    financialReporting: number;
    operationalOversight: number;
    stakeholderComm: number;
  };
  industryContext: {
    primaryIndustry: string;
    industrySubcategory: string;
    companySize: string;
    teamSize: number;
  };
}

const AI_TOOLS_OPTIONS = [
  'ChatGPT', 'Claude', 'Perplexity', 'Midjourney', 'DALL-E', 'Notion AI',
  'Grammarly', 'Jasper', 'Copy.ai', 'Otter.ai', 'Calendly AI', 'Slack AI',
  'Microsoft Copilot', 'Google Bard', 'Canva AI', 'Loom AI', 'Zoom AI',
  'Salesforce Einstein', 'HubSpot AI', 'Monday.com AI', 'None'
];

const INDUSTRIES = {
  'Technology': ['SaaS', 'Hardware', 'AI/ML', 'Cybersecurity', 'Fintech'],
  'Financial Services': ['Banking', 'Insurance', 'Investment', 'Wealth Management'],
  'Healthcare': ['Pharmaceuticals', 'Medical Devices', 'Healthcare Services', 'Biotech'],
  'Manufacturing': ['Automotive', 'Aerospace', 'Consumer Goods', 'Industrial Equipment'],
  'Retail': ['E-commerce', 'Traditional Retail', 'Luxury', 'Food & Beverage'],
  'Energy': ['Oil & Gas', 'Renewable Energy', 'Utilities', 'Mining'],
  'Real Estate': ['Commercial', 'Residential', 'REITs', 'Property Management'],
  'Professional Services': ['Consulting', 'Legal', 'Accounting', 'Marketing']
};

const CHALLENGES = [
  'Lack of technical knowledge',
  'Security concerns',
  'Cost justification',
  'Team resistance',
  'Integration complexity',
  'Time constraints',
  'Finding the right tools',
  'Measuring ROI'
];

export function EnhancedAssessment() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    aiKnowledge: {
      currentTools: [],
      usageFrequency: '',
      confidenceLevel: 5,
      challenges: [],
      previousTraining: false
    },
    roleActivities: {
      publicSpeaking: 0,
      teamMeetings: 0,
      boardPrep: 0,
      earningsCalls: 0,
      strategicPlanning: 0,
      financialReporting: 0,
      operationalOversight: 0,
      stakeholderComm: 0
    },
    industryContext: {
      primaryIndustry: '',
      industrySubcategory: '',
      companySize: '',
      teamSize: 0
    }
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to complete the assessment.",
          variant: "destructive"
        });
        return;
      }

      // Calculate AI knowledge score
      const knowledgeScore = calculateKnowledgeScore(assessmentData.aiKnowledge);
      
      // For now, just store in localStorage until database types are updated
      // TODO: Replace with actual database save once types are updated
      localStorage.setItem('assessmentData', JSON.stringify({
        user_id: user.id,
        ai_knowledge_score: knowledgeScore,
        current_tools: assessmentData.aiKnowledge.currentTools,
        activity_breakdown: assessmentData.roleActivities,
        industry_category: assessmentData.industryContext.primaryIndustry,
        industry_subcategory: assessmentData.industryContext.industrySubcategory,
        assessment_version: '2.0',
        completed_at: new Date().toISOString()
      }));

      // Store activity allocations in localStorage too
      const activities = Object.entries(assessmentData.roleActivities);
      const activityAllocations = activities
        .filter(([, percentage]) => percentage > 0)
        .map(([activity, percentage]) => ({
          user_id: user.id,
          activity_type: activity,
          time_percentage: percentage,
          importance_level: percentage > 20 ? 3 : percentage > 10 ? 2 : 1,
          ai_potential_score: calculateAIPotential(activity)
        }));
      
      localStorage.setItem('activityAllocations', JSON.stringify(activityAllocations));

      toast({
        title: "Assessment completed!",
        description: "Your personalized recommendations are being prepared."
      });

      // Redirect to personalized onboarding
      window.location.href = '/onboarding/personalized';
      
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error saving assessment",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateKnowledgeScore = (knowledge: any) => {
    let score = 0;
    score += knowledge.currentTools.length * 5; // 5 points per tool
    score += knowledge.confidenceLevel * 5; // Up to 50 points for confidence
    score += knowledge.previousTraining ? 20 : 0; // 20 points for training
    return Math.min(score, 100);
  };

  const calculateAIPotential = (activity: string) => {
    const potentialScores: { [key: string]: number } = {
      publicSpeaking: 85,
      teamMeetings: 70,
      boardPrep: 90,
      earningsCalls: 80,
      strategicPlanning: 95,
      financialReporting: 90,
      operationalOversight: 75,
      stakeholderComm: 80
    };
    return potentialScores[activity] || 70;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">AI Readiness Assessment</h1>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground mt-2">Step {currentStep} of {totalSteps}</p>
      </div>

      {currentStep === 1 && (
        <AIKnowledgeStep 
          data={assessmentData.aiKnowledge}
          onChange={(data) => setAssessmentData(prev => ({ ...prev, aiKnowledge: data }))}
        />
      )}

      {currentStep === 2 && (
        <RoleActivitiesStep 
          data={assessmentData.roleActivities}
          onChange={(data) => setAssessmentData(prev => ({ ...prev, roleActivities: data }))}
        />
      )}

      {currentStep === 3 && (
        <IndustryContextStep 
          data={assessmentData.industryContext}
          onChange={(data) => setAssessmentData(prev => ({ ...prev, industryContext: data }))}
        />
      )}

      {currentStep === 4 && (
        <AssessmentSummary data={assessmentData} />
      )}

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentStep === totalSteps ? 'Complete Assessment' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

function AIKnowledgeStep({ data, onChange }: {
  data: AssessmentData['aiKnowledge'];
  onChange: (data: AssessmentData['aiKnowledge']) => void;
}) {
  const handleToolToggle = (tool: string) => {
    const currentTools = data.currentTools;
    const newTools = currentTools.includes(tool)
      ? currentTools.filter(t => t !== tool)
      : [...currentTools, tool];
    onChange({ ...data, currentTools: newTools });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          AI Knowledge & Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Which AI tools do you currently use?</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
            {AI_TOOLS_OPTIONS.map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  checked={data.currentTools.includes(tool)}
                  onCheckedChange={() => handleToolToggle(tool)}
                />
                <Label htmlFor={tool} className="text-sm">{tool}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">How frequently do you use AI tools?</Label>
          <RadioGroup value={data.usageFrequency} onValueChange={(value) => onChange({ ...data, usageFrequency: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Weekly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rarely" id="rarely" />
              <Label htmlFor="rarely">Rarely</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="never" id="never" />
              <Label htmlFor="never">Never</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium">
            Confidence level with AI tools (1-10): {data.confidenceLevel}
          </Label>
          <Slider
            value={[data.confidenceLevel]}
            onValueChange={(value) => onChange({ ...data, confidenceLevel: value[0] })}
            max={10}
            min={1}
            step={1}
            className="mt-3"
          />
        </div>

        <div>
          <Label className="text-base font-medium">What are your main challenges with AI?</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {CHALLENGES.map((challenge) => (
              <div key={challenge} className="flex items-center space-x-2">
                <Checkbox
                  id={challenge}
                  checked={data.challenges.includes(challenge)}
                  onCheckedChange={(checked) => {
                    const newChallenges = checked
                      ? [...data.challenges, challenge]
                      : data.challenges.filter(c => c !== challenge);
                    onChange({ ...data, challenges: newChallenges });
                  }}
                />
                <Label htmlFor={challenge} className="text-sm">{challenge}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="training"
            checked={data.previousTraining}
            onCheckedChange={(checked) => onChange({ ...data, previousTraining: !!checked })}
          />
          <Label htmlFor="training">I have received formal AI training</Label>
        </div>
      </CardContent>
    </Card>
  );
}

function RoleActivitiesStep({ data, onChange }: {
  data: AssessmentData['roleActivities'];
  onChange: (data: AssessmentData['roleActivities']) => void;
}) {
  const activities = [
    { key: 'publicSpeaking', label: 'Public Speaking & Presentations', icon: '🎤' },
    { key: 'teamMeetings', label: 'Team Meetings & Leadership', icon: '👥' },
    { key: 'boardPrep', label: 'Board Preparation & Reporting', icon: '📊' },
    { key: 'earningsCalls', label: 'Earnings Calls & Investor Relations', icon: '📞' },
    { key: 'strategicPlanning', label: 'Strategic Planning & Analysis', icon: '🎯' },
    { key: 'financialReporting', label: 'Financial Reporting & Analysis', icon: '📈' },
    { key: 'operationalOversight', label: 'Operational Oversight', icon: '⚙️' },
    { key: 'stakeholderComm', label: 'Stakeholder Communication', icon: '💬' }
  ];

  const totalPercentage = Object.values(data).reduce((sum, val) => sum + val, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Role Activities Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Allocate your time across these activities (total: {totalPercentage}%)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center">
                <span className="mr-2">{activity.icon}</span>
                {activity.label}
              </Label>
              <span className="text-sm font-medium">{data[activity.key as keyof typeof data]}%</span>
            </div>
            <Slider
              value={[data[activity.key as keyof typeof data]]}
              onValueChange={(value) => onChange({ ...data, [activity.key]: value[0] })}
              max={100}
              min={0}
              step={5}
            />
          </div>
        ))}
        {totalPercentage !== 100 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              💡 Tip: Activities should total 100% for accurate recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IndustryContextStep({ data, onChange }: {
  data: AssessmentData['industryContext'];
  onChange: (data: AssessmentData['industryContext']) => void;
}) {
  const companySizes = [
    'Startup (1-50 employees)',
    'Small (51-200 employees)',
    'Medium (201-1000 employees)',
    'Large (1001-5000 employees)',
    'Enterprise (5000+ employees)'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Industry & Company Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Primary Industry</Label>
          <Select value={data.primaryIndustry} onValueChange={(value) => onChange({ ...data, primaryIndustry: value, industrySubcategory: '' })}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(INDUSTRIES).map((industry) => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.primaryIndustry && (
          <div>
            <Label className="text-base font-medium">Industry Subcategory</Label>
            <Select value={data.industrySubcategory} onValueChange={(value) => onChange({ ...data, industrySubcategory: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES[data.primaryIndustry as keyof typeof INDUSTRIES].map((sub) => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label className="text-base font-medium">Company Size</Label>
          <Select value={data.companySize} onValueChange={(value) => onChange({ ...data, companySize: value })}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {companySizes.map((size) => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">Your Team Size</Label>
          <Input
            type="number"
            value={data.teamSize || ''}
            onChange={(e) => onChange({ ...data, teamSize: parseInt(e.target.value) || 0 })}
            placeholder="Number of direct reports"
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AssessmentSummary({ data }: { data: AssessmentData }) {
  const knowledgeScore = Math.min(
    data.aiKnowledge.currentTools.length * 5 + 
    data.aiKnowledge.confidenceLevel * 5 + 
    (data.aiKnowledge.previousTraining ? 20 : 0), 
    100
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Assessment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{knowledgeScore}</div>
            <div className="text-sm text-blue-800">AI Knowledge Score</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.aiKnowledge.currentTools.length}</div>
            <div className="text-sm text-green-800">AI Tools Used</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{data.industryContext.primaryIndustry}</div>
            <div className="text-sm text-purple-800">Industry Focus</div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Top Activities</h3>
          <div className="space-y-2">
            {Object.entries(data.roleActivities)
              .filter(([, percentage]) => percentage > 0)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([activity, percentage]) => (
                <div key={activity} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{activity.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <Badge variant="outline">{percentage}%</Badge>
                </div>
              ))}
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Your assessment is complete! Click "Complete Assessment" to get your personalized AI recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}