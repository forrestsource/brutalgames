import React, { useState } from 'react';
import { Play, AlertCircle } from 'lucide-react';

export default function LandingPage({ onLogin }: { onLogin: (username: string) => Promise<{ success: boolean; error?: string }> }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError('Enter a username');
      return;
    }

    setLoading(true);
    setError('');
    const result = await onLogin(username);
    setLoading(false);

    if (!result.success) {
      const errMsg = result.error || 'Failed to login';
      if (errMsg.includes('profiles') || errMsg.includes('relation') || errMsg.includes('does not exist')) {
        setError('⚠️ Database not initialized. Ask admin to run schema.sql in Supabase.');
      } else {
        setError(errMsg);
      }
    }
  }

  return (
    <div className="h-screen w-full bg-[#f3efe6] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-black bg-[#facc3c] mb-6">
            <Play size={28} strokeWidth={3} />
          </div>
          <h1 className="font-mono text-4xl font-bold mb-2">BrutalGames</h1>
          <p className="text-sm font-medium text-gray-700">Fast. Raw. Competitive.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000]">
          <h2 className="font-bold text-2xl mb-6">Join the arena</h2>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Your player name"
              className="w-full border-2 border-black p-3 outline-none focus:bg-[#fafafa]"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-700 text-sm font-medium mb-4 p-3 border-2 border-red-600 bg-red-50 flex gap-2 items-start">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3 border-2 border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none disabled:opacity-60 active:disabled:translate-y-0 active:disabled:shadow-[4px_4px_0_0_#000]"
          >
            {loading ? 'Entering arena...' : 'Enter Arena'}
          </button>

          <p className="text-xs text-gray-600 text-center mt-4">
            New player? Just enter a username. No email needed.
          </p>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-xs font-bold">
            <div className="border-2 border-black p-3 bg-[#facc3c]">
              <div className="text-lg">7</div>
              <div>Games</div>
            </div>
            <div className="border-2 border-black p-3 bg-[#f0a6d9]">
              <div className="text-lg">∞</div>
              <div>Players</div>
            </div>
            <div className="border-2 border-black p-3 bg-[#b6e3b6]">
              <div className="text-lg">1v1</div>
              <div>Battles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
