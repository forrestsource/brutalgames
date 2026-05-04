import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Recent {
  id: string;
  result: 'Win' | 'Loss' | 'Draw';
  opponent: string;
  game: string;
}

export default function StatsHistory({ userId }: { userId: string }) {
  const [recent, setRecent] = useState<Recent[]>([]);
  const [stats, setStats] = useState({ winRate: 0, matchesPlayed: 0, streak: 0 });

  useEffect(() => {
    async function load() {
      try {
        // Fetch leaderboard stats for current user
        const { data: leaderData } = await supabase.from('leaderboard').select('wins,losses,draws,win_rate').eq('user_id', userId).single();
        if (leaderData) {
          const total = leaderData.wins + leaderData.losses + leaderData.draws;
          setStats({
            winRate: Math.round(leaderData.win_rate * 100),
            matchesPlayed: total,
            streak: 0,
          });
        }

        // Fetch recent game results
        const { data: results } = await supabase
          .from('game_results')
          .select('id,game_id,winner_id,loser_id,draw')
          .or(`winner_id.eq.${userId},loser_id.eq.${userId}`)
          .order('finished_at', { ascending: false })
          .limit(3);

        if (results && Array.isArray(results)) {
          const mapped: Recent[] = await Promise.all(
            results.map(async (r) => {
              const isWin = r.winner_id === userId;
              const opponentId = isWin ? r.loser_id : r.winner_id;
              const { data: oppProfile } = await supabase.from('profiles').select('username').eq('id', opponentId).single();
              return {
                id: r.id,
                result: r.draw ? 'Draw' : isWin ? 'Win' : 'Loss',
                opponent: oppProfile?.username ?? 'Unknown',
                game: r.game_id,
              };
            })
          );
          setRecent(mapped);
        }
      } catch (e) {
        console.error('Error loading stats:', e);
      }
    }
    load();
  }, [userId]);

  return (
    <section className="border-4 border-black p-4 bg-[#fff] shadow-[6px_6px_0_0_#000]">
      <h3 className="font-bold text-xl mb-3">Stats & History</h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="neo-stat-large">
          <div className="font-bold text-2xl">{stats.winRate}%</div>
          <div className="text-xs font-medium">Win rate</div>
        </div>
        <div className="neo-stat-large">
          <div className="font-bold text-2xl">{stats.matchesPlayed}</div>
          <div className="text-xs font-medium">Matches</div>
        </div>
        <div className="neo-stat-large">
          <div className="font-bold text-2xl">—</div>
          <div className="text-xs font-medium">Current streak</div>
        </div>
      </div>

      <div className="space-y-2">
        {recent.length === 0 ? (
          <div className="text-xs text-gray-500">No recent matches</div>
        ) : (
          recent.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 border-2 border-black bg-[#f7f7f7]">
              <div>
                <div className="font-bold">{r.game}</div>
                <div className="text-xs">vs {r.opponent}</div>
              </div>
              <div className={"font-bold text-sm" + (r.result === 'Win' ? ' text-green-700' : r.result === 'Loss' ? ' text-red-700' : ' text-gray-700')}>
                {r.result}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
