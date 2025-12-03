-- Enable RLS on challenges table
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Allow admins to do everything
CREATE POLICY "Admins can manage challenges"
  ON challenges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow everyone to view published challenges
CREATE POLICY "Public can view published challenges"
  ON challenges FOR SELECT
  USING (is_published = true);

-- Enable RLS on challenge_days table
ALTER TABLE challenge_days ENABLE ROW LEVEL SECURITY;

-- Allow admins to do everything on challenge_days
CREATE POLICY "Admins can manage challenge_days"
  ON challenge_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow everyone to view challenge_days for published challenges
CREATE POLICY "Public can view challenge_days"
  ON challenge_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_days.challenge_id
      AND challenges.is_published = true
    )
  );
