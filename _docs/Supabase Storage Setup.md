# Supabase Storage Setup for Photo Sharing

## 🚀 Automated Setup (Recommended)

### Option 1: Run Setup Script (CLI)
```bash
# Run the automated setup script
./_scripts/setup_storage.sh
```

**Requirements:**
- Supabase CLI installed: `npm install -g supabase`
- Project initialized: `supabase init` (if not done already)

### Option 2: Copy-Paste SQL (Dashboard)
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy the contents of `_scripts/setup_storage.sql`
3. Paste and click **"Run"**

---

## 📝 Manual Setup (Fallback)

If the automated options don't work, follow these manual steps:

### 1. Create Storage Bucket

In your Supabase dashboard:

1. Go to **Storage** → **Buckets**
2. Click **New Bucket**
3. Set bucket name: `photos`
4. Make it **Public** (for MVP with public URLs)
5. Click **Create**

### 2. Set Up Bucket Policies

Go to **Storage** → **Policies** and create these policies for the `photos` bucket:

#### Allow Insert (Upload Photos)
```sql
CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Allow Select (View Photos)  
```sql
CREATE POLICY "Photos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');
```

#### Allow Delete (Delete Own Photos)
```sql
CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Folder Structure

Photos will be organized as:
```
photos/
├── user_123/
│   ├── user_123_1640995200000.jpg
│   └── user_123_1640995300000.jpg
└── user_456/
    └── user_456_1640995400000.jpg
```

### 4. Public Access (for now)

With the bucket set to public and the SELECT policy above, photo URLs will be accessible like:
```
https://[project-id].supabase.co/storage/v1/object/public/photos/user_123/photo.jpg
```

### 5. Testing Storage

You can test the storage setup by:

1. Taking a photo in the app
2. Sharing it to a friend
3. Checking the Supabase Storage dashboard to see the uploaded file
4. Viewing the photo in a conversation

## Security Notes for Production

- **MVP**: Uses public URLs for simplicity
- **Production**: Consider implementing signed URLs for private photos
- **File Validation**: Server-side validation for file types and sizes
- **Rate Limiting**: Implement upload limits per user 