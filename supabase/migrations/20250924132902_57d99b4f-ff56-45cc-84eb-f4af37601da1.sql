-- Phase 2: Advanced CFO Features Database Schema

-- Financial data uploads and storage
CREATE TABLE public.financial_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data_type TEXT NOT NULL, -- 'budget', 'actual', 'forecast', 'historical'
  period_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'annual'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data_entries JSONB NOT NULL DEFAULT '{}',
  upload_source TEXT, -- 'manual', 'csv', 'api', 'integration'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI variance analysis results
CREATE TABLE public.variance_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_period DATE NOT NULL,
  budget_vs_actual JSONB NOT NULL DEFAULT '{}',
  key_variances JSONB NOT NULL DEFAULT '[]',
  ai_insights TEXT NOT NULL,
  severity_score INTEGER DEFAULT 1, -- 1-5 scale
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cash flow predictions
CREATE TABLE public.cash_flow_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prediction_date DATE NOT NULL,
  weeks_ahead INTEGER NOT NULL DEFAULT 13,
  predicted_cash_flow JSONB NOT NULL DEFAULT '{}',
  confidence_intervals JSONB DEFAULT '{}',
  key_assumptions JSONB DEFAULT '[]',
  ai_analysis TEXT,
  scenario_name TEXT DEFAULT 'base_case',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Anomaly detection results
CREATE TABLE public.financial_anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  detected_date DATE NOT NULL,
  anomaly_type TEXT NOT NULL, -- 'expense_spike', 'revenue_drop', 'unusual_transaction', etc.
  affected_accounts JSONB DEFAULT '[]',
  anomaly_score NUMERIC NOT NULL, -- 0-1 confidence score
  description TEXT NOT NULL,
  ai_explanation TEXT,
  investigation_status TEXT DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'false_positive'
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scenario modeling
CREATE TABLE public.financial_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario_name TEXT NOT NULL,
  scenario_type TEXT NOT NULL, -- 'best_case', 'worst_case', 'custom'
  assumptions JSONB NOT NULL DEFAULT '{}',
  projections JSONB NOT NULL DEFAULT '{}',
  key_metrics JSONB DEFAULT '{}',
  ai_insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Board presentation automation
CREATE TABLE public.board_presentations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  presentation_title TEXT NOT NULL,
  presentation_date DATE NOT NULL,
  slides_data JSONB NOT NULL DEFAULT '[]',
  executive_summary TEXT,
  key_insights JSONB DEFAULT '[]',
  talking_points JSONB DEFAULT '[]',
  chart_configurations JSONB DEFAULT '[]',
  presentation_status TEXT DEFAULT 'draft', -- 'draft', 'review', 'final'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variance_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_presentations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
-- Financial data policies
CREATE POLICY "Users can view their own financial data" 
ON public.financial_data FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial data" 
ON public.financial_data FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial data" 
ON public.financial_data FOR UPDATE 
USING (auth.uid() = user_id);

-- Variance analysis policies
CREATE POLICY "Users can view their own variance analysis" 
ON public.variance_analysis FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own variance analysis" 
ON public.variance_analysis FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Cash flow predictions policies
CREATE POLICY "Users can view their own cash flow predictions" 
ON public.cash_flow_predictions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cash flow predictions" 
ON public.cash_flow_predictions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Financial anomalies policies
CREATE POLICY "Users can view their own financial anomalies" 
ON public.financial_anomalies FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial anomalies" 
ON public.financial_anomalies FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial anomalies" 
ON public.financial_anomalies FOR UPDATE 
USING (auth.uid() = user_id);

-- Financial scenarios policies
CREATE POLICY "Users can view their own financial scenarios" 
ON public.financial_scenarios FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial scenarios" 
ON public.financial_scenarios FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial scenarios" 
ON public.financial_scenarios FOR UPDATE 
USING (auth.uid() = user_id);

-- Board presentations policies
CREATE POLICY "Users can view their own board presentations" 
ON public.board_presentations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own board presentations" 
ON public.board_presentations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own board presentations" 
ON public.board_presentations FOR UPDATE 
USING (auth.uid() = user_id);

-- Create update triggers for updated_at columns
CREATE TRIGGER update_financial_data_updated_at
BEFORE UPDATE ON public.financial_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_anomalies_updated_at
BEFORE UPDATE ON public.financial_anomalies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_scenarios_updated_at
BEFORE UPDATE ON public.financial_scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_board_presentations_updated_at
BEFORE UPDATE ON public.board_presentations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();