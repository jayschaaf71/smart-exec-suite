-- Enhanced user assessment table
CREATE TABLE IF NOT EXISTS user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_knowledge_score INTEGER,
  current_tools JSONB,
  activity_breakdown JSONB,
  industry_category TEXT,
  industry_subcategory TEXT,
  role_level TEXT,
  team_size INTEGER,
  assessment_version TEXT DEFAULT '2.0',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity time allocation table
CREATE TABLE IF NOT EXISTS activity_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT,
  time_percentage INTEGER,
  importance_level INTEGER,
  ai_potential_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  community_type TEXT CHECK (community_type IN ('role', 'industry', 'hybrid')),
  role_filter TEXT,
  industry_filter TEXT,
  member_count INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community memberships
CREATE TABLE IF NOT EXISTS community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

-- Community messages
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_name TEXT DEFAULT 'general',
  message_content TEXT NOT NULL,
  parent_message_id UUID REFERENCES community_messages(id),
  attachments JSONB,
  mentions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Industry updates table
CREATE TABLE IF NOT EXISTS industry_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type TEXT NOT NULL,
  industry_category TEXT NOT NULL,
  industry_subcategory TEXT,
  week_of DATE NOT NULL,
  topic_1_title TEXT NOT NULL,
  topic_1_content TEXT NOT NULL,
  topic_2_title TEXT NOT NULL,
  topic_2_content TEXT NOT NULL,
  topic_3_title TEXT NOT NULL,
  topic_3_content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consulting services table
CREATE TABLE IF NOT EXISTS consulting_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT CHECK (service_type IN ('training', 'deep_dive', 'assessment', 'implementation')),
  service_name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  price_usd INTEGER,
  delivery_method TEXT CHECK (delivery_method IN ('remote', 'onsite', 'hybrid')),
  max_participants INTEGER,
  features TEXT[],
  prerequisites TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service bookings
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES consulting_services(id) ON DELETE CASCADE,
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  total_amount INTEGER,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  special_requirements TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User tool progress table
CREATE TABLE IF NOT EXISTS user_tool_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  status TEXT DEFAULT 'interested' CHECK (status IN ('interested', 'in_progress', 'completed', 'paused')),
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consulting_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tool_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own assessments" ON user_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments" ON user_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity allocations" ON activity_allocations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity allocations" ON activity_allocations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Communities are viewable by everyone" ON communities FOR SELECT USING (true);

CREATE POLICY "Users can view their memberships" ON community_memberships FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join communities" ON community_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Community members can view messages" ON community_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_memberships 
    WHERE community_id = community_messages.community_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Community members can send messages" ON community_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM community_memberships 
    WHERE community_id = community_messages.community_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Industry updates are viewable by everyone" ON industry_updates FOR SELECT USING (true);

CREATE POLICY "Consulting services are viewable by everyone" ON consulting_services FOR SELECT USING (true);

CREATE POLICY "Users can view their bookings" ON service_bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON service_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their tool progress" ON user_tool_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their tool progress" ON user_tool_progress 
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_tool_progress_updated_at
  BEFORE UPDATE ON public.user_tool_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();