import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const games = [
  { id: 'xo', name: 'Tic Tac Toe' },
  { id: 'connect4', name: 'Connect 4' },
  { id: 'gomoku', name: 'Gomoku' },
  { id: 'rps', name: 'Rock Paper Scissors' },
  { id: 'reaction', name: 'Reaction Speed' },
  { id: 'memory', name: 'Memory Match' },
  { id: 'typing', name: 'Typing Race' },
];

interface GameStats {
  playersOnline: number;
  activeRooms: number;
  matchesPlayed: number;
}

export default function GameInfoCard({ onPlayNow, onCreateRoom }: { onPlayNow?: (gameId: string) => void; onCreateRoom?: (gameId: string) => void }) {
  const [selected, setSelected] = useState('xo');
  const [stats, setStats] = useState<GameStats>({ playersOnline: 0, activeRooms: 0, matchesPlayed: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const { count: roomCount } = await supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('game_id', selected).eq('status', 'active');
        const { count: resultCount } = await supabase.from('game_results').select('*', { count: 'exact', head: true }).eq('game_id', selected);
        const { count: waitingCount } = await supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('game_id', selected).eq('status', 'waiting');
        setStats({
          playersOnline: (waitingCount || 0) + (roomCount || 0) * 2,
          activeRooms: roomCount || 0,
          matchesPlayed: resultCount || 0,
        });
      } catch (e) {
        console.error('Error loading stats:', e);
      }
    }
    loadStats();
  }, [selected]);

  const selectedGame = games.find((g) => g.id === selected);

  return (
    <section className="border-4 border-black p-5 bg-white shadow-[6px_6px_0_0_#000]">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="font-mono font-bold text-3xl">{selectedGame?.name}</h2>
          <p className="text-sm font-medium">Live stats & preview</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="border-2 border-black p-2 bg-[#fff] font-bold"
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => onPlayNow?.(selected)}
            className="px-3 py-2 border-2 border-black bg-black text-white font-bold hover:bg-gray-800 active:translate-y-1"
          >
            Play Now
          </button>
          <button
            onClick={() => onCreateRoom?.(selected)}
            className="px-3 py-2 border-2 border-black bg-[#facc3c] font-bold active:translate-y-1"
          >
            Create Room
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-6 items-start">
        <div className="w-48 h-48 border-4 border-black bg-[#f7f7f7] p-3 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-1 w-36 h-36">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border-2 border-black bg-[#fff] flex items-center justify-center text-lg font-bold" />
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-col">
          <div className="neo-stat">
            <div className="font-bold text-lg">{stats.playersOnline}</div>
            <div className="text-xs font-medium">Players online</div>
          </div>
          <div className="neo-stat">
            <div className="font-bold text-lg">{stats.activeRooms}</div>
            <div className="text-xs font-medium">Active rooms</div>
          </div>
          <div className="neo-stat">
            <div className="font-bold text-lg">{stats.matchesPlayed}</div>
            <div className="text-xs font-medium">Matches played</div>
          </div>
        </div>
      </div>
    </section>
  );
}
