import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const gameNames: Record<string, string> = {
  xo: 'Tic Tac Toe',
  connect4: 'Connect 4',
  gomoku: 'Gomoku',
  rps: 'Rock Paper Scissors',
  reaction: 'Reaction Speed',
  memory: 'Memory Match',
  typing: 'Typing Race',
};

interface Room {
  id: string;
  game_id: string;
  host_id: string;
  player2_id?: string;
  status: string;
}

export default function ActiveRoomsPanel({ onJoinRoom }: { onJoinRoom?: (roomId: string) => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadRooms() {
      setLoading(true);
      try {
        const { data } = await supabase.from('rooms').select('*').eq('status', 'waiting').order('created_at', { ascending: false }).limit(10);
        if (Array.isArray(data)) setRooms(data);
      } catch (e) {
        console.error('Error loading rooms:', e);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();

    const channel = supabase
      .channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        loadRooms();
      })
      .subscribe();

    return () => {
      (channel as any)?.unsubscribe?.();
    };
  }, []);

  return (
    <aside className="border-4 border-black p-4 bg-[#fff] shadow-[6px_6px_0_0_#000]">
      <h3 className="font-bold text-xl mb-3">Waiting Rooms</h3>
      <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
        {rooms.length === 0 ? (
          <div className="text-sm text-gray-500 p-2">No waiting rooms. Create one!</div>
        ) : (
          rooms.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 p-3 border-2 border-black bg-[#f9f9f9] hover:bg-gray-50">
              <div className="flex flex-col min-w-0">
                <div className="font-bold text-sm">{gameNames[r.game_id] || r.game_id}</div>
                <div className="text-xs text-gray-600">{r.player2_id ? '2/2 (full)' : '1/2 (open)'}</div>
              </div>
              <button
                onClick={() => onJoinRoom?.(r.id)}
                disabled={!!r.player2_id}
                className="px-2 py-1 border-2 border-black bg-[#b6e3b6] font-bold text-xs active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
