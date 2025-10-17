-- Create supply chain batches table
CREATE TABLE public.supply_chain_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL UNIQUE,
  quantity_kg NUMERIC NOT NULL,
  harvest_date DATE NOT NULL,
  initial_quality_grade TEXT,
  blockchain_topic_id TEXT,
  blockchain_transaction_id TEXT,
  current_status TEXT NOT NULL DEFAULT 'harvested',
  current_location_lat NUMERIC,
  current_location_lng NUMERIC,
  destination_lat NUMERIC,
  destination_lng NUMERIC,
  buyer_id UUID REFERENCES public.buyer_profiles(id) ON DELETE SET NULL,
  estimated_delivery_date TIMESTAMP WITH TIME ZONE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,
  spoilage_risk_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create supply chain checkpoints table
CREATE TABLE public.supply_chain_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.supply_chain_batches(id) ON DELETE CASCADE,
  checkpoint_type TEXT NOT NULL,
  location_lat NUMERIC NOT NULL,
  location_lng NUMERIC NOT NULL,
  location_accuracy NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  verified_by TEXT,
  verification_method TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_score NUMERIC,
  tampering_detected BOOLEAN DEFAULT false,
  tampering_indicators JSONB,
  image_urls TEXT[],
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create supply chain quality checks table
CREATE TABLE public.supply_chain_quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.supply_chain_batches(id) ON DELETE CASCADE,
  checkpoint_id UUID REFERENCES public.supply_chain_checkpoints(id) ON DELETE SET NULL,
  check_type TEXT NOT NULL,
  quality_grade TEXT NOT NULL,
  quality_score NUMERIC NOT NULL,
  freshness_score NUMERIC,
  contamination_detected BOOLEAN DEFAULT false,
  contamination_type TEXT,
  storage_conditions JSONB,
  image_analysis JSONB,
  ai_confidence NUMERIC,
  visual_indicators JSONB,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create supply chain documents table
CREATE TABLE public.supply_chain_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.supply_chain_batches(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_number TEXT,
  issuer TEXT,
  issue_date DATE,
  expiry_date DATE,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_method TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  compliance_status TEXT,
  compliance_issues TEXT[],
  ai_analysis JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create supply chain logistics table
CREATE TABLE public.supply_chain_logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.supply_chain_batches(id) ON DELETE CASCADE,
  route_plan JSONB NOT NULL,
  optimized_route JSONB,
  estimated_duration_hours NUMERIC,
  estimated_cost NUMERIC,
  spoilage_risk_factors JSONB,
  temperature_requirements JSONB,
  handling_requirements TEXT[],
  delivery_priority TEXT NOT NULL DEFAULT 'normal',
  optimization_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.supply_chain_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_logistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supply_chain_batches
CREATE POLICY "Farmers can view their own batches"
  ON public.supply_chain_batches FOR SELECT
  USING (
    farmer_id IN (
      SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can create their own batches"
  ON public.supply_chain_batches FOR INSERT
  WITH CHECK (
    farmer_id IN (
      SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can update their own batches"
  ON public.supply_chain_batches FOR UPDATE
  USING (
    farmer_id IN (
      SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view assigned batches"
  ON public.supply_chain_batches FOR SELECT
  USING (
    buyer_id IN (
      SELECT id FROM public.buyer_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for supply_chain_checkpoints
CREATE POLICY "Users can view checkpoints for their batches"
  ON public.supply_chain_checkpoints FOR SELECT
  USING (
    batch_id IN (
      SELECT id FROM public.supply_chain_batches
      WHERE farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
         OR buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Service can manage checkpoints"
  ON public.supply_chain_checkpoints FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for supply_chain_quality_checks
CREATE POLICY "Users can view quality checks for their batches"
  ON public.supply_chain_quality_checks FOR SELECT
  USING (
    batch_id IN (
      SELECT id FROM public.supply_chain_batches
      WHERE farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
         OR buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Service can manage quality checks"
  ON public.supply_chain_quality_checks FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for supply_chain_documents
CREATE POLICY "Users can view documents for their batches"
  ON public.supply_chain_documents FOR SELECT
  USING (
    batch_id IN (
      SELECT id FROM public.supply_chain_batches
      WHERE farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
         OR buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Farmers can upload documents for their batches"
  ON public.supply_chain_documents FOR INSERT
  WITH CHECK (
    batch_id IN (
      SELECT id FROM public.supply_chain_batches
      WHERE farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for supply_chain_logistics
CREATE POLICY "Users can view logistics for their batches"
  ON public.supply_chain_logistics FOR SELECT
  USING (
    batch_id IN (
      SELECT id FROM public.supply_chain_batches
      WHERE farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
         OR buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Service can manage logistics"
  ON public.supply_chain_logistics FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_batches_farmer_id ON public.supply_chain_batches(farmer_id);
CREATE INDEX idx_batches_buyer_id ON public.supply_chain_batches(buyer_id);
CREATE INDEX idx_batches_status ON public.supply_chain_batches(current_status);
CREATE INDEX idx_checkpoints_batch_id ON public.supply_chain_checkpoints(batch_id);
CREATE INDEX idx_quality_checks_batch_id ON public.supply_chain_quality_checks(batch_id);
CREATE INDEX idx_documents_batch_id ON public.supply_chain_documents(batch_id);
CREATE INDEX idx_logistics_batch_id ON public.supply_chain_logistics(batch_id);

-- Create trigger for updated_at
CREATE TRIGGER update_supply_chain_batches_updated_at
  BEFORE UPDATE ON public.supply_chain_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supply_chain_logistics_updated_at
  BEFORE UPDATE ON public.supply_chain_logistics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.supply_chain_batches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.supply_chain_checkpoints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.supply_chain_quality_checks;