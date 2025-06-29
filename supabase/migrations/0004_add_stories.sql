-- =============================================
-- STORIES TABLE
-- =============================================

-- Create stories table - one story per user
CREATE TABLE IF NOT EXISTS "public"."stories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_pkey" PRIMARY KEY ("id");

-- Unique constraint - one story per user
ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_user_id_unique" UNIQUE ("user_id");

-- Foreign keys
ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX "stories_user_id_idx" ON "public"."stories" USING "btree" ("user_id");
CREATE INDEX "stories_updated_at_idx" ON "public"."stories" USING "btree" ("updated_at" DESC);

-- RLS Policies
ALTER TABLE "public"."stories" ENABLE ROW LEVEL SECURITY;

-- Anyone can view stories
CREATE POLICY "Stories are viewable by everyone" 
ON "public"."stories" 
FOR SELECT 
TO authenticated
USING (true);

-- Users can only create their own story
CREATE POLICY "Users can create their own story" 
ON "public"."stories" 
FOR INSERT 
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can only update their own story
CREATE POLICY "Users can update their own story" 
ON "public"."stories" 
FOR UPDATE 
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can only delete their own story
CREATE POLICY "Users can delete their own story" 
ON "public"."stories" 
FOR DELETE 
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- =============================================
-- STORY_CONTENTS TABLE
-- =============================================

-- Create story_contents table - individual items in a story
CREATE TABLE IF NOT EXISTS "public"."story_contents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL CHECK (type IN ('photo', 'video')),
    "content_url" "text" NOT NULL,
    "index" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."story_contents"
    ADD CONSTRAINT "story_contents_pkey" PRIMARY KEY ("id");

-- Unique constraint - no duplicate indexes per story
ALTER TABLE ONLY "public"."story_contents"
    ADD CONSTRAINT "story_contents_story_id_index_unique" UNIQUE ("story_id", "index");

-- Foreign keys
ALTER TABLE ONLY "public"."story_contents"
    ADD CONSTRAINT "story_contents_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."story_contents"
    ADD CONSTRAINT "story_contents_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX "story_contents_story_id_idx" ON "public"."story_contents" USING "btree" ("story_id");
CREATE INDEX "story_contents_user_id_idx" ON "public"."story_contents" USING "btree" ("user_id");
CREATE INDEX "story_contents_story_id_index_idx" ON "public"."story_contents" USING "btree" ("story_id", "index");

-- RLS Policies
ALTER TABLE "public"."story_contents" ENABLE ROW LEVEL SECURITY;

-- Anyone can view story contents
CREATE POLICY "Story contents are viewable by everyone" 
ON "public"."story_contents" 
FOR SELECT 
TO authenticated
USING (true);

-- Users can only create content for their own stories
CREATE POLICY "Users can create content for their own stories" 
ON "public"."story_contents" 
FOR INSERT 
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can only update their own story content
CREATE POLICY "Users can update their own story content" 
ON "public"."story_contents" 
FOR UPDATE 
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can only delete their own story content
CREATE POLICY "Users can delete their own story content" 
ON "public"."story_contents" 
FOR DELETE 
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to automatically create a story for new users
CREATE OR REPLACE FUNCTION public.create_story_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.stories (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create story when profile is created
CREATE TRIGGER create_story_on_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_story_for_user();

-- Create stories for existing users
INSERT INTO public.stories (user_id)
SELECT id FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.stories);