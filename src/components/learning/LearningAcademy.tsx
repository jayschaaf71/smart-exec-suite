import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, PlayCircle, Clock, Star, Users, CheckCircle, ArrowRight, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  target_role: string;
  difficulty_level: string;
  estimated_duration_hours: number;
  prerequisites: string[];
  learning_objectives: string[];
  learning_modules?: LearningModule[];
  progress?: {
    modules_completed: number;
    total_modules: number;
    last_accessed?: string;
    status: string;
  };
}

interface LearningModule {
  id: string;
  path_id?: string;
  title: string;
  description: string;
  module_type: string;
  duration_minutes: number;
  content_preview: string;
  completed?: boolean;
}

export function LearningAcademy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [featuredPath, setFeaturedPath] = useState<LearningPath | null>(null);
  const [recentModules, setRecentModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLearningData();
    }
  }, [user]);

  const loadLearningData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      // Load learning paths with progress
      const { data: paths, error: pathsError } = await supabase
        .from('learning_paths')
        .select(`
          *,
          learning_modules (
            id,
            title,
            description,
            module_type,
            duration_minutes,
            content_preview,
            user_learning_progress!left (
              status,
              completed_at,
              last_accessed
            )
          )
        `)
        .eq('status', 'active')
        .order('path_order');

      if (pathsError) throw pathsError;

      // Process paths with progress information
      const processedPaths = paths?.map(path => {
        const modules = path.learning_modules || [];
        const completedModules = modules.filter(m => 
          m.user_learning_progress?.some(p => p.status === 'completed')
        );
        
        return {
          ...path,
          progress: {
            modules_completed: completedModules.length,
            total_modules: modules.length,
            last_accessed: modules
              .flatMap(m => m.user_learning_progress || [])
              .sort((a, b) => new Date(b.last_accessed || 0).getTime() - new Date(a.last_accessed || 0).getTime())[0]?.last_accessed,
            status: completedModules.length === modules.length ? 'completed' : 
                    completedModules.length > 0 ? 'in_progress' : 'not_started'
          }
        };
      }) || [];

      setLearningPaths(processedPaths);

      // Set featured path (role-specific or most popular)
      const roleSpecificPath = processedPaths.find(p => p.target_role === profile?.role);
      const featured = roleSpecificPath || processedPaths[0];
      setFeaturedPath(featured);

      // Load recent modules
      const { data: recentProgress } = await supabase
        .from('user_learning_progress')
        .select(`
          *,
          learning_modules (
            id,
            title,
            description,
            module_type,
            duration_minutes,
            content_preview
          )
        `)
        .eq('user_id', user.id)
        .order('last_accessed', { ascending: false })
        .limit(3);

      const recentMods = recentProgress?.map(p => ({
        ...p.learning_modules,
        path_id: p.path_id,
        completed: p.status === 'completed'
      })) || [];

      setRecentModules(recentMods);

    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLearningPath = async (pathId: string) => {
    if (!user) return;

    try {
      // Get first module of the path
      const { data: modules } = await supabase
        .from('learning_modules')
        .select('id')
        .eq('path_id', pathId)
        .order('order_in_path')
        .limit(1);

      if (modules && modules.length > 0) {
        // Start progress tracking
        await supabase
          .from('user_learning_progress')
          .upsert({
            user_id: user.id,
            path_id: pathId,
            module_id: modules[0].id,
            status: 'in_progress',
            started_at: new Date().toISOString(),
            last_accessed: new Date().toISOString()
          }, {
            onConflict: 'user_id,path_id,module_id'
          });

        toast({
          title: "Learning started!",
          description: "Your learning journey has begun. Good luck!",
        });

        // Refresh data
        loadLearningData();
      }
    } catch (error) {
      console.error('Error starting learning path:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Learning Path */}
      {featuredPath && (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-purple-600" />
              <Badge className="bg-purple-600 text-white">Featured for You</Badge>
            </div>
            <CardTitle className="text-2xl">{featuredPath.title}</CardTitle>
            <CardDescription className="text-base">
              {featuredPath.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Path Info */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>{featuredPath.estimated_duration_hours} hours</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4 text-purple-600" />
                <span>{featuredPath.progress?.total_modules || 0} modules</span>
              </div>
              <Badge className={getDifficultyColor(featuredPath.difficulty_level)}>
                {featuredPath.difficulty_level}
              </Badge>
            </div>

            {/* Progress */}
            {featuredPath.progress && featuredPath.progress.total_modules > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{featuredPath.progress.modules_completed} of {featuredPath.progress.total_modules} modules</span>
                </div>
                <Progress 
                  value={(featuredPath.progress.modules_completed / featuredPath.progress.total_modules) * 100} 
                  className="h-3"
                />
              </div>
            )}

            {/* Learning Objectives */}
            <div>
              <h4 className="font-medium mb-2">What you'll learn:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                {featuredPath.learning_objectives.slice(0, 4).map((objective, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <Button 
              onClick={() => startLearningPath(featuredPath.id)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {featuredPath.progress?.status === 'not_started' ? (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Learning Path
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continue Learning
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle>All Learning Paths</CardTitle>
          <CardDescription>
            Structured learning journeys tailored to your role and experience level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <Card key={path.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getDifficultyColor(path.difficulty_level)}>
                      {path.difficulty_level}
                    </Badge>
                    {path.progress && (
                      <Badge className={getStatusColor(path.progress.status)}>
                        {path.progress.status.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Path Metrics */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {path.estimated_duration_hours}h
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {path.progress?.total_modules || 0} modules
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {path.target_role.toUpperCase()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {path.progress && path.progress.total_modules > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.round((path.progress.modules_completed / path.progress.total_modules) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(path.progress.modules_completed / path.progress.total_modules) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Prerequisites */}
                  {path.prerequisites.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Prerequisites:</p>
                      <p className="text-xs text-gray-600">{path.prerequisites.join(', ')}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => startLearningPath(path.id)}
                  >
                    {path.progress?.status === 'completed' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review Path
                      </>
                    ) : path.progress?.status === 'in_progress' ? (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Continue
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Path
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Learning Activity */}
      {recentModules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Learning Activity
            </CardTitle>
            <CardDescription>Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentModules.map((module) => (
                <div key={module.id} className="flex items-start gap-4 p-3 rounded-lg border">
                  <div className="mt-1">
                    {module.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <PlayCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{module.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{module.module_type}</span>
                      <span>{module.duration_minutes} min</span>
                      {module.completed && <span className="text-green-600">Completed</span>}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {module.completed ? 'Review' : 'Continue'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Learning with Tabs */}
      <Tabs defaultValue="paths" className="space-y-6">
        <TabsList>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="modules">Quick Modules</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {learningPaths.flatMap(path => path.learning_modules || []).slice(0, 6).map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{module.module_type}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {module.duration_minutes}min
                    </div>
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      <span className="text-sm font-medium">Learning Objectives</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {module.content_preview}
                    </div>
                    
                    <Button className="w-full" onClick={() => module.path_id && startLearningPath(module.path_id)}>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Module
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Statistics</CardTitle>
                <CardDescription>Track your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {learningPaths.reduce((acc, path) => acc + (path.progress?.modules_completed || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Modules Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {learningPaths.reduce((acc, path) => acc + (path.estimated_duration_hours || 0), 0)}h
                    </div>
                    <div className="text-sm text-muted-foreground">Total Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {learningPaths.filter(path => path.progress?.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Learning Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Learning Academy Stats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{learningPaths.length}</div>
            <div className="text-sm text-gray-600">Learning Paths</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {learningPaths.reduce((acc, path) => acc + (path.progress?.total_modules || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Learning Modules</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">92%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">4.8★</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}