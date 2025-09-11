-- Insert more comprehensive achievements
INSERT INTO public.achievements (name, description, icon, category, criteria, points, rarity) VALUES
-- Getting Started Achievements
('First Steps', 'Complete your first onboarding', '🚀', 'getting_started', '{"action": "onboarding_complete"}', 50, 'common'),
('Tool Explorer', 'View your first AI tool recommendation', '🔍', 'exploration', '{"action": "view_tool", "count": 1}', 25, 'common'),
('Quick Learner', 'Complete your first quick win', '⚡', 'progress', '{"action": "complete_quickwin", "count": 1}', 75, 'common'),

-- Implementation Achievements
('Implementation Rookie', 'Start your first implementation guide', '📋', 'implementation', '{"action": "start_guide", "count": 1}', 100, 'common'),
('Implementation Pro', 'Complete 3 implementation guides', '🛠️', 'implementation', '{"action": "complete_guide", "count": 3}', 300, 'uncommon'),
('Implementation Master', 'Complete 10 implementation guides', '🏆', 'implementation', '{"action": "complete_guide", "count": 10}', 1000, 'rare'),

-- Learning Achievements
('Knowledge Seeker', 'Start your first learning path', '📚', 'learning', '{"action": "start_path", "count": 1}', 100, 'common'),
('Module Master', 'Complete 5 learning modules', '🎓', 'learning', '{"action": "complete_module", "count": 5}', 250, 'uncommon'),
('Learning Legend', 'Complete an entire learning path', '🌟', 'learning', '{"action": "complete_path", "count": 1}', 500, 'rare'),

-- Engagement Achievements
('Daily Warrior', 'Visit the platform 7 days in a row', '🔥', 'engagement', '{"action": "daily_streak", "count": 7}', 200, 'uncommon'),
('Weekly Champion', 'Maintain a 30-day streak', '💪', 'engagement', '{"action": "daily_streak", "count": 30}', 750, 'rare'),
('Tool Collector', 'Interact with 10 different tools', '🧰', 'exploration', '{"action": "interact_tools", "count": 10}', 300, 'uncommon'),

-- Special Achievements
('Speed Runner', 'Complete a guide in under 30 minutes', '🏃', 'special', '{"action": "fast_completion", "time_minutes": 30}', 150, 'uncommon'),
('Night Owl', 'Complete activities between 10PM-6AM', '🦉', 'special', '{"action": "night_activity", "hours": ["22", "23", "0", "1", "2", "3", "4", "5"]}', 100, 'uncommon'),
('Early Bird', 'Complete activities between 5AM-8AM', '🐦', 'special', '{"action": "early_activity", "hours": ["5", "6", "7"]}', 100, 'uncommon'),

-- Progress Achievements
('Progress Tracker', 'Check your progress dashboard 5 times', '📊', 'engagement', '{"action": "view_progress", "count": 5}', 75, 'common'),
('Goal Setter', 'Set your first implementation goal', '🎯', 'progress', '{"action": "set_goal", "count": 1}', 50, 'common'),
('Goal Achiever', 'Complete 5 implementation goals', '✅', 'progress', '{"action": "complete_goal", "count": 5}', 400, 'rare'),

-- Social & Sharing
('Feedback Hero', 'Rate 5 different tools', '⭐', 'social', '{"action": "rate_tools", "count": 5}', 150, 'uncommon'),
('Review Master', 'Write detailed reviews for 3 tools', '📝', 'social', '{"action": "write_reviews", "count": 3}', 200, 'uncommon');

-- Create levels table for user progression
CREATE TABLE public.levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  icon TEXT,
  color TEXT,
  rewards JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for levels
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

-- Create policy for levels (read-only for all users)
CREATE POLICY "Levels are viewable by everyone" 
ON public.levels 
FOR SELECT 
USING (true);

-- Insert level progression
INSERT INTO public.levels (level_number, title, description, points_required, icon, color, rewards) VALUES
(1, 'AI Novice', 'Just getting started with AI tools', 0, '🌱', '#10B981', '{"welcome_message": "Welcome to your AI journey!"}'),
(2, 'AI Explorer', 'Beginning to explore AI capabilities', 100, '🔍', '#3B82F6', '{"feature_unlock": "advanced_recommendations"}'),
(3, 'AI Apprentice', 'Learning the fundamentals', 300, '📚', '#8B5CF6', '{"badge": "apprentice", "tools_unlocked": 3}'),
(4, 'AI Practitioner', 'Implementing AI solutions', 600, '⚙️', '#F59E0B', '{"priority_support": true, "tools_unlocked": 5}'),
(5, 'AI Specialist', 'Specialized in specific AI domains', 1000, '🎯', '#EF4444', '{"custom_recommendations": true, "tools_unlocked": 10}'),
(6, 'AI Expert', 'Advanced AI implementation skills', 1500, '🏆', '#EC4899', '{"expert_content": true, "beta_features": true}'),
(7, 'AI Master', 'Mastery across multiple AI areas', 2500, '👑', '#6366F1', '{"mentorship_program": true, "all_tools": true}'),
(8, 'AI Innovator', 'Pushing the boundaries of AI', 4000, '🚀', '#F97316', '{"innovation_lab": true, "custom_integrations": true}'),
(9, 'AI Visionary', 'Leading AI transformation', 6000, '🌟', '#84CC16', '{"advisory_board": true, "early_access": true}'),
(10, 'AI Legend', 'Legendary status in AI mastery', 10000, '⚡', '#D946EF', '{"legend_status": true, "unlimited_access": true}');

-- Create user level tracking function
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  current_points INTEGER;
  new_level_record RECORD;
  old_level INTEGER;
BEGIN
  -- Get current points
  current_points := NEW.total_points;
  old_level := COALESCE(
    (SELECT level_number FROM public.levels 
     WHERE points_required <= (SELECT total_points FROM public.user_stats WHERE user_id = NEW.user_id AND id != NEW.id)
     ORDER BY points_required DESC LIMIT 1), 1
  );
  
  -- Find the appropriate level
  SELECT * INTO new_level_record
  FROM public.levels
  WHERE points_required <= current_points
  ORDER BY points_required DESC
  LIMIT 1;
  
  -- Update level title if level changed
  IF new_level_record.level_number > old_level THEN
    NEW.level_title := new_level_record.title;
    
    -- Create level up notification
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data,
      priority
    ) VALUES (
      NEW.user_id,
      'achievement',
      '🎉 Level Up!',
      'Congratulations! You''ve reached ' || new_level_record.title || ' (Level ' || new_level_record.level_number || ')!',
      jsonb_build_object(
        'level_number', new_level_record.level_number,
        'level_title', new_level_record.title,
        'rewards', new_level_record.rewards
      ),
      'high'
    );
  ELSE
    -- Keep existing level title if no level change
    NEW.level_title := COALESCE(NEW.level_title, new_level_record.title);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for level updates
CREATE TRIGGER update_user_level_trigger
  BEFORE UPDATE OF total_points ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();

-- Create trigger for new user stats (initial level)
CREATE TRIGGER insert_user_level_trigger
  BEFORE INSERT ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();

-- Create achievement checking function
CREATE OR REPLACE FUNCTION public.check_and_award_achievements()
RETURNS TRIGGER AS $$
DECLARE
  achievement_record RECORD;
  user_achievement_exists BOOLEAN;
BEGIN
  -- Loop through all achievements to check criteria
  FOR achievement_record IN SELECT * FROM public.achievements LOOP
    -- Check if user already has this achievement
    SELECT EXISTS(
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = NEW.user_id AND achievement_id = achievement_record.id
    ) INTO user_achievement_exists;
    
    -- Skip if already earned
    IF user_achievement_exists THEN
      CONTINUE;
    END IF;
    
    -- Check specific achievement criteria (simplified for demo)
    -- In production, this would be more sophisticated
    IF (achievement_record.criteria->>'action' = 'complete_guide' AND 
        NEW.guides_completed >= (achievement_record.criteria->>'count')::INTEGER) OR
       (achievement_record.criteria->>'action' = 'complete_module' AND 
        NEW.modules_completed >= (achievement_record.criteria->>'count')::INTEGER) OR
       (achievement_record.criteria->>'action' = 'implement_tool' AND 
        NEW.tools_implemented >= (achievement_record.criteria->>'count')::INTEGER) THEN
      
      -- Award the achievement
      INSERT INTO public.user_achievements (user_id, achievement_id, progress_data)
      VALUES (NEW.user_id, achievement_record.id, jsonb_build_object(
        'earned_at', now(),
        'criteria_met', achievement_record.criteria
      ));
      
      -- Add points to user stats
      UPDATE public.user_stats 
      SET total_points = total_points + achievement_record.points
      WHERE user_id = NEW.user_id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for achievement checking
CREATE TRIGGER check_achievements_trigger
  AFTER UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_award_achievements();

-- Create index for better performance
CREATE INDEX idx_levels_points_required ON public.levels(points_required);
CREATE INDEX idx_user_stats_points ON public.user_stats(total_points);
CREATE INDEX idx_achievements_category ON public.achievements(category);