-- Add setup difficulty and time estimates to tools table
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS setup_time_estimate_weeks INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS setup_complexity_score INTEGER DEFAULT 3; -- 1-5 scale

-- Add industry-specific scoring to tools table  
ALTER TABLE public.tools
ADD COLUMN IF NOT EXISTS industry_specific_score JSONB DEFAULT '{}';

-- Update existing tools with setup estimates based on difficulty
UPDATE public.tools 
SET setup_time_estimate_weeks = CASE 
  WHEN setup_difficulty = 'easy' THEN 1
  WHEN setup_difficulty = 'medium' THEN 2
  WHEN setup_difficulty = 'hard' THEN 4
  ELSE 2
END,
setup_complexity_score = CASE 
  WHEN setup_difficulty = 'easy' THEN 2
  WHEN setup_difficulty = 'medium' THEN 3
  WHEN setup_difficulty = 'hard' THEN 5
  ELSE 3
END
WHERE setup_time_estimate_weeks IS NULL;

-- Add sample industry-specific scoring for tools
UPDATE public.tools 
SET industry_specific_score = jsonb_build_object(
  'manufacturing', 85,
  'healthcare', 70,
  'retail', 80,
  'financial_services', 90,
  'technology', 95
)
WHERE name ILIKE '%power%' OR name ILIKE '%tableau%' OR name ILIKE '%excel%';

-- Add template library table
CREATE TABLE IF NOT EXISTS public.template_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'Excel',
  file_size TEXT,
  download_url TEXT,
  preview_url TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'Medium',
  target_industries TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on template library
ALTER TABLE public.template_library ENABLE ROW LEVEL SECURITY;

-- Create policies for template library
CREATE POLICY "Templates are viewable by everyone" 
ON public.template_library 
FOR SELECT 
USING (is_active = true);

-- Add success case studies table
CREATE TABLE IF NOT EXISTS public.success_case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_size TEXT,
  revenue_range TEXT,
  challenge_description TEXT NOT NULL,
  solution_summary TEXT NOT NULL,
  results_data JSONB NOT NULL DEFAULT '{}',
  testimonial JSONB,
  tools_used TEXT[] DEFAULT '{}',
  implementation_timeline TEXT,
  roi_percentage INTEGER,
  cost_savings_annual INTEGER,
  time_saved_monthly INTEGER,
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on case studies
ALTER TABLE public.success_case_studies ENABLE ROW LEVEL SECURITY;

-- Create policies for case studies
CREATE POLICY "Case studies are viewable by everyone" 
ON public.success_case_studies 
FOR SELECT 
USING (is_public = true);

-- Insert sample templates
INSERT INTO public.template_library (name, description, category, file_type, file_size, difficulty_level, target_industries, tags) VALUES
('CFO Monthly Dashboard', 'Comprehensive executive dashboard with KPIs, cash flow, and variance analysis', 'Financial Reporting', 'Excel', '2.4 MB', 'Medium', ARRAY['All Industries'], ARRAY['Dashboard', 'KPI', 'Executive']),
('Budget vs Actual Analysis', 'Automated variance analysis with drill-down capabilities', 'Budgeting & Forecasting', 'Excel', '1.8 MB', 'Easy', ARRAY['Manufacturing', 'Retail'], ARRAY['Budget', 'Variance', 'Analysis']),
('Cash Flow Forecasting Model', '13-week rolling cash flow forecast with scenario planning', 'Cash Management', 'Excel', '3.2 MB', 'Advanced', ARRAY['All Industries'], ARRAY['Cash Flow', 'Forecasting']);

-- Insert sample case studies
INSERT INTO public.success_case_studies (company_name, industry, company_size, revenue_range, challenge_description, solution_summary, results_data, roi_percentage, cost_savings_annual, time_saved_monthly, is_featured) VALUES
('TechFlow Manufacturing', 'Manufacturing', '1,200 employees', '$350M', 'Manual financial reporting took 40+ hours per month, board presentations required 3 weeks of preparation', 'Implemented automated dashboards, self-updating board templates, and automated variance analysis', '{"timeSaved": "32 hours/month", "efficiency": "75% faster reporting"}', 420, 180000, 32, true),
('HealthCare Plus', 'Healthcare', '800 employees', '$120M', 'Complex regulatory reporting, manual cash flow forecasting, difficulty tracking KPIs', 'Deployed automated compliance reporting, built rolling cash flow models, created KPI dashboards', '{"timeSaved": "28 hours/month", "efficiency": "60% faster close"}', 310, 95000, 28, true);