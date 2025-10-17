-- Create verification submissions table
CREATE TABLE public.verification_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL, -- 'farm_ownership', 'crop_quality', 'identity'
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'flagged'
  image_urls TEXT[] DEFAULT '{}',
  geolocation JSONB, -- {lat, lng, accuracy, timestamp}
  metadata JSONB, -- Additional context
  ai_analysis JSONB, -- Computer vision results
  verification_score NUMERIC, -- 0-100
  fraud_flags JSONB, -- Array of detected issues
  verified_by UUID, -- Reference to verifier user
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create fraud detection logs table
CREATE TABLE public.fraud_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'loan_application', 'transaction', 'user', 'submission'
  entity_id UUID NOT NULL,
  fraud_score NUMERIC NOT NULL, -- 0-100, higher = more suspicious
  detection_method TEXT NOT NULL, -- 'pattern_recognition', 'anomaly_detection', 'behavioral', 'image_analysis'
  fraud_indicators JSONB NOT NULL, -- Specific suspicious patterns found
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  ai_confidence NUMERIC, -- 0-1
  status TEXT DEFAULT 'flagged', -- 'flagged', 'investigating', 'confirmed', 'false_positive', 'resolved'
  investigated_by UUID,
  investigation_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transaction monitoring table
CREATE TABLE public.transaction_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL, -- 'loan', 'payment', 'sale', 'purchase'
  transaction_id UUID,
  from_user_id UUID,
  to_user_id UUID,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  transaction_data JSONB,
  anomaly_score NUMERIC, -- 0-100
  anomaly_reasons JSONB, -- Why flagged as suspicious
  behavioral_patterns JSONB, -- User behavior analysis
  network_analysis JSONB, -- Trust network connections
  status TEXT DEFAULT 'normal', -- 'normal', 'suspicious', 'blocked', 'verified'
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create behavioral biometrics table
CREATE TABLE public.behavioral_biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  biometric_type TEXT NOT NULL, -- 'typing', 'mouse', 'touch', 'device'
  biometric_data JSONB NOT NULL, -- Typing speed, mouse patterns, touch pressure, etc.
  device_fingerprint JSONB, -- Device characteristics
  location_data JSONB, -- IP, geolocation
  risk_score NUMERIC, -- 0-100
  anomaly_detected BOOLEAN DEFAULT false,
  anomaly_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trust network nodes table
CREATE TABLE public.trust_network_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL, -- 'farmer', 'buyer', 'lender', 'verifier'
  initial_trust_score NUMERIC DEFAULT 50, -- Starting score
  current_trust_score NUMERIC DEFAULT 50, -- 0-100, updated dynamically
  trust_level TEXT DEFAULT 'new', -- 'new', 'building', 'established', 'verified', 'suspicious', 'blocked'
  verification_count INTEGER DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,
  fraud_reports INTEGER DEFAULT 0,
  peer_ratings JSONB, -- Ratings from other users
  historical_behavior JSONB, -- Behavior patterns over time
  network_connections INTEGER DEFAULT 0, -- Number of trusted connections
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trust network edges table (relationships)
CREATE TABLE public.trust_network_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node_id UUID REFERENCES public.trust_network_nodes(id) ON DELETE CASCADE,
  to_node_id UUID REFERENCES public.trust_network_nodes(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'transaction', 'verification', 'referral', 'cooperative'
  trust_weight NUMERIC DEFAULT 0.5, -- 0-1, strength of trust relationship
  interaction_count INTEGER DEFAULT 0,
  successful_interactions INTEGER DEFAULT 0,
  last_interaction TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_node_id, to_node_id)
);

-- Create verification quality checks table
CREATE TABLE public.verification_quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.verification_submissions(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL, -- 'geolocation', 'image_quality', 'metadata', 'consistency'
  check_result TEXT NOT NULL, -- 'passed', 'failed', 'warning'
  quality_score NUMERIC, -- 0-100
  issues_found JSONB,
  recommendations JSONB,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_network_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_network_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_quality_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verification_submissions
CREATE POLICY "Users can view their own submissions"
  ON public.verification_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = verification_submissions.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own submissions"
  ON public.verification_submissions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = verification_submissions.farmer_id
    AND farmer_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Service can manage submissions"
  ON public.verification_submissions FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for fraud_detection_logs
CREATE POLICY "Users can view fraud logs related to them"
  ON public.fraud_detection_logs FOR SELECT
  USING (
    entity_type IN ('loan_application', 'transaction') AND
    EXISTS (
      SELECT 1 FROM public.farmer_profiles
      WHERE farmer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can manage fraud logs"
  ON public.fraud_detection_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for transaction_monitoring
CREATE POLICY "Users can view their own transactions"
  ON public.transaction_monitoring FOR SELECT
  USING (
    from_user_id = auth.uid() OR to_user_id = auth.uid()
  );

CREATE POLICY "Service can manage transaction monitoring"
  ON public.transaction_monitoring FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for behavioral_biometrics
CREATE POLICY "Users can view their own biometrics"
  ON public.behavioral_biometrics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service can insert biometrics"
  ON public.behavioral_biometrics FOR INSERT
  WITH CHECK (true);

-- RLS Policies for trust_network_nodes
CREATE POLICY "Users can view all trust nodes"
  ON public.trust_network_nodes FOR SELECT
  USING (true);

CREATE POLICY "Service can manage trust nodes"
  ON public.trust_network_nodes FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for trust_network_edges
CREATE POLICY "Users can view network edges"
  ON public.trust_network_edges FOR SELECT
  USING (true);

CREATE POLICY "Service can manage network edges"
  ON public.trust_network_edges FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for verification_quality_checks
CREATE POLICY "Users can view quality checks for their submissions"
  ON public.verification_quality_checks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.verification_submissions vs
    JOIN public.farmer_profiles fp ON vs.farmer_id = fp.id
    WHERE vs.id = verification_quality_checks.submission_id
    AND fp.user_id = auth.uid()
  ));

CREATE POLICY "Service can manage quality checks"
  ON public.verification_quality_checks FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_verification_submissions_farmer ON public.verification_submissions(farmer_id);
CREATE INDEX idx_verification_submissions_status ON public.verification_submissions(verification_status);
CREATE INDEX idx_fraud_detection_entity ON public.fraud_detection_logs(entity_type, entity_id);
CREATE INDEX idx_fraud_detection_risk ON public.fraud_detection_logs(risk_level, status);
CREATE INDEX idx_transaction_monitoring_users ON public.transaction_monitoring(from_user_id, to_user_id);
CREATE INDEX idx_behavioral_biometrics_user ON public.behavioral_biometrics(user_id, created_at);
CREATE INDEX idx_trust_network_nodes_user ON public.trust_network_nodes(user_id);
CREATE INDEX idx_trust_network_edges_nodes ON public.trust_network_edges(from_node_id, to_node_id);

-- Create triggers for updated_at
CREATE TRIGGER update_verification_submissions_updated_at
  BEFORE UPDATE ON public.verification_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trust_network_nodes_updated_at
  BEFORE UPDATE ON public.trust_network_nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trust_network_edges_updated_at
  BEFORE UPDATE ON public.trust_network_edges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fraud_detection_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_monitoring;