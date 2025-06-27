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

    // -----------------------------
    // Gather IDs to exclude
    // -----------------------------

    // 1) Existing friendships (either direction)
    const { data: relations, error: friendsError } = await supabase
      .from('friends')
      .select('user_id, friend_id')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (friendsError) {
      return Response.json({ error: 'Failed to fetch friends' }, { status: 500 });
    }

    const friendIds = (relations || []).map(rel => (rel.user_id === user.id ? rel.friend_id : rel.user_id));

    // 2) Pending requests *sent* by the dev user
    const { data: sentRequests } = await supabase
      .from('friend_requests')
      .select('addressee_id')
      .eq('requester_id', user.id)
      .eq('status', 'pending');

    const sentRequestIds = sentRequests?.map(r => r.addressee_id) || [];

    // 3) Pending requests *received* by the dev user
    const { data: receivedRequests } = await supabase
      .from('friend_requests')
      .select('requester_id')
      .eq('addressee_id', user.id)
      .eq('status', 'pending');

    const receivedRequestIds = receivedRequests?.map(r => r.requester_id) || [];

    // Get all users except current user, friends, and those with pending requests
    const excludeIds = [user.id, ...friendIds, ...sentRequestIds, ...receivedRequestIds];
    
    const { data: availableUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(10);

    if (usersError || !availableUsers || availableUsers.length === 0) {
      return Response.json({ error: 'No available users to send friend request' }, { status: 400 });
    }

    // Select a random user to be the requester of the incoming friend request
    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];

    // Create friend request from the random user **to** the dev user
    const { data: friendRequest, error: requestError } = await supabase
      .from('friend_requests')
      .insert({
        requester_id: randomUser.id,
        addressee_id: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (requestError) {
      return Response.json({ error: 'Failed to create friend request', details: requestError.message }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Friend request sent',
      from: randomUser.full_name || randomUser.username || 'Unknown User',
      request_id: friendRequest.id
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}