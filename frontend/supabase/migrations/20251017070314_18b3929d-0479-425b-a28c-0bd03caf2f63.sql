-- Create farmer profiles table
CREATE TABLE public.farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  farm_location TEXT,
  farm_size_acres DECIMAL(10,2),
  primary_crops TEXT[],
  years_farming INTEGER,
  community_network_size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assessment data sources table
CREATE TABLE public.assessment_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'satellite', 'weather', 'soil', 'transaction', 'social', 'yield_prediction'
  data_json JSONB NOT NULL,
  confidence_score DECIMAL(5,2), -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create farmer trust scores table
CREATE TABLE public.farmer_trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  overall_score DECIMAL(5,2) NOT NULL, -- 0-100
  satellite_score DECIMAL(5,2),
  weather_score DECIMAL(5,2),
  soil_score DECIMAL(5,2),
  transaction_score DECIMAL(5,2),
  social_score DECIMAL(5,2),
  yield_prediction_score DECIMAL(5,2),
  risk_level TEXT, -- 'low', 'medium', 'high', 'very_high'
  loan_recommendation TEXT, -- 'approve', 'review', 'reject'
  confidence_percentage DECIMAL(5,2),
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create loan applications table
CREATE TABLE public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  trust_score_id UUID REFERENCES public.farmer_trust_scores(id),
  loan_amount DECIMAL(12,2) NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'under_review'
  ai_recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farmer_profiles
CREATE POLICY "Users can view their own profile"
  ON public.farmer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON public.farmer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.farmer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for assessment_data_sources
CREATE POLICY "Users can view their assessment data"
  ON public.assessment_data_sources FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = assessment_data_sources.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their assessment data"
  ON public.assessment_data_sources FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = assessment_data_sources.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- RLS Policies for farmer_trust_scores
CREATE POLICY "Users can view their trust scores"
  ON public.farmer_trust_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = farmer_trust_scores.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can insert trust scores"
  ON public.farmer_trust_scores FOR INSERT
  WITH CHECK (true);

-- RLS Policies for loan_applications
CREATE POLICY "Users can view their loan applications"
  ON public.loan_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = loan_applications.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can create loan applications"
  ON public.loan_applications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = loan_applications.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_farmer_profiles_updated_at
  BEFORE UPDATE ON public.farmer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for trust scores
ALTER PUBLICATION supabase_realtime ADD TABLE public.farmer_trust_scores;