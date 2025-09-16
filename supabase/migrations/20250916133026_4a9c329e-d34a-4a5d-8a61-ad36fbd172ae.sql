-- Create learning paths table (enhanced)
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_hours INTEGER NOT NULL,
  target_role TEXT NOT NULL,
  learning_objectives TEXT[],
  prerequisites TEXT[],
  path_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning modules table (enhanced)
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('video', 'article', 'interactive', 'quiz', 'case_study')),
  content_preview TEXT,
  content_url TEXT,
  duration_minutes INTEGER NOT NULL,
  order_in_path INTEGER NOT NULL,
  learning_objectives TEXT[],
  prerequisites TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user learning progress table (enhanced)
CREATE TABLE IF NOT EXISTS public.user_learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Learning paths are viewable by everyone" 
ON public.learning_paths FOR SELECT USING (true);

CREATE POLICY "Learning modules are viewable by everyone" 
ON public.learning_modules FOR SELECT USING (true);

CREATE POLICY "Users can view their own learning progress" 
ON public.user_learning_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress" 
ON public.user_learning_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" 
ON public.user_learning_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert sample learning paths
INSERT INTO public.learning_paths (title, description, difficulty_level, estimated_duration_hours, target_role, learning_objectives, prerequisites, path_order) VALUES
('AI Fundamentals for CEOs', 'Comprehensive introduction to AI technologies and their business applications for executive leadership', 'beginner', 8, 'CEO', ARRAY['Understand core AI technologies', 'Identify business opportunities', 'Lead AI transformation initiatives', 'Evaluate AI investments'], ARRAY['Basic business knowledge', 'Strategic thinking experience'], 1),
('AI Implementation for Managers', 'Practical guide to implementing AI tools and managing AI-driven teams', 'intermediate', 12, 'Manager', ARRAY['Deploy AI tools effectively', 'Manage AI-enhanced workflows', 'Train teams on AI adoption', 'Measure AI ROI'], ARRAY['Team management experience', 'Basic technology familiarity'], 2),
('AI Tools for Productivity', 'Hands-on training with popular AI productivity tools', 'beginner', 6, 'all', ARRAY['Master AI writing tools', 'Automate routine tasks', 'Enhance creative workflows', 'Integrate AI into daily work'], ARRAY['Basic computer skills'], 3);

-- Insert sample learning modules
INSERT INTO public.learning_modules (path_id, title, description, module_type, content_preview, duration_minutes, order_in_path, learning_objectives) VALUES
-- CEO Path Modules
((SELECT id FROM public.learning_paths WHERE title = 'AI Fundamentals for CEOs'), 'Understanding AI Business Impact', 'Learn how AI technologies can transform business operations and create competitive advantages', 'video', 'Explore real-world case studies of AI transformation in Fortune 500 companies...', 45, 1, ARRAY['Define artificial intelligence', 'Identify AI business applications', 'Analyze competitive advantages']),
((SELECT id FROM public.learning_paths WHERE title = 'AI Fundamentals for CEOs'), 'Building an AI Strategy', 'Framework for developing and implementing an organizational AI strategy', 'interactive', 'Step-by-step guide to creating your AI roadmap with interactive planning tools...', 60, 2, ARRAY['Develop AI vision', 'Create implementation roadmap', 'Set measurable goals']),
((SELECT id FROM public.learning_paths WHERE title = 'AI Fundamentals for CEOs'), 'AI Investment and ROI', 'How to evaluate AI investments and measure return on investment', 'case_study', 'Analyze real ROI data from AI implementations across different industries...', 40, 3, ARRAY['Calculate AI ROI', 'Evaluate vendor proposals', 'Budget for AI initiatives']),

-- Manager Path Modules
((SELECT id FROM public.learning_paths WHERE title = 'AI Implementation for Managers'), 'Leading AI Adoption', 'Strategies for successfully leading teams through AI adoption', 'video', 'Learn change management techniques specific to AI implementation...', 50, 1, ARRAY['Lead change management', 'Address team concerns', 'Build AI confidence']),
((SELECT id FROM public.learning_paths WHERE title = 'AI Implementation for Managers'), 'Tool Selection and Deployment', 'How to evaluate, select, and deploy AI tools for your team', 'interactive', 'Interactive tool comparison matrix and deployment checklists...', 55, 2, ARRAY['Evaluate AI tools', 'Plan deployments', 'Manage implementations']),

-- Productivity Path Modules  
((SELECT id FROM public.learning_paths WHERE title = 'AI Tools for Productivity'), 'AI Writing and Content Creation', 'Master AI tools for writing, editing, and content generation', 'interactive', 'Hands-on practice with ChatGPT, Copy.ai, and Jasper for various content types...', 40, 1, ARRAY['Generate quality content', 'Edit with AI assistance', 'Maintain brand voice']),
((SELECT id FROM public.learning_paths WHERE title = 'AI Tools for Productivity'), 'Workflow Automation with AI', 'Automate repetitive tasks using AI-powered tools', 'video', 'Learn to set up automated workflows with Zapier, Make, and AI integrations...', 45, 2, ARRAY['Identify automation opportunities', 'Build AI workflows', 'Monitor automation performance']);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_modules_updated_at
  BEFORE UPDATE ON public.learning_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_learning_progress_updated_at
  BEFORE UPDATE ON public.user_learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();