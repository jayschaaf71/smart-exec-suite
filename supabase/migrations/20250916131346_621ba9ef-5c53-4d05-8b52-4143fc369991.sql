-- Add quick win indicators and progress tracking to tools table
ALTER TABLE tools ADD COLUMN IF NOT EXISTS is_quick_win BOOLEAN DEFAULT FALSE;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS setup_time TEXT;

-- Update existing tools to mark as quick wins with proper data
UPDATE tools SET 
  is_quick_win = TRUE,
  setup_time = '5-15 minutes'
WHERE name IN ('ChatGPT Plus', 'Perplexity Pro', 'Otter.ai', 'Gamma');

UPDATE tools SET 
  is_quick_win = TRUE,
  setup_time = '10-20 minutes'
WHERE name IN ('Slack AI', 'Copy.ai');

-- Create user tool progress table
CREATE TABLE IF NOT EXISTS user_tool_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'interested' CHECK (status IN ('interested', 'started', 'implementing', 'completed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_invested INTEGER DEFAULT 0,
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- Enable RLS on user_tool_progress
ALTER TABLE user_tool_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user_tool_progress
CREATE POLICY "Users can view their own progress" ON user_tool_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_tool_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_tool_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create analytics tracking table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  tool_id UUID REFERENCES tools(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_analytics
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for user_analytics
CREATE POLICY "Users can view their own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add trigger for updating updated_at on user_tool_progress
CREATE TRIGGER update_user_tool_progress_updated_at
BEFORE UPDATE ON user_tool_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();