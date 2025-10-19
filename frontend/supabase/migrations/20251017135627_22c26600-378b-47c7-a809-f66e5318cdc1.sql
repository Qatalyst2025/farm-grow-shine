-- Add new fields to negotiation_messages (skip blockchain_hash as it exists)
ALTER TABLE negotiation_messages 
ADD COLUMN IF NOT EXISTS blockchain_timestamp timestamp with time zone,
ADD COLUMN IF NOT EXISTS response_time_seconds integer;

-- Add verification fields to farmer profiles
ALTER TABLE farmer_profiles
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_level text DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS trust_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_deals integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS successful_deals integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_response_time integer;

-- Add verification fields to buyer profiles  
ALTER TABLE buyer_profiles
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_level text DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS trust_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_deals integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS successful_deals integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_response_time integer;

-- Create contracts table
CREATE TABLE IF NOT EXISTS negotiation_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES negotiation_rooms(id) ON DELETE CASCADE NOT NULL,
  contract_terms jsonb NOT NULL,
  contract_status text DEFAULT 'draft',
  blockchain_contract_address text,
  blockchain_tx_hash text,
  farmer_signature text,
  buyer_signature text,
  farmer_signed_at timestamp with time zone,
  buyer_signed_at timestamp with time zone,
  deployed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on contracts
ALTER TABLE negotiation_contracts ENABLE ROW LEVEL SECURITY;

-- RLS policies for contracts
DROP POLICY IF EXISTS "Participants can view contracts" ON negotiation_contracts;
CREATE POLICY "Participants can view contracts"
ON negotiation_contracts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM negotiation_participants
    WHERE negotiation_participants.room_id = negotiation_contracts.room_id
    AND negotiation_participants.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Participants can create contracts" ON negotiation_contracts;
CREATE POLICY "Participants can create contracts"
ON negotiation_contracts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM negotiation_participants
    WHERE negotiation_participants.room_id = negotiation_contracts.room_id
    AND negotiation_participants.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Participants can update contracts" ON negotiation_contracts;
CREATE POLICY "Participants can update contracts"
ON negotiation_contracts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM negotiation_participants
    WHERE negotiation_participants.room_id = negotiation_contracts.room_id
    AND negotiation_participants.user_id = auth.uid()
  )
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_contracts_room_id ON negotiation_contracts(room_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON negotiation_contracts(contract_status);

-- Enable realtime for contracts
ALTER PUBLICATION supabase_realtime ADD TABLE negotiation_contracts;