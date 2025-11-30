-- Create Confession Journal Table
CREATE TABLE IF NOT EXISTS confession_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'confession',
  mood VARCHAR(50) DEFAULT 'grateful',
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE confession_journal ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Users can view their own journal entries" ON confession_journal;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON confession_journal;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON confession_journal;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON confession_journal;

CREATE POLICY "Users can view their own journal entries" 
  ON confession_journal FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" 
  ON confession_journal FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" 
  ON confession_journal FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" 
  ON confession_journal FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_confession_journal_user_id ON confession_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_confession_journal_created_at ON confession_journal(created_at);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_confession_journal_updated_at ON confession_journal;
CREATE TRIGGER update_confession_journal_updated_at
  BEFORE UPDATE ON confession_journal
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
