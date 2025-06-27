-- SnapConnect Database Schema
-- This file contains the complete database schema organized by table
-- Run this file to create the entire database structure (minus Supabase defaults)

-- =============================================
-- PROFILES TABLE
-- =============================================

-- Create profiles table - stores user profile information
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    "email" "text"
);

-- Primary key
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

-- Unique constraints
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_unique" UNIQUE ("username");

-- Foreign keys
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX "profiles_username_full_name_idx" ON "public"."profiles" USING "btree" ("username", "full_name");
CREATE INDEX "profiles_full_name_idx" ON "public"."profiles" USING "btree" ("full_name");
CREATE INDEX "profiles_email_idx" ON "public"."profiles" USING "btree" ("email");

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone." 
ON "public"."profiles" 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile." 
ON "public"."profiles" 
FOR INSERT 
WITH CHECK ((SELECT "auth"."uid"() AS "uid") = "id");

CREATE POLICY "Users can update own profile." 
ON "public"."profiles" 
FOR UPDATE 
USING ((SELECT "auth"."uid"() AS "uid") = "id");

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================

-- Create conversations table - manages chat threads
CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" DEFAULT 'direct'::"text" NOT NULL,
    "title" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");

-- Indexes
CREATE INDEX "conversations_type_idx" ON "public"."conversations" USING "btree" ("type");
CREATE INDEX "conversations_updated_at_idx" ON "public"."conversations" USING "btree" ("updated_at");

-- RLS Policies
CREATE POLICY "Allow viewing conversations" 
ON "public"."conversations" 
FOR SELECT 
TO "authenticated" 
USING (true);

CREATE POLICY "Allow creating conversations" 
ON "public"."conversations" 
FOR INSERT 
TO "authenticated" 
WITH CHECK (true);

CREATE POLICY "Allow updating conversations" 
ON "public"."conversations" 
FOR UPDATE 
TO "authenticated" 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Users cannot delete conversations" 
ON "public"."conversations" 
FOR DELETE 
TO "authenticated" 
USING (false);

-- =============================================
-- CONVERSATION_PARTICIPANTS TABLE
-- =============================================

-- Create conversation participants table - many-to-many relationship for conversations
CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_read_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_user_id_pk" PRIMARY KEY ("conversation_id", "user_id");

-- Foreign keys
ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX "conversation_participants_user_id_idx" ON "public"."conversation_participants" USING "btree" ("user_id");
CREATE INDEX "conversation_participants_last_read_at_idx" ON "public"."conversation_participants" USING "btree" ("last_read_at");
CREATE INDEX "conversation_participants_is_active_idx" ON "public"."conversation_participants" USING "btree" ("is_active");

-- RLS Policies
CREATE POLICY "Allow viewing conversation participants" 
ON "public"."conversation_participants" 
FOR SELECT 
TO "authenticated" 
USING (true);

CREATE POLICY "Allow adding conversation participants" 
ON "public"."conversation_participants" 
FOR INSERT 
TO "authenticated" 
WITH CHECK (true);

CREATE POLICY "Users can update their own participation" 
ON "public"."conversation_participants" 
FOR UPDATE 
TO "authenticated" 
USING ("user_id" = (SELECT "auth"."uid"() AS "uid")) 
WITH CHECK ("user_id" = (SELECT "auth"."uid"() AS "uid"));

CREATE POLICY "Users can leave conversations" 
ON "public"."conversation_participants" 
FOR DELETE 
TO "authenticated" 
USING ("user_id" = (SELECT "auth"."uid"() AS "uid"));

-- =============================================
-- MESSAGES TABLE
-- =============================================

-- Create messages table - individual messages in conversations
CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "type" "text" DEFAULT 'text'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX "messages_conversation_id_idx" ON "public"."messages" USING "btree" ("conversation_id");
CREATE INDEX "messages_conversation_created_at_idx" ON "public"."messages" USING "btree" ("conversation_id", "created_at");
CREATE INDEX "messages_sender_id_idx" ON "public"."messages" USING "btree" ("sender_id");
CREATE INDEX "messages_expires_at_idx" ON "public"."messages" USING "btree" ("expires_at");
CREATE INDEX "messages_type_idx" ON "public"."messages" USING "btree" ("type");

-- RLS Policies
CREATE POLICY "Users can view messages from their conversations" 
ON "public"."messages" 
FOR SELECT 
TO "authenticated" 
USING (
  ("conversation_id" IN (
    SELECT "conversation_participants"."conversation_id"
    FROM "public"."conversation_participants"
    WHERE (
      ("conversation_participants"."user_id" = (SELECT "auth"."uid"() AS "uid")) 
      AND ("conversation_participants"."is_active" = true)
    )
  )) 
  AND ("expires_at" > "now"())
);

CREATE POLICY "Users can send messages to their conversations" 
ON "public"."messages" 
FOR INSERT 
TO "authenticated" 
WITH CHECK (
  ("sender_id" = (SELECT "auth"."uid"() AS "uid")) 
  AND ("conversation_id" IN (
    SELECT "conversation_participants"."conversation_id"
    FROM "public"."conversation_participants"
    WHERE (
      ("conversation_participants"."user_id" = (SELECT "auth"."uid"() AS "uid")) 
      AND ("conversation_participants"."is_active" = true)
    )
  ))
);

CREATE POLICY "Users cannot delete messages" 
ON "public"."messages" 
FOR DELETE 
TO "authenticated" 
USING (false);

CREATE POLICY "Users cannot update messages" 
ON "public"."messages" 
FOR UPDATE 
TO "authenticated" 
USING (false) 
WITH CHECK (false);

-- =============================================
-- FRIENDS TABLE
-- =============================================

-- Create friends table - bidirectional friend relationships
CREATE TABLE IF NOT EXISTS "public"."friends" (
    "user_id" "uuid" NOT NULL,
    "friend_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_user_id_friend_id_pk" PRIMARY KEY ("user_id", "friend_id");

-- Foreign keys
ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_friend_id_profiles_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- =============================================
-- FRIEND_REQUESTS TABLE
-- =============================================

-- Create friend requests table - pending friend requests
CREATE TABLE IF NOT EXISTS "public"."friend_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "addressee_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "friend_requests_requester_id_profiles_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "friend_requests_addressee_id_profiles_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- =============================================
-- FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'email', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.handle_friend_removal()
RETURNS TRIGGER AS $$
BEGIN
  -- When a friendship is removed (e.g., OLD.user_id and OLD.friend_id),
  -- delete any pending friend requests between these two users.
  -- This prevents old, irrelevant requests from showing up if they re-add each other.
  DELETE FROM public.friend_requests
  WHERE 
    (requester_id = OLD.user_id AND addressee_id = OLD.friend_id) OR
    (requester_id = OLD.friend_id AND addressee_id = OLD.user_id);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create the trigger to execute the function after a delete on the friends table
CREATE TRIGGER on_friend_removal
  AFTER DELETE ON public.friends
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_friend_removal();
