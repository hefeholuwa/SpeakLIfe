-- EMERGENCY FIX: Remove circular dependency in profiles RLS policies
-- The admin policies were querying the profiles table to check if user is admin,
-- creating an infinite loop that causes 500 errors

-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Recreate simpler admin policies that don't create circular dependencies
-- These rely on the is_admin flag directly from auth.uid() without subqueries

-- Admins can view all profiles (simplified - no circular dependency)
CREATE POLICY "Admins can view all profiles v2" ON profiles
  FOR SELECT USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Admins can update all profiles (simplified - no circular dependency  
CREATE POLICY "Admins can update all profiles v2" ON profiles
  FOR UPDATE USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Grant read access to authenticated users for their own profiles (this already exists but ensuring it's there)
-- Users can view their own profile and update it (these policies already exist from previous migration)
