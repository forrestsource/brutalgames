import { useEffect, useState } from 'react';
import { supabase, ensureProfile } from '../lib/supabase';

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('playerId');
    const username = localStorage.getItem('playerUsername');

    if (userId && username) {
      setUser({ id: userId, username });
    }
    setLoading(false);
  }, []);

  async function signup(username: string) {
    setLoading(true);
    setError(null);
    try {
      const { id, error: profileError } = await ensureProfile(username);
      if (profileError) throw profileError;
      localStorage.setItem('playerUsername', username);
      setUser({ id, username });
      return { success: true };
    } catch (err: any) {
      const msg = err?.message ?? 'Signup failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string) {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (fetchError) {
        // User doesn't exist, create them
        const { id, error: profileError } = await ensureProfile(username);
        if (profileError) throw profileError;
        localStorage.setItem('playerUsername', username);
        setUser({ id, username });
        return { success: true };
      }

      if (data) {
        localStorage.setItem('playerId', data.id);
        localStorage.setItem('playerUsername', username);
        setUser({ id: data.id, username });
        return { success: true };
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('playerId');
    localStorage.removeItem('playerUsername');
    setUser(null);
  }

  return { user, loading, error, signup, login, logout };
}
