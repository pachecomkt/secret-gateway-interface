
-- Function to get user ID from email (used for group invitations)
CREATE OR REPLACE FUNCTION public.get_user_id_from_email(email TEXT)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM auth.users WHERE email = email LIMIT 1;
$$;

-- Function to get user information from ID (used for showing member details)
CREATE OR REPLACE FUNCTION public.get_user_info_from_id(user_id UUID)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'email', email,
    'name', COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
  )
  FROM auth.users 
  WHERE id = user_id
  LIMIT 1;
$$;

-- Function to get Discord server preview information
CREATE OR REPLACE FUNCTION public.get_discord_server_preview(server_id TEXT, bot_token_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  server_info JSON;
  token_text TEXT;
BEGIN
  -- Get the bot token
  SELECT token INTO token_text FROM public.discord_bot_tokens WHERE id = bot_token_id;
  
  -- If we're in development/test mode, return mock data
  IF token_text IS NULL OR token_text = '' THEN
    server_info := json_build_object(
      'id', server_id,
      'name', 'Discord Server #' || substring(server_id, 1, 4),
      'icon_url', 'https://cdn.discordapp.com/embed/avatars/0.png',
      'member_count', floor(random() * 1000) + 100
    );
  ELSE
    -- In a real implementation, this would call the Discord API
    -- For now, we'll still return mock data
    server_info := json_build_object(
      'id', server_id,
      'name', 'Discord Server #' || substring(server_id, 1, 4),
      'icon_url', 'https://cdn.discordapp.com/embed/avatars/0.png',
      'member_count', floor(random() * 1000) + 100
    );
  END IF;
  
  RETURN server_info;
END;
$$;
