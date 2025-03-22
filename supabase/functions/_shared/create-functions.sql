
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
