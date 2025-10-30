-- Create enum for verification levels
CREATE TYPE public.verification_level AS ENUM ('basic', 'trusted', 'premium', 'expert');

-- Create enum for message types
CREATE TYPE public.private_message_type AS ENUM ('text', 'image', 'voice', 'document', 'deal_offer', 'meeting_request', 'payment');

-- Create private conversations table
CREATE TABLE public.private_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ,
  encryption_enabled BOOLEAN DEFAULT false,
  conversation_hash TEXT, -- For blockchain verification
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create conversation participants table
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.private_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  is_blocked BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT true,
  UNIQUE(conversation_id, user_id)
);

-- Create private messages table
CREATE TABLE public.private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.private_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type public.private_message_type NOT NULL DEFAULT 'text',
  content TEXT,
  encrypted_content TEXT, -- For E2E encrypted messages
  media_url TEXT,
  document_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ, -- For temporary messages
  forwarding_disabled BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  -- Deal-related fields
  deal_amount NUMERIC,
  deal_status TEXT,
  -- Meeting-related fields
  meeting_datetime TIMESTAMPTZ,
  meeting_location TEXT,
  -- Security flags
  contains_suspicious_content BOOLEAN DEFAULT false,
  flagged_reason TEXT
);

-- Create message reactions table
CREATE TABLE public.private_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.private_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create user verification table
CREATE TABLE public.user_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_level public.verification_level NOT NULL DEFAULT 'basic',
  phone_verified BOOLEAN DEFAULT false,
  id_verified BOOLEAN DEFAULT false,
  meeting_attended BOOLEAN DEFAULT false,
  credentials_certified BOOLEAN DEFAULT false,
  verification_documents JSONB DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create message reports table for safety
CREATE TABLE public.message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.private_messages(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_reason TEXT NOT NULL,
  report_details TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.private_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for private_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.private_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their conversation settings"
  ON public.private_conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations"
  ON public.conversation_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participant settings"
  ON public.conversation_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for private_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.private_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid() AND is_blocked = false
    )
    AND (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "Users can send messages to their conversations"
  ON public.private_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid() AND is_blocked = false
    )
  );

CREATE POLICY "Senders can update their own messages"
  ON public.private_messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- RLS Policies for reactions
CREATE POLICY "Users can view reactions in their conversations"
  ON public.private_message_reactions FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM public.private_messages
      WHERE conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add reactions"
  ON public.private_message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
  ON public.private_message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_verification
CREATE POLICY "Users can view their own verification"
  ON public.user_verification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view verification of conversation participants"
  ON public.user_verification FOR SELECT
  USING (
    user_id IN (
      SELECT DISTINCT cp.user_id
      FROM public.conversation_participants cp
      WHERE cp.conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can manage verifications"
  ON public.user_verification FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for message_reports
CREATE POLICY "Users can report messages"
  ON public.message_reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view their own reports"
  ON public.message_reports FOR SELECT
  USING (auth.uid() = reported_by);

-- Create indexes for performance
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON public.conversation_participants(conversation_id);
CREATE INDEX idx_private_messages_conversation ON public.private_messages(conversation_id);
CREATE INDEX idx_private_messages_sender ON public.private_messages(sender_id);
CREATE INDEX idx_private_messages_created_at ON public.private_messages(created_at DESC);
CREATE INDEX idx_user_verification_user ON public.user_verification(user_id);

-- Create trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.private_conversations
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.private_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Create trigger to auto-expire messages
CREATE OR REPLACE FUNCTION check_message_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
    NEW.content := '[Message Expired]';
    NEW.encrypted_content := NULL;
    NEW.media_url := NULL;
    NEW.document_url := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_expiration_on_select
  BEFORE UPDATE ON public.private_messages
  FOR EACH ROW
  EXECUTE FUNCTION check_message_expiration();

-- Enable realtime for private messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_message_reactions;