import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface EnhancedOnboardingData {
  displayName: string;
  role: string;
  industry: string;
  companySize: string;
  aiExperience: string;
  primaryGoals: string[];
  timeAvailability: string;
  implementationTimeline: string;
}

const roles = [
  { id: 'ceo', title: 'CEO', description: 'Chief Executive Officer - Strategic leadership and vision' },
  { id: 'cto', title: 'CTO', description: 'Chief Technology Officer - Technology strategy and implementation' },
  { id: 'cmo', title: 'CMO', description: 'Chief Marketing Officer - Marketing strategy and brand management' },
  { id: 'coo', title: 'COO', description: 'Chief Operating Officer - Operations and process optimization' },
  { id: 'cfo', title: 'CFO', description: 'Chief Financial Officer - Financial strategy and analysis' },
  { id: 'vp', title: 'VP', description: 'Vice President - Senior leadership in specific domain' },
  { id: 'director', title: 'Director', description: 'Director - Department leadership and management' },
  { id: 'manager', title: 'Manager', description: 'Manager - Team leadership and daily operations' },
  { id: 'individual', title: 'Individual Contributor', description: 'Specialist focused on specific expertise area' },
  { id: 'other', title: 'Other', description: 'Other professional role' }
];

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Professional Services',
  'Retail', 'Education', 'Government', 'Real Estate', 'Consulting',
  'Media & Entertainment', 'Non-profit', 'Energy', 'Transportation', 'Other'
];

const companySizes = [
  '1-10 employees', '11-50 employees', '51-200 employees', 
  '201-1000 employees', '1000+ employees'
];

const aiExperienceLevels = [
  { id: 'never', title: 'Never used AI', description: 'New to AI tools and applications' },
  { id: 'chatgpt', title: 'ChatGPT only', description: 'Used ChatGPT for basic tasks' },
  { id: 'multiple', title: 'Multiple AI tools', description: 'Experience with several AI applications' },
  { id: 'advanced', title: 'Advanced AI user', description: 'Deep experience with AI integration and automation' }
];

const goalOptions = [
  'Increase personal productivity',
  'Improve team efficiency',
  'Reduce operational costs',
  'Enhance customer experience',
  'Drive innovation',
  'Stay competitive',
  'Automate repetitive tasks',
  'Improve decision making',
  'Scale operations',
  'Learn new technologies'
];

const timeAvailabilityOptions = [
  '15 minutes per day',
  '30 minutes per day', 
  '1 hour per day',
  '2+ hours per day'
];

const timelineOptions = [
  'This week',
  'This month',
  'This quarter',
  'Long-term planning'
];

export function EnhancedOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState<EnhancedOnboardingData>({
    displayName: '',
    role: '',
    industry: '',
    companySize: '',
    aiExperience: '',
    primaryGoals: [],
    timeAvailability: '',
    implementationTimeline: ''
  });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (isStepValid()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleGoalToggle = (goal: string) => {
    setData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goal)
        ? prev.primaryGoals.filter(g => g !== goal)
        : [...prev.primaryGoals, goal]
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return data.displayName.trim().length > 0;
      case 2: return data.role.length > 0;
      case 3: return data.industry.length > 0;
      case 4: return data.companySize.length > 0;
      case 5: return data.aiExperience.length > 0;
      case 6: return data.primaryGoals.length > 0;
      case 7: return data.timeAvailability.length > 0 && data.implementationTimeline.length > 0;
      default: return true;
    }
  };

  const handleComplete = async () => {
    if (!user || !isStepValid()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.displayName,
          role: data.role,
          industry: data.industry,
          company_size: data.companySize,
          ai_experience: data.aiExperience,
          goals: data.primaryGoals,
          time_availability: data.timeAvailability,
          implementation_timeline: data.implementationTimeline
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "We're generating your personalized AI tool recommendations.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    const titles = [
      "What's your name?",
      "What's your role?",
      "What industry are you in?",
      "What's your company size?",
      "Your AI experience?",
      "What are your primary goals?",
      "Time and timeline preferences?"
    ];
    return titles[currentStep - 1];
  };

  const getStepDescription = () => {
    const descriptions = [
      "Help us personalize your experience",
      "This helps us recommend the most relevant AI tools",
      "Different industries have unique AI opportunities",
      "Tool recommendations vary by organization size",
      "We'll match tools to your current skill level",
      "Select all that apply to your objectives",
      "This helps us create a realistic implementation plan"
    ];
    return descriptions[currentStep - 1];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={data.displayName}
                onChange={(e) => setData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            {roles.map((role) => (
              <Card
                key={role.id}
                className={`cursor-pointer transition-colors ${
                  data.role === role.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setData(prev => ({ ...prev, role: role.id }))}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <h3 className="font-medium">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {data.role === role.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-2 gap-3">
            {industries.map((industry) => (
              <Card
                key={industry}
                className={`cursor-pointer transition-colors ${
                  data.industry === industry 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setData(prev => ({ ...prev, industry }))}
              >
                <CardContent className="p-3 text-center">
                  <span className="text-sm font-medium">{industry}</span>
                  {data.industry === industry && (
                    <CheckCircle className="h-4 w-4 text-primary mx-auto mt-1" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            {companySizes.map((size) => (
              <Card
                key={size}
                className={`cursor-pointer transition-colors ${
                  data.companySize === size 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setData(prev => ({ ...prev, companySize: size }))}
              >
                <CardContent className="p-4 text-center">
                  <span className="font-medium">{size}</span>
                  {data.companySize === size && (
                    <CheckCircle className="h-5 w-5 text-primary mx-auto mt-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-3">
            {aiExperienceLevels.map((level) => (
              <Card
                key={level.id}
                className={`cursor-pointer transition-colors ${
                  data.aiExperience === level.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setData(prev => ({ ...prev, aiExperience: level.id }))}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <h3 className="font-medium">{level.title}</h3>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                    {data.aiExperience === level.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 6:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goalOptions.map((goal) => (
              <Card
                key={goal}
                className={`cursor-pointer transition-colors ${
                  data.primaryGoals.includes(goal) 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleGoalToggle(goal)}
              >
                <CardContent className="p-3 text-center">
                  <span className="text-sm font-medium">{goal}</span>
                  {data.primaryGoals.includes(goal) && (
                    <CheckCircle className="h-4 w-4 text-primary mx-auto mt-1" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Time Availability</Label>
              <p className="text-sm text-muted-foreground mb-3">How much time can you dedicate to AI implementation daily?</p>
              <div className="grid grid-cols-2 gap-3">
                {timeAvailabilityOptions.map((option) => (
                  <Card
                    key={option}
                    className={`cursor-pointer transition-colors ${
                      data.timeAvailability === option 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setData(prev => ({ ...prev, timeAvailability: option }))}
                  >
                    <CardContent className="p-3 text-center">
                      <span className="text-sm font-medium">{option}</span>
                      {data.timeAvailability === option && (
                        <CheckCircle className="h-4 w-4 text-primary mx-auto mt-1" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Implementation Timeline</Label>
              <p className="text-sm text-muted-foreground mb-3">When do you want to start implementing AI tools?</p>
              <div className="grid grid-cols-2 gap-3">
                {timelineOptions.map((option) => (
                  <Card
                    key={option}
                    className={`cursor-pointer transition-colors ${
                      data.implementationTimeline === option 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setData(prev => ({ ...prev, implementationTimeline: option }))}
                  >
                    <CardContent className="p-3 text-center">
                      <span className="text-sm font-medium">{option}</span>
                      {data.implementationTimeline === option && (
                        <CheckCircle className="h-4 w-4 text-primary mx-auto mt-1" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
          <CardDescription className="text-base">
            {getStepDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {currentStep === totalSteps ? (
              <Button 
                onClick={handleComplete} 
                disabled={!isStepValid() || loading}
              >
                {loading ? 'Saving...' : 'Complete Setup'}
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                disabled={!isStepValid()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}