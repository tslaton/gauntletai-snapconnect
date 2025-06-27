-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Policy: Avatar images are publicly accessible
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Policy: Anyone can upload avatars
CREATE POLICY "Anyone can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Policy: Anyone can update their own avatar
CREATE POLICY "Anyone can update their own avatar" ON storage.objects
FOR UPDATE USING ((SELECT auth.uid()) = owner)
WITH CHECK (
  bucket_id = 'avatars'
); 

-- Create photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Policy: Users can upload photos to their own folder
CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND 
  auth.uid()::text = split_part(name, '/', 1)
);

-- Policy: Photos are publicly viewable
CREATE POLICY "Photos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
