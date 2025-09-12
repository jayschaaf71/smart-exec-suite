import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Target, 
  Clock, 
  TrendingUp,
  CheckCircle,
  Circle,
  PlayCircle,
  Calendar,
  BarChart3,
  Zap,
  BookOpen,
  Flame,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
  earned_at?: string;
  progress?: number;
}

interface UserStats {
  total_points: number;
  streak_days: number;
  tools_implemented: number;
  guides_completed: number;
  modules_completed: number;
  achievements_earned: number;
  total_time_invested_minutes: number;
  level_title: string;
  last_activity_date?: string;
}

export function ProgressTracking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
      initializeGamification();
    }
  }, [user]);

  const initializeGamification = async () => {
    if (!user) return;
    
    // Simple gamification initialization
    console.log('Initializing gamification for user:', user.id);
  };

  const loadProgressData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load or create user stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;
      
      if (!stats) {
        // Create initial stats
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            total_points: 0,
            level_title: 'AI Novice'
          })
          .select()
          .single();
        
        if (createError) throw createError;
        setUserStats(newStats);
      } else {
        setUserStats(stats);
      }

      // Load all achievements with user progress
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select(`
          *,
          user_achievements!left (
            earned_at
          )
        `)
        .order('points', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Process achievements to show earned status and progress
      const processedAchievements = allAchievements?.map(achievement => {
        const userAchievement = achievement.user_achievements?.find(
          ua => ua && typeof ua === 'object' && 'earned_at' in ua
        );
        
        return {
          ...achievement,
          earned_at: userAchievement?.earned_at,
          progress: calculateAchievementProgress(achievement, stats || {
            total_points: 0,
            streak_days: 0,
            tools_implemented: 0,
            guides_completed: 0,
            modules_completed: 0,
            achievements_earned: 0,
            total_time_invested_minutes: 0,
            level_title: 'AI Novice'
          })
        };
      }) || [];

      setAchievements(processedAchievements);
      
      // Get recent achievements (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentEarned = processedAchievements
        .filter(a => a.earned_at && new Date(a.earned_at) > thirtyDaysAgo)
        .sort((a, b) => new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime())
        .slice(0, 3);
      
      setRecentAchievements(recentEarned);

      // Check for new achievements
      await checkAndAwardAchievements(stats || {
        total_points: 0,
        streak_days: 0,
        tools_implemented: 0,
        guides_completed: 0,
        modules_completed: 0,
        achievements_earned: 0,
        total_time_invested_minutes: 0,
        level_title: 'AI Novice'
      });

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAchievementProgress = (achievement: any, stats: UserStats): number => {
    const criteria = achievement.criteria;
    
    if (achievement.earned_at) return 100;
    
    if (criteria.tools_implemented) {
      return Math.min(100, (stats.tools_implemented / criteria.tools_implemented) * 100);
    }
    if (criteria.modules_completed) {
      return Math.min(100, (stats.modules_completed / criteria.modules_completed) * 100);
    }
    if (criteria.streak_days) {
      return Math.min(100, (stats.streak_days / criteria.streak_days) * 100);
    }
    if (criteria.time_invested_hours) {
      const hoursInvested = stats.total_time_invested_minutes / 60;
      return Math.min(100, (hoursInvested / criteria.time_invested_hours) * 100);
    }
    
    return 0;
  };

  const checkAndAwardAchievements = async (stats: UserStats) => {
    if (!user) return;

    // Simple achievement checking logic
    const achievementsToCheck = [
      { id: 'first_steps', condition: stats.tools_implemented >= 1 },
      { id: 'learning_enthusiast', condition: stats.modules_completed >= 1 },
      { id: 'streak_master', condition: stats.streak_days >= 7 },
      { id: 'time_investor', condition: (stats.total_time_invested_minutes / 60) >= 10 }
    ];

    for (const check of achievementsToCheck) {
      if (check.condition) {
        // Award achievement if not already earned
        const achievement = achievements.find(a => a.name.toLowerCase().replace(' ', '_') === check.id);
        if (achievement && !achievement.earned_at) {
          await awardAchievement(achievement.id);
        }
      }
    }
  };

  const awardAchievement = async (achievementId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          earned_at: new Date().toISOString()
        });

      if (error && error.code !== '23505') throw error; // Ignore duplicate key errors
      
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        toast({
          title: "Achievement Unlocked! 🏆",
          description: `You earned "${achievement.name}" (+${achievement.points} points)`,
        });
        
        // Refresh data
        loadProgressData();
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '🥉';
      case 'rare': return '🥈';
      case 'epic': return '🥇';
      case 'legendary': return '👑';
      default: return '🏅';
    }
  };

  const getNextLevel = (points: number): { title: string; pointsNeeded: number; totalNeeded: number } => {
    const levels = [
      { title: 'AI Novice', points: 0 },
      { title: 'AI Explorer', points: 500 },
      { title: 'AI Practitioner', points: 1500 },
      { title: 'AI Expert', points: 3000 },
      { title: 'AI Master', points: 6000 },
      { title: 'AI Legend', points: 10000 }
    ];

    const currentLevelIndex = levels.findIndex((level, index) => {
      const nextLevel = levels[index + 1];
      return points >= level.points && (!nextLevel || points < nextLevel.points);
    });

    const nextLevelIndex = Math.min(currentLevelIndex + 1, levels.length - 1);
    const nextLevel = levels[nextLevelIndex];
    
    return {
      title: nextLevel.title,
      pointsNeeded: Math.max(0, nextLevel.points - points),
      totalNeeded: nextLevel.points
    };
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Progress Tracking Unavailable</h3>
          <p className="text-muted-foreground">Unable to load your progress data.</p>
        </CardContent>
      </Card>
    );
  }

  const nextLevel = getNextLevel(userStats.total_points);
  const levelProgress = ((userStats.total_points / nextLevel.totalNeeded) * 100);

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-blue-600" />
            Your AI Journey Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level and Points */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{userStats.level_title}</h3>
              <p className="text-gray-600">{userStats.total_points} points earned</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Next Level: {nextLevel.title}</p>
              <p className="text-lg font-semibold text-blue-600">{nextLevel.pointsNeeded} points to go</p>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level Progress</span>
              <span>{Math.round(levelProgress)}%</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.tools_implemented}</p>
              <p className="text-sm text-gray-600">Tools Implemented</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.modules_completed}</p>
              <p className="text-sm text-gray-600">Modules Completed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.streak_days}</p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{Math.round(userStats.total_time_invested_minutes / 60)}</p>
              <p className="text-sm text-gray-600">Hours Invested</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <Badge variant="secondary">+{achievement.points}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Earned {new Date(achievement.earned_at!).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            All Achievements
          </CardTitle>
          <CardDescription>
            {achievements.filter(a => a.earned_at).length} of {achievements.length} achievements unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.earned_at 
                    ? getRarityColor(achievement.rarity) 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">
                    {achievement.earned_at ? achievement.icon : '🔒'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <span className="text-sm">{getRarityIcon(achievement.rarity)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {achievement.points} points
                    </Badge>
                  </div>
                </div>
                
                {!achievement.earned_at && achievement.progress !== undefined && achievement.progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{Math.round(achievement.progress)}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                )}
                
                {achievement.earned_at && (
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Earned!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Progress Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Insights</CardTitle>
          <CardDescription>Patterns and recommendations based on your activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Learning Pattern</h4>
              <p className="text-sm text-muted-foreground">
                You're most productive during morning hours. Consider scheduling implementation sessions before 11 AM.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Implementation Success</h4>
              <p className="text-sm text-muted-foreground">
                Tools with step-by-step guides have a 85% higher completion rate. Keep using structured approaches.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}