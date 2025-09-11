import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { GamificationManager, type UserStats, type Level, type UserAchievement, type Achievement } from '@/utils/gamification';
import { Trophy, Star, TrendingUp, Calendar, Flame, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function GamificationDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [nextLevel, setNextLevel] = useState<Level | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [stats, achievements, allAch, levels] = await Promise.all([
        GamificationManager.getUserStats(user.id),
        GamificationManager.getUserAchievements(user.id),
        GamificationManager.getAllAchievements(),
        GamificationManager.getAllLevels(),
      ]);

      setUserStats(stats);
      setUserAchievements(achievements);
      setAllAchievements(allAch);
      setAllLevels(levels);

      if (stats) {
        const [current, next] = await Promise.all([
          GamificationManager.getCurrentLevel(stats.total_points),
          GamificationManager.getNextLevel(stats.total_points),
        ]);
        setCurrentLevel(current);
        setNextLevel(next);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
      toast({
        title: "Error",
        description: "Failed to load progress data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const levelProgress = currentLevel && userStats ? 
    GamificationManager.calculateLevelProgress(userStats.total_points, currentLevel, nextLevel) : 0;

  const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));
  const pendingAchievements = allAchievements.filter(a => !earnedAchievementIds.has(a.id));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level & Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {currentLevel?.icon} {currentLevel?.title || 'AI Novice'}
              </CardTitle>
              <CardDescription>
                {currentLevel?.description || 'Just getting started with AI tools'}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {userStats?.total_points || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progress to {nextLevel?.title || 'Max Level'}</span>
              <span>
                {nextLevel ? `${userStats?.total_points || 0}/${nextLevel.points_required} points` : 'Max Level Reached!'}
              </span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{userStats?.achievements_earned || 0}</div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{userStats?.guides_completed || 0}</div>
            <div className="text-xs text-muted-foreground">Guides Done</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{userStats?.modules_completed || 0}</div>
            <div className="text-xs text-muted-foreground">Modules</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{userStats?.tools_implemented || 0}</div>
            <div className="text-xs text-muted-foreground">Tools Used</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{userStats?.streak_days || 0}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold">{Math.floor((userStats?.total_time_invested_minutes || 0) / 60)}</div>
            <div className="text-xs text-muted-foreground">Hours</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements & Levels Tabs */}
      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="levels">All Levels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earned Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Earned Achievements ({userAchievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {userAchievements.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No achievements yet. Complete activities to earn your first achievement!
                  </p>
                ) : (
                  userAchievements.map((ua) => (
                    <div key={ua.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl">{ua.achievement?.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{ua.achievement?.name}</h4>
                          <Badge 
                            variant="secondary" 
                            style={{ backgroundColor: GamificationManager.getRarityColor(ua.achievement?.rarity || 'common') }}
                            className="text-white text-xs"
                          >
                            {GamificationManager.getRarityLabel(ua.achievement?.rarity || 'common')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{ua.achievement?.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          +{ua.achievement?.points} points • {new Date(ua.earned_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Available Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Available Achievements ({pendingAchievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {pendingAchievements.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Congratulations! You've earned all available achievements!
                  </p>
                ) : (
                  pendingAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg opacity-60">
                      <div className="text-2xl grayscale">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {achievement.points} pts
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <div className="text-xs text-muted-foreground mt-1 capitalize">
                          {achievement.category} • {GamificationManager.getRarityLabel(achievement.rarity)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Level Progression</CardTitle>
              <CardDescription>
                Your journey through the AI mastery levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allLevels.map((level, index) => {
                  const isCurrentLevel = currentLevel?.level_number === level.level_number;
                  const isCompleted = (userStats?.total_points || 0) >= level.points_required;
                  const isNext = nextLevel?.level_number === level.level_number;
                  
                  return (
                    <div 
                      key={level.id} 
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        isCurrentLevel 
                          ? 'bg-primary/10 border-primary' 
                          : isCompleted 
                            ? 'bg-muted/50 border-muted' 
                            : 'border-border'
                      }`}
                    >
                      <div className="text-3xl">{level.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            Level {level.level_number}: {level.title}
                          </h3>
                          {isCurrentLevel && (
                            <Badge variant="default">Current</Badge>
                          )}
                          {isNext && (
                            <Badge variant="outline">Next</Badge>
                          )}
                          {isCompleted && !isCurrentLevel && (
                            <Badge variant="secondary">Completed</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {level.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {level.points_required} points required
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium" style={{ color: level.color }}>
                          {level.points_required === 0 ? 'Starting Level' : `${level.points_required} pts`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}