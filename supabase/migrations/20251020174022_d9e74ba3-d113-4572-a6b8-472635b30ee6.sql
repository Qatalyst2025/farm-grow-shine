-- Create enum for alert types
CREATE TYPE public.alert_type AS ENUM ('weather', 'pest_disease', 'market_price', 'government_program', 'general');

-- Create enum for alert severity
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical', 'emergency');

-- Create emergency alerts table
CREATE TABLE public.emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type public.alert_type NOT NULL,
  severity public.alert_severity NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  translations JSONB DEFAULT '{}'::jsonb, -- Multi-language support
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  target_regions TEXT[] DEFAULT '{}'::text[],
  target_crop_types TEXT[] DEFAULT '{}'::text[],
  affected_users_count INTEGER DEFAULT 0,
  acknowledgement_required BOOLEAN DEFAULT true,
  action_items JSONB DEFAULT '[]'::jsonb, -- Follow-up actions
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create alert acknowledgements table
CREATE TABLE public.alert_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.emergency_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  location_data JSONB,
  notes TEXT,
  UNIQUE(alert_id, user_id)
);

-- Create alert actions table for follow-up coordination
CREATE TABLE public.alert_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.emergency_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_status TEXT DEFAULT 'pending',
  action_data JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user roles table for authority verification
CREATE TYPE public.app_role AS ENUM ('admin', 'authority', 'expert', 'farmer', 'buyer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for emergency_alerts
CREATE POLICY "Anyone can view active alerts"
  ON public.emergency_alerts FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Authorities can create alerts"
  ON public.emergency_alerts FOR INSERT
  WITH CHECK (
    auth.uid() = created_by 
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'authority')
    )
  );

CREATE POLICY "Authorities can update their alerts"
  ON public.emergency_alerts FOR UPDATE
  USING (
    auth.uid() = created_by 
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'authority')
    )
  );

-- RLS Policies for alert_acknowledgements
CREATE POLICY "Users can view their acknowledgements"
  ON public.alert_acknowledgements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can acknowledge alerts"
  ON public.alert_acknowledgements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authorities can view all acknowledgements for their alerts"
  ON public.alert_acknowledgements FOR SELECT
  USING (
    alert_id IN (
      SELECT id FROM public.emergency_alerts
      WHERE created_by = auth.uid()
    )
  );

-- RLS Policies for alert_actions
CREATE POLICY "Users can view their actions"
  ON public.alert_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their actions"
  ON public.alert_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their actions"
  ON public.alert_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authorities can view all actions for their alerts"
  ON public.alert_actions FOR SELECT
  USING (
    alert_id IN (
      SELECT id FROM public.emergency_alerts
      WHERE created_by = auth.uid()
    )
  );

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_emergency_alerts_created_at ON public.emergency_alerts(created_at DESC);
CREATE INDEX idx_emergency_alerts_severity ON public.emergency_alerts(severity);
CREATE INDEX idx_emergency_alerts_active ON public.emergency_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_alert_acknowledgements_alert ON public.alert_acknowledgements(alert_id);
CREATE INDEX idx_alert_acknowledgements_user ON public.alert_acknowledgements(user_id);
CREATE INDEX idx_alert_actions_alert ON public.alert_actions(alert_id);
CREATE INDEX idx_alert_actions_user ON public.alert_actions(user_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- Create trigger to update affected_users_count
CREATE OR REPLACE FUNCTION update_alert_acknowledgement_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.emergency_alerts
  SET affected_users_count = (
    SELECT COUNT(*) FROM public.alert_acknowledgements
    WHERE alert_id = NEW.alert_id
  )
  WHERE id = NEW.alert_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_acknowledgement_count
  AFTER INSERT ON public.alert_acknowledgements
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_acknowledgement_count();

-- Enable realtime for emergency alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_acknowledgements;