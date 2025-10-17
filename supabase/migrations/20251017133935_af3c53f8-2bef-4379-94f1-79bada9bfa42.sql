-- Create enum for chat room types
CREATE TYPE chat_room_type AS ENUM ('regional', 'crop_specific', 'cooperative', 'emergency');

-- Create enum for message types
CREATE TYPE message_type AS ENUM ('text', 'voice', 'image', 'poll', 'alert');

-- Create enum for member roles
CREATE TYPE chat_member_role AS ENUM ('member', 'moderator', 'admin');

-- Chat rooms table
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  room_type chat_room_type NOT NULL,
  region TEXT,
  crop_type TEXT,
  language TEXT DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chat members table with wisdom points
CREATE TABLE chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role chat_member_role DEFAULT 'member',
  wisdom_points INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  message_type message_type DEFAULT 'text',
  voice_url TEXT,
  image_url TEXT,
  ai_analysis JSONB,
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  is_alert BOOLEAN DEFAULT false,
  reply_to UUID REFERENCES chat_messages(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chat reactions table
CREATE TABLE chat_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, reaction)
);

-- Wisdom points log
CREATE TABLE wisdom_points_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  giver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_points_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Anyone can view active rooms"
  ON chat_rooms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create rooms"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms"
  ON chat_rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for chat_members
CREATE POLICY "Users can view members of their rooms"
  ON chat_members FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM chat_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON chat_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON chat_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators can update member roles"
  ON chat_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE room_id = chat_members.room_id
      AND user_id = auth.uid()
      AND role IN ('moderator', 'admin')
    )
  );

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their rooms"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM chat_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE room_id = chat_messages.room_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators can pin messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE room_id = chat_messages.room_id
      AND user_id = auth.uid()
      AND role IN ('moderator', 'admin')
    )
  );

-- RLS Policies for chat_reactions
CREATE POLICY "Users can view reactions in their rooms"
  ON chat_reactions FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT id FROM chat_messages
      WHERE room_id IN (
        SELECT room_id FROM chat_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add reactions"
  ON chat_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
  ON chat_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for wisdom_points_log
CREATE POLICY "Users can view wisdom points in their rooms"
  ON wisdom_points_log FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM chat_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can award wisdom points"
  ON wisdom_points_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = giver_id);

-- Create indexes for performance
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_members_room_id ON chat_members(room_id);
CREATE INDEX idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX idx_chat_reactions_message_id ON chat_reactions(message_id);

-- Function to update member count
CREATE OR REPLACE FUNCTION update_room_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_rooms
    SET member_count = member_count + 1
    WHERE id = NEW.room_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_rooms
    SET member_count = member_count - 1
    WHERE id = OLD.room_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update member count
CREATE TRIGGER update_member_count_trigger
AFTER INSERT OR DELETE ON chat_members
FOR EACH ROW EXECUTE FUNCTION update_room_member_count();

-- Function to update wisdom points
CREATE OR REPLACE FUNCTION update_wisdom_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_members
  SET wisdom_points = wisdom_points + NEW.points
  WHERE room_id = NEW.room_id
  AND user_id = NEW.recipient_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update wisdom points
CREATE TRIGGER update_wisdom_points_trigger
AFTER INSERT ON wisdom_points_log
FOR EACH ROW EXECUTE FUNCTION update_wisdom_points();

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_members;