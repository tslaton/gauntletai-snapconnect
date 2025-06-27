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

    // Get the conversation ID from the request body
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return Response.json({ error: 'conversationId is required' }, { status: 400 });
    }

    // Fetch the conversation with participants
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        conversation_participants(
          user_id,
          profiles(id, username, full_name)
        )
      `)
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verify the user is a participant in this conversation
    const participants = conversation.conversation_participants;
    const isUserParticipant = participants.some((p: any) => p.user_id === user.id);

    if (!isUserParticipant) {
      return Response.json({ error: 'You are not a participant in this conversation' }, { status: 403 });
    }

    // Get other participants (not the current user)
    const otherParticipants = participants.filter((p: any) => p.user_id !== user.id);

    if (otherParticipants.length === 0) {
      return Response.json({ error: 'No other participants found in conversation' }, { status: 400 });
    }

    // Randomly select one of the other participants
    const sender = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
    const senderProfile = sender.profiles;

    if (!senderProfile) {
      return Response.json({ error: 'Sender profile not found' }, { status: 500 });
    }

    // Array of test messages to randomly select from
    const testMessages = [
      'Hey!',
      'What\'s up?',
      'How are you?',
      'Did you see that?',
      'LOL',
      '😂',
      'That\'s awesome!',
      'Let me know',
      'Sure thing',
      'No way!'
    ];

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];

    // Send a message from the selected participant
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: sender.user_id,
        content: randomMessage,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single();

    if (messageError) {
      return Response.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: randomMessage,
      from: senderProfile.full_name || senderProfile.username,
      conversation_id: conversationId
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}