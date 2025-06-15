CREATE TABLE IF NOT EXISTS replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  -- user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Uncomment when auth is set up
  author_name TEXT NOT NULL, -- Temporary until user auth
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  parent_reply_id UUID REFERENCES replies(id) ON DELETE CASCADE NULL -- For threaded replies
);
