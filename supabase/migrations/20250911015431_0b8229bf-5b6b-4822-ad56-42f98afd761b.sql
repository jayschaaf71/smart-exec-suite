-- Create categories table for AI tools
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  parent_category_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tools table
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  pricing_model TEXT, -- 'free', 'freemium', 'paid', 'enterprise'
  pricing_amount DECIMAL,
  website_url TEXT,
  logo_url TEXT,
  setup_difficulty TEXT, -- 'easy', 'medium', 'hard'
  time_to_value TEXT, -- 'minutes', 'hours', 'days', 'weeks'
  target_roles TEXT[], -- Array of roles this tool is good for
  target_industries TEXT[], -- Array of industries
  target_company_sizes TEXT[], -- Array of company sizes
  features TEXT[],
  integrations TEXT[],
  pros TEXT[],
  cons TEXT[],
  user_rating DECIMAL,
  expert_rating DECIMAL,
  popularity_score INTEGER DEFAULT 0,
  implementation_guide TEXT,
  video_tutorial_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_tool_interactions table
CREATE TABLE public.user_tool_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_id UUID REFERENCES public.tools(id),
  interaction_type TEXT NOT NULL, -- 'viewed', 'interested', 'dismissed', 'implementing', 'completed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tool_recommendations table
CREATE TABLE public.tool_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_id UUID REFERENCES public.tools(id),
  recommendation_score DECIMAL NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'dismissed', 'accepted'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add additional columns to profiles for enhanced assessment
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS time_availability TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS implementation_timeline TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_focus_areas TEXT[];

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tool_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read access)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- RLS Policies for tools (public read access)
CREATE POLICY "Tools are viewable by everyone" 
ON public.tools 
FOR SELECT 
USING (true);

-- RLS Policies for user_tool_interactions (user-specific)
CREATE POLICY "Users can view their own tool interactions" 
ON public.user_tool_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool interactions" 
ON public.user_tool_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool interactions" 
ON public.user_tool_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for tool_recommendations (user-specific)
CREATE POLICY "Users can view their own tool recommendations" 
ON public.tool_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool recommendations" 
ON public.tool_recommendations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
BEFORE UPDATE ON public.tools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tool_interactions_updated_at
BEFORE UPDATE ON public.user_tool_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tool_recommendations_updated_at
BEFORE UPDATE ON public.tool_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();