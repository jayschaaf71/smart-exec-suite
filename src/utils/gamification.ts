import { supabase } from '@/integrations/supabase/client';

export interface Level {
  id: string;
  level_number: number;
  title: string;
  description: string;
  points_required: number;
  icon: string;
  color: string;
  rewards: Record<string, any>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: Record<string, any>;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress_data?: Record<string, any>;
  achievement?: Achievement;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_points: number;
  achievements_earned: number;
  level_title: string;
  modules_completed: number;
  guides_completed: number;
  tools_implemented: number;
  last_activity_date: string;
  streak_days: number;
  total_time_invested_minutes: number;
}

export class GamificationManager {
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UserAchievement[];
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  static async getAllAchievements(): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true })
        .order('points', { ascending: true });

      if (error) throw error;
      return (data || []) as Achievement[];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  static async getAllLevels(): Promise<Level[]> {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('level_number', { ascending: true });

      if (error) throw error;
      return (data || []) as Level[];
    } catch (error) {
      console.error('Error fetching levels:', error);
      return [];
    }
  }

  static async getCurrentLevel(points: number): Promise<Level | null> {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .lte('points_required', points)
        .order('points_required', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Level | null;
    } catch (error) {
      console.error('Error fetching current level:', error);
      return null;
    }
  }

  static async getNextLevel(points: number): Promise<Level | null> {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .gt('points_required', points)
        .order('points_required', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Level | null;
    } catch (error) {
      console.error('Error fetching next level:', error);
      return null;
    }
  }

  static async initializeUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          total_points: 0,
          achievements_earned: 0,
          level_title: 'AI Novice',
          modules_completed: 0,
          guides_completed: 0,
          tools_implemented: 0,
          last_activity_date: new Date().toISOString().split('T')[0],
          streak_days: 1,
          total_time_invested_minutes: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error initializing user stats:', error);
      return null;
    }
  }

  static async updateUserStats(
    userId: string, 
    updates: Partial<Omit<UserStats, 'id' | 'user_id'>>
  ): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return null;
    }
  }

  static async awardPoints(userId: string, points: number, reason: string): Promise<boolean> {
    try {
      // Get current stats
      const currentStats = await this.getUserStats(userId);
      if (!currentStats) {
        await this.initializeUserStats(userId);
      }

      // Update points
      const { error } = await supabase
        .from('user_stats')
        .update({ 
          total_points: (currentStats?.total_points || 0) + points,
          last_activity_date: new Date().toISOString().split('T')[0],
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Track the point award
      await supabase.from('user_analytics_events').insert({
        user_id: userId,
        event_type: 'points_awarded',
        event_data: {
          points_awarded: points,
          reason: reason,
          timestamp: new Date().toISOString(),
        },
      });

      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  }

  static async incrementStat(
    userId: string, 
    statType: 'modules_completed' | 'guides_completed' | 'tools_implemented',
    increment = 1
  ): Promise<boolean> {
    try {
      const currentStats = await this.getUserStats(userId);
      if (!currentStats) {
        await this.initializeUserStats(userId);
      }

      const updates = {
        [statType]: (currentStats?.[statType] || 0) + increment,
        last_activity_date: new Date().toISOString().split('T')[0],
      };

      await this.updateUserStats(userId, updates);
      return true;
    } catch (error) {
      console.error('Error incrementing stat:', error);
      return false;
    }
  }

  static async updateStreak(userId: string): Promise<boolean> {
    try {
      const currentStats = await this.getUserStats(userId);
      if (!currentStats) {
        await this.initializeUserStats(userId);
        return true;
      }

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = currentStats.last_activity_date;
      
      let newStreakDays = currentStats.streak_days;
      
      if (lastActivity !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActivity === yesterdayStr) {
          // Continuing streak
          newStreakDays += 1;
        } else {
          // Streak broken, reset to 1
          newStreakDays = 1;
        }
      }

      await this.updateUserStats(userId, {
        streak_days: newStreakDays,
        last_activity_date: today,
      });

      return true;
    } catch (error) {
      console.error('Error updating streak:', error);
      return false;
    }
  }

  static getRarityColor(rarity: Achievement['rarity']): string {
    switch (rarity) {
      case 'common': return '#10B981'; // green
      case 'uncommon': return '#3B82F6'; // blue
      case 'rare': return '#8B5CF6'; // purple
      case 'epic': return '#F59E0B'; // amber
      case 'legendary': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  }

  static getRarityLabel(rarity: Achievement['rarity']): string {
    switch (rarity) {
      case 'common': return 'Common';
      case 'uncommon': return 'Uncommon';
      case 'rare': return 'Rare';
      case 'epic': return 'Epic';
      case 'legendary': return 'Legendary';
      default: return 'Unknown';
    }
  }

  static calculateLevelProgress(currentPoints: number, currentLevel: Level, nextLevel: Level | null): number {
    if (!nextLevel) return 100; // Max level reached
    
    const pointsInCurrentLevel = currentPoints - currentLevel.points_required;
    const pointsNeededForNext = nextLevel.points_required - currentLevel.points_required;
    
    return Math.min(100, Math.max(0, (pointsInCurrentLevel / pointsNeededForNext) * 100));
  }
}