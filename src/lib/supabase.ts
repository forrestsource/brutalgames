import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials. Check your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function ensureProfile(username: string, avatar_url?: string) {
  const id = localStorage.getItem('playerId') ?? crypto.randomUUID();
  localStorage.setItem('playerId', id);
  const payload = { id, username, avatar_url: avatar_url ?? null, created_at: new Date().toISOString() };
  try {
    const { error } = await supabase.from('profiles').upsert(payload, { returning: 'minimal' });
    if (error) {
      console.error('❌ Profile error:', error.message);
      throw error;
    }
    return { id, error: null };
  } catch (e: any) {
    console.error('❌ ensureProfile failed:', e.message);
    return { id, error: e };
  }
}

export async function fetchRooms() {
  const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
  return { data, error };
}

export async function fetchGames() {
  const { data, error } = await supabase.from('games').select('*');
  return { data, error };
}

export async function createRoom(game_id: string, host_id: string) {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ game_id, host_id, status: 'waiting', created_at: new Date().toISOString() }])
    .select()
    .single();
  return { data, error };
}

export async function joinRoom(roomId: string, player2_id: string) {
  const { data, error } = await supabase
    .from('rooms')
    .update({ player2_id, status: 'active' })
    .eq('id', roomId)
    .select()
    .single();
  return { data, error };
}

export function subscribeToRooms(cb: (payload: any) => void) {
  try {
    const channel = supabase
      .channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        cb(payload);
      })
      .subscribe();
    return channel;
  } catch (e) {
    console.warn('Realtime not available', e);
    return null;
  }
}

export async function saveMove(game_id: string, player_id: string, move_data: any) {
  const { data, error } = await supabase.from('moves').insert([{ game_id, player_id, move_data, created_at: new Date().toISOString() }]);
  return { data, error };
}

export function subscribeToMoves(game_id: string, cb: (payload: any) => void) {
  try {
    const channel = supabase
      .channel(`game:${game_id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'moves', filter: `game_id=eq.${game_id}` },
        (payload) => cb(payload),
      )
      .subscribe();
    return channel;
  } catch (e) {
    console.warn('Realtime not available', e);
    return null;
  }
}
