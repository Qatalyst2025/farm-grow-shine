-- Create expert profiles table
CREATE TABLE expert_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expertise_areas text[] NOT NULL DEFAULT '{}',
  credentials jsonb NOT NULL DEFAULT '{}',
  verified boolean DEFAULT false,
  verification_level text DEFAULT 'pending',
  total_responses integer DEFAULT 0,
  helpful_responses integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  bio text,
  certifications text[],
  years_experience integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create learning materials table
CREATE TABLE learning_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  material_type text NOT NULL,
  content_url text,
  content_data jsonb,
  difficulty_level text DEFAULT 'beginner',
  topic_tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  downloads integer DEFAULT 0,
  views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create quizzes and polls table
CREATE TABLE chat_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  poll_type text DEFAULT 'single_choice',
  correct_answer text,
  ends_at timestamp with time zone,
  is_active boolean DEFAULT true,
  total_votes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create poll responses table
CREATE TABLE poll_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES chat_polls(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  selected_option text NOT NULL,
  is_correct boolean,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Create achievements and badges table
CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  badge_icon text,
  earned_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Create scheduled sessions table
CREATE TABLE scheduled_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  expert_id uuid REFERENCES expert_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  session_type text NOT NULL,
  scheduled_start timestamp with time zone NOT NULL,
  scheduled_end timestamp with time zone NOT NULL,
  status text DEFAULT 'scheduled',
  max_participants integer,
  current_participants integer DEFAULT 0,
  recording_url text,
  summary text,
  ai_summary jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create session questions table
CREATE TABLE session_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES scheduled_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  upvotes integer DEFAULT 0,
  answered boolean DEFAULT false,
  answer_message_id uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create message ratings table
CREATE TABLE message_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  is_helpful boolean DEFAULT true,
  feedback text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create learning progress table
CREATE TABLE learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  material_id uuid REFERENCES learning_materials(id) ON DELETE CASCADE,
  progress_percentage numeric DEFAULT 0,
  completed boolean DEFAULT false,
  quiz_scores jsonb DEFAULT '{}',
  last_accessed timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- Enable RLS
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expert_profiles
CREATE POLICY "Anyone can view verified experts"
ON expert_profiles FOR SELECT
USING (verified = true);

CREATE POLICY "Users can create their expert profile"
ON expert_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their expert profile"
ON expert_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for learning_materials
CREATE POLICY "Anyone can view learning materials"
ON learning_materials FOR SELECT
USING (true);

CREATE POLICY "Experts can create materials"
ON learning_materials FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM expert_profiles
    WHERE expert_profiles.user_id = auth.uid()
    AND expert_profiles.verified = true
  )
);

CREATE POLICY "Creators can update their materials"
ON learning_materials FOR UPDATE
USING (auth.uid() = created_by);

-- RLS Policies for chat_polls
CREATE POLICY "Room members can view polls"
ON chat_polls FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM chat_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Room members can create polls"
ON chat_polls FOR INSERT
WITH CHECK (
  room_id IN (
    SELECT room_id FROM chat_members
    WHERE user_id = auth.uid()
  )
  AND auth.uid() = created_by
);

-- RLS Policies for poll_responses
CREATE POLICY "Users can view poll responses in their rooms"
ON poll_responses FOR SELECT
USING (
  poll_id IN (
    SELECT cp.id FROM chat_polls cp
    JOIN chat_members cm ON cm.room_id = cp.room_id
    WHERE cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can submit poll responses"
ON poll_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
ON user_achievements FOR INSERT
WITH CHECK (true);

-- RLS Policies for scheduled_sessions
CREATE POLICY "Room members can view sessions"
ON scheduled_sessions FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM chat_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Experts can create sessions"
ON scheduled_sessions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM expert_profiles
    WHERE expert_profiles.id = scheduled_sessions.expert_id
    AND expert_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Experts can update their sessions"
ON scheduled_sessions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM expert_profiles
    WHERE expert_profiles.id = scheduled_sessions.expert_id
    AND expert_profiles.user_id = auth.uid()
  )
);

-- RLS Policies for session_questions
CREATE POLICY "Session participants can view questions"
ON session_questions FOR SELECT
USING (
  session_id IN (
    SELECT ss.id FROM scheduled_sessions ss
    JOIN chat_members cm ON cm.room_id = ss.room_id
    WHERE cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can submit questions"
ON session_questions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can upvote questions"
ON session_questions FOR UPDATE
USING (true);

-- RLS Policies for message_ratings
CREATE POLICY "Users can view ratings in their rooms"
ON message_ratings FOR SELECT
USING (
  message_id IN (
    SELECT cm.id FROM chat_messages cm
    JOIN chat_members cmem ON cmem.room_id = cm.room_id
    WHERE cmem.user_id = auth.uid()
  )
);

CREATE POLICY "Users can rate messages"
ON message_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for learning_progress
CREATE POLICY "Users can view their own progress"
ON learning_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can track their progress"
ON learning_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their progress"
ON learning_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_expert_profiles_user_id ON expert_profiles(user_id);
CREATE INDEX idx_expert_profiles_verified ON expert_profiles(verified);
CREATE INDEX idx_learning_materials_room_id ON learning_materials(room_id);
CREATE INDEX idx_learning_materials_difficulty ON learning_materials(difficulty_level);
CREATE INDEX idx_chat_polls_room_id ON chat_polls(room_id);
CREATE INDEX idx_poll_responses_poll_id ON poll_responses(poll_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_scheduled_sessions_room_id ON scheduled_sessions(room_id);
CREATE INDEX idx_scheduled_sessions_expert_id ON scheduled_sessions(expert_id);
CREATE INDEX idx_session_questions_session_id ON session_questions(session_id);
CREATE INDEX idx_message_ratings_message_id ON message_ratings(message_id);
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE expert_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE scheduled_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE session_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE message_ratings;