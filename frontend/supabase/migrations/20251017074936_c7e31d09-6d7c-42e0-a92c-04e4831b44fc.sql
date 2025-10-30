-- Create credit assessment dimensions table
CREATE TABLE public.credit_assessment_dimensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id),
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Satellite & Farm Data
  farm_area_verified BOOLEAN DEFAULT FALSE,
  crop_health_score NUMERIC CHECK (crop_health_score >= 0 AND crop_health_score <= 100),
  land_use_efficiency NUMERIC CHECK (land_use_efficiency >= 0 AND land_use_efficiency <= 100),
  satellite_data JSONB,
  
  -- Weather & Climate Risk
  climate_risk_score NUMERIC CHECK (climate_risk_score >= 0 AND climate_risk_score <= 100),
  drought_exposure NUMERIC CHECK (drought_exposure >= 0 AND drought_exposure <= 100),
  flood_risk NUMERIC CHECK (flood_risk >= 0 AND flood_risk <= 100),
  weather_data JSONB,
  
  -- Financial Behavior
  mobile_money_score NUMERIC CHECK (mobile_money_score >= 0 AND mobile_money_score <= 100),
  transaction_consistency NUMERIC CHECK (transaction_consistency >= 0 AND transaction_consistency <= 100),
  savings_pattern NUMERIC CHECK (savings_pattern >= 0 AND savings_pattern <= 100),
  financial_data JSONB,
  
  -- Social Trust
  community_verification_score NUMERIC CHECK (community_verification_score >= 0 AND community_verification_score <= 100),
  peer_endorsements INTEGER DEFAULT 0,
  network_strength NUMERIC CHECK (network_strength >= 0 AND network_strength <= 100),
  social_data JSONB,
  
  -- Historical Performance
  historical_yield_score NUMERIC CHECK (historical_yield_score >= 0 AND historical_yield_score <= 100),
  repayment_history_score NUMERIC CHECK (repayment_history_score >= 0 AND repayment_history_score <= 100),
  business_longevity_score NUMERIC CHECK (business_longevity_score >= 0 AND business_longevity_score <= 100),
  performance_data JSONB,
  
  -- Metadata
  data_completeness NUMERIC CHECK (data_completeness >= 0 AND data_completeness <= 100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create credit scores table
CREATE TABLE public.credit_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id),
  assessment_id UUID REFERENCES public.credit_assessment_dimensions(id),
  
  -- Overall Score
  overall_score NUMERIC NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  risk_category TEXT NOT NULL CHECK (risk_category IN ('minimal', 'low', 'moderate', 'high', 'very_high')),
  
  -- Confidence Metrics
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  confidence_interval_lower NUMERIC,
  confidence_interval_upper NUMERIC,
  
  -- Component Scores
  satellite_weight NUMERIC DEFAULT 0.20,
  weather_weight NUMERIC DEFAULT 0.15,
  financial_weight NUMERIC DEFAULT 0.25,
  social_weight NUMERIC DEFAULT 0.20,
  historical_weight NUMERIC DEFAULT 0.20,
  
  -- AI Explanation
  score_factors JSONB NOT NULL,
  improvement_recommendations JSONB,
  peer_comparison JSONB,
  
  -- Trend Analysis
  score_trend TEXT CHECK (score_trend IN ('improving', 'stable', 'declining')),
  previous_score NUMERIC,
  score_change NUMERIC,
  
  -- Loan Eligibility
  max_loan_amount NUMERIC,
  recommended_interest_rate NUMERIC,
  loan_term_months INTEGER,
  
  -- Model Info
  model_version TEXT NOT NULL,
  model_confidence TEXT CHECK (model_confidence IN ('low', 'medium', 'high')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create score history for tracking changes
CREATE TABLE public.credit_score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id),
  score_id UUID REFERENCES public.credit_scores(id),
  overall_score NUMERIC NOT NULL,
  risk_category TEXT NOT NULL,
  change_reason TEXT,
  triggered_by TEXT CHECK (triggered_by IN ('new_data', 'model_update', 'manual_review', 'scheduled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create improvement goals table
CREATE TABLE public.score_improvement_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id),
  dimension TEXT NOT NULL CHECK (dimension IN ('satellite', 'weather', 'financial', 'social', 'historical')),
  current_value NUMERIC NOT NULL,
  target_value NUMERIC NOT NULL,
  deadline DATE,
  action_items JSONB NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  progress_percentage NUMERIC DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create alerts table for significant score changes
CREATE TABLE public.credit_score_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id),
  score_id UUID REFERENCES public.credit_scores(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('score_drop', 'score_improvement', 'risk_increase', 'opportunity', 'data_issue')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  affected_dimensions JSONB,
  action_required TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.credit_assessment_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_improvement_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_score_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_assessment_dimensions
CREATE POLICY "Farmers can view their own assessments"
  ON public.credit_assessment_dimensions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = credit_assessment_dimensions.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can manage assessments"
  ON public.credit_assessment_dimensions FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- RLS Policies for credit_scores
CREATE POLICY "Farmers can view their own scores"
  ON public.credit_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = credit_scores.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can manage scores"
  ON public.credit_scores FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- RLS Policies for credit_score_history
CREATE POLICY "Farmers can view their score history"
  ON public.credit_score_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = credit_score_history.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can manage score history"
  ON public.credit_score_history FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- RLS Policies for score_improvement_goals
CREATE POLICY "Farmers can manage their improvement goals"
  ON public.score_improvement_goals FOR ALL
  USING (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = score_improvement_goals.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = score_improvement_goals.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- RLS Policies for credit_score_alerts
CREATE POLICY "Farmers can view and update their alerts"
  ON public.credit_score_alerts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = credit_score_alerts.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = credit_score_alerts.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_score_improvement_goals_updated_at
  BEFORE UPDATE ON public.score_improvement_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_credit_scores_farmer_active ON public.credit_scores(farmer_id, is_active);
CREATE INDEX idx_credit_score_history_farmer ON public.credit_score_history(farmer_id, created_at DESC);
CREATE INDEX idx_credit_alerts_farmer_unread ON public.credit_score_alerts(farmer_id, is_read);
CREATE INDEX idx_improvement_goals_farmer_status ON public.score_improvement_goals(farmer_id, status);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_score_alerts;