import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  AlertCircle,
  FileText,
  ExternalLink,
  Users,
  Settings
} from 'lucide-react';

interface Implementation {
  id: string;
  tool_id: string;
  status: string;
  progress_percentage: number;
  time_invested_hours: number;
  roi_achieved_percentage: number;
  implementation_notes: string;
  started_at: string;
  completed_at: string;
  tools: {
    name: string;
    logo_url?: string;
  };
}

interface ImplementationWizardProps {
  implementations: Implementation[];
  onRefresh: () => void;
}

export function ImplementationWizard({ implementations, onRefresh }: ImplementationWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImplementation, setSelectedImplementation] = useState<Implementation | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'planned': return 'bg-gray-500';
      case 'abandoned': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Play;
      case 'planned': return Clock;
      case 'abandoned': return RotateCcw;
      default: return Clock;
    }
  };

  const updateImplementationStatus = async (implementation: Implementation, newStatus: string, progressPercentage?: number) => {
    setUpdating(true);
    try {
      const updates: any = {
        status: newStatus,
        implementation_notes: notes || implementation.implementation_notes
      };

      if (progressPercentage !== undefined) {
        updates.progress_percentage = progressPercentage;
      }

      if (newStatus === 'in_progress' && implementation.status === 'planned') {
        updates.started_at = new Date().toISOString();
      }

      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.progress_percentage = 100;
      }

      const { error } = await supabase
        .from('tool_implementations')
        .update(updates)
        .eq('id', implementation.id);

      if (error) throw error;

      toast({
        title: "Implementation Updated",
        description: `${implementation.tools.name} status updated to ${newStatus}`,
      });

      onRefresh();
      setNotes('');
    } catch (error) {
      console.error('Error updating implementation:', error);
      toast({
        title: "Error",
        description: "Failed to update implementation status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateProgress = async (implementation: Implementation, progressPercentage: number) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('tool_implementations')
        .update({
          progress_percentage: progressPercentage,
          status: progressPercentage === 100 ? 'completed' : 
                 progressPercentage > 0 ? 'in_progress' : 'planned'
        })
        .eq('id', implementation.id);

      if (error) throw error;

      onRefresh();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getImplementationGuide = (toolName: string) => {
    // This would normally come from the database or API
    const guides = {
      "Power BI": {
        steps: [
          "Install Power BI Desktop",
          "Connect to your data sources (ERP, Excel files)",
          "Create basic financial dashboards",
          "Set up automated data refresh",
          "Share dashboards with team",
          "Train team on usage"
        ],
        estimatedHours: 20,
        tips: "Start with your most common reports. Focus on automation to save weekly time."
      },
      "Excel AI Add-ins": {
        steps: [
          "Install Excel AI add-ins (Ideas, Dynamic Arrays)",
          "Set up automated variance analysis templates",
          "Create predictive forecasting models",
          "Build automated KPI dashboards",
          "Train team on new features"
        ],
        estimatedHours: 12,
        tips: "Begin with templates for your monthly reports. Gradual adoption works best."
      }
    };

    return guides[toolName as keyof typeof guides] || {
      steps: [
        "Initial setup and configuration",
        "Data integration and testing",
        "User training and adoption",
        "Full deployment"
      ],
      estimatedHours: 16,
      tips: "Follow vendor documentation and consider professional services for complex setups."
    };
  };

  const groupedImplementations = {
    planned: implementations.filter(impl => impl.status === 'planned'),
    in_progress: implementations.filter(impl => impl.status === 'in_progress'),
    completed: implementations.filter(impl => impl.status === 'completed'),
    abandoned: implementations.filter(impl => impl.status === 'abandoned')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Implementation Wizard</span>
          </CardTitle>
          <CardDescription>
            Track and manage your AI tool implementations with step-by-step guidance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{groupedImplementations.planned.length}</div>
              <p className="text-sm text-muted-foreground">Planned</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{groupedImplementations.in_progress.length}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{groupedImplementations.completed.length}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round((groupedImplementations.completed.length / Math.max(implementations.length, 1)) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList>
          <TabsTrigger value="current">Current Projects</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {groupedImplementations.in_progress.length > 0 ? (
            groupedImplementations.in_progress.map((implementation) => {
              const guide = getImplementationGuide(implementation.tools.name);
              const StatusIcon = getStatusIcon(implementation.status);
              
              return (
                <Card key={implementation.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <StatusIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{implementation.tools.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">In Progress</Badge>
                            <span className="text-sm text-muted-foreground">
                              Started {new Date(implementation.started_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{implementation.progress_percentage}%</div>
                        <p className="text-sm text-muted-foreground">Complete</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Implementation Progress</span>
                        <span>{implementation.progress_percentage}% of {guide.estimatedHours}h estimated</span>
                      </div>
                      <Progress value={implementation.progress_percentage} className="h-2" />
                    </div>

                    {/* Implementation Steps */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Implementation Steps</span>
                      </h4>
                      <div className="space-y-2">
                        {guide.steps.map((step, index) => {
                          const stepProgress = Math.max(0, implementation.progress_percentage - (index * (100 / guide.steps.length)));
                          const isCompleted = stepProgress >= (100 / guide.steps.length);
                          const isInProgress = stepProgress > 0 && stepProgress < (100 / guide.steps.length);
                          
                          return (
                            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-accent/5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-green-500 text-white' :
                                isInProgress ? 'bg-blue-500 text-white' :
                                'bg-gray-200 text-gray-500'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <span className="text-xs">{index + 1}</span>
                                )}
                              </div>
                              <span className={`flex-1 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Progress Update Controls */}
                    <div className="space-y-4 p-4 bg-accent/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Update Progress:</span>
                        <div className="flex space-x-1">
                          {[25, 50, 75, 100].map(percent => (
                            <Button
                              key={percent}
                              variant="outline"
                              size="sm"
                              onClick={() => updateProgress(implementation, percent)}
                              disabled={updating || implementation.progress_percentage >= percent}
                            >
                              {percent}%
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Add implementation notes..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => updateImplementationStatus(implementation, 'completed')}
                            disabled={updating}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => updateImplementationStatus(implementation, 'abandoned')}
                            disabled={updating}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Implementation Tips */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900">Implementation Tip</p>
                          <p className="text-sm text-blue-700">{guide.tips}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No active implementations</h3>
                <p className="text-muted-foreground mb-4">
                  Start implementing a recommended tool to track your progress here
                </p>
                <Button onClick={() => window.location.href = '/cfo-dashboard?tab=tools'}>
                  View Recommendations
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {groupedImplementations.completed.map((implementation) => (
            <Card key={implementation.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{implementation.tools.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="bg-green-500">Completed</Badge>
                        <span className="text-sm text-muted-foreground">
                          {implementation.completed_at && 
                            `Completed ${new Date(implementation.completed_at).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {implementation.roi_achieved_percentage}% ROI
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {implementation.time_invested_hours}h invested
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              {implementation.implementation_notes && (
                <CardContent>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">{implementation.implementation_notes}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="planned" className="space-y-4">
          {groupedImplementations.planned.map((implementation) => (
            <Card key={implementation.id} className="border-l-4 border-l-gray-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{implementation.tools.name}</CardTitle>
                      <Badge variant="outline">Planned</Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => updateImplementationStatus(implementation, 'in_progress')}
                    disabled={updating}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Implementation
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}