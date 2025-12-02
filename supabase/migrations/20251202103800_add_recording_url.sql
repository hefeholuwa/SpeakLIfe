-- Add recording_url column to session_declarations table
ALTER TABLE session_declarations 
ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- Add index for faster querying
CREATE INDEX IF NOT EXISTS idx_session_declarations_declaration_id 
ON session_declarations(declaration_id);
