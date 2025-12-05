-- Enable the pg_net extension to make HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a trigger function that calls the Edge Function
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- We use pg_net to make an async POST request to the Edge Function
  -- Note: You need to replace PROJECT_REF and ANON_KEY/SERVICE_KEY
  -- Ideally, this should use the internal network or correct authenticated endpoint
  
  -- Method A: Using Supabase/pg_net to call the function
  -- We send the NEW record as the payload
  
  -- NOTE FOR DEPLOYMENT: 
  -- 1. Get your Project Ref (e.g. xxuskmfvqpozgttakhou)
  -- 2. Get your Anon Key or Service Role Key
  -- 3. In a real environment, you might use a vault or simply hardcode if secure enough context (but beware git).
  -- Since we are generating a migration file, we will assume standard headers.
  
  -- Ideally, Supabase supports "Database Webhooks" natively in the dashboard which is easier than raw pg_net SQL.
  -- But here is the raw SQL approach:
  
  PERFORM
    net.http_post(
      url := 'https://xxuskmfvqpozgttakhou.supabase.co/functions/v1/push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.jwt.claim.sub', true) -- This might not work in trigger context as expected for service auth
        -- Better to use a fixed Service Role Key if possible, but we can't hardcode it here safely.
        -- ALTERNATIVE: Rely on the Dashboard's "Database Webhooks" feature which handles auth.
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
-- DROP TRIGGER IF EXISTS send_push_on_notification ON notifications;
-- CREATE TRIGGER send_push_on_notification
--   AFTER INSERT ON notifications
--   FOR EACH ROW
--   EXECUTE FUNCTION trigger_push_notification();

-- NOTE: The above SQL using pg_net requires careful setup of headers (Authorization). 
-- Since we cannot securely hardcode the Service Key here, the BEST practice is:
-- 1. Go to Supabase Dashboard -> Database -> Webhooks
-- 2. Create a new Webhook
-- 3. Name: "Send Push Notification"
-- 4. Table: "notifications" -> INSERT
-- 5. Type: HTTP Request
-- 6. URL: https://xxuskmfvqpozgttakhou.supabase.co/functions/v1/push-notification
-- 7. Method: POST
-- 8. Header: Authorization = Bearer [YOUR_SERVICE_ROLE_KEY]
