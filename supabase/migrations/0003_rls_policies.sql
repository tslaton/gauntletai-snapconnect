-- SnapConnect RLS Policies for Events and User Interests
-- This migration enables Row Level Security and creates policies
-- for the events and user_interests tables

-- =============================================
-- ENABLE RLS ON TABLES
-- =============================================

-- Enable RLS on events and user_interests tables
ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_interests" ENABLE ROW LEVEL SECURITY;

-- =============================================
-- EVENTS TABLE POLICIES
-- =============================================

-- Allow all authenticated users to view events
CREATE POLICY "Authenticated users can view events" 
ON "public"."events" 
FOR SELECT 
TO "authenticated" 
USING (true);

-- =============================================
-- USER_INTERESTS TABLE POLICIES
-- =============================================

-- Allow users to view their own interests
CREATE POLICY "Users can view their own interests" 
ON "public"."user_interests" 
FOR SELECT 
TO "authenticated" 
USING ("user_id" = (SELECT "auth"."uid"() AS "uid"));

-- Allow users to insert their own interests
CREATE POLICY "Users can insert their own interests" 
ON "public"."user_interests" 
FOR INSERT 
TO "authenticated" 
WITH CHECK ("user_id" = (SELECT "auth"."uid"() AS "uid"));

-- Allow users to update their own interests
CREATE POLICY "Users can update their own interests" 
ON "public"."user_interests" 
FOR UPDATE 
TO "authenticated" 
USING ("user_id" = (SELECT "auth"."uid"() AS "uid")) 
WITH CHECK ("user_id" = (SELECT "auth"."uid"() AS "uid")); 