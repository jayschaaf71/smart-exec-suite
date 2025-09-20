-- Create tables for Community Hub functionality
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create table for community memberships
CREATE TABLE IF NOT EXISTS public.community_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, community_id)
);

-- Create table for community messages
CREATE TABLE IF NOT EXISTS public.community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'discussion',
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  parent_message_id UUID REFERENCES public.community_messages(id) ON DELETE CASCADE
);

-- Create table for consulting services
CREATE TABLE IF NOT EXISTS public.consulting_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_range TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  consultant_name TEXT NOT NULL,
  consultant_expertise TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0.0,
  reviews_count INTEGER DEFAULT 0,
  outcomes TEXT[] DEFAULT '{}',
  next_availability DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for service bookings
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.consulting_services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_start_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  consultant_notes TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI assessments
CREATE TABLE IF NOT EXISTS public.ai_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  assessment_data JSONB NOT NULL DEFAULT '{}',
  ai_recommendations JSONB NOT NULL DEFAULT '{}',
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for communities
CREATE POLICY "Communities are viewable by everyone" 
ON public.communities FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create communities" 
ON public.communities FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Create RLS policies for community memberships
CREATE POLICY "Users can view community memberships" 
ON public.community_memberships FOR SELECT USING (true);

CREATE POLICY "Users can manage their own memberships" 
ON public.community_memberships FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for community messages
CREATE POLICY "Users can view community messages" 
ON public.community_messages FOR SELECT USING (true);

CREATE POLICY "Users can create messages" 
ON public.community_messages FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own messages" 
ON public.community_messages FOR UPDATE 
USING (auth.uid() = author_id);

-- Create RLS policies for consulting services
CREATE POLICY "Consulting services are viewable by everyone" 
ON public.consulting_services FOR SELECT USING (is_active = true);

-- Create RLS policies for service bookings
CREATE POLICY "Users can view their own bookings" 
ON public.service_bookings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.service_bookings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.service_bookings FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for AI assessments
CREATE POLICY "Users can view their own assessments" 
ON public.ai_assessments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.ai_assessments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.ai_assessments FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_communities_updated_at
BEFORE UPDATE ON public.communities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_messages_updated_at
BEFORE UPDATE ON public.community_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consulting_services_updated_at
BEFORE UPDATE ON public.consulting_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_bookings_updated_at
BEFORE UPDATE ON public.service_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_assessments_updated_at
BEFORE UPDATE ON public.ai_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();