-- Create farming advice sessions table
CREATE TABLE public.farming_advice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id),
  session_type TEXT NOT NULL CHECK (session_type IN ('chat', 'voice', 'whatsapp', 'ussd')),
  language TEXT NOT NULL DEFAULT 'en',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_data JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create farming plans table
CREATE TABLE public.farming_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id),
  crop_type TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  soil_analysis JSONB DEFAULT NULL,
  climate_data JSONB DEFAULT NULL,
  resource_assessment JSONB DEFAULT NULL,
  recommendations JSONB NOT NULL,
  success_probability NUMERIC CHECK (success_probability >= 0 AND success_probability <= 100),
  estimated_yield NUMERIC,
  estimated_revenue NUMERIC,
  learning_source JSONB DEFAULT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create alert subscriptions table
CREATE TABLE public.alert_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('weather', 'market', 'pest', 'disease', 'harvest')),
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('app', 'sms', 'whatsapp', 'ussd')),
  preferences JSONB DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create farmer knowledge base table
CREATE TABLE public.farmer_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id),
  crop_type TEXT NOT NULL,
  farm_conditions JSONB NOT NULL,
  practices_used JSONB NOT NULL,
  outcomes JSONB NOT NULL,
  success_score NUMERIC CHECK (success_score >= 0 AND success_score <= 100),
  verified BOOLEAN DEFAULT FALSE,
  verification_source TEXT,
  contributed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create weather alerts table
CREATE TABLE public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recommendations JSONB DEFAULT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create market alerts table
CREATE TABLE public.market_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_type TEXT NOT NULL,
  region TEXT,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_surge', 'high_demand', 'new_buyer', 'export_opportunity')),
  current_price NUMERIC,
  predicted_price NUMERIC,
  opportunity_details JSONB NOT NULL,
  action_recommended TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.farming_advice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farming_advice_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.farming_advice_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = farming_advice_sessions.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own sessions"
  ON public.farming_advice_sessions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = farming_advice_sessions.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own sessions"
  ON public.farming_advice_sessions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = farming_advice_sessions.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- RLS Policies for farming_plans
CREATE POLICY "Users can view their own farming plans"
  ON public.farming_plans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = farming_plans.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own farming plans"
  ON public.farming_plans FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = farming_plans.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own farming plans"
  ON public.farming_plans FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = farming_plans.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- RLS Policies for alert_subscriptions
CREATE POLICY "Users can manage their own alert subscriptions"
  ON public.alert_subscriptions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = alert_subscriptions.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = alert_subscriptions.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- RLS Policies for farmer_knowledge_base
CREATE POLICY "Users can view verified knowledge"
  ON public.farmer_knowledge_base FOR SELECT
  USING (verified = TRUE);

CREATE POLICY "Users can contribute their own knowledge"
  ON public.farmer_knowledge_base FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM farmer_profiles
    WHERE farmer_profiles.id = farmer_knowledge_base.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- RLS Policies for weather_alerts
CREATE POLICY "Everyone can view weather alerts"
  ON public.weather_alerts FOR SELECT
  USING (TRUE);

CREATE POLICY "Service can manage weather alerts"
  ON public.weather_alerts FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- RLS Policies for market_alerts
CREATE POLICY "Everyone can view market alerts"
  ON public.market_alerts FOR SELECT
  USING (TRUE);

CREATE POLICY "Service can manage market alerts"
  ON public.market_alerts FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Create triggers for updated_at
CREATE TRIGGER update_farming_advice_sessions_updated_at
  BEFORE UPDATE ON public.farming_advice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farming_plans_updated_at
  BEFORE UPDATE ON public.farming_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.farming_advice_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_alerts;