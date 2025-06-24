-- Enable Row Level Security on all messaging tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONVERSATIONS TABLE POLICIES
-- =====================================================

-- Users can view conversations they participate in
CREATE POLICY "Users can view their conversations" ON conversations 
FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = (SELECT auth.uid()) AND is_active = true
  )
);

-- Users can create new conversations (they will be added as participants separately)
CREATE POLICY "Users can create conversations" ON conversations 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Users can update conversations they participate in (for title changes in group chats)
CREATE POLICY "Users can update their conversations" ON conversations 
FOR UPDATE 
TO authenticated 
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = (SELECT auth.uid()) AND is_active = true
  )
) 
WITH CHECK (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = (SELECT auth.uid()) AND is_active = true
  )
);

-- Users cannot delete conversations (they can only leave them)
CREATE POLICY "Users cannot delete conversations" ON conversations 
FOR DELETE 
TO authenticated 
USING (false);

-- =====================================================
-- CONVERSATION_PARTICIPANTS TABLE POLICIES
-- =====================================================

-- Users can view participants of conversations they participate in
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants 
FOR SELECT 
TO authenticated 
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants cp 
    WHERE cp.user_id = (SELECT auth.uid()) AND cp.is_active = true
  )
);

-- Users can add themselves to conversations (when invited)
CREATE POLICY "Users can join conversations" ON conversation_participants 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can update their own participation (like marking messages as read)
CREATE POLICY "Users can update their own participation" ON conversation_participants 
FOR UPDATE 
TO authenticated 
USING (user_id = (SELECT auth.uid())) 
WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can remove themselves from conversations (leave conversation)
CREATE POLICY "Users can leave conversations" ON conversation_participants 
FOR DELETE 
TO authenticated 
USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- MESSAGES TABLE POLICIES
-- =====================================================

-- Users can view messages from conversations they participate in (and messages not expired)
CREATE POLICY "Users can view messages from their conversations" ON messages 
FOR SELECT 
TO authenticated 
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = (SELECT auth.uid()) AND is_active = true
  ) 
  AND expires_at > NOW()
);

-- Users can send messages to conversations they participate in
CREATE POLICY "Users can send messages to their conversations" ON messages 
FOR INSERT 
TO authenticated 
WITH CHECK (
  sender_id = (SELECT auth.uid()) 
  AND conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = (SELECT auth.uid()) AND is_active = true
  )
);

-- Users cannot update messages (messages are immutable)
CREATE POLICY "Users cannot update messages" ON messages 
FOR UPDATE 
TO authenticated 
USING (false) 
WITH CHECK (false);

-- Users cannot delete messages (they expire automatically)
CREATE POLICY "Users cannot delete messages" ON messages 
FOR DELETE 
TO authenticated 
USING (false); 