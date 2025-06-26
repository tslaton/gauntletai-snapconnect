-- Supabase Storage Setup for SnapConnect
-- Run this in Supabase Dashboard > SQL Editor

-- Create photos storage bucket
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('photos', 'photos', true)
-- ON CONFLICT (id) DO UPDATE SET
--   name = EXCLUDED.name,
--   public = EXCLUDED.public;

-- -- Enable RLS on storage.objects if not already enabled
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- -- Drop existing policies if they exist (safe to run multiple times)
-- DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Photos are publicly viewable" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- -- Policy: Users can upload photos to their own folder
-- CREATE POLICY "Users can upload photos" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'photos' AND 
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- -- Policy: Photos are publicly viewable
-- CREATE POLICY "Photos are publicly viewable" ON storage.objects
-- FOR SELECT USING (bucket_id = 'photos');

-- -- Policy: Users can delete their own photos
-- CREATE POLICY "Users can delete own photos" ON storage.objects
-- FOR DELETE USING (
--   bucket_id = 'photos' AND 
--   auth.uid()::text = (storage.foldername(name))[1]
-- ); 

-- the above didn't work (maybe because of the bucket setup? we had photos/photos instead of photos/user-id at one point)...
-- the below setup did work... but probably will replace all with signed urls later...

CREATE POLICY "Photos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- Enable RLS (safe to run twice)
alter table storage.objects enable row level security;

-- Remove old copy if it exists
drop policy if exists "Users can upload photos" on storage.objects;

-- Allow authenticated users to upload to  photos/<their-uid>/...
create policy "Users can upload photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'photos'
  and auth.uid()::text = split_part(name, '/', 1)   -- first folder = uid
);