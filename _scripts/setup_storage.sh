#!/bin/bash

# Supabase Storage Setup Script
# Sets up the photos bucket and RLS policies for SnapConnect

set -e  # Exit on any error

echo "🚀 Setting up Supabase Storage for SnapConnect..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory."
    echo "   Make sure you're in the project root and have run 'supabase init'"
    exit 1
fi

echo "📦 Creating photos storage bucket..."

# Create the SQL migration for storage setup
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_setup_photo_storage.sql << 'EOF'
-- Create photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Photos are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- Policy: Users can upload photos to their own folder
CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
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
EOF

echo "🔄 Applying migration to local database..."
supabase db reset

echo "📤 Pushing changes to remote database..."
read -p "Do you want to push to remote Supabase? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    supabase db push
    echo "✅ Remote database updated!"
else
    echo "⏭️  Skipped remote push. Run 'supabase db push' later to sync."
fi

echo ""
echo "🎉 Storage setup complete!"
echo ""
echo "📋 What was created:"
echo "   ✅ 'photos' bucket (public)"
echo "   ✅ Upload policy (users can upload to their folder)"
echo "   ✅ View policy (photos are publicly viewable)"
echo "   ✅ Delete policy (users can delete their own photos)"
echo ""
echo "🧪 Test your setup:"
echo "   1. Restart your Expo app"
echo "   2. Take a photo and try sharing it"
echo "   3. Check Supabase Dashboard > Storage to see uploaded files"
echo ""
echo "📁 Photo structure: photos/user_123/photo.jpg"
EOF 