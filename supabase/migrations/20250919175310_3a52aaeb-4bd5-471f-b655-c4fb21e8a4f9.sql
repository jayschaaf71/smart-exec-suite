-- CFO-specific assessment table
CREATE TABLE public.cfo_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_profile JSONB NOT NULL,
  current_stack JSONB NOT NULL,
  pain_points JSONB NOT NULL,
  goals JSONB NOT NULL,
  assessment_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cfo_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own CFO assessments"
ON public.cfo_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CFO assessments"
ON public.cfo_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CFO assessments"
ON public.cfo_assessments FOR UPDATE
USING (auth.uid() = user_id);

-- Industry-specific tool recommendations
CREATE TABLE public.cfo_tool_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id),
  industry_relevance_score INTEGER DEFAULT 0,
  implementation_priority INTEGER DEFAULT 1,
  estimated_roi_percentage INTEGER DEFAULT 0,
  setup_complexity TEXT DEFAULT 'medium',
  recommended_timeline TEXT,
  implementation_guide TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cfo_tool_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own CFO tool recommendations"
ON public.cfo_tool_recommendations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CFO tool recommendations"
ON public.cfo_tool_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CFO tool recommendations"
ON public.cfo_tool_recommendations FOR UPDATE
USING (auth.uid() = user_id);

-- Implementation tracking
CREATE TABLE public.tool_implementations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id),
  status TEXT DEFAULT 'planned', -- planned, in_progress, completed, abandoned
  progress_percentage INTEGER DEFAULT 0,
  time_invested_hours INTEGER DEFAULT 0,
  roi_achieved_percentage INTEGER DEFAULT 0,
  implementation_notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tool_implementations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tool implementations"
ON public.tool_implementations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool implementations"
ON public.tool_implementations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool implementations"
ON public.tool_implementations FOR UPDATE
USING (auth.uid() = user_id);

-- Success metrics tracking
CREATE TABLE public.user_success_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'time_saved_weekly', 'process_efficiency', 'cost_savings'
  metric_value NUMERIC NOT NULL,
  measurement_date DATE DEFAULT CURRENT_DATE,
  tool_id UUID REFERENCES public.tools(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_success_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own success metrics"
ON public.user_success_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own success metrics"
ON public.user_success_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own success metrics"
ON public.user_success_metrics FOR UPDATE
USING (auth.uid() = user_id);

-- Add update triggers
CREATE TRIGGER update_cfo_assessments_updated_at
BEFORE UPDATE ON public.cfo_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cfo_tool_recommendations_updated_at
BEFORE UPDATE ON public.cfo_tool_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tool_implementations_updated_at
BEFORE UPDATE ON public.tool_implementations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();