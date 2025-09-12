import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Users, Star, ArrowRight, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ImplementationStep {
  id: number;
  title: string;
  description: string;
  estimatedTime: string;
  tips?: string[];
  resources?: { name: string; url: string }[];
}

interface ImplementationGuide {
  id: string;
  tool_name: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_time: string;
  target_roles: string[];
  steps: ImplementationStep[];
  success_metrics: string[];
  prerequisites: string[];
}

interface ImplementationGuideViewerProps {
  toolId: string;
  onClose?: () => void;
}

// Mock implementation guides for immediate demonstration
const mockGuides: { [key: string]: ImplementationGuide } = {
  'chatgpt-plus': {
    id: 'chatgpt-plus',
    tool_name: 'ChatGPT Plus',
    title: 'ChatGPT Plus Implementation Guide',
    description: 'Get started with ChatGPT Plus to supercharge your productivity with advanced AI assistance.',
    difficulty_level: 'easy',
    estimated_time: '30 minutes',
    target_roles: ['manager', 'director', 'individual'],
    prerequisites: ['Basic computer skills', 'Email account'],
    success_metrics: [
      'Successfully created ChatGPT Plus account',
      'Completed 5 different task types',
      'Saved 2+ hours per week on writing tasks'
    ],
    steps: [
      {
        id: 1,
        title: 'Sign Up for ChatGPT Plus',
        description: 'Create your account and upgrade to Plus for advanced features',
        estimatedTime: '5 minutes',
        tips: [
          'Use your work email for easier expense reporting',
          'Enable two-factor authentication for security'
        ],
        resources: [
          { name: 'ChatGPT Plus Signup', url: 'https://chat.openai.com/auth/login' }
        ]
      },
      {
        id: 2,
        title: 'Learn Basic Prompting',
        description: 'Master the fundamentals of effective prompt writing',
        estimatedTime: '10 minutes',
        tips: [
          'Be specific and detailed in your requests',
          'Provide context and examples when needed',
          'Ask for output in specific formats'
        ]
      },
      {
        id: 3,
        title: 'Try Your First Business Tasks',
        description: 'Apply ChatGPT to real work scenarios',
        estimatedTime: '15 minutes',
        tips: [
          'Start with email drafting or meeting summaries',
          'Use it for brainstorming and ideation',
          'Try data analysis and report writing'
        ]
      }
    ]
  },
  'perplexity-pro': {
    id: 'perplexity-pro',
    tool_name: 'Perplexity Pro',
    title: 'Perplexity Pro Research Setup',
    description: 'Transform your research process with AI-powered search and analysis.',
    difficulty_level: 'easy',
    estimated_time: '20 minutes',
    target_roles: ['ceo', 'director', 'manager'],
    prerequisites: ['Internet browser', 'Research needs'],
    success_metrics: [
      'Account created and Pro features activated',
      'Completed 3 research queries with citations',
      'Reduced research time by 50%'
    ],
    steps: [
      {
        id: 1,
        title: 'Create Perplexity Account',
        description: 'Sign up and upgrade to Pro for advanced research features',
        estimatedTime: '5 minutes',
        resources: [
          { name: 'Perplexity Pro', url: 'https://perplexity.ai/pro' }
        ]
      },
      {
        id: 2,
        title: 'Learn Advanced Search Techniques',
        description: 'Master Pro search features and citation tracking',
        estimatedTime: '10 minutes',
        tips: [
          'Use specific date ranges for current information',
          'Ask for pros and cons analysis',
          'Request sources and citations'
        ]
      },
      {
        id: 3,
        title: 'Apply to Your Industry',
        description: 'Use Perplexity for industry-specific research',
        estimatedTime: '5 minutes',
        tips: [
          'Research competitors and market trends',
          'Stay updated on industry news',
          'Analyze regulatory changes'
        ]
      }
    ]
  }
};

export function ImplementationGuideViewer({ toolId, onClose }: ImplementationGuideViewerProps) {
  const { user } = useAuth();
  const [guide, setGuide] = useState<ImplementationGuide | null>(null);
  const [progress, setProgress] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuide();
    loadProgress();
  }, [toolId]);

  const loadGuide = async () => {
    try {
      // For now, use mock guides - in production this would fetch from database
      const mockGuide = Object.values(mockGuides).find(g => 
        g.tool_name.toLowerCase().includes(toolId.toLowerCase()) ||
        toolId.toLowerCase().includes(g.tool_name.toLowerCase().replace(/\s+/g, '-'))
      );
      
      if (mockGuide) {
        setGuide(mockGuide);
      } else {
        // Fallback generic guide
        setGuide({
          id: toolId,
          tool_name: 'AI Tool',
          title: 'Implementation Guide',
          description: 'Step-by-step guide to implement this AI tool in your workflow.',
          difficulty_level: 'medium',
          estimated_time: '1 hour',
          target_roles: ['all'],
          prerequisites: ['Basic computer skills'],
          success_metrics: ['Tool successfully integrated into workflow'],
          steps: [
            {
              id: 1,
              title: 'Account Setup',
              description: 'Create your account and configure initial settings',
              estimatedTime: '10 minutes'
            },
            {
              id: 2,
              title: 'Learn the Basics',
              description: 'Familiarize yourself with core features',
              estimatedTime: '20 minutes'
            },
            {
              id: 3,
              title: 'First Implementation',
              description: 'Apply the tool to a real business task',
              estimatedTime: '30 minutes'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_implementation_progress')
        .select('completed_steps')
        .eq('user_id', user.id)
        .eq('guide_id', toolId)
        .maybeSingle();
      
      setProgress(data?.completed_steps || []);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const markStepComplete = async (stepId: number) => {
    if (!user || !guide) return;

    const newProgress = [...progress, stepId];
    setProgress(newProgress);

    try {
      await supabase
        .from('user_implementation_progress')
        .upsert({
          user_id: user.id,
          guide_id: guide.id,
          completed_steps: newProgress,
          current_step: stepId,
          status: stepId === guide.steps.length ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,guide_id'
        });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading implementation guide...</p>
        </CardContent>
      </Card>
    );
  }

  if (!guide) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Implementation guide not found.</p>
        </CardContent>
      </Card>
    );
  }

  const completedSteps = progress.length;
  const totalSteps = guide.steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{guide.title}</CardTitle>
              <CardDescription className="text-base mb-4">{guide.description}</CardDescription>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {guide.estimated_time}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {guide.difficulty_level}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {guide.target_roles.join(', ')}
                </div>
              </div>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{completedSteps}/{totalSteps} steps completed</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {guide.prerequisites.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Prerequisites:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {guide.prerequisites.map((prereq, index) => (
                    <li key={index}>• {prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Steps */}
      <div className="space-y-4">
        {guide.steps.map((step) => {
          const isCompleted = progress.includes(step.id);
          const isNext = !isCompleted && progress.length === step.id - 1;
          
          return (
            <Card key={step.id} className={`${isCompleted ? 'bg-green-50 border-green-200' : isNext ? 'bg-blue-50 border-blue-200' : ''}`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`rounded-full p-2 ${isCompleted ? 'bg-green-500' : isNext ? 'bg-blue-500' : 'bg-gray-200'}`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-white">{step.id}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className={`text-lg ${isCompleted ? 'text-green-800' : ''}`}>
                      {step.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {step.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.estimatedTime}
                      </Badge>
                      {isNext && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Next Step
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {(step.tips || step.resources || isNext) && (
                <CardContent>
                  <div className="space-y-3">
                    {step.tips && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">💡 Pro Tips:</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {step.tips.map((tip, index) => (
                            <li key={index}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {step.resources && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">🔗 Resources:</h5>
                        <div className="space-y-2">
                          {step.resources.map((resource, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(resource.url, '_blank')}
                              className="mr-2"
                            >
                              {resource.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {!isCompleted && (
                      <Button
                        onClick={() => markStepComplete(step.id)}
                        className="mt-3"
                        variant={isNext ? "default" : "outline"}
                      >
                        {isNext ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start This Step
                          </>
                        ) : (
                          'Mark Complete'
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Success Metrics */}
      {guide.success_metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Success Metrics</CardTitle>
            <CardDescription>
              You'll know you've successfully implemented this tool when:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guide.success_metrics.map((metric, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
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