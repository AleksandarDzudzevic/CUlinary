-- Fix Database Permissions for Menu Storage
-- Run this in your Supabase SQL Editor

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Only service role can modify menus" ON menus;

-- Create a more permissive policy for authenticated users to insert menus
CREATE POLICY "Authenticated users can insert menus"
    ON menus FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update menus (for upsert functionality)
CREATE POLICY "Authenticated users can update menus"
    ON menus FOR UPDATE
    TO authenticated
    USING (true);

-- Keep the existing read policy
-- (The "Authenticated users can view menus" policy should already exist)
