-- Create enum for negotiation room types
CREATE TYPE negotiation_room_type AS ENUM ('farmer_buyer', 'loan_application', 'supply_chain');

-- Create enum for negotiation message types
CREATE TYPE negotiation_message_type AS ENUM ('offer', 'counter_offer', 'accept', 'reject', 'question', 'document', 'payment_proposal', 'location_update', 'quality_check');

-- Create enum for negotiation status
CREATE TYPE negotiation_status AS ENUM ('active', 'accepted', 'rejected', 'completed', 'cancelled', 'pending_verification');

-- Negotiation rooms table
CREATE TABLE negotiation_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type negotiation_room_type NOT NULL,
  status negotiation_status DEFAULT 'active',
  subject TEXT NOT NULL,
  
  -- Participants
  farmer_id UUID REFERENCES auth.users(id) NOT NULL,
  buyer_id UUID REFERENCES auth.users(id),
  loan_officer_id UUID REFERENCES auth.users(id),
  transporter_id UUID REFERENCES auth.users(id),
  
  -- Related entities
  crop_listing_id UUID,
  loan_application_id UUID,
  supply_batch_id UUID,
  
  -- Deal terms
  current_offer_amount NUMERIC,
  accepted_amount NUMERIC,
  payment_terms JSONB DEFAULT '{}',
  delivery_terms JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  blockchain_hash TEXT,
  contract_signed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Negotiation messages table
CREATE TABLE negotiation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES negotiation_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  
  message_type negotiation_message_type NOT NULL,
  content TEXT,
  
  -- Offer/Counter-offer data
  offer_amount NUMERIC,
  offer_terms JSONB,
  offer_expires_at TIMESTAMPTZ,
  
  -- Document data
  document_url TEXT,
  document_type TEXT,
  document_verified BOOLEAN DEFAULT false,
  
  -- Location data
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_description TEXT,
  
  -- Quality check data
  quality_photo_url TEXT,
  quality_score NUMERIC,
  quality_notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  blockchain_hash TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Negotiation participants table (for multi-party negotiations)
CREATE TABLE negotiation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES negotiation_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL,
  can_make_offers BOOLEAN DEFAULT true,
  can_accept_offers BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Negotiation documents table
CREATE TABLE negotiation_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES negotiation_rooms(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  blockchain_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payment milestones table (for structured payments)
CREATE TABLE payment_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES negotiation_rooms(id) ON DELETE CASCADE NOT NULL,
  milestone_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, milestone_number)
);

-- Enable RLS
ALTER TABLE negotiation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for negotiation_rooms
CREATE POLICY "Participants can view their negotiation rooms"
  ON negotiation_rooms FOR SELECT
  TO authenticated
  USING (
    auth.uid() = farmer_id OR
    auth.uid() = buyer_id OR
    auth.uid() = loan_officer_id OR
    auth.uid() = transporter_id OR
    EXISTS (
      SELECT 1 FROM negotiation_participants
      WHERE room_id = negotiation_rooms.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers and buyers can create negotiation rooms"
  ON negotiation_rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = farmer_id OR
    auth.uid() = buyer_id
  );

CREATE POLICY "Participants can update negotiation rooms"
  ON negotiation_rooms FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = farmer_id OR
    auth.uid() = buyer_id OR
    auth.uid() = loan_officer_id OR
    auth.uid() = transporter_id
  );

-- RLS Policies for negotiation_messages
CREATE POLICY "Participants can view messages in their rooms"
  ON negotiation_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiation_rooms nr
      WHERE nr.id = negotiation_messages.room_id
      AND (
        auth.uid() = nr.farmer_id OR
        auth.uid() = nr.buyer_id OR
        auth.uid() = nr.loan_officer_id OR
        auth.uid() = nr.transporter_id OR
        EXISTS (
          SELECT 1 FROM negotiation_participants
          WHERE room_id = nr.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Participants can send messages"
  ON negotiation_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM negotiation_rooms nr
      WHERE nr.id = negotiation_messages.room_id
      AND (
        auth.uid() = nr.farmer_id OR
        auth.uid() = nr.buyer_id OR
        auth.uid() = nr.loan_officer_id OR
        auth.uid() = nr.transporter_id
      )
    )
  );

CREATE POLICY "Senders can update their messages"
  ON negotiation_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id);

-- RLS Policies for negotiation_participants
CREATE POLICY "Participants can view room participants"
  ON negotiation_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiation_rooms
      WHERE id = negotiation_participants.room_id
      AND (
        auth.uid() = farmer_id OR
        auth.uid() = buyer_id OR
        auth.uid() = loan_officer_id OR
        auth.uid() = transporter_id
      )
    )
  );

CREATE POLICY "Room owners can add participants"
  ON negotiation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiation_rooms
      WHERE id = negotiation_participants.room_id
      AND auth.uid() = farmer_id
    )
  );

-- RLS Policies for negotiation_documents
CREATE POLICY "Participants can view documents"
  ON negotiation_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiation_rooms nr
      WHERE nr.id = negotiation_documents.room_id
      AND (
        auth.uid() = nr.farmer_id OR
        auth.uid() = nr.buyer_id OR
        auth.uid() = nr.loan_officer_id OR
        auth.uid() = nr.transporter_id
      )
    )
  );

CREATE POLICY "Participants can upload documents"
  ON negotiation_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM negotiation_rooms nr
      WHERE nr.id = negotiation_documents.room_id
      AND (
        auth.uid() = nr.farmer_id OR
        auth.uid() = nr.buyer_id
      )
    )
  );

CREATE POLICY "Loan officers can verify documents"
  ON negotiation_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiation_rooms nr
      WHERE nr.id = negotiation_documents.room_id
      AND auth.uid() = nr.loan_officer_id
    )
  );

-- RLS Policies for payment_milestones
CREATE POLICY "Participants can view payment milestones"
  ON payment_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiation_rooms nr
      WHERE nr.id = payment_milestones.room_id
      AND (
        auth.uid() = nr.farmer_id OR
        auth.uid() = nr.buyer_id OR
        auth.uid() = nr.loan_officer_id
      )
    )
  );

CREATE POLICY "Participants can create payment milestones"
  ON payment_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiation_rooms nr
      WHERE nr.id = payment_milestones.room_id
      AND (
        auth.uid() = nr.farmer_id OR
        auth.uid() = nr.buyer_id OR
        auth.uid() = nr.loan_officer_id
      )
    )
  );

-- Create indexes for performance
CREATE INDEX idx_negotiation_rooms_farmer ON negotiation_rooms(farmer_id);
CREATE INDEX idx_negotiation_rooms_buyer ON negotiation_rooms(buyer_id);
CREATE INDEX idx_negotiation_rooms_status ON negotiation_rooms(status);
CREATE INDEX idx_negotiation_messages_room ON negotiation_messages(room_id);
CREATE INDEX idx_negotiation_messages_created ON negotiation_messages(created_at DESC);
CREATE INDEX idx_negotiation_documents_room ON negotiation_documents(room_id);
CREATE INDEX idx_payment_milestones_room ON payment_milestones(room_id);

-- Function to update room updated_at
CREATE OR REPLACE FUNCTION update_negotiation_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE negotiation_rooms
  SET updated_at = now()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update room timestamp on new message
CREATE TRIGGER update_room_on_message
AFTER INSERT ON negotiation_messages
FOR EACH ROW EXECUTE FUNCTION update_negotiation_room_timestamp();

-- Enable realtime for negotiations
ALTER PUBLICATION supabase_realtime ADD TABLE negotiation_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE negotiation_rooms;