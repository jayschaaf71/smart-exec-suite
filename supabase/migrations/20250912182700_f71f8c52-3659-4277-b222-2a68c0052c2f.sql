-- Add user recommendations tracking table
CREATE TABLE IF NOT EXISTS public.user_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_id UUID REFERENCES public.tools(id),
  recommendation_reason TEXT,
  priority_order INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'implemented')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for user recommendations
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for user recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.user_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" 
ON public.user_recommendations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations" 
ON public.user_recommendations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add progress status to existing user_implementation_progress if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_implementation_progress' 
                 AND column_name = 'implementation_status') THEN
    ALTER TABLE public.user_implementation_progress 
    ADD COLUMN implementation_status TEXT DEFAULT 'interested' 
    CHECK (implementation_status IN ('interested', 'trying', 'implementing', 'mastered'));
  END IF;
END $$;

-- Add trigger for updated_at on user_recommendations
CREATE TRIGGER update_user_recommendations_updated_at
BEFORE UPDATE ON public.user_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();