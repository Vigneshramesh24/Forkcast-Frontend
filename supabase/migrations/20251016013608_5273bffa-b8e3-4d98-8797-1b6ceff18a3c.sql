-- Block all direct writes to user_roles table
CREATE POLICY "No direct role modifications"
ON public.user_roles FOR INSERT
WITH CHECK (false);

CREATE POLICY "No role updates"
ON public.user_roles FOR UPDATE
USING (false);

CREATE POLICY "No role deletions"
ON public.user_roles FOR DELETE
USING (false);

-- Create secure function to assign roles during signup
CREATE OR REPLACE FUNCTION public.assign_user_role(p_user_id uuid, p_requested_role text)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate role is either customer or business_owner
  IF p_requested_role NOT IN ('customer', 'business_owner') THEN
    RAISE EXCEPTION 'Invalid role: must be customer or business_owner';
  END IF;
  
  -- Only allow assignment if no role exists yet
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'Role already assigned to this user';
  END IF;
  
  -- Insert the role
  INSERT INTO user_roles (user_id, role) 
  VALUES (p_user_id, p_requested_role::app_role);
END;
$$ LANGUAGE plpgsql;