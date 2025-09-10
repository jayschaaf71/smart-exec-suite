import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

interface OnboardingData {
  displayName: string;
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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    role: "",
    industry: "",
    companySize: "",
    aiExperience: "",
    goals: [],
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 6;

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

  const handleComplete = async () => {
    if (!user) return;
    
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
          goals: data.goals,
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile Updated",
        description: "Your preferences have been saved successfully.",
      });

      // Navigate to dashboard (create this later)
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return data.displayName.trim() !== "";
      case 2: return data.role !== "";
      case 3: return data.industry !== "";
      case 4: return data.companySize !== "";
      case 5: return data.aiExperience !== "";
      case 6: return data.goals.length > 0;
      default: return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "What should we call you?";
      case 2: return "What's your role?";
      case 3: return "What industry are you in?";
      case 4: return "What's your company size?";
      case 5: return "What's your AI experience?";
      case 6: return "What are your goals?";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Enter your preferred name so we can personalize your experience.";
      case 2: return "Help us understand your position and responsibilities.";
      case 3: return "This helps us recommend relevant AI tools for your sector.";
      case 4: return "Company size affects which tools and strategies work best.";
      case 5: return "We'll tailor recommendations to your current knowledge level.";
      case 6: return "Select all that apply to personalize your AI toolkit.";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/65117502-c5fc-4d37-bc15-b1f5f625b12e.png" 
            alt="Black Knight AI" 
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-white mb-4">
            Personalize Your AI Journey
          </h1>
          <p className="text-white/80 text-lg">
            Answer a few questions to get personalized AI tool recommendations
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-white/60 text-sm mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        {/* Main Content Card */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-900">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              {getStepDescription()}
            </CardDescription>
          </CardHeader>
          
           <CardContent className="space-y-6">
            {/* Step 1: Display Name */}
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  placeholder="Enter your preferred name..."
                  value={data.displayName}
                  onChange={(e) => setData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="text-lg h-12"
                  autoFocus
                />
                <p className="text-gray-500 text-sm text-center">
                  This is how we'll address you throughout the platform
                </p>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div className="grid gap-4">
                {roles.map((role) => (
                  <Card
                    key={role.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      data.role === role.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setData(prev => ({ ...prev, role: role.id }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{role.title}</h3>
                          <p className="text-gray-600 text-sm">{role.description}</p>
                        </div>
                        {data.role === role.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 3: Industry Selection */}
            {step === 3 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {industries.map((industry) => (
                  <Button
                    key={industry}
                    variant={data.industry === industry ? "default" : "outline"}
                    className="h-auto py-4 px-4 text-center justify-center"
                    onClick={() => setData(prev => ({ ...prev, industry }))}
                  >
                    {industry}
                  </Button>
                ))}
              </div>
            )}

            {/* Step 4: Company Size */}
            {step === 4 && (
              <div className="grid gap-3">
                {companySizes.map((size) => (
                  <Button
                    key={size}
                    variant={data.companySize === size ? "default" : "outline"}
                    className="h-auto py-4 px-6 justify-start text-left"
                    onClick={() => setData(prev => ({ ...prev, companySize: size }))}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            )}

            {/* Step 5: AI Experience */}
            {step === 5 && (
              <div className="grid gap-4">
                {aiExperienceLevels.map((level) => (
                  <Card
                    key={level.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      data.aiExperience === level.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setData(prev => ({ ...prev, aiExperience: level.id }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{level.title}</h3>
                          <p className="text-gray-600 text-sm">{level.description}</p>
                        </div>
                        {data.aiExperience === level.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 6: Goals Selection */}
            {step === 6 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <Button
                    key={goal}
                    variant={data.goals.includes(goal) ? "default" : "outline"}
                    className="h-auto py-4 px-4 text-center justify-center text-sm"
                    onClick={() => handleGoalToggle(goal)}
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 ? (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}

              {step < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="px-8"
                  onClick={handleComplete}
                  disabled={!isStepValid() || loading}
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                  <Check className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}