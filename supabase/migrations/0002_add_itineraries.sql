-- =============================================
-- ITINERARIES TABLE
-- =============================================

-- Create itineraries table - stores travel itineraries
CREATE TABLE IF NOT EXISTS "public"."itineraries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "cover_image_url" "text",
    "weather" "json" DEFAULT '[]'::json NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."itineraries"
    ADD CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."itineraries"
    ADD CONSTRAINT "itineraries_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX "itineraries_created_by_idx" ON "public"."itineraries" USING "btree" ("created_by");
CREATE INDEX "itineraries_created_at_idx" ON "public"."itineraries" USING "btree" ("created_at");
CREATE INDEX "itineraries_title_idx" ON "public"."itineraries" USING "btree" ("title");

-- =============================================
-- ACTIVITIES TABLE
-- =============================================

-- Create activities table - stores individual activities within itineraries
CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "location" "text",
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "image_url" "text",
    "tags" "text"[] DEFAULT '{}'::text[],
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "itinerary_id" "uuid" NOT NULL
);

-- Primary key
ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_itinerary_id_itineraries_id_fk" FOREIGN KEY ("itinerary_id") REFERENCES "public"."itineraries"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX "activities_itinerary_id_idx" ON "public"."activities" USING "btree" ("itinerary_id");
CREATE INDEX "activities_start_time_idx" ON "public"."activities" USING "btree" ("start_time");
CREATE INDEX "activities_created_by_idx" ON "public"."activities" USING "btree" ("created_by");
CREATE INDEX "activities_tags_idx" ON "public"."activities" USING "gin" ("tags");

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on tables
ALTER TABLE "public"."itineraries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;

-- Itineraries RLS Policies

-- Users can view their own itineraries
CREATE POLICY "Users can view their own itineraries" 
ON "public"."itineraries" 
FOR SELECT 
TO "authenticated" 
USING ("created_by" = (SELECT "auth"."uid"()));

-- Users can create itineraries
CREATE POLICY "Users can create itineraries" 
ON "public"."itineraries" 
FOR INSERT 
TO "authenticated" 
WITH CHECK ("created_by" = (SELECT "auth"."uid"()));

-- Users can update their own itineraries
CREATE POLICY "Users can update their own itineraries" 
ON "public"."itineraries" 
FOR UPDATE 
TO "authenticated" 
USING ("created_by" = (SELECT "auth"."uid"()))
WITH CHECK ("created_by" = (SELECT "auth"."uid"()));

-- Users can delete their own itineraries
CREATE POLICY "Users can delete their own itineraries" 
ON "public"."itineraries" 
FOR DELETE 
TO "authenticated" 
USING ("created_by" = (SELECT "auth"."uid"()));

-- Activities RLS Policies

-- Users can view activities from their itineraries
CREATE POLICY "Users can view activities from their itineraries" 
ON "public"."activities" 
FOR SELECT 
TO "authenticated" 
USING (
    "itinerary_id" IN (
        SELECT "id" FROM "public"."itineraries"
        WHERE "created_by" = (SELECT "auth"."uid"())
    )
);

-- Users can create activities in their itineraries
CREATE POLICY "Users can create activities in their itineraries" 
ON "public"."activities" 
FOR INSERT 
TO "authenticated" 
WITH CHECK (
    "created_by" = (SELECT "auth"."uid"()) AND
    "itinerary_id" IN (
        SELECT "id" FROM "public"."itineraries"
        WHERE "created_by" = (SELECT "auth"."uid"())
    )
);

-- Users can update activities in their itineraries
CREATE POLICY "Users can update activities in their itineraries" 
ON "public"."activities" 
FOR UPDATE 
TO "authenticated" 
USING (
    "itinerary_id" IN (
        SELECT "id" FROM "public"."itineraries"
        WHERE "created_by" = (SELECT "auth"."uid"())
    )
)
WITH CHECK (
    "itinerary_id" IN (
        SELECT "id" FROM "public"."itineraries"
        WHERE "created_by" = (SELECT "auth"."uid"())
    )
);

-- Users can delete activities from their itineraries
CREATE POLICY "Users can delete activities from their itineraries" 
ON "public"."activities" 
FOR DELETE 
TO "authenticated" 
USING (
    "itinerary_id" IN (
        SELECT "id" FROM "public"."itineraries"
        WHERE "created_by" = (SELECT "auth"."uid"())
    )
);

-- =============================================
-- FUNCTIONS FOR AUTO-UPDATING TIMESTAMPS
-- =============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER "update_itineraries_updated_at" 
BEFORE UPDATE ON "public"."itineraries"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_activities_updated_at" 
BEFORE UPDATE ON "public"."activities"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();