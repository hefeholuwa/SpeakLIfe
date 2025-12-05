-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'alert', 'success')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_reads table (tracks which users have read which notifications)
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_global ON notifications(is_global);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications table
-- Users can view global notifications or notifications targeted to them
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (
    is_global = true OR 
    user_id = auth.uid()
  );

-- Only admins can create notifications
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update notifications
CREATE POLICY "Admins can update notifications"
  ON notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete notifications
CREATE POLICY "Admins can delete notifications"
  ON notifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for notification_reads table
-- Users can only view their own read receipts
CREATE POLICY "Users can view their own read receipts"
  ON notification_reads FOR SELECT
  USING (user_id = auth.uid());

-- Users can only insert their own read receipts
CREATE POLICY "Users can mark notifications as read"
  ON notification_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only delete their own read receipts
CREATE POLICY "Users can delete their own read receipts"
  ON notification_reads FOR DELETE
  USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at_trigger ON notifications;
CREATE TRIGGER update_notifications_updated_at_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Insert some sample notifications for testing
-- Trigger is ready

