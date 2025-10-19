-- Fix search_path for message expiration function
CREATE OR REPLACE FUNCTION check_message_expiration()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
    NEW.content := '[Message Expired]';
    NEW.encrypted_content := NULL;
    NEW.media_url := NULL;
    NEW.document_url := NULL;
  END IF;
  RETURN NEW;
END;
$$;