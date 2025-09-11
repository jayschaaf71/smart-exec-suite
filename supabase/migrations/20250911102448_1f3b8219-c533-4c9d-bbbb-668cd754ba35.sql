-- Create notifications table for user notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'achievement', 'recommendation', 'reminder', 'system', 'progress'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  notification_types JSONB DEFAULT '{
    "achievements": true,
    "recommendations": true,
    "reminders": true,
    "progress": true,
    "system": true
  }'::jsonb,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for notification preferences
CREATE POLICY "Users can view their own notification preferences" 
ON public.notification_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" 
ON public.notification_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" 
ON public.notification_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for preferences timestamp updates
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notifications automatically
CREATE OR REPLACE FUNCTION public.create_achievement_notification()
RETURNS TRIGGER AS $$
DECLARE
  achievement_name TEXT;
BEGIN
  -- Get achievement name
  SELECT name INTO achievement_name 
  FROM public.achievements 
  WHERE id = NEW.achievement_id;
  
  -- Create notification
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
    '🏆 Achievement Unlocked!',
    'Congratulations! You''ve earned the "' || achievement_name || '" achievement.',
    jsonb_build_object(
      'achievement_id', NEW.achievement_id,
      'achievement_name', achievement_name
    ),
    'high'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for achievement notifications
CREATE TRIGGER achievement_notification_trigger
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.create_achievement_notification();

-- Function to create progress notifications
CREATE OR REPLACE FUNCTION public.create_progress_notification()
RETURNS TRIGGER AS $$
DECLARE
  guide_title TEXT;
  completion_percentage INTEGER;
BEGIN
  -- Only trigger for completion status changes
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get guide title
    SELECT title INTO guide_title 
    FROM public.implementation_guides 
    WHERE id = NEW.guide_id;
    
    -- Create completion notification
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data,
      priority
    ) VALUES (
      NEW.user_id,
      'progress',
      '✅ Implementation Complete!',
      'You''ve successfully completed the "' || guide_title || '" implementation guide.',
      jsonb_build_object(
        'guide_id', NEW.guide_id,
        'guide_title', guide_title,
        'completion_type', 'implementation'
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for implementation progress notifications
CREATE TRIGGER implementation_progress_notification_trigger
  AFTER UPDATE ON public.user_implementation_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.create_progress_notification();