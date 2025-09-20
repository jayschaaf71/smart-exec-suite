import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Building, 
  Users, 
  Target, 
  Clock, 
  Calendar,
  Brain,
  Briefcase
} from 'lucide-react';

interface AssessmentData {
  role: string;
  industry: string;
  company_size: string;
  ai_experience: string;
  goals: string[];
  time_availability: string;
  implementation_timeline: string;
}

const steps = [
  {
    id: 1,
    title: "What's your role?",
    description: "This helps us recommend tools specific to your responsibilities",
    icon: Briefcase
  },
  {
    id: 2,
    title: "What industry are you in?",
    description: "Different industries have unique AI adoption patterns",
    icon: Building
  },
  {
    id: 3,
    title: "What's your company size?",
    description: "Team size affects tool complexity and budget considerations",
    icon: Users
  },
  {
    id: 4,
    title: "What's your AI experience?",
    description: "We'll adjust recommendations based on your current knowledge",
    icon: Brain
  },
  {
    id: 5,
    title: "What are your primary goals?",
    description: "Select all that apply - we'll prioritize tools accordingly",
    icon: Target
  },
  {
    id: 6,
    title: "How much time can you invest daily?",
    description: "This helps us recommend tools with appropriate setup complexity",
    icon: Clock
  },
  {
    id: 7,
    title: "What's your implementation timeline?",
    description: "When do you want to start seeing results?",
    icon: Calendar
  }
];

const roleOptions = [
  'CEO / Founder',
  'CTO / Technical Lead',
  'CMO / Marketing Manager',
  'COO / Operations Manager',
  'CFO / Finance Manager',
  'HR Manager',
  'Sales Manager',
  'Project Manager',
  'Content Creator',
  'Administrative Assistant',
  'Consultant',
  'Other'
];

const industryOptions = [
  'Technology / Software',
  'Marketing / Advertising',
  'Consulting',
  'E-commerce / Retail',  
  'Healthcare',
  'Education',
  'Finance / Banking',
  'Legal',
  'Manufacturing',
  'Real Estate',
  'Media / Entertainment',
  'Non-profit',
  'Other'
];

const companySizeOptions = [
  'Solo / Freelancer (1 person)',
  'Small team (2-10 people)',
  'Medium team (11-50 people)',
  'Large team (51-200 people)',
  'Enterprise (200+ people)'
];

const experienceOptions = [
  { value: 'never', label: 'Never used AI tools', description: 'Complete beginner' },
  { value: 'basic', label: 'Basic (ChatGPT only)', description: 'Used ChatGPT for simple tasks' },
  { value: 'intermediate', label: 'Intermediate', description: 'Used 2-3 AI tools regularly' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced with multiple AI tools' }
];

const goalOptions = [
  'Increase productivity and efficiency',
  'Reduce operational costs',
  'Improve content quality',
  'Automate repetitive tasks',
  'Enhance customer experience',
  'Gain competitive advantage',
  'Improve decision making',
  'Scale operations',
  'Reduce manual errors',
  'Save time on routine work'
];

const timeOptions = [
  '15-30 minutes daily',
  '30-60 minutes daily',
  '1-2 hours daily',
  '2+ hours daily',
  'Weekends only',
  'As needed basis'
];

const timelineOptions = [
  'This week (immediate impact)',
  'This month (quick wins)',
  'Next quarter (strategic implementation)',
  'Long-term (6+ months)',
  'Exploring options (no rush)'
];

export default function Assessment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    role: '',
    industry: '',
    company_size: '',
    ai_experience: '',
    goals: [],
    time_availability: '',
    implementation_timeline: ''
  });

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalToggle = (goal: string) => {
    setAssessmentData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return assessmentData.role !== '';
      case 2: return assessmentData.industry !== '';
      case 3: return assessmentData.company_size !== '';
      case 4: return assessmentData.ai_experience !== '';
      case 5: return assessmentData.goals.length > 0;
      case 6: return assessmentData.time_availability !== '';
      case 7: return assessmentData.implementation_timeline !== '';
      default: return false;
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Save assessment to database
      const { error: assessmentError } = await supabase
        .from('profiles')
        .update({
          role: assessmentData.role,
          industry: assessmentData.industry,
          company_size: assessmentData.company_size,
          ai_experience: assessmentData.ai_experience,
          goals: assessmentData.goals,
          time_availability: assessmentData.time_availability,
          implementation_timeline: assessmentData.implementation_timeline,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (assessmentError) throw assessmentError;

      // Initialize user stats
      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_points: 100, // Welcome bonus
          achievements_earned: 0,
          modules_completed: 0,
          tools_implemented: 0,
          guides_completed: 0,
          streak_days: 1,
          level_title: 'AI Novice',
          last_activity_date: new Date().toISOString().split('T')[0],
          total_time_invested_minutes: 5 // Time spent on assessment
        }, {
          onConflict: 'user_id'
        });

      if (statsError) throw statsError;

      toast({
        title: "Assessment Complete! 🎉",
        description: "Your personalized recommendations are ready! Redirecting to your dashboard...",
        duration: 3000
      });

      // Brief delay to show success message, then redirect
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep - 1];
    const StepIcon = currentStepData.icon;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roleOptions.map(role => (
                <button
                  key={role}
                  onClick={() => setAssessmentData(prev => ({ ...prev, role }))}
                  className={`p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                    assessmentData.role === role
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{role}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {industryOptions.map(industry => (
                <button
                  key={industry}
                  onClick={() => setAssessmentData(prev => ({ ...prev, industry }))}
                  className={`p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                    assessmentData.industry === industry
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{industry}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {companySizeOptions.map(size => (
                <button
                  key={size}
                  onClick={() => setAssessmentData(prev => ({ ...prev, company_size: size }))}
                  className={`p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                    assessmentData.company_size === size
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{size}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {experienceOptions.map(exp => (
                <button
                  key={exp.value}
                  onClick={() => setAssessmentData(prev => ({ ...prev, ai_experience: exp.value }))}
                  className={`p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                    assessmentData.ai_experience === exp.value
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{exp.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">{exp.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Select all goals that apply to you:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalOptions.map(goal => (
                <button
                  key={goal}
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                    assessmentData.goals.includes(goal)
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{goal}</div>
                    {assessmentData.goals.includes(goal) && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {timeOptions.map(time => (
                <button
                  key={time}
                  onClick={() => setAssessmentData(prev => ({ ...prev, time_availability: time }))}
                  className={`p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                    assessmentData.time_availability === time
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{time}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {timelineOptions.map(timeline => (
                <button
                  key={timeline}
                  onClick={() => setAssessmentData(prev => ({ ...prev, implementation_timeline: timeline }))}
                  className={`p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                    assessmentData.implementation_timeline === timeline
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{timeline}</div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  const currentStepData = steps[currentStep - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            AI Readiness Assessment
          </h1>
          <p className="text-lg text-slate-600">
            Help us create your personalized AI implementation roadmap
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-slate-200" />
          <div className="flex justify-between mt-2">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`text-xs px-2 py-1 rounded ${
                  index + 1 < currentStep 
                    ? 'bg-green-100 text-green-700' 
                    : index + 1 === currentStep 
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {index + 1 < currentStep ? '✓' : index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <StepIcon className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-base">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {canProceed() ? 'Ready to continue' : 'Please complete this step'}
            </span>
            {currentStep === steps.length ? (
              <Button 
                onClick={handleComplete}
                disabled={!canProceed() || loading}
                size="lg"
                className="min-w-32"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Completing...
                  </div>
                ) : (
                  'Complete Assessment'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                size="lg"
                className="flex items-center gap-2 min-w-32"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="hidden space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index + 1 === currentStep
                    ? 'bg-primary'
                    : index + 1 < currentStep
                    ? 'bg-primary/50'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length ? (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || loading}
              className="flex items-center gap-2"
              size="lg"
            >
              {loading ? 'Completing...' : 'Complete Assessment'}
              <CheckCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Selected Goals Summary */}
        {currentStep === 5 && assessmentData.goals.length > 0 && (
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Selected Goals ({assessmentData.goals.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {assessmentData.goals.map(goal => (
                  <Badge key={goal} variant="secondary" className="text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}