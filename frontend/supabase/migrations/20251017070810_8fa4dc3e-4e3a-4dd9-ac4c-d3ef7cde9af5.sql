-- Create crops table
CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  planting_date DATE NOT NULL,
  expected_harvest_date DATE,
  predicted_harvest_date DATE,
  land_area_acres DECIMAL(10,2),
  status TEXT DEFAULT 'active', -- 'active', 'harvested', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create crop images table
CREATE TABLE public.crop_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL, -- 'ground_photo', 'satellite', 'drone'
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create crop health analysis table
CREATE TABLE public.crop_health_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
  image_id UUID REFERENCES public.crop_images(id) ON DELETE CASCADE,
  growth_stage TEXT, -- 'germination', 'vegetative', 'flowering', 'fruiting', 'maturity'
  health_score DECIMAL(5,2), -- 0-100
  pest_detected BOOLEAN DEFAULT false,
  pest_type TEXT,
  pest_severity TEXT, -- 'low', 'medium', 'high', 'critical'
  disease_detected BOOLEAN DEFAULT false,
  disease_type TEXT,
  disease_severity TEXT,
  water_stress_level TEXT, -- 'none', 'low', 'moderate', 'high'
  nutrient_deficiency TEXT[],
  vegetation_index DECIMAL(5,3), -- NDVI or similar
  ai_analysis JSONB, -- Full AI response
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create crop forecasts table
CREATE TABLE public.crop_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
  forecast_type TEXT NOT NULL, -- 'yield', 'harvest_date', 'risk'
  predicted_value JSONB NOT NULL,
  confidence_score DECIMAL(5,2),
  forecast_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create crop alerts table
CREATE TABLE public.crop_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'irrigation', 'fertilization', 'pest_control', 'disease', 'harvest'
  severity TEXT NOT NULL, -- 'info', 'warning', 'urgent', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_required TEXT,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_health_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crops
CREATE POLICY "Users can view their own crops"
  ON public.crops FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = crops.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own crops"
  ON public.crops FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = crops.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own crops"
  ON public.crops FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = crops.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- RLS Policies for crop_images
CREATE POLICY "Users can view their crop images"
  ON public.crop_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = crop_images.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can upload crop images"
  ON public.crop_images FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = crop_images.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- RLS Policies for crop_health_analysis
CREATE POLICY "Users can view their crop analysis"
  ON public.crop_health_analysis FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.crops
    JOIN public.farmer_profiles ON farmer_profiles.id = crops.farmer_id
    WHERE crops.id = crop_health_analysis.crop_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can insert crop analysis"
  ON public.crop_health_analysis FOR INSERT
  WITH CHECK (true);

-- RLS Policies for crop_forecasts
CREATE POLICY "Users can view their crop forecasts"
  ON public.crop_forecasts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.crops
    JOIN public.farmer_profiles ON farmer_profiles.id = crops.farmer_id
    WHERE crops.id = crop_forecasts.crop_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can insert forecasts"
  ON public.crop_forecasts FOR INSERT
  WITH CHECK (true);

-- RLS Policies for crop_alerts
CREATE POLICY "Users can view their crop alerts"
  ON public.crop_alerts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = crop_alerts.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their crop alerts"
  ON public.crop_alerts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = crop_alerts.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can insert alerts"
  ON public.crop_alerts FOR INSERT
  WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.crop_health_analysis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crop_alerts;