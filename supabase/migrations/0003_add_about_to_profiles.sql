-- Add about field to profiles table
ALTER TABLE "public"."profiles"
ADD COLUMN IF NOT EXISTS "about" "text";

-- Update the trigger function to include about field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email, avatar_url, about)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'about'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;