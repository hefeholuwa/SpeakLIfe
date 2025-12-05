-- Enable RLS on tables if not already enabled
ALTER TABLE IF EXISTS public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_verses ENABLE ROW LEVEL SECURITY;

-- Policy for community_posts
DROP POLICY IF EXISTS "Admins can delete posts" ON public.community_posts;
CREATE POLICY "Admins can delete posts" ON public.community_posts
AS PERMISSIVE FOR DELETE
TO public
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Policy for community_comments
DROP POLICY IF EXISTS "Admins can delete comments" ON public.community_comments;
CREATE POLICY "Admins can delete comments" ON public.community_comments
AS PERMISSIVE FOR DELETE
TO public
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Policy for daily_verses
DROP POLICY IF EXISTS "Admins can delete daily_verses" ON public.daily_verses;
CREATE POLICY "Admins can delete daily_verses" ON public.daily_verses
AS PERMISSIVE FOR DELETE
TO public
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Also ensure admins can UPDATE these tables (e.g. for hiding/pinning)
DROP POLICY IF EXISTS "Admins can update posts" ON public.community_posts;
CREATE POLICY "Admins can update posts" ON public.community_posts
AS PERMISSIVE FOR UPDATE
TO public
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

DROP POLICY IF EXISTS "Admins can update comments" ON public.community_comments;
CREATE POLICY "Admins can update comments" ON public.community_comments
AS PERMISSIVE FOR UPDATE
TO public
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

DROP POLICY IF EXISTS "Admins can update daily_verses" ON public.daily_verses;
CREATE POLICY "Admins can update daily_verses" ON public.daily_verses
AS PERMISSIVE FOR UPDATE
TO public
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
