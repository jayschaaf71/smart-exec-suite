-- Create function to update recommendation scores
CREATE OR REPLACE FUNCTION public.update_recommendation_score(
  p_user_id UUID,
  p_tool_id UUID,
  p_score_change INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tool_recommendations 
  SET 
    recommendation_score = GREATEST(0, LEAST(100, recommendation_score + p_score_change)),
    updated_at = now()
  WHERE user_id = p_user_id AND tool_id = p_tool_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;