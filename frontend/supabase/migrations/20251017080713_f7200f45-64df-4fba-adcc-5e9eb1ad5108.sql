-- Add buyer ratings and reputation system
CREATE TABLE IF NOT EXISTS public.buyer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.buyer_profiles(id) ON DELETE CASCADE NOT NULL,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.farmer_buyer_matches(id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  payment_speed_rating NUMERIC CHECK (payment_speed_rating >= 1 AND payment_speed_rating <= 5),
  communication_rating NUMERIC CHECK (communication_rating >= 1 AND communication_rating <= 5),
  reliability_rating NUMERIC CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add price history tracking
CREATE TABLE IF NOT EXISTS public.crop_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type TEXT NOT NULL,
  region TEXT,
  price_per_kg NUMERIC NOT NULL,
  quality_grade TEXT,
  volume_kg NUMERIC,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add market trends and insights
CREATE TABLE IF NOT EXISTS public.market_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type TEXT NOT NULL,
  region TEXT,
  trend_type TEXT NOT NULL,
  trend_direction TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  trend_data JSONB NOT NULL,
  forecast_period TEXT,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add price alerts for farmers
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE NOT NULL,
  crop_type TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  alert_condition TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.buyer_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buyer_ratings
CREATE POLICY "Farmers can create ratings for their buyers"
  ON public.buyer_ratings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farmer_profiles
      WHERE farmer_profiles.id = buyer_ratings.farmer_id
      AND farmer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view ratings"
  ON public.buyer_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM farmer_profiles
      WHERE farmer_profiles.id = buyer_ratings.farmer_id
      AND farmer_profiles.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM buyer_profiles
      WHERE buyer_profiles.id = buyer_ratings.buyer_id
      AND buyer_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for crop_price_history
CREATE POLICY "Everyone can view price history"
  ON public.crop_price_history FOR SELECT
  USING (TRUE);

CREATE POLICY "Service can insert price history"
  ON public.crop_price_history FOR INSERT
  WITH CHECK (TRUE);

-- RLS Policies for market_trends
CREATE POLICY "Everyone can view market trends"
  ON public.market_trends FOR SELECT
  USING (TRUE);

CREATE POLICY "Service can manage market trends"
  ON public.market_trends FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- RLS Policies for price_alerts
CREATE POLICY "Farmers can manage their own price alerts"
  ON public.price_alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM farmer_profiles
      WHERE farmer_profiles.id = price_alerts.farmer_id
      AND farmer_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farmer_profiles
      WHERE farmer_profiles.id = price_alerts.farmer_id
      AND farmer_profiles.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_buyer_ratings_buyer ON buyer_ratings(buyer_id);
CREATE INDEX idx_buyer_ratings_farmer ON buyer_ratings(farmer_id);
CREATE INDEX idx_price_history_crop_date ON crop_price_history(crop_type, recorded_date);
CREATE INDEX idx_market_trends_crop ON market_trends(crop_type, analysis_date);
CREATE INDEX idx_price_alerts_farmer ON price_alerts(farmer_id, is_active);

-- Enable realtime for market trends (market_alerts already added)
ALTER PUBLICATION supabase_realtime ADD TABLE market_trends;