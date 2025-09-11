-- Create implementation_guides table
CREATE TABLE public.implementation_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_time TEXT, -- e.g., "15 minutes", "1-2 hours"
  difficulty_level TEXT, -- "beginner", "intermediate", "advanced"
  target_roles TEXT[],
  prerequisites TEXT[],
  steps JSONB NOT NULL, -- Array of step objects with title, description, duration, resources
  success_metrics TEXT[],
  troubleshooting JSONB, -- Common issues and solutions
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_implementation_progress table
CREATE TABLE public.user_implementation_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  guide_id UUID REFERENCES public.implementation_guides(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  completed_steps INTEGER[] DEFAULT '{}',
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'paused'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, guide_id)
);

-- Enable Row Level Security
ALTER TABLE public.implementation_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_implementation_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for implementation_guides (public read)
CREATE POLICY "Implementation guides are viewable by everyone" 
ON public.implementation_guides 
FOR SELECT 
USING (true);

-- RLS Policies for user_implementation_progress (user-specific)
CREATE POLICY "Users can view their own implementation progress" 
ON public.user_implementation_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own implementation progress" 
ON public.user_implementation_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own implementation progress" 
ON public.user_implementation_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_implementation_guides_updated_at
BEFORE UPDATE ON public.implementation_guides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_implementation_progress_updated_at
BEFORE UPDATE ON public.user_implementation_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();