-- SnapConnect Events and User Interests Schema
-- This migration creates the events and user_interests tables
-- and adds personality fields to the profiles table

-- =============================================
-- ALTER PROFILES TABLE
-- =============================================

-- Add personality and about fields to profiles
ALTER TABLE "public"."profiles" 
ADD COLUMN IF NOT EXISTS "personality_description" "text",
ADD COLUMN IF NOT EXISTS "about" "text";

-- =============================================
-- EVENTS TABLE
-- =============================================

-- Create events table - stores event information
CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "location" "text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "image_url" "text",
    "tags" "text"[] DEFAULT '{}',
    "max_attendees" integer,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;

-- Indexes
CREATE INDEX "events_start_time_idx" ON "public"."events" USING "btree" ("start_time");
CREATE INDEX "events_location_idx" ON "public"."events" USING "btree" ("location");
CREATE INDEX "events_tags_idx" ON "public"."events" USING "gin" ("tags");
CREATE INDEX "events_created_by_idx" ON "public"."events" USING "btree" ("created_by");

-- =============================================
-- USER_INTERESTS TABLE
-- =============================================

-- Create user_interests table - stores user's interests and activities
CREATE TABLE IF NOT EXISTS "public"."user_interests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL, -- 'current_activity' or 'desired_activity'
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX "user_interests_user_id_idx" ON "public"."user_interests" USING "btree" ("user_id");
CREATE INDEX "user_interests_type_idx" ON "public"."user_interests" USING "btree" ("type");
CREATE INDEX "user_interests_description_idx" ON "public"."user_interests" USING "btree" ("description");

-- Unique constraint to prevent duplicate interests per user and type
ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_user_id_type_description_unique" UNIQUE ("user_id", "type", "description"); 