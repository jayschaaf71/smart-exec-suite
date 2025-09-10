import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

interface OnboardingData {
  role: string;
  industry: string;
  companySize: string;
  aiExperience: string;
  goals: string[];
}

const roles = [
  { id: 'ceo', title: 'CEO/Founder', description: 'Chief Executive Officer or Company Founder' },
  { id: 'cto', title: 'CTO', description: 'Chief Technology Officer' },
  { id: 'cmo', title: 'CMO', description: 'Chief Marketing Officer' },
  { id: 'coo', title: 'COO', description: 'Chief Operating Officer' },
  { id: 'director', title: 'Director', description: 'Department Director or Senior Manager' },
  { id: 'manager', title: 'Manager', description: 'Team Lead or Manager' },
];

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Manufacturing', 
  'Retail', 'Education', 'Consulting', 'Real Estate', 'Other'
];

const companySizes = [
  '1-10 employees', '11-50 employees', '51-200 employees', '200+ employees'
];

const aiExperienceLevels = [
  { id: 'beginner', title: 'Beginner', description: 'New to AI tools, maybe used ChatGPT' },
  { id: 'intermediate', title: 'Intermediate', description: 'Used several AI tools, comfortable with basics' },
  { id: 'advanced', title: 'Advanced', description: 'Experienced with AI implementation and strategy' },
];

const goals = [
  'Increase team productivity',
  'Reduce operational costs',
  'Improve decision making',
  'Automate repetitive tasks',
  'Enhance customer experience',
  'Accelerate innovation',
  'Scale operations efficiently',
  'Gain competitive advantage'
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    role: '',
    industry: '',
    companySize: '',
    aiExperience: '',
    goals: []
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGoalToggle = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return data.role !== '';
      case 2: return data.industry !== '';
      case 3: return data.companySize !== '';
      case 4: return data.aiExperience !== '';
      case 5: return data.goals.length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="heading-lg mb-4">Let's Personalize Your Experience</h1>
            <p className="text-muted-foreground">
              Help us understand your needs so we can recommend the perfect AI tools for your business.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Main Content */}
          <Card className="bg-gradient-card border-accent/10">
            <CardHeader>
              <CardTitle className="text-2xl">
                {step === 1 && "What's your role?"}
                {step === 2 && "What industry are you in?"}
                {step === 3 && "What's your company size?"}
                {step === 4 && "What's your AI experience level?"}
                {step === 5 && "What are your primary goals?"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "This helps us tailor recommendations to your responsibilities."}
                {step === 2 && "Industry-specific tools can make a big difference."}
                {step === 3 && "We'll suggest tools that scale with your organization."}
                {step === 4 && "This helps us match you with appropriate learning content."}
                {step === 5 && "Select all that apply - we'll prioritize based on your goals."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Step 1: Role Selection */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <Card 
                      key={role.id}
                      className={`cursor-pointer transition-smooth border-2 ${
                        data.role === role.id 
                          ? 'border-accent shadow-glow' 
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => setData(prev => ({ ...prev, role: role.id }))}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{role.title}</CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 2: Industry Selection */}
              {step === 2 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {industries.map((industry) => (
                    <Button
                      key={industry}
                      variant={data.industry === industry ? "cta" : "outline"}
                      className="h-auto py-4 px-4 text-left justify-start"
                      onClick={() => setData(prev => ({ ...prev, industry }))}
                    >
                      {industry}
                    </Button>
                  ))}
                </div>
              )}

              {/* Step 3: Company Size */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companySizes.map((size) => (
                    <Card 
                      key={size}
                      className={`cursor-pointer transition-smooth border-2 ${
                        data.companySize === size 
                          ? 'border-accent shadow-glow' 
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => setData(prev => ({ ...prev, companySize: size }))}
                    >
                      <CardHeader className="text-center py-6">
                        <CardTitle className="text-lg">{size}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 4: AI Experience */}
              {step === 4 && (
                <div className="space-y-4">
                  {aiExperienceLevels.map((level) => (
                    <Card 
                      key={level.id}
                      className={`cursor-pointer transition-smooth border-2 ${
                        data.aiExperience === level.id 
                          ? 'border-accent shadow-glow' 
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => setData(prev => ({ ...prev, aiExperience: level.id }))}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{level.title}</CardTitle>
                        <CardDescription>{level.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 5: Goals */}
              {step === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {goals.map((goal) => (
                    <Button
                      key={goal}
                      variant={data.goals.includes(goal) ? "cta" : "outline"}
                      className="h-auto py-4 px-4 text-left justify-start relative"
                      onClick={() => handleGoalToggle(goal)}
                    >
                      {data.goals.includes(goal) && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      {goal}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button 
              variant="cta"
              onClick={step === totalSteps ? () => {
                // Handle completion - redirect to dashboard
                console.log('Onboarding complete:', data);
              } : handleNext}
              disabled={!isStepValid()}
            >
              {step === totalSteps ? (
                <>
                  Get My Recommendations
                  <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}