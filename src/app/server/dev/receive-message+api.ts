import { createSupabaseClientForServer } from '@/utils/supabaseForServer';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseClientForServer(authHeader);

  try {
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a dev user (email check)
    if (user.email !== 'dev@snapconnect.com') {
      return Response.json({ error: 'Forbidden: Dev functions only' }, { status: 403 });
    }

    // Fetch all friend relations where the dev user is either side of the relationship
    const { data: relations, error: relationsError } = await supabase
      .from('friends')
      .select('user_id, friend_id')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (relationsError) {
      return Response.json({ error: 'Failed to fetch friends' }, { status: 500 });
    }

    // Derive the set of counterpart user IDs
    const friendIds: string[] = Array.from(
      new Set(
        (relations || []).map((rel: any) => (rel.user_id === user.id ? rel.friend_id : rel.user_id))
      )
    );

    if (friendIds.length === 0) {
      return Response.json({ error: 'No friends found' }, { status: 400 });
    }

    // Grab the corresponding profiles so we can show a meaningful name in the alert
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', friendIds);

    if (profilesError) {
      return Response.json({ error: 'Failed to fetch friend profiles' }, { status: 500 });
    }

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    const friendId = friendIds[Math.floor(Math.random() * friendIds.length)];

    const friendProfile = profileMap.get(friendId);

    if (!friendProfile) {
      return Response.json({ error: 'Friend profile not found' }, { status: 500 });
    }

    // Find or create a conversation with this friend
    // First, get all conversations where the current user is a participant
    const { data: userConversations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    let conversationId = null;

    if (userConversations && userConversations.length > 0) {
      const conversationIds = userConversations.map(c => c.conversation_id);
      
      // Now get all participants for these conversations
      const { data: conversationsWithParticipants } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_participants(user_id)
        `)
        .in('id', conversationIds);

      // Check if we already have a direct conversation with this friend
      for (const conv of conversationsWithParticipants || []) {
        const participants = conv.conversation_participants;
        if (participants.length === 2 && 
            participants.some((p: any) => p.user_id === user.id) &&
            participants.some((p: any) => p.user_id === friendId)) {
          conversationId = conv.id;
          break;
        }
      }
    }

    // If no conversation exists, create one
    if (!conversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError || !newConversation) {
        return Response.json({ error: 'Failed to create conversation' }, { status: 500 });
      }

      conversationId = newConversation.id;

      // Add participants
      await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: user.id },
          { conversation_id: conversationId, user_id: friendId }
        ]);
    }

    // Send a message from the friend
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: friendId,
        content: 'Hey!',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single();

    if (messageError) {
      return Response.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Message sent',
      from: friendProfile.full_name || friendProfile.username,
      conversation_id: conversationId
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}