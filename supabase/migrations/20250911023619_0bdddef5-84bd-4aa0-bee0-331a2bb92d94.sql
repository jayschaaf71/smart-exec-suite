-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- 'implementation', 'learning', 'collaboration', 'milestone'
  criteria JSONB NOT NULL, -- Criteria for earning the achievement
  points INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress_data JSONB, -- Additional data about the achievement progress
  UNIQUE(user_id, achievement_id)
);

-- Create learning_paths table
CREATE TABLE public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_role TEXT NOT NULL,
  difficulty_level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  estimated_duration_hours INTEGER NOT NULL,
  prerequisites TEXT[],
  learning_objectives TEXT[],
  path_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'draft', 'archived'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning_modules table
CREATE TABLE public.learning_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  module_type TEXT NOT NULL, -- 'video', 'article', 'interactive', 'assessment'
  content_url TEXT,
  duration_minutes INTEGER NOT NULL,
  order_in_path INTEGER NOT NULL,
  prerequisites TEXT[],
  learning_objectives TEXT[],
  content_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_learning_progress table
CREATE TABLE public.user_learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  score INTEGER, -- For assessments
  notes TEXT,
  bookmarked BOOLEAN DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, path_id, module_id)
);

-- Create user_stats table for gamification
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  tools_implemented INTEGER DEFAULT 0,
  guides_completed INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  achievements_earned INTEGER DEFAULT 0,
  total_time_invested_minutes INTEGER DEFAULT 0,
  level_title TEXT DEFAULT 'AI Novice',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Achievements are viewable by everyone" 
ON public.achievements FOR SELECT USING (true);

CREATE POLICY "Learning paths are viewable by everyone" 
ON public.learning_paths FOR SELECT USING (true);

CREATE POLICY "Learning modules are viewable by everyone" 
ON public.learning_modules FOR SELECT USING (true);

-- RLS Policies for user-specific data
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own learning progress" 
ON public.user_learning_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress" 
ON public.user_learning_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" 
ON public.user_learning_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats" 
ON public.user_stats FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_learning_paths_updated_at
BEFORE UPDATE ON public.learning_paths
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_modules_updated_at
BEFORE UPDATE ON public.learning_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_learning_progress_updated_at
BEFORE UPDATE ON public.user_learning_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();