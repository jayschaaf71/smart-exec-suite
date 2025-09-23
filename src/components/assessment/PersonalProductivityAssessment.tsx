import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, User, Clock, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PersonalAssessmentData {
  workProfile: {
    dailyActivities: Record<string, number>;
    communicationPatterns: string[];
    contentCreation: string[];
    decisionMaking: string;
    learningGoals: string;
  };
  currentAIUsage: {
    toolsUsed: string[];
    satisfaction: number;
    painPoints: string;
    timeOnRepetitive: number;
    overwhelmAreas: string[];
  };
  productivityChallenges: {
    timeWasters: string;
    automationWishes: string;
    insightNeeds: string[];
    collaborationPains: string;
    skillDevelopment: string[];
  };
  implementation: {
    learningStyle: string;
    timeAvailable: string;
    comfortLevel: number;
    budget: string;
    integrationNeeds: string[];
  };
  successMetrics: {
    measurementMethods: string[];
    desiredOutcomes: string;
    timeline: string;
    kpis: string[];
  };
}

const PersonalProductivityAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<PersonalAssessmentData>({
    workProfile: {
      dailyActivities: {},
      communicationPatterns: [],
      contentCreation: [],
      decisionMaking: '',
      learningGoals: ''
    },
    currentAIUsage: {
      toolsUsed: [],
      satisfaction: 3,
      painPoints: '',
      timeOnRepetitive: 0,
      overwhelmAreas: []
    },
    productivityChallenges: {
      timeWasters: '',
      automationWishes: '',
      insightNeeds: [],
      collaborationPains: '',
      skillDevelopment: []
    },
    implementation: {
      learningStyle: '',
      timeAvailable: '',
      comfortLevel: 3,
      budget: '',
      integrationNeeds: []
    },
    successMetrics: {
      measurementMethods: [],
      desiredOutcomes: '',
      timeline: '',
      kpis: []
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

      // Convert assessment data to profile format
      const profile = {
        role: 'Individual Contributor',
        industry: 'technology', // Default, could be enhanced
        company_size: 'medium', // Default, could be enhanced
        ai_experience: assessmentData.currentAIUsage.toolsUsed.includes('None') ? 'never' : 'multiple',
        goals: assessmentData.productivityChallenges.insightNeeds,
        time_availability: assessmentData.implementation.timeAvailable,
        implementation_timeline: assessmentData.successMetrics.timeline,
        primary_focus_areas: assessmentData.workProfile.communicationPatterns,
        display_name: 'Personal Productivity User'
      };

      // Save assessment data to AI assessments table
      const { error: assessmentError } = await supabase
        .from('ai_assessments')
        .insert({
          user_id: userData.user.id,
          assessment_type: 'personal_productivity',
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
        });

      if (profileError) throw profileError;

      console.log('Personal Assessment Complete:', assessmentData);
      alert('Assessment completed successfully! Your personalized recommendations are being generated.');
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment. Please try again.');
    }
  };

  const renderWorkProfile = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-4 block">How do you spend your typical workday? (Estimate percentage for each)</Label>
        <div className="grid grid-cols-2 gap-4">
          {['Meetings', 'Email/Communication', 'Content Creation', 'Analysis/Research', 'Admin Tasks', 'Strategic Planning'].map((activity) => (
            <div key={activity} className="flex items-center gap-2">
              <Label className="flex-1">{activity}</Label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                className="w-16 px-2 py-1 border rounded text-sm"
                placeholder="%" 
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Communication Patterns (Select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Email-heavy role', 'Frequent meetings', 'Presentation creation', 'Client communication', 'Team collaboration', 'External stakeholder management'].map((pattern) => (
            <div key={pattern} className="flex items-center space-x-2">
              <Checkbox id={pattern} />
              <Label htmlFor={pattern} className="text-sm">{pattern}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What type of content do you create most often?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Reports & Documentation', 'Presentations', 'Emails & Communications', 'Creative Content', 'Data Analysis', 'Strategic Plans'].map((content) => (
            <div key={content} className="flex items-center space-x-2">
              <Checkbox id={content} />
              <Label htmlFor={content} className="text-sm">{content}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Describe your learning and development goals</Label>
        <Textarea placeholder="What skills do you want to develop? What knowledge gaps do you need to fill?" className="min-h-[80px]" />
      </div>
    </div>
  );

  const renderCurrentAIUsage = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">Which AI tools are you currently using?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['ChatGPT', 'Claude', 'Copilot', 'Midjourney', 'Notion AI', 'Grammarly', 'Calendly', 'Zapier', 'None'].map((tool) => (
            <div key={tool} className="flex items-center space-x-2">
              <Checkbox id={tool} />
              <Label htmlFor={tool} className="text-sm">{tool}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">How satisfied are you with your current AI tools? (1-5)</Label>
        <RadioGroup defaultValue="3">
          {[1, 2, 3, 4, 5].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <RadioGroupItem value={rating.toString()} id={`satisfaction-${rating}`} />
              <Label htmlFor={`satisfaction-${rating}`}>
                {rating} - {rating === 1 ? 'Very Unsatisfied' : rating === 3 ? 'Neutral' : rating === 5 ? 'Very Satisfied' : ''}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What are your biggest pain points with current AI tools?</Label>
        <Textarea placeholder="Describe specific frustrations, limitations, or challenges you face..." className="min-h-[80px]" />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">How many hours per week do you spend on repetitive tasks?</Label>
        <RadioGroup>
          {['0-5 hours', '6-10 hours', '11-20 hours', '21+ hours'].map((range) => (
            <div key={range} className="flex items-center space-x-2">
              <RadioGroupItem value={range} id={range} />
              <Label htmlFor={range}>{range}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderProductivityChallenges = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">What are the biggest time wasters in your day?</Label>
        <Textarea placeholder="Be specific about activities, processes, or situations that consume time without adding value..." className="min-h-[80px]" />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What tasks do you wish you could automate or streamline?</Label>
        <Textarea placeholder="List specific tasks, workflows, or processes you'd love to make more efficient..." className="min-h-[80px]" />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Where do you need better insights or data?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Performance metrics', 'Time tracking', 'Goal progress', 'Team productivity', 'Project status', 'Market trends'].map((insight) => (
            <div key={insight} className="flex items-center space-x-2">
              <Checkbox id={insight} />
              <Label htmlFor={insight} className="text-sm">{insight}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What are your communication and collaboration pain points?</Label>
        <Textarea placeholder="Describe challenges with email, meetings, project coordination, or team communication..." className="min-h-[80px]" />
      </div>
    </div>
  );

  const renderImplementation = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">What's your preferred learning style?</Label>
        <RadioGroup>
          {['Video tutorials', 'Written guides', 'Hands-on practice', 'One-on-one training', 'Group workshops'].map((style) => (
            <div key={style} className="flex items-center space-x-2">
              <RadioGroupItem value={style} id={style} />
              <Label htmlFor={style}>{style}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">How much time can you dedicate to learning new tools?</Label>
        <RadioGroup>
          {['1-2 hours/week', '3-5 hours/week', '6-10 hours/week', '10+ hours/week'].map((time) => (
            <div key={time} className="flex items-center space-x-2">
              <RadioGroupItem value={time} id={time} />
              <Label htmlFor={time}>{time}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What's your comfort level with new technology? (1-5)</Label>
        <RadioGroup defaultValue="3">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level.toString()} id={`comfort-${level}`} />
              <Label htmlFor={`comfort-${level}`}>
                {level} - {level === 1 ? 'Very Uncomfortable' : level === 3 ? 'Neutral' : level === 5 ? 'Very Comfortable' : ''}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What's your monthly budget for productivity tools?</Label>
        <RadioGroup>
          {['$0-25', '$26-100', '$101-250', '$250+'].map((budget) => (
            <div key={budget} className="flex items-center space-x-2">
              <RadioGroupItem value={budget} id={budget} />
              <Label htmlFor={budget}>{budget}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderSuccessMetrics = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">How do you currently measure your productivity?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Tasks completed', 'Hours worked', 'Goals achieved', 'Revenue generated', 'Time saved', 'Quality of work'].map((method) => (
            <div key={method} className="flex items-center space-x-2">
              <Checkbox id={method} />
              <Label htmlFor={method} className="text-sm">{method}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What specific outcomes do you want to achieve?</Label>
        <Textarea placeholder="Be specific about what success looks like for you..." className="min-h-[80px]" />
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What's your timeline for seeing results?</Label>
        <RadioGroup>
          {['Within 1 month', '2-3 months', '4-6 months', '6+ months'].map((timeline) => (
            <div key={timeline} className="flex items-center space-x-2">
              <RadioGroupItem value={timeline} id={timeline} />
              <Label htmlFor={timeline}>{timeline}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">What KPIs matter most to you?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Time saved per day', 'Tasks automated', 'Quality improvement', 'Stress reduction', 'Revenue impact', 'Learning progress'].map((kpi) => (
            <div key={kpi} className="flex items-center space-x-2">
              <Checkbox id={kpi} />
              <Label htmlFor={kpi} className="text-sm">{kpi}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const stepComponents = {
    1: renderWorkProfile,
    2: renderCurrentAIUsage,
    3: renderProductivityChallenges,
    4: renderImplementation,
    5: renderSuccessMetrics
  };

  const stepTitles = {
    1: 'Your Work Profile',
    2: 'Current AI Usage',
    3: 'Productivity Challenges',
    4: 'Implementation Preferences',
    5: 'Success Metrics'
  };

  const stepIcons = {
    1: User,
    2: Target,
    3: Clock,
    4: Target,
    5: Target
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Personal AI Productivity Assessment</h1>
            <p className="text-muted-foreground">Help us understand your work patterns to recommend the perfect AI tools for your productivity</p>
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
            {currentStep === 1 && "Tell us about your daily work activities and responsibilities"}
            {currentStep === 2 && "Share your experience with current AI tools and usage patterns"}
            {currentStep === 3 && "Identify your biggest productivity obstacles and pain points"}
            {currentStep === 4 && "Define your preferences for learning and implementing new tools"}
            {currentStep === 5 && "Set clear success metrics and expectations for improvement"}
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

export default PersonalProductivityAssessment;