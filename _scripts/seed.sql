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
  
  -- Update profiles with username, full_name, avatar_url, and about sections
  UPDATE public.profiles SET 
    username = 'alexchen', 
    full_name = 'Alex Chen', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=alex',
    about = 'Travel photographer and adventure seeker. I love capturing breathtaking landscapes and sharing hidden gems from around the world. Always planning my next hiking expedition or cultural immersion trip.'
  WHERE id = '11111111-1111-1111-1111-111111111111'::uuid;
  
  UPDATE public.profiles SET 
    username = 'sarahjohnson', 
    full_name = 'Sarah Johnson', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=sarah',
    about = 'Food enthusiast and culinary explorer. I post about local cuisines, cooking experiments, and the best restaurants I discover during my travels. Currently obsessed with Southeast Asian street food.'
  WHERE id = '22222222-2222-2222-2222-222222222222'::uuid;
  
  UPDATE public.profiles SET 
    username = 'mikewilliams', 
    full_name = 'Mike Williams', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=mike',
    about = 'Digital nomad and tech professional. Sharing my experiences working remotely from different countries, coworking spaces reviews, and tips for maintaining work-life balance while traveling.'
  WHERE id = '33333333-3333-3333-3333-333333333333'::uuid;
  
  UPDATE public.profiles SET 
    username = 'emilydavis', 
    full_name = 'Emily Davis', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=emily',
    about = 'Nature lover and wildlife photographer. I share stunning shots from national parks, wildlife encounters, and eco-friendly travel tips. Passionate about conservation and sustainable tourism.'
  WHERE id = '44444444-4444-4444-4444-444444444444'::uuid;
  
  UPDATE public.profiles SET 
    username = 'chrisbrown', 
    full_name = 'Chris Brown', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=chris',
    about = 'Urban explorer and architecture enthusiast. I document interesting buildings, street art, and city vibes. Love finding unique coffee shops and local music venues in every city I visit.'
  WHERE id = '55555555-5555-5555-5555-555555555555'::uuid;
  
  UPDATE public.profiles SET 
    username = 'jessicamiller', 
    full_name = 'Jessica Miller', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=jessica',
    about = 'Beach lover and water sports enthusiast. Sharing my favorite coastal destinations, surfing spots, and underwater photography. Always chasing the perfect wave and sunset.'
  WHERE id = '66666666-6666-6666-6666-666666666666'::uuid;
  
  UPDATE public.profiles SET 
    username = 'davidwilson', 
    full_name = 'David Wilson', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=david',
    about = 'History buff and cultural explorer. I post about historical sites, museums, and cultural experiences. Love sharing interesting facts and stories from the places I visit.'
  WHERE id = '77777777-7777-7777-7777-777777777777'::uuid;
  
  UPDATE public.profiles SET 
    username = 'lisaanderson', 
    full_name = 'Lisa Anderson', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=lisa',
    about = 'Wellness traveler and yoga instructor. Sharing retreat recommendations, meditation spots, and healthy travel tips. Passionate about finding balance and mindfulness in every journey.'
  WHERE id = '88888888-8888-8888-8888-888888888888'::uuid;
  
  UPDATE public.profiles SET 
    username = 'jamestaylor', 
    full_name = 'James Taylor', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=james',
    about = 'Adventure sports enthusiast. From mountain biking to skydiving, I share adrenaline-pumping experiences and extreme sports destinations. Always looking for the next thrill.'
  WHERE id = '99999999-9999-9999-9999-999999999999'::uuid;
  
  UPDATE public.profiles SET 
    username = 'mariagarcia', 
    full_name = 'Maria Garcia', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=maria',
    about = 'Fashion and lifestyle blogger. I share travel outfits, packing tips, and stylish destinations. Love exploring local fashion scenes and boutique hotels around the world.'
  WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;
  
  UPDATE public.profiles SET 
    username = 'robertlee', 
    full_name = 'Robert Lee', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=robert',
    about = 'Train enthusiast and slow travel advocate. Documenting scenic train routes, railway stations, and the joy of overland travel. Believer in the journey being as important as the destination.'
  WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid;
  
  UPDATE public.profiles SET 
    username = 'lindamartin', 
    full_name = 'Linda Martin', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=linda',
    about = 'Family travel expert. Sharing kid-friendly destinations, travel hacks for parents, and memorable family adventures. Making travel with children fun and stress-free.'
  WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid;
  
  UPDATE public.profiles SET 
    username = 'kevinwhite', 
    full_name = 'Kevin White', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=kevin',
    about = 'Budget traveler and hostel connoisseur. Proving that amazing adventures don''t need to break the bank. Sharing money-saving tips and affordable destination guides.'
  WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid;
  
  UPDATE public.profiles SET 
    username = 'amythomas', 
    full_name = 'Amy Thomas', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=amy',
    about = 'Wine and vineyard explorer. Posting about wine regions, tasting experiences, and scenic vineyard stays. Love pairing local wines with regional cuisines.'
  WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid;
  
  UPDATE public.profiles SET 
    username = 'brianjackson', 
    full_name = 'Brian Jackson', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=brian',
    about = 'Music festival traveler. Following festivals around the globe, sharing lineup reviews, and festival survival tips. Always chasing the perfect beat and summer vibes.'
  WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid;
  
  UPDATE public.profiles SET 
    username = 'nancyharris', 
    full_name = 'Nancy Harris', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=nancy',
    about = 'Luxury travel consultant. Curating high-end experiences, five-star hotel reviews, and exclusive destination guides. Helping travelers indulge in the finer things.'
  WHERE id = '11111111-2222-3333-4444-555555555555'::uuid;
  
  UPDATE public.profiles SET 
    username = 'steveclark', 
    full_name = 'Steve Clark', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=steve',
    about = 'Motorcycle touring enthusiast. Documenting epic road trips, scenic routes, and biker-friendly destinations. Two wheels, endless adventures.'
  WHERE id = '22222222-3333-4444-5555-666666666666'::uuid;
  
  UPDATE public.profiles SET 
    username = 'karenlewis', 
    full_name = 'Karen Lewis', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=karen',
    about = 'Solo female traveler. Empowering women to explore the world safely and confidently. Sharing solo travel tips, safety advice, and inspiring stories from the road.'
  WHERE id = '33333333-4444-5555-6666-777777777777'::uuid;
  
  UPDATE public.profiles SET 
    username = 'jasonwalker', 
    full_name = 'Jason Walker', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=jason',
    about = 'Drone pilot and aerial photographer. Capturing destinations from above, sharing unique perspectives and breathtaking aerial views. Licensed drone operator with a passion for heights.'
  WHERE id = '44444444-5555-6666-7777-888888888888'::uuid;
  
  UPDATE public.profiles SET 
    username = 'michellehall', 
    full_name = 'Michelle Hall', 
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/png?seed=michelle',
    about = 'Cruise specialist and island hopper. Reviewing cruise lines, shore excursions, and tropical paradise destinations. Helping you find your perfect floating vacation.'
  WHERE id = '55555555-6666-7777-8888-999999999999'::uuid;
  
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

  RAISE NOTICE '';
  RAISE NOTICE '=== SEED DATA CREATED SUCCESSFULLY ===';
  RAISE NOTICE 'Dev user: % (dev@snapconnect.com)', auth_user_id;
  RAISE NOTICE 'Friends added: %', friend_count;
  RAISE NOTICE 'Incoming friend requests: %', incoming_requests;
  RAISE NOTICE 'Outgoing friend requests: %', outgoing_requests;
  RAISE NOTICE 'Conversations created: %', conversation_count;
  RAISE NOTICE 'Messages created: %', message_count;
  RAISE NOTICE '';
  RAISE NOTICE 'To run this again: DELETE FROM profiles WHERE email != ''dev@snapconnect.com'';';
END $$;

-- =============================================
-- ITINERARIES AND ACTIVITIES SEED DATA
-- =============================================

DO $$
DECLARE
  auth_user_id uuid;
  japan_trip_id uuid;
  italy_trip_id uuid;
  thailand_trip_id uuid;
  iceland_trip_id uuid;
  peru_trip_id uuid;
  itinerary_count integer := 0;
  activity_count integer := 0;
BEGIN
  -- Find the authenticated user by email
  SELECT id INTO auth_user_id
  FROM public.profiles
  WHERE email = 'dev@snapconnect.com';
  
  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email dev@snapconnect.com. Please sign up with this email first.';
  END IF;
    -- Create Japan Trip Itinerary
    japan_trip_id := gen_random_uuid();
    INSERT INTO public.itineraries (id, title, description, start_time, end_time, cover_image_url, created_by, created_at, updated_at)
    VALUES (
      japan_trip_id,
      'Japan Adventure 2024',
      'A 10-day journey through Tokyo, Kyoto, and Osaka exploring modern culture and ancient traditions',
      '2024-04-01 09:00:00+00',
      '2024-04-10 23:00:00+00',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      auth_user_id,
      now() - interval '30 days',
      now() - interval '5 days'
    );
    
    -- Japan Trip Activities
    INSERT INTO public.activities (title, description, location, start_time, end_time, image_url, tags, weather, temperature, precipitation_chance, gps_coords, timezone, created_by, itinerary_id)
    VALUES 
      ('Arrive at Narita Airport', 'Land in Tokyo and take the Narita Express to the city', 'Narita International Airport', 
       '2024-04-01 14:00:00+00', '2024-04-01 16:00:00+00', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 
       ARRAY['transportation', 'arrival'], 'weather-partly-cloudy', '64', '20', ARRAY[35.7647, 140.3862], 'Asia/Tokyo', auth_user_id, japan_trip_id),
      
      ('Check-in at Shinjuku Hotel', 'Get settled at the hotel and explore the neighborhood', 'Shinjuku, Tokyo',
       '2024-04-01 17:00:00+00', '2024-04-01 18:30:00+00', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600',
       ARRAY['accommodation', 'shinjuku'], 'weather-partly-cloudy', '62', '15', ARRAY[35.6938, 139.7034], 'Asia/Tokyo', auth_user_id, japan_trip_id),
       
      ('Dinner at Ichiran Ramen', 'Experience authentic tonkotsu ramen at this famous chain', 'Shibuya, Tokyo',
       '2024-04-01 19:00:00+00', '2024-04-01 20:30:00+00', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
       ARRAY['food', 'ramen', 'dinner'], 'weather-night-partly-cloudy', '58', '10', ARRAY[35.6595, 139.7006], 'Asia/Tokyo', auth_user_id, japan_trip_id),
       
      ('Visit Sensoji Temple', 'Explore Tokyo''s oldest temple and browse Nakamise shopping street', 'Asakusa, Tokyo',
       '2024-04-02 09:00:00+00', '2024-04-02 12:00:00+00', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600',
       ARRAY['temple', 'culture', 'shopping'], 'weather-sunny', '68', '5', ARRAY[35.7148, 139.7967], 'Asia/Tokyo', auth_user_id, japan_trip_id),
       
      ('Tokyo Skytree', 'Panoramic views of Tokyo from the observation deck', 'Sumida, Tokyo',
       '2024-04-02 14:00:00+00', '2024-04-02 16:00:00+00', 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600',
       ARRAY['sightseeing', 'views'], 'weather-sunny', '72', '0', ARRAY[35.7101, 139.8107], 'Asia/Tokyo', auth_user_id, japan_trip_id),
       
      ('TeamLab Borderless', 'Immersive digital art museum experience', 'Odaiba, Tokyo',
       '2024-04-03 10:00:00+00', '2024-04-03 13:00:00+00', 'https://images.unsplash.com/photo-1634912314704-c646c586b131?w=600',
       ARRAY['art', 'museum', 'technology'], 'weather-cloudy', '66', '30', ARRAY[35.6197, 139.7768], 'Asia/Tokyo', auth_user_id, japan_trip_id),
       
      ('Buy JR Pass', 'Purchase Japan Rail Pass for intercity travel', 'Tokyo Station',
       NULL, NULL, NULL, ARRAY['transportation', 'planning'], NULL, NULL, NULL, ARRAY[35.6812, 139.7671], 'Asia/Tokyo', auth_user_id, japan_trip_id),
       
      ('Pack rain jacket', 'Remember to pack rain gear for potential April showers', NULL,
       NULL, NULL, NULL, ARRAY['packing', 'preparation'], NULL, NULL, NULL, NULL, NULL, auth_user_id, japan_trip_id);
    
    -- Create Italy Vacation Itinerary
    italy_trip_id := gen_random_uuid();
    INSERT INTO public.itineraries (id, title, description, start_time, end_time, cover_image_url, created_by, created_at)
    VALUES (
      italy_trip_id,
      'Italian Renaissance Tour',
      'Exploring Rome, Florence, and Venice - art, history, and incredible food',
      '2024-06-15 10:00:00+00',
      '2024-06-25 22:00:00+00',
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
      auth_user_id,
      now() - interval '20 days'
    );
    
    -- Italy Trip Activities
    INSERT INTO public.activities (title, description, location, start_time, end_time, image_url, tags, weather, temperature, precipitation_chance, gps_coords, timezone, created_by, itinerary_id)
    VALUES 
      ('Colosseum Tour', 'Skip-the-line guided tour of the Colosseum and Roman Forum', 'Rome',
       '2024-06-16 09:00:00+00', '2024-06-16 13:00:00+00', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600',
       ARRAY['history', 'ancient rome', 'tour'], 'weather-sunny', '82', '10', ARRAY[41.8902, 12.4922], 'Europe/Rome', auth_user_id, italy_trip_id),
       
      ('Vatican Museums', 'Visit Sistine Chapel and St. Peter''s Basilica', 'Vatican City',
       '2024-06-17 08:30:00+00', '2024-06-17 14:00:00+00', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
       ARRAY['art', 'religion', 'museum'], 'weather-partly-cloudy', '79', '15', ARRAY[41.9022, 12.4539], 'Europe/Rome', auth_user_id, italy_trip_id),
       
      ('Trevi Fountain at Sunset', 'Throw a coin and make a wish at the iconic fountain', 'Rome',
       '2024-06-17 19:00:00+00', '2024-06-17 20:00:00+00', 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?w=600',
       ARRAY['landmark', 'evening'], 'weather-sunny', '75', '5', ARRAY[41.9009, 12.4833], 'Europe/Rome', auth_user_id, italy_trip_id),
       
      ('Uffizi Gallery', 'Renaissance masterpieces including Botticelli''s Birth of Venus', 'Florence',
       '2024-06-19 10:00:00+00', '2024-06-19 14:00:00+00', 'https://images.unsplash.com/photo-1547948577-967e101e81b5?w=600',
       ARRAY['art', 'renaissance', 'museum'], 'weather-sunny', '85', '0', ARRAY[43.7678, 11.2553], 'Europe/Rome', auth_user_id, italy_trip_id),
       
      ('Cooking Class in Tuscany', 'Learn to make authentic pasta and tiramisu', 'Chianti, Tuscany',
       '2024-06-20 10:00:00+00', '2024-06-20 15:00:00+00', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
       ARRAY['cooking', 'food', 'experience'], 'weather-sunny', '88', '0', ARRAY[43.4663, 11.2201], 'Europe/Rome', auth_user_id, italy_trip_id),
       
      ('Research Venice restaurants', 'Find authentic local restaurants away from tourist traps', NULL,
       NULL, NULL, NULL, ARRAY['planning', 'food'], NULL, NULL, NULL, NULL, NULL, auth_user_id, italy_trip_id);
    
    -- Create Thailand Adventure Itinerary
    thailand_trip_id := gen_random_uuid();
    INSERT INTO public.itineraries (id, title, description, start_time, end_time, cover_image_url, created_by, created_at)
    VALUES (
      thailand_trip_id,
      'Thailand Island Hopping',
      'Bangkok temples, Chiang Mai elephants, and island paradise in Phuket and Koh Phi Phi',
      '2024-11-01 06:00:00+00',
      '2024-11-14 23:00:00+00',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
      auth_user_id,
      now() - interval '10 days'
    );
    
    -- Thailand Activities
    INSERT INTO public.activities (title, description, location, start_time, end_time, image_url, tags, weather, temperature, precipitation_chance, gps_coords, timezone, created_by, itinerary_id)
    VALUES 
      ('Grand Palace & Wat Phra Kaew', 'Marvel at the golden temples and intricate Thai architecture', 'Bangkok',
       '2024-11-02 08:00:00+00', '2024-11-02 12:00:00+00', 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600',
       ARRAY['temple', 'culture', 'bangkok'], 'weather-partly-cloudy', '86', '40', ARRAY[13.7500, 100.4913], 'Asia/Bangkok', auth_user_id, thailand_trip_id),
       
      ('Floating Market Tour', 'Shop for souvenirs and try local food from boat vendors', 'Damnoen Saduak',
       '2024-11-03 06:00:00+00', '2024-11-03 13:00:00+00', 'https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=600',
       ARRAY['market', 'shopping', 'local'], 'weather-cloudy', '82', '60', ARRAY[13.5181, 99.9595], 'Asia/Bangkok', auth_user_id, thailand_trip_id),
       
      ('Elephant Nature Park', 'Ethical elephant sanctuary visit - feed and bathe rescued elephants', 'Chiang Mai',
       '2024-11-05 08:00:00+00', '2024-11-05 17:00:00+00', 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=600',
       ARRAY['animals', 'nature', 'ethical'], 'weather-rainy', '78', '70', ARRAY[18.7883, 98.9853], 'Asia/Bangkok', auth_user_id, thailand_trip_id),
       
      ('Island Hopping Tour', 'Speedboat tour to Maya Bay, Pileh Lagoon, and Monkey Beach', 'Koh Phi Phi',
       '2024-11-09 08:30:00+00', '2024-11-09 16:30:00+00', 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600',
       ARRAY['beach', 'boat', 'snorkeling'], 'weather-sunny', '88', '20', ARRAY[7.7407, 98.7784], 'Asia/Bangkok', auth_user_id, thailand_trip_id),
       
      ('Thai Massage Course', 'Half-day traditional Thai massage workshop', 'Phuket',
       '2024-11-11 09:00:00+00', '2024-11-11 13:00:00+00', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600',
       ARRAY['wellness', 'learning', 'spa'], 'weather-partly-cloudy', '84', '30', ARRAY[7.8804, 98.3923], 'Asia/Bangkok', auth_user_id, thailand_trip_id);
    
    -- Create Iceland Road Trip Itinerary (shorter, past trip)
    iceland_trip_id := gen_random_uuid();
    INSERT INTO public.itineraries (id, title, description, start_time, end_time, cover_image_url, created_by, created_at)
    VALUES (
      iceland_trip_id,
      'Iceland Ring Road Adventure',
      'Epic road trip around Iceland''s Ring Road - waterfalls, glaciers, and northern lights',
      '2023-09-15 08:00:00+00',
      '2023-09-22 20:00:00+00',
      'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800',
      auth_user_id,
      now() - interval '1 year'
    );
    
    -- Iceland Activities
    INSERT INTO public.activities (title, description, location, start_time, end_time, image_url, tags, weather, temperature, precipitation_chance, gps_coords, timezone, created_by, itinerary_id)
    VALUES 
      ('Blue Lagoon', 'Relax in the famous geothermal spa', 'Grindavík',
       '2023-09-15 14:00:00+00', '2023-09-15 17:00:00+00', 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=600',
       ARRAY['spa', 'geothermal', 'relaxation'], 'weather-cloudy', '50', '40', ARRAY[63.8804, -22.4495], 'Atlantic/Reykjavik', auth_user_id, iceland_trip_id),
       
      ('Golden Circle Tour', 'Gullfoss, Geysir, and Thingvellir National Park', 'Reykjavik Region',
       '2023-09-16 08:00:00+00', '2023-09-16 18:00:00+00', 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=600',
       ARRAY['nature', 'waterfall', 'geyser'], 'weather-partly-cloudy', '48', '30', ARRAY[64.3271, -20.1199], 'Atlantic/Reykjavik', auth_user_id, iceland_trip_id),
       
      ('Northern Lights Hunt', 'Chase the Aurora Borealis away from city lights', 'South Coast',
       '2023-09-17 21:00:00+00', '2023-09-18 01:00:00+00', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600',
       ARRAY['aurora', 'night', 'photography'], 'weather-night', '42', '20', ARRAY[63.4424, -19.0068], 'Atlantic/Reykjavik', auth_user_id, iceland_trip_id);
    
    -- Create Peru Machu Picchu Trek (future trip with minimal activities)
    peru_trip_id := gen_random_uuid();
    INSERT INTO public.itineraries (id, title, description, start_time, end_time, cover_image_url, created_by, created_at)
    VALUES (
      peru_trip_id,
      'Peru & Machu Picchu Trek',
      'Inca Trail adventure to the lost city of Machu Picchu',
      '2025-05-10 06:00:00+00',
      '2025-05-20 23:00:00+00',
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
      auth_user_id,
      now() - interval '5 days'
    );
    
    -- Peru Activities (just planning items)
    INSERT INTO public.activities (title, description, location, start_time, end_time, image_url, tags, weather, temperature, precipitation_chance, gps_coords, timezone, created_by, itinerary_id)
    VALUES 
      ('Book Inca Trail permits', 'Need to book 6 months in advance!', NULL,
       NULL, NULL, NULL, ARRAY['planning', 'urgent'], NULL, NULL, NULL, NULL, NULL, auth_user_id, peru_trip_id),
       
      ('Altitude acclimatization', 'Spend 2-3 days in Cusco before starting trek', 'Cusco',
       NULL, NULL, NULL, ARRAY['health', 'preparation'], NULL, NULL, NULL, ARRAY[-13.5319, -71.9675], 'America/Lima', auth_user_id, peru_trip_id);
    
  -- Count the created records
  SELECT COUNT(*) INTO itinerary_count FROM public.itineraries WHERE created_by = auth_user_id;
  SELECT COUNT(*) INTO activity_count FROM public.activities WHERE created_by = auth_user_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== ITINERARIES SEED DATA CREATED SUCCESSFULLY ===';
  RAISE NOTICE 'Itineraries created: %', itinerary_count;
  RAISE NOTICE 'Activities created: %', activity_count;
  RAISE NOTICE '';
  RAISE NOTICE 'To run this again: DELETE FROM profiles WHERE email != ''dev@snapconnect.com'';';
END $$;

-- =============================================
-- STORIES SEED DATA
-- =============================================

DO $$
DECLARE
  auth_user_id uuid;
  story_count integer := 0;
  story_content_count integer := 0;
  user_story_id uuid;
  content_index integer;
BEGIN
  -- Find the authenticated dev user by email (needed for count and any user-specific logic)
  SELECT id INTO auth_user_id
  FROM public.profiles
  WHERE email = 'dev@snapconnect.com';

  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email dev@snapconnect.com. Please sign up with this email first.';
  END IF;

  -- Create stories for users with travel-themed content
  -- Note: Stories are automatically created by trigger, so we just need to add content
  -- Ensure stories exist for all test users
  INSERT INTO public.stories (user_id)
  SELECT id FROM public.profiles
  WHERE id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    '66666666-6666-6666-6666-666666666666'::uuid,
    '77777777-7777-7777-7777-777777777777'::uuid,
    '88888888-8888-8888-8888-888888888888'::uuid,
    '99999999-9999-9999-9999-999999999999'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Alex Chen - Travel photographer
  SELECT id INTO user_story_id FROM public.stories WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid;
  IF user_story_id IS NOT NULL THEN
    INSERT INTO public.story_contents (story_id, user_id, type, content_url, index, created_at)
    VALUES 
      (user_story_id, '11111111-1111-1111-1111-111111111111'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop', 0, now() - interval '2 hours'),
      (user_story_id, '11111111-1111-1111-1111-111111111111'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&h=900&fit=crop', 1, now() - interval '2 hours'),
      (user_story_id, '11111111-1111-1111-1111-111111111111'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=600&h=900&fit=crop', 2, now() - interval '2 hours');
    story_content_count := story_content_count + 3;
  END IF;
  
  -- Sarah Johnson - Food enthusiast
  SELECT id INTO user_story_id FROM public.stories WHERE user_id = '22222222-2222-2222-2222-222222222222'::uuid;
  IF user_story_id IS NOT NULL THEN
    INSERT INTO public.story_contents (story_id, user_id, type, content_url, index, created_at)
    VALUES 
      (user_story_id, '22222222-2222-2222-2222-222222222222'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=900&fit=crop', 0, now() - interval '4 hours'),
      (user_story_id, '22222222-2222-2222-2222-222222222222'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=900&fit=crop', 1, now() - interval '4 hours'),
      (user_story_id, '22222222-2222-2222-2222-222222222222'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=900&fit=crop', 2, now() - interval '4 hours'),
      (user_story_id, '22222222-2222-2222-2222-222222222222'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=900&fit=crop', 3, now() - interval '4 hours');
    story_content_count := story_content_count + 4;
  END IF;
  
  -- Emily Davis - Nature photographer
  SELECT id INTO user_story_id FROM public.stories WHERE user_id = '44444444-4444-4444-4444-444444444444'::uuid;
  IF user_story_id IS NOT NULL THEN
    INSERT INTO public.story_contents (story_id, user_id, type, content_url, index, created_at)
    VALUES 
      (user_story_id, '44444444-4444-4444-4444-444444444444'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=900&fit=crop', 0, now() - interval '6 hours'),
      (user_story_id, '44444444-4444-4444-4444-444444444444'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600&h=900&fit=crop', 1, now() - interval '6 hours'),
      (user_story_id, '44444444-4444-4444-4444-444444444444'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=600&h=900&fit=crop', 2, now() - interval '6 hours');
    story_content_count := story_content_count + 3;
  END IF;
  
  -- Jessica Miller - Beach lover
  SELECT id INTO user_story_id FROM public.stories WHERE user_id = '66666666-6666-6666-6666-666666666666'::uuid;
  IF user_story_id IS NOT NULL THEN
    INSERT INTO public.story_contents (story_id, user_id, type, content_url, index, created_at)
    VALUES 
      (user_story_id, '66666666-6666-6666-6666-666666666666'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=900&fit=crop', 0, now() - interval '8 hours'),
      (user_story_id, '66666666-6666-6666-6666-666666666666'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=900&fit=crop', 1, now() - interval '8 hours'),
      (user_story_id, '66666666-6666-6666-6666-666666666666'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&h=900&fit=crop', 2, now() - interval '8 hours'),
      (user_story_id, '66666666-6666-6666-6666-666666666666'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1514832049050-c85c0c07bd16?w=600&h=900&fit=crop', 3, now() - interval '8 hours'),
      (user_story_id, '66666666-6666-6666-6666-666666666666'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&h=900&fit=crop', 4, now() - interval '8 hours');
    story_content_count := story_content_count + 5;
  END IF;
  
  -- Chris Brown - Urban explorer
  SELECT id INTO user_story_id FROM public.stories WHERE user_id = '55555555-5555-5555-5555-555555555555'::uuid;
  IF user_story_id IS NOT NULL THEN
    INSERT INTO public.story_contents (story_id, user_id, type, content_url, index, created_at)
    VALUES 
      (user_story_id, '55555555-5555-5555-5555-555555555555'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&h=900&fit=crop', 0, now() - interval '12 hours'),
      (user_story_id, '55555555-5555-5555-5555-555555555555'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=900&fit=crop', 1, now() - interval '12 hours'),
      (user_story_id, '55555555-5555-5555-5555-555555555555'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=900&fit=crop', 2, now() - interval '12 hours');
    story_content_count := story_content_count + 3;
  END IF;
  
  -- David Wilson - History buff
  SELECT id INTO user_story_id FROM public.stories WHERE user_id = '77777777-7777-7777-7777-777777777777'::uuid;
  IF user_story_id IS NOT NULL THEN
    INSERT INTO public.story_contents (story_id, user_id, type, content_url, index, created_at)
    VALUES 
      (user_story_id, '77777777-7777-7777-7777-777777777777'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=900&fit=crop', 0, now() - interval '1 day'),
      (user_story_id, '77777777-7777-7777-7777-777777777777'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=900&fit=crop', 1, now() - interval '1 day');
    story_content_count := story_content_count + 2;
  END IF;
  
  -- Lisa Anderson - Wellness traveler
  SELECT id INTO user_story_id FROM public.stories WHERE user_id = '88888888-8888-8888-8888-888888888888'::uuid;
  IF user_story_id IS NOT NULL THEN
    INSERT INTO public.story_contents (story_id, user_id, type, content_url, index, created_at)
    VALUES 
      (user_story_id, '88888888-8888-8888-8888-888888888888'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=900&fit=crop', 0, now() - interval '1 day'),
      (user_story_id, '88888888-8888-8888-8888-888888888888'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=900&fit=crop', 1, now() - interval '1 day'),
      (user_story_id, '88888888-8888-8888-8888-888888888888'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=900&fit=crop', 2, now() - interval '1 day');
    story_content_count := story_content_count + 3;
  END IF;
  
  -- James Taylor - Adventure sports
  SELECT id INTO user_story_id FROM public.stories WHERE user_id = '99999999-9999-9999-9999-999999999999'::uuid;
  IF user_story_id IS NOT NULL THEN
    INSERT INTO public.story_contents (story_id, user_id, type, content_url, index, created_at)
    VALUES 
      (user_story_id, '99999999-9999-9999-9999-999999999999'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1540324155974-7523202daa3f?w=600&h=900&fit=crop', 0, now() - interval '2 days'),
      (user_story_id, '99999999-9999-9999-9999-999999999999'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=900&fit=crop', 1, now() - interval '2 days');
    story_content_count := story_content_count + 2;
  END IF;
  
  -- Maria Garcia - Fashion blogger
  SELECT id INTO user_story_id FROM public.stories WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;
  IF user_story_id IS NOT NULL THEN
    INSERT INTO public.story_contents (story_id, user_id, type, content_url, index, created_at)
    VALUES 
      (user_story_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=900&fit=crop', 0, now() - interval '3 days'),
      (user_story_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&h=900&fit=crop', 1, now() - interval '3 days'),
      (user_story_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1490650404312-a2175773bbf5?w=600&h=900&fit=crop', 2, now() - interval '3 days'),
      (user_story_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'photo', 
       'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?w=600&h=900&fit=crop', 3, now() - interval '3 days');
    story_content_count := story_content_count + 4;
  END IF;
  
  -- Update story timestamps
  UPDATE public.stories 
  SET updated_at = now() - (random() * interval '3 days')
  WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    '66666666-6666-6666-6666-666666666666'::uuid,
    '77777777-7777-7777-7777-777777777777'::uuid,
    '88888888-8888-8888-8888-888888888888'::uuid,
    '99999999-9999-9999-9999-999999999999'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
  );
  
  SELECT COUNT(*) INTO story_count FROM public.stories WHERE user_id != auth_user_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== STORIES SEED DATA CREATED SUCCESSFULLY ===';
  RAISE NOTICE 'Stories with content: %', story_count;
  RAISE NOTICE 'Story contents created: %', story_content_count;
  RAISE NOTICE '';
END $$;