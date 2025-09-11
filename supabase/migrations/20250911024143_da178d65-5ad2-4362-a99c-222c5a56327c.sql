-- Create analytics tracking tables
CREATE TABLE public.user_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own analytics events" 
ON public.user_analytics_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics events" 
ON public.user_analytics_events 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create tool effectiveness tracking
CREATE TABLE public.tool_effectiveness_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID,
  metric_type TEXT NOT NULL, -- 'recommendation_accuracy', 'implementation_success', 'user_satisfaction'
  metric_value NUMERIC NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 1,
  time_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for tool metrics (admin only for now, but readable by all)
ALTER TABLE public.tool_effectiveness_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tool metrics are viewable by everyone" 
ON public.tool_effectiveness_metrics 
FOR SELECT 
USING (true);

-- Create user behavior insights table
CREATE TABLE public.user_behavior_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'engagement_pattern', 'learning_style', 'tool_preference', 'success_factor'
  insight_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC NOT NULL DEFAULT 0.5,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_behavior_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own behavior insights" 
ON public.user_behavior_insights 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create analytics summary table for quick dashboard queries
CREATE TABLE public.user_analytics_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_page_views INTEGER NOT NULL DEFAULT 0,
  total_tool_interactions INTEGER NOT NULL DEFAULT 0,
  avg_session_duration_minutes NUMERIC NOT NULL DEFAULT 0,
  most_active_day_of_week INTEGER, -- 0=Sunday, 6=Saturday
  most_active_hour_of_day INTEGER, -- 0-23
  preferred_tool_categories TEXT[],
  engagement_score NUMERIC NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own analytics summary" 
ON public.user_analytics_summary 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics summary" 
ON public.user_analytics_summary 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics summary" 
ON public.user_analytics_summary 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for analytics summary updates
CREATE TRIGGER update_user_analytics_summary_updated_at
BEFORE UPDATE ON public.user_analytics_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_analytics_events_user_id ON public.user_analytics_events(user_id);
CREATE INDEX idx_user_analytics_events_event_type ON public.user_analytics_events(event_type);
CREATE INDEX idx_user_analytics_events_created_at ON public.user_analytics_events(created_at);
CREATE INDEX idx_tool_effectiveness_metrics_tool_id ON public.tool_effectiveness_metrics(tool_id);
CREATE INDEX idx_tool_effectiveness_metrics_metric_type ON public.tool_effectiveness_metrics(metric_type);
CREATE INDEX idx_user_behavior_insights_user_id ON public.user_behavior_insights(user_id);
CREATE INDEX idx_user_behavior_insights_insight_type ON public.user_behavior_insights(insight_type);