import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  Users, 
  Target,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ImplementationStep {
  step: number;
  title: string;
  description: string;
  duration: string;
  resources?: string[];
  tips?: string;
}

interface ImplementationGuide {
  id: string;
  tool_id: string;
  title: string;
  description: string;
  estimated_time: string;
  difficulty_level: string;
  target_roles: string[];
  prerequisites: string[];
  steps: ImplementationStep[];
  success_metrics: string[];
  troubleshooting: any;
  tool?: {
    name: string;
    description: string;
    website_url: string;
  };
}

interface UserProgress {
  id?: string;
  current_step: number;
  completed_steps: number[];
  status: string;
  time_spent_minutes: number;
  notes?: string;
}

interface ImplementationGuideViewerProps {
  toolId: string;
  onClose: () => void;
}

export function ImplementationGuideViewer({ toolId, onClose }: ImplementationGuideViewerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [guide, setGuide] = useState<ImplementationGuide | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    current_step: 0,
    completed_steps: [],
    status: 'not_started',
    time_spent_minutes: 0
  });
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (toolId) {
      loadGuideAndProgress();
    }
  }, [toolId]);

  const loadGuideAndProgress = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load implementation guide
      const { data: guideData, error: guideError } = await supabase
        .from('implementation_guides')
        .select(`
          *,
          tools (
            name,
            description,
            website_url
          )
        `)
        .eq('tool_id', toolId)
        .maybeSingle();

      if (guideError) throw guideError;
      
      if (guideData) {
        setGuide({
          ...guideData,
          steps: Array.isArray(guideData.steps) ? guideData.steps : JSON.parse(guideData.steps as string),
          tool: guideData.tools
        });

        // Load user progress
        const { data: progressData } = await supabase
          .from('user_implementation_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('guide_id', guideData.id)
          .maybeSingle();

        if (progressData) {
          setProgress(progressData);
          setCurrentStepIndex(progressData.current_step);
          setNotes(progressData.notes || '');
        }
      }
    } catch (error) {
      console.error('Error loading guide:', error);
      toast({
        title: "Error",
        description: "Failed to load implementation guide.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startImplementation = async () => {
    if (!user || !guide) return;

    setStartTime(new Date());
    const newProgress = {
      user_id: user.id,
      guide_id: guide.id,
      current_step: 0,
      completed_steps: [],
      status: 'in_progress',
      started_at: new Date().toISOString(),
      time_spent_minutes: 0
    };

    try {
      const { data, error } = await supabase
        .from('user_implementation_progress')
        .upsert(newProgress, { onConflict: 'user_id,guide_id' })
        .select()
        .single();

      if (error) throw error;
      
      setProgress(data);
      
      toast({
        title: "Implementation started!",
        description: "Good luck with your implementation.",
      });
    } catch (error) {
      console.error('Error starting implementation:', error);
    }
  };

  const completeStep = async (stepIndex: number) => {
    if (!user || !guide) return;

    const newCompletedSteps = [...progress.completed_steps, stepIndex];
    const nextStep = Math.min(stepIndex + 1, guide.steps.length);
    const timeSpent = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 60000) : 0;
    
    const updatedProgress = {
      ...progress,
      current_step: nextStep,
      completed_steps: newCompletedSteps,
      status: nextStep >= guide.steps.length ? 'completed' : 'in_progress',
      completed_at: nextStep >= guide.steps.length ? new Date().toISOString() : null,
      time_spent_minutes: progress.time_spent_minutes + timeSpent,
      notes: notes
    };

    try {
      const { error } = await supabase
        .from('user_implementation_progress')
        .update(updatedProgress)
        .eq('user_id', user.id)
        .eq('guide_id', guide.id);

      if (error) throw error;
      
      setProgress(updatedProgress);
      setCurrentStepIndex(nextStep);
      
      if (nextStep >= guide.steps.length) {
        toast({
          title: "Congratulations! 🎉",
          description: "You've completed the implementation guide!",
        });
      } else {
        toast({
          title: "Step completed!",
          description: `Moving to step ${nextStep + 1}`,
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const saveNotes = async () => {
    if (!user || !guide) return;

    try {
      const { error } = await supabase
        .from('user_implementation_progress')
        .update({ notes })
        .eq('user_id', user.id)
        .eq('guide_id', guide.id);

      if (error) throw error;
      
      toast({
        title: "Notes saved",
        description: "Your implementation notes have been saved.",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    if (!guide) return 0;
    return (progress.completed_steps.length / guide.steps.length) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!guide) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Implementation Guide Available</h3>
          <p className="text-muted-foreground mb-4">
            This tool doesn't have a step-by-step implementation guide yet.
          </p>
          <Button onClick={onClose}>Close</Button>
        </CardContent>
      </Card>
    );
  }

  const currentStep = guide.steps[currentStepIndex];
  const isCompleted = progress.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{guide.title}</h2>
          <p className="text-gray-600 mb-4">{guide.description}</p>
          
          <div className="flex items-center gap-4 mb-4">
            <Badge className={getDifficultyColor(guide.difficulty_level)}>
              {guide.difficulty_level}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {guide.estimated_time}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              {guide.target_roles.join(', ')}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.completed_steps.length} of {guide.steps.length} steps</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </div>
        
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>

      {/* Prerequisites */}
      {guide.prerequisites.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Prerequisites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {guide.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  {prereq}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Implementation Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {guide.steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentStepIndex === index ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentStepIndex(index)}
                >
                  <div className="mt-0.5">
                    {progress.completed_steps.includes(index) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.duration}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Current Step Detail */}
        <div className="lg:col-span-2">
          {progress.status === 'not_started' ? (
            <Card>
              <CardContent className="p-6 text-center">
                <PlayCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
                <p className="text-gray-600 mb-6">
                  This implementation guide will take approximately {guide.estimated_time} to complete.
                </p>
                <Button onClick={startImplementation} size="lg">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Start Implementation
                </Button>
              </CardContent>
            </Card>
          ) : isCompleted ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">Implementation Complete!</h3>
                <p className="text-green-700 mb-4">
                  Congratulations! You've successfully completed the {guide.tool?.name} implementation.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-green-600">
                  <span>Time spent: {progress.time_spent_minutes} minutes</span>
                  <span>•</span>
                  <span>Steps completed: {progress.completed_steps.length}/{guide.steps.length}</span>
                </div>
              </CardContent>
            </Card>
          ) : currentStep ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Step {currentStep.step}: {currentStep.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      Estimated time: {currentStep.duration}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {currentStepIndex + 1} of {guide.steps.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{currentStep.description}</p>

                {currentStep.resources && currentStep.resources.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Resources:</h4>
                    <ul className="space-y-1">
                      {currentStep.resources.map((resource, index) => (
                        <li key={index}>
                          <a 
                            href={resource.startsWith('http') ? resource : '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {resource}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentStep.tips && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Tip</p>
                        <p className="text-sm text-blue-700">{currentStep.tips}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                    disabled={currentStepIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  {!progress.completed_steps.includes(currentStepIndex) && (
                    <Button 
                      onClick={() => completeStep(currentStepIndex)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Step
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStepIndex(Math.min(guide.steps.length - 1, currentStepIndex + 1))}
                    disabled={currentStepIndex === guide.steps.length - 1}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Implementation Notes</CardTitle>
          <CardDescription>
            Keep track of your progress, challenges, and insights during implementation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add your implementation notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
          <Button variant="outline" onClick={saveNotes}>
            Save Notes
          </Button>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      {guide.success_metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Success Metrics
            </CardTitle>
            <CardDescription>
              How to measure the success of your implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guide.success_metrics.map((metric, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{metric}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}