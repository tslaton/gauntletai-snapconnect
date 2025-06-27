-- Seed data script - Run this AFTER creating your account
-- Usage:
-- 1. Run: npx supabase db reset
-- 2. Sign up in your app with email: dev@snapconnect.com
-- 3. Run: psql $DATABASE_URL < supabase/seed.sql
-- Or run directly in Supabase SQL editor

DO $$
DECLARE
  auth_user_id uuid;
  test_user_id uuid;
  conversation_id uuid;
  friend_count integer := 0;
  incoming_requests integer := 0;
  outgoing_requests integer := 0;
  conversation_count integer := 0;
  message_count integer := 0;
BEGIN
  -- Find the authenticated user by email
  SELECT id INTO auth_user_id
  FROM public.profiles
  WHERE email = 'dev@snapconnect.com';
  
  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email dev@snapconnect.com. Please sign up with this email first.';
  END IF;
  
  RAISE NOTICE 'Found dev user with ID: %', auth_user_id;
  
  -- First, insert test users into auth.users (if they don't exist)
  -- Using fixed UUIDs so we can reference them
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'alex.chen@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'sarah.johnson@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'mike.williams@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('44444444-4444-4444-4444-444444444444'::uuid, 'emily.davis@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('55555555-5555-5555-5555-555555555555'::uuid, 'chris.brown@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('66666666-6666-6666-6666-666666666666'::uuid, 'jessica.miller@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('77777777-7777-7777-7777-777777777777'::uuid, 'david.wilson@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('88888888-8888-8888-8888-888888888888'::uuid, 'lisa.anderson@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('99999999-9999-9999-9999-999999999999'::uuid, 'james.taylor@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'maria.garcia@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'robert.lee@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'linda.martin@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'kevin.white@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'amy.thomas@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'brian.jackson@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('11111111-2222-3333-4444-555555555555'::uuid, 'nancy.harris@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('22222222-3333-4444-5555-666666666666'::uuid, 'steve.clark@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('33333333-4444-5555-6666-777777777777'::uuid, 'karen.lewis@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('44444444-5555-6666-7777-888888888888'::uuid, 'jason.walker@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('55555555-6666-7777-8888-999999999999'::uuid, 'michelle.hall@example.com', crypt('password123', gen_salt('bf')), now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Create corresponding profiles (the trigger might do this, but let's be explicit)
  WITH test_users AS (
    SELECT id, username, full_name, email, avatar_seed
    FROM (VALUES
      ('11111111-1111-1111-1111-111111111111'::uuid, 'alexchen', 'Alex Chen', 'alex.chen@example.com', 'alex'),
      ('22222222-2222-2222-2222-222222222222'::uuid, 'sarahjohnson', 'Sarah Johnson', 'sarah.johnson@example.com', 'sarah'),
      ('33333333-3333-3333-3333-333333333333'::uuid, 'mikewilliams', 'Mike Williams', 'mike.williams@example.com', 'mike'),
      ('44444444-4444-4444-4444-444444444444'::uuid, 'emilydavis', 'Emily Davis', 'emily.davis@example.com', 'emily'),
      ('55555555-5555-5555-5555-555555555555'::uuid, 'chrisbrown', 'Chris Brown', 'chris.brown@example.com', 'chris'),
      ('66666666-6666-6666-6666-666666666666'::uuid, 'jessicamiller', 'Jessica Miller', 'jessica.miller@example.com', 'jessica'),
      ('77777777-7777-7777-7777-777777777777'::uuid, 'davidwilson', 'David Wilson', 'david.wilson@example.com', 'david'),
      ('88888888-8888-8888-8888-888888888888'::uuid, 'lisaanderson', 'Lisa Anderson', 'lisa.anderson@example.com', 'lisa'),
      ('99999999-9999-9999-9999-999999999999'::uuid, 'jamestaylor', 'James Taylor', 'james.taylor@example.com', 'james'),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'mariagarcia', 'Maria Garcia', 'maria.garcia@example.com', 'maria'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'robertlee', 'Robert Lee', 'robert.lee@example.com', 'robert'),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'lindamartin', 'Linda Martin', 'linda.martin@example.com', 'linda'),
      ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'kevinwhite', 'Kevin White', 'kevin.white@example.com', 'kevin'),
      ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'amythomas', 'Amy Thomas', 'amy.thomas@example.com', 'amy'),
      ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'brianjackson', 'Brian Jackson', 'brian.jackson@example.com', 'brian'),
      ('11111111-2222-3333-4444-555555555555'::uuid, 'nancyharris', 'Nancy Harris', 'nancy.harris@example.com', 'nancy'),
      ('22222222-3333-4444-5555-666666666666'::uuid, 'steveclark', 'Steve Clark', 'steve.clark@example.com', 'steve'),
      ('33333333-4444-5555-6666-777777777777'::uuid, 'karenlewis', 'Karen Lewis', 'karen.lewis@example.com', 'karen'),
      ('44444444-5555-6666-7777-888888888888'::uuid, 'jasonwalker', 'Jason Walker', 'jason.walker@example.com', 'jason'),
      ('55555555-6666-7777-8888-999999999999'::uuid, 'michellehall', 'Michelle Hall', 'michelle.hall@example.com', 'michelle')
    ) AS t(id, username, full_name, email, avatar_seed)
  )
  INSERT INTO public.profiles (id, username, full_name, email, avatar_url, updated_at)
  SELECT 
    id,
    username,
    full_name,
    email,
    'https://api.dicebear.com/7.x/avataaars/png?seed=' || avatar_seed,
    now() - (random() * interval '365 days')
  FROM test_users
  ON CONFLICT (id) DO NOTHING;
  
  -- Update profiles with username, full_name, and avatar_url (trigger only sets minimal fields)
  UPDATE public.profiles SET username = 'alexchen', full_name = 'Alex Chen', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=alex' WHERE id = '11111111-1111-1111-1111-111111111111'::uuid;
  UPDATE public.profiles SET username = 'sarahjohnson', full_name = 'Sarah Johnson', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=sarah' WHERE id = '22222222-2222-2222-2222-222222222222'::uuid;
  UPDATE public.profiles SET username = 'mikewilliams', full_name = 'Mike Williams', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=mike' WHERE id = '33333333-3333-3333-3333-333333333333'::uuid;
  UPDATE public.profiles SET username = 'emilydavis', full_name = 'Emily Davis', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=emily' WHERE id = '44444444-4444-4444-4444-444444444444'::uuid;
  UPDATE public.profiles SET username = 'chrisbrown', full_name = 'Chris Brown', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=chris' WHERE id = '55555555-5555-5555-5555-555555555555'::uuid;
  UPDATE public.profiles SET username = 'jessicamiller', full_name = 'Jessica Miller', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=jessica' WHERE id = '66666666-6666-6666-6666-666666666666'::uuid;
  UPDATE public.profiles SET username = 'davidwilson', full_name = 'David Wilson', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=david' WHERE id = '77777777-7777-7777-7777-777777777777'::uuid;
  UPDATE public.profiles SET username = 'lisaanderson', full_name = 'Lisa Anderson', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=lisa' WHERE id = '88888888-8888-8888-8888-888888888888'::uuid;
  UPDATE public.profiles SET username = 'jamestaylor', full_name = 'James Taylor', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=james' WHERE id = '99999999-9999-9999-9999-999999999999'::uuid;
  UPDATE public.profiles SET username = 'mariagarcia', full_name = 'Maria Garcia', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=maria' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;
  UPDATE public.profiles SET username = 'robertlee', full_name = 'Robert Lee', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=robert' WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid;
  UPDATE public.profiles SET username = 'lindamartin', full_name = 'Linda Martin', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=linda' WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid;
  UPDATE public.profiles SET username = 'kevinwhite', full_name = 'Kevin White', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=kevin' WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid;
  UPDATE public.profiles SET username = 'amythomas', full_name = 'Amy Thomas', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=amy' WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid;
  UPDATE public.profiles SET username = 'brianjackson', full_name = 'Brian Jackson', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=brian' WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid;
  UPDATE public.profiles SET username = 'nancyharris', full_name = 'Nancy Harris', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=nancy' WHERE id = '11111111-2222-3333-4444-555555555555'::uuid;
  UPDATE public.profiles SET username = 'steveclark', full_name = 'Steve Clark', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=steve' WHERE id = '22222222-3333-4444-5555-666666666666'::uuid;
  UPDATE public.profiles SET username = 'karenlewis', full_name = 'Karen Lewis', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=karen' WHERE id = '33333333-4444-5555-6666-777777777777'::uuid;
  UPDATE public.profiles SET username = 'jasonwalker', full_name = 'Jason Walker', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=jason' WHERE id = '44444444-5555-6666-7777-888888888888'::uuid;
  UPDATE public.profiles SET username = 'michellehall', full_name = 'Michelle Hall', avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=michelle' WHERE id = '55555555-6666-7777-8888-999999999999'::uuid;
  
  -- Make first 10 test users friends with auth user
  FOR test_user_id IN 
    SELECT id FROM public.profiles 
    WHERE id IN (
      '11111111-1111-1111-1111-111111111111'::uuid,
      '22222222-2222-2222-2222-222222222222'::uuid,
      '33333333-3333-3333-3333-333333333333'::uuid,
      '44444444-4444-4444-4444-444444444444'::uuid,
      '55555555-5555-5555-5555-555555555555'::uuid,
      '66666666-6666-6666-6666-666666666666'::uuid,
      '77777777-7777-7777-7777-777777777777'::uuid,
      '88888888-8888-8888-8888-888888888888'::uuid,
      '99999999-9999-9999-9999-999999999999'::uuid,
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
    )
  LOOP
    -- Add bidirectional friendship
    INSERT INTO public.friends (user_id, friend_id, created_at)
    VALUES 
      (auth_user_id, test_user_id, now() - (random() * interval '180 days')),
      (test_user_id, auth_user_id, now() - (random() * interval '180 days'))
    ON CONFLICT DO NOTHING;
    
    friend_count := friend_count + 1;
    
    -- Create conversation with 70% of friends
    IF random() < 0.7 THEN
      conversation_id := gen_random_uuid();
      
      INSERT INTO public.conversations (id, type, created_at, updated_at)
      VALUES (
        conversation_id,
        'direct',
        now() - (random() * interval '30 days'),
        now() - (random() * interval '1 day')
      );
      
      -- Add participants
      INSERT INTO public.conversation_participants (conversation_id, user_id, joined_at, last_read_at)
      VALUES 
        (conversation_id, auth_user_id, now() - (random() * interval '30 days'), 
         CASE WHEN random() < 0.8 THEN now() - (random() * interval '1 day') ELSE NULL END),
        (conversation_id, test_user_id, now() - (random() * interval '30 days'),
         CASE WHEN random() < 0.6 THEN now() - (random() * interval '2 days') ELSE NULL END);
      
      conversation_count := conversation_count + 1;
      
      -- Add realistic conversation messages
      DECLARE
        messages text[] := ARRAY[
          'Hey! How are you doing?',
          'I''m good thanks! Just working on a new project',
          'That sounds interesting! What kind of project?',
          'Building a social app actually',
          'Nice! Let me know if you need any help',
          'Thanks, I might take you up on that!',
          'Did you see the news today?',
          'Yeah, crazy stuff happening',
          'Want to grab lunch tomorrow?',
          'Sure! The usual place?',
          'Sounds perfect',
          'See you at noon then',
          'Looking forward to it!',
          'Me too!',
          'How was your weekend?',
          'Pretty chill, just relaxed mostly',
          'Sometimes that''s exactly what you need',
          'Absolutely!',
          'Any plans for tonight?',
          'Not really, might just watch a movie'
        ];
        msg_count integer;
        msg_text text;
        sender uuid;
        msg_time timestamp;
      BEGIN
        msg_count := 3 + floor(random() * 8)::int; -- 3-10 messages per conversation
        msg_time := now() - interval '30 days';
        
        FOR i IN 1..msg_count LOOP
          msg_text := messages[1 + floor(random() * array_length(messages, 1))::int];
          sender := CASE WHEN random() < 0.5 THEN auth_user_id ELSE test_user_id END;
          msg_time := msg_time + (random() * interval '2 days');
          
          INSERT INTO public.messages (
            conversation_id, 
            sender_id, 
            content, 
            type, 
            created_at, 
            expires_at
          )
          VALUES (
            conversation_id,
            sender,
            msg_text,
            'text',
            msg_time,
            now() + interval '7 days' + (random() * interval '3 days')
          );
          
          message_count := message_count + 1;
        END LOOP;
        
        -- Update conversation updated_at to last message time
        UPDATE public.conversations 
        SET updated_at = msg_time 
        WHERE id = conversation_id;
      END;
    END IF;
  END LOOP;
  
  -- Create incoming friend requests (users 11-15)
  FOR test_user_id IN 
    SELECT id FROM public.profiles 
    WHERE id IN (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
      'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
      'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
      'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
    )
  LOOP
    INSERT INTO public.friend_requests (requester_id, addressee_id, status, created_at, updated_at)
    VALUES (
      test_user_id,
      auth_user_id,
      'pending',
      now() - (random() * interval '7 days'),
      now() - (random() * interval '7 days')
    )
    ON CONFLICT DO NOTHING;
    
    incoming_requests := incoming_requests + 1;
  END LOOP;
  
  -- Create outgoing friend requests (users 16-20)
  FOR test_user_id IN 
    SELECT id FROM public.profiles 
    WHERE id IN (
      '11111111-2222-3333-4444-555555555555'::uuid,
      '22222222-3333-4444-5555-666666666666'::uuid,
      '33333333-4444-5555-6666-777777777777'::uuid,
      '44444444-5555-6666-7777-888888888888'::uuid,
      '55555555-6666-7777-8888-999999999999'::uuid
    )
  LOOP
    INSERT INTO public.friend_requests (requester_id, addressee_id, status, created_at, updated_at)
    VALUES (
      auth_user_id,
      test_user_id,
      'pending',
      now() - (random() * interval '7 days'),
      now() - (random() * interval '7 days')
    )
    ON CONFLICT DO NOTHING;
    
    outgoing_requests := outgoing_requests + 1;
  END LOOP;
  
  -- Create some friendships between test users for realism
  INSERT INTO public.friends (user_id, friend_id, created_at)
  SELECT 
    p1.id,
    p2.id,
    now() - (random() * interval '180 days')
  FROM public.profiles p1
  CROSS JOIN public.profiles p2
  WHERE p1.username LIKE '%chen' OR p1.username LIKE '%johnson' OR p1.username LIKE '%williams'
    AND p2.username LIKE '%davis' OR p2.username LIKE '%brown' OR p2.username LIKE '%miller'
    AND p1.id < p2.id
    AND p1.id != auth_user_id
    AND p2.id != auth_user_id
  ON CONFLICT DO NOTHING;
  
  -- Add reverse friendships
  INSERT INTO public.friends (user_id, friend_id, created_at)
  SELECT friend_id, user_id, created_at
  FROM public.friends
  WHERE user_id != auth_user_id 
    AND friend_id != auth_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.friends f2 
      WHERE f2.user_id = friends.friend_id 
      AND f2.friend_id = friends.user_id
    );
  
  -- Insert 20 sample events with future start times
  INSERT INTO public.events (title, description, location, start_time, end_time, image_url, tags, max_attendees, created_by)
  VALUES
    ('Tech Startup Networking Night', 'Connect with fellow entrepreneurs and tech professionals in a casual setting. Share ideas, find collaborators, and build your network.', 'WeWork Downtown, 123 Main St', now() + interval '2 days' + interval '6 hours', now() + interval '2 days' + interval '9 hours', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400', ARRAY['networking', 'technology', 'startup', 'business'], 50, '11111111-1111-1111-1111-111111111111'::uuid),
    ('Morning Yoga in the Park', 'Start your day with peaceful yoga practice surrounded by nature. All levels welcome, mats provided.', 'Central Park East Meadow', now() + interval '1 day' + interval '7 hours', now() + interval '1 day' + interval '8 hours', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', ARRAY['yoga', 'wellness', 'outdoor', 'fitness'], 30, '22222222-2222-2222-2222-222222222222'::uuid),
    ('Coffee & Code Meetup', 'Bring your laptop and work on projects together. Great for freelancers, students, and anyone who enjoys coding in company.', 'Blue Bottle Coffee, 456 Oak Ave', now() + interval '3 days' + interval '10 hours', now() + interval '3 days' + interval '13 hours', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', ARRAY['coding', 'programming', 'coffee', 'productivity'], 20, '33333333-3333-3333-3333-333333333333'::uuid),
    ('Weekend Hiking Adventure', 'Explore beautiful mountain trails with a group of nature lovers. Moderate difficulty, bring water and snacks.', 'Mountain View Trailhead, Parking Lot A', now() + interval '5 days' + interval '8 hours', now() + interval '5 days' + interval '14 hours', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400', ARRAY['hiking', 'outdoor', 'nature', 'adventure'], 15, '44444444-4444-4444-4444-444444444444'::uuid),
    ('Board Game Night', 'Come play modern board games and meet fellow enthusiasts. We have a huge collection of games for all skill levels.', 'The Game Corner, 789 Pine St', now() + interval '4 days' + interval '19 hours', now() + interval '4 days' + interval '22 hours', 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400', ARRAY['games', 'social', 'indoor', 'strategy'], 25, '55555555-5555-5555-5555-555555555555'::uuid),
    ('Photography Walk Downtown', 'Capture the city''s beauty with fellow photographers. Tips on urban photography and great spots to discover.', 'City Hall Steps, 321 Government Plaza', now() + interval '6 days' + interval '15 hours', now() + interval '6 days' + interval '18 hours', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400', ARRAY['photography', 'art', 'urban', 'creative'], 12, '66666666-6666-6666-6666-666666666666'::uuid),
    ('Book Club Discussion', 'This month we''re reading "The Midnight Library" by Matt Haig. Join us for thoughtful discussion and great conversation.', 'Corner Bookstore Café, 654 Literary Lane', now() + interval '8 days' + interval '18 hours', now() + interval '8 days' + interval '20 hours', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', ARRAY['books', 'literature', 'discussion', 'intellectual'], 15, '77777777-7777-7777-7777-777777777777'::uuid),
    ('Cooking Class: Italian Cuisine', 'Learn to make authentic pasta and sauce from scratch. All ingredients provided, take home recipes included.', 'Culinary Arts Studio, 987 Flavor Street', now() + interval '7 days' + interval '17 hours', now() + interval '7 days' + interval '20 hours', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', ARRAY['cooking', 'food', 'learning', 'italian'], 18, '88888888-8888-8888-8888-888888888888'::uuid),
    ('Live Jazz Performance', 'Enjoy an evening of smooth jazz with local musicians. Intimate venue with great acoustics and craft cocktails.', 'The Blue Note, 159 Music Row', now() + interval '9 days' + interval '20 hours', now() + interval '9 days' + interval '23 hours', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', ARRAY['music', 'jazz', 'performance', 'nightlife'], 60, '99999999-9999-9999-9999-999999999999'::uuid),
    ('Volunteer Beach Cleanup', 'Help keep our coastline beautiful while meeting environmentally conscious people. Gloves and bags provided.', 'Sunset Beach, North Parking Area', now() + interval '10 days' + interval '9 hours', now() + interval '10 days' + interval '12 hours', 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400', ARRAY['volunteer', 'environment', 'beach', 'community'], 40, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid),
    ('Rock Climbing Beginner Session', 'Learn the basics of indoor rock climbing with experienced instructors. All equipment provided, no experience needed.', 'Vertical Limits Climbing Gym, 753 Adventure Way', now() + interval '11 days' + interval '14 hours', now() + interval '11 days' + interval '16 hours', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', ARRAY['climbing', 'fitness', 'adventure', 'beginner'], 12, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid),
    ('Art Gallery Opening', 'Celebrate emerging local artists at this month''s featured exhibition. Wine, cheese, and inspiring conversations.', 'Modern Art Collective, 852 Canvas Street', now() + interval '12 days' + interval '18 hours', now() + interval '12 days' + interval '21 hours', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400', ARRAY['art', 'gallery', 'culture', 'social'], 80, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid),
    ('Meditation & Mindfulness Workshop', 'Learn practical techniques for stress reduction and mental clarity. Suitable for beginners and experienced practitioners.', 'Zen Center, 147 Peaceful Path', now() + interval '13 days' + interval '10 hours', now() + interval '13 days' + interval '12 hours', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', ARRAY['meditation', 'mindfulness', 'wellness', 'stress-relief'], 25, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid),
    ('Stand-up Comedy Open Mic', 'Share laughs and support local comedians. Open mic starts at 8pm, come early for good seats and drink specials.', 'The Laugh Track, 369 Comedy Lane', now() + interval '14 days' + interval '20 hours', now() + interval '14 days' + interval '22 hours', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', ARRAY['comedy', 'entertainment', 'open-mic', 'nightlife'], 50, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid),
    ('Farmers Market Tour', 'Discover local vendors, seasonal produce, and artisanal goods. Perfect for food lovers and sustainable living enthusiasts.', 'Downtown Farmers Market, Central Square', now() + interval '15 days' + interval '9 hours', now() + interval '15 days' + interval '12 hours', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400', ARRAY['food', 'local', 'sustainable', 'community'], 35, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid),
    ('Chess Tournament', 'Test your strategic skills against players of all levels. Prizes for winners, lessons for beginners.', 'Central Library Meeting Room B', now() + interval '16 days' + interval '13 hours', now() + interval '16 days' + interval '17 hours', 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400', ARRAY['chess', 'strategy', 'competition', 'intellectual'], 32, '11111111-2222-3333-4444-555555555555'::uuid),
    ('Wine Tasting Evening', 'Sample wines from local vineyards with expert sommelier guidance. Learn about tasting notes and wine pairing.', 'Vintage Wine Bar, 741 Grape Street', now() + interval '17 days' + interval '19 hours', now() + interval '17 days' + interval '22 hours', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', ARRAY['wine', 'tasting', 'education', 'social'], 24, '22222222-3333-4444-5555-666666666666'::uuid),
    ('Salsa Dancing Lesson', 'Learn basic salsa steps and enjoy Latin music. No partner needed, beginner-friendly with experienced instructors.', 'Dance Studio Libre, 258 Rhythm Road', now() + interval '18 days' + interval '19 hours', now() + interval '18 days' + interval '21 hours', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400', ARRAY['dance', 'salsa', 'music', 'social'], 30, '33333333-4444-5555-6666-777777777777'::uuid),
    ('Podcast Recording Workshop', 'Learn the basics of podcast production, from recording to editing. Equipment provided, bring your ideas.', 'Audio Production Studio, 963 Sound Wave Ave', now() + interval '19 days' + interval '14 hours', now() + interval '19 days' + interval '17 hours', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400', ARRAY['podcast', 'audio', 'media', 'creative'], 16, '44444444-5555-6666-7777-888888888888'::uuid),
    ('Community Garden Planting', 'Help plant vegetables and flowers in our neighborhood garden. Learn about sustainable gardening and take home herbs.', 'Riverside Community Garden, 159 Green Thumb Way', now() + interval '20 days' + interval '10 hours', now() + interval '20 days' + interval '13 hours', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', ARRAY['gardening', 'community', 'sustainable', 'outdoor'], 28, '55555555-6666-7777-8888-999999999999'::uuid);

  RAISE NOTICE '';
  RAISE NOTICE '=== SEED DATA CREATED SUCCESSFULLY ===';
  RAISE NOTICE 'Dev user: % (dev@snapconnect.com)', auth_user_id;
  RAISE NOTICE 'Friends added: %', friend_count;
  RAISE NOTICE 'Incoming friend requests: %', incoming_requests;
  RAISE NOTICE 'Outgoing friend requests: %', outgoing_requests;
  RAISE NOTICE 'Conversations created: %', conversation_count;
  RAISE NOTICE 'Messages created: %', message_count;
  RAISE NOTICE 'Events created: 20';
  RAISE NOTICE '';
  RAISE NOTICE 'To run this again: DELETE FROM profiles WHERE email != ''dev@snapconnect.com'';';
END $$;