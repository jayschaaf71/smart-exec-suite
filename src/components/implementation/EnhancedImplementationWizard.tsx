import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Zap, 
  ChevronRight, 
  Target,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';

interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  resources?: string[];
}

interface ImplementationWizardProps {
  implementations: any[];
  onRefresh: () => void;
}

export function ImplementationWizard({ implementations, onRefresh }: ImplementationWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeImplementation, setActiveImplementation] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ImplementationStep[]>([]);

  useEffect(() => {
    if (implementations.length > 0 && !activeImplementation) {
      const inProgressImpl = implementations.find(impl => impl.status === 'in_progress') ||
                            implementations.find(impl => impl.status === 'planned') ||
                            implementations[0];
      setActiveImplementation(inProgressImpl);
    }
  }, [implementations]);

  useEffect(() => {
    if (activeImplementation) {
      generateImplementationSteps();
    }
  }, [activeImplementation]);

  const generateImplementationSteps = () => {
    if (!activeImplementation?.tools) return;

    const tool = activeImplementation.tools;
    const baseSteps: ImplementationStep[] = [
      {
        id: 'setup',
        title: 'Initial Setup',
        description: `Set up your ${tool.name} account and basic configuration`,
        estimatedTime: '15-30 minutes',
        difficulty: 'easy',
        completed: false,
        resources: [
          `${tool.name} getting started guide`,
          'Account creation checklist',
          'Initial configuration template'
        ]
      },
      {
        id: 'integration',
        title: 'System Integration',
        description: 'Connect with your existing tools and workflows',
        estimatedTime: '30-60 minutes',
        difficulty: 'medium',
        completed: false,
        resources: [
          'Integration documentation',
          'API setup guide',
          'Workflow templates'
        ]
      },
      {
        id: 'training',
        title: 'Team Training',
        description: 'Train your team on the new tool and processes',
        estimatedTime: '1-2 hours',
        difficulty: 'medium',
        completed: false,
        resources: [
          'Training materials',
          'Video tutorials',
          'Best practices guide'
        ]
      },
      {
        id: 'optimization',
        title: 'Optimization & Refinement',
        description: 'Fine-tune settings and optimize for your specific needs',
        estimatedTime: '45-90 minutes',
        difficulty: 'hard',
        completed: false,
        resources: [
          'Optimization checklist',
          'Advanced configuration guide',
          'Performance tuning tips'
        ]
      },
      {
        id: 'measurement',
        title: 'Success Measurement',
        description: 'Set up metrics and tracking to measure ROI',
        estimatedTime: '30 minutes',
        difficulty: 'easy',
        completed: false,
        resources: [
          'Metrics dashboard setup',
          'ROI calculation template',
          'Success criteria checklist'
        ]
      }
    ];

    // Mark steps as completed based on progress
    const progressPercentage = activeImplementation.progress_percentage || 0;
    const completedStepsCount = Math.floor((progressPercentage / 100) * baseSteps.length);
    
    baseSteps.forEach((step, index) => {
      if (index < completedStepsCount) {
        step.completed = true;
      }
    });

    setSteps(baseSteps);
    setCurrentStep(completedStepsCount < baseSteps.length ? completedStepsCount : baseSteps.length - 1);
  };

  const handleStepComplete = async (stepIndex: number) => {
    if (!activeImplementation || !user) return;

    try {
      const newSteps = [...steps];
      newSteps[stepIndex].completed = true;
      setSteps(newSteps);

      const completedSteps = newSteps.filter(s => s.completed).length;
      const newProgressPercentage = Math.round((completedSteps / newSteps.length) * 100);
      
      // Update implementation progress
      const { error } = await supabase
        .from('user_tool_progress')
        .update({
          progress_percentage: newProgressPercentage,
          status: newProgressPercentage === 100 ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString(),
          notes: `Completed step: ${newSteps[stepIndex].title}`
        })
        .eq('id', activeImplementation.id);

      if (error) throw error;

      // Track success metric
      await supabase
        .from('user_success_metrics')
        .insert({
          user_id: user.id,
          tool_id: activeImplementation.tool_id,
          metric_name: 'implementation_step_completed',
          metric_value: stepIndex + 1,
          notes: `Completed: ${newSteps[stepIndex].title}`
        });

      toast({
        title: "Step Completed!",
        description: `${newSteps[stepIndex].title} has been marked as complete.`,
      });

      if (newProgressPercentage === 100) {
        toast({
          title: "🎉 Implementation Complete!",
          description: `You've successfully implemented ${activeImplementation.tools?.name}!`,
        });
      }

      onRefresh();
    } catch (error) {
      console.error('Error updating step:', error);
      toast({
        title: "Error",
        description: "Failed to update step. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startNewImplementation = async (toolId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_tool_progress')
        .insert({
          user_id: user.id,
          tool_id: toolId,
          status: 'planned',
          progress_percentage: 0,
          started_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Implementation Started!",
        description: "Your new tool implementation has been added to the wizard.",
      });

      onRefresh();
    } catch (error) {
      console.error('Error starting implementation:', error);
      toast({
        title: "Error",
        description: "Failed to start implementation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStepIcon = (step: ImplementationStep, index: number) => {
    if (step.completed) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (index === currentStep) return <Clock className="w-5 h-5 text-blue-600" />;
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
  };

  if (implementations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Zap className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Implementations Yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Start implementing recommended tools to begin your AI transformation journey.
          </p>
          <Button onClick={() => window.location.href = '/dashboard?tab=recommendations'}>
            View Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Implementation Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Active Implementations</CardTitle>
          <CardDescription>Select an implementation to continue with the guided setup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {implementations.map((impl) => (
              <div 
                key={impl.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  activeImplementation?.id === impl.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setActiveImplementation(impl)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <span className="font-medium">
                        {impl.tools?.name?.[0] || '?'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{impl.tools?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {impl.tools?.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      impl.status === 'completed' ? 'default' :
                      impl.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {impl.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {impl.progress_percentage || 0}% complete
                    </div>
                  </div>
                </div>
                <Progress value={impl.progress_percentage || 0} className="mt-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Steps */}
      {activeImplementation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Implementation Guide: {activeImplementation.tools?.name}
            </CardTitle>
            <CardDescription>
              Follow these steps to successfully implement and optimize your new tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {getStepIcon(step, index)}
                    {index < steps.length - 1 && (
                      <div className="w-px h-12 bg-border mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${
                        step.completed ? 'text-green-600' : 
                        index === currentStep ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(step.difficulty)}`}
                        >
                          {step.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {step.estimatedTime}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    
                    {step.resources && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Resources:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {step.resources.map((resource, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {!step.completed && index <= currentStep && (
                      <Button 
                        size="sm"
                        onClick={() => handleStepComplete(index)}
                        className="flex items-center gap-1"
                      >
                        Mark Complete
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    )}
                    
                    {step.completed && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      {activeImplementation && (
        <Card>
          <CardHeader>
            <CardTitle>Implementation Progress Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {steps.filter(s => s.completed).length}/{steps.length}
                </div>
                <p className="text-sm text-muted-foreground">Steps Completed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {activeImplementation.time_invested || 0}h
                </div>
                <p className="text-sm text-muted-foreground">Time Invested</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {activeImplementation.progress_percentage || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}