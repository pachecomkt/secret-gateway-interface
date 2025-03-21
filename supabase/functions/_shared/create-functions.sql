
-- Function to get user ID from email (used for group invitations)
CREATE OR REPLACE FUNCTION public.get_user_id_from_email(email TEXT)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM auth.users WHERE email = email LIMIT 1;
$$;
