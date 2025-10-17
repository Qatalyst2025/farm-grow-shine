-- Create buyer profiles table
CREATE TABLE public.buyer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  buyer_type TEXT NOT NULL, -- 'wholesale', 'retail', 'restaurant', 'export'
  preferred_crops TEXT[] DEFAULT '{}',
  preferred_certifications TEXT[] DEFAULT '{}', -- 'organic', 'fair_trade', 'gmo_free'
  max_distance_km NUMERIC,
  min_quality_score NUMERIC DEFAULT 3.0,
  purchase_frequency TEXT, -- 'daily', 'weekly', 'monthly'
  average_order_size NUMERIC,
  preferred_delivery_method TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchase history table
CREATE TABLE public.purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.buyer_profiles(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  price_per_kg NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  quality_rating NUMERIC, -- 1-5 stars
  delivery_rating NUMERIC, -- 1-5 stars
  purchase_date TIMESTAMPTZ NOT NULL,
  season TEXT,
  certifications TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create market demand forecasts table
CREATE TABLE public.market_demand_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type TEXT NOT NULL,
  forecast_date DATE NOT NULL,
  predicted_demand_kg NUMERIC NOT NULL,
  predicted_price_per_kg NUMERIC NOT NULL,
  confidence_score NUMERIC, -- 0-1
  demand_trend TEXT, -- 'increasing', 'stable', 'decreasing'
  price_trend TEXT, -- 'rising', 'stable', 'falling'
  seasonal_factor NUMERIC,
  market_conditions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crop_type, forecast_date)
);

-- Create farmer-buyer matches table
CREATE TABLE public.farmer_buyer_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.buyer_profiles(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
  match_score NUMERIC NOT NULL, -- 0-100
  match_reasons JSONB, -- {"quality": 95, "location": 85, "timing": 90, "certification": 100}
  recommended_price NUMERIC,
  potential_revenue NUMERIC,
  distance_km NUMERIC,
  delivery_date DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'negotiating', 'accepted', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create planting recommendations table
CREATE TABLE public.planting_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  recommended_planting_date DATE NOT NULL,
  expected_harvest_date DATE NOT NULL,
  predicted_market_price NUMERIC,
  predicted_demand_level TEXT, -- 'low', 'medium', 'high', 'very_high'
  expected_profit_per_acre NUMERIC,
  confidence_score NUMERIC, -- 0-1
  reasoning JSONB, -- AI explanation of recommendation
  market_forecast JSONB,
  weather_factors JSONB,
  competition_level TEXT, -- 'low', 'medium', 'high'
  status TEXT DEFAULT 'active', -- 'active', 'implemented', 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_buyer_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planting_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buyer_profiles
CREATE POLICY "Users can view their own buyer profile"
  ON public.buyer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own buyer profile"
  ON public.buyer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buyer profile"
  ON public.buyer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for purchase_history
CREATE POLICY "Buyers can view their purchase history"
  ON public.purchase_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.buyer_profiles
    WHERE buyer_profiles.id = purchase_history.buyer_id
    AND buyer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Farmers can view their sales history"
  ON public.purchase_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = purchase_history.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can insert purchase history"
  ON public.purchase_history FOR INSERT
  WITH CHECK (true);

-- RLS Policies for market_demand_forecasts
CREATE POLICY "Everyone can view market forecasts"
  ON public.market_demand_forecasts FOR SELECT
  USING (true);

CREATE POLICY "Service can insert market forecasts"
  ON public.market_demand_forecasts FOR INSERT
  WITH CHECK (true);

-- RLS Policies for farmer_buyer_matches
CREATE POLICY "Farmers can view their matches"
  ON public.farmer_buyer_matches FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = farmer_buyer_matches.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Buyers can view their matches"
  ON public.farmer_buyer_matches FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.buyer_profiles
    WHERE buyer_profiles.id = farmer_buyer_matches.buyer_id
    AND buyer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can manage matches"
  ON public.farmer_buyer_matches FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Farmers can update match status"
  ON public.farmer_buyer_matches FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = farmer_buyer_matches.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- RLS Policies for planting_recommendations
CREATE POLICY "Farmers can view their recommendations"
  ON public.planting_recommendations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = planting_recommendations.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can insert recommendations"
  ON public.planting_recommendations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Farmers can update recommendation status"
  ON public.planting_recommendations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = planting_recommendations.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_buyer_profiles_updated_at
  BEFORE UPDATE ON public.buyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farmer_buyer_matches_updated_at
  BEFORE UPDATE ON public.farmer_buyer_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for matches and recommendations
ALTER PUBLICATION supabase_realtime ADD TABLE public.farmer_buyer_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.planting_recommendations;