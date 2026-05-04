-- schema.sql for BrutalGames (Supabase / PostgreSQL)

-- enable uuid generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------
-- Profiles
-- ------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  avatar_url text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------
-- Games (catalog of supported game types)
-- id is a short key like 'xo', 'connect4', 'gomoku', etc.
-- ------------------------------
CREATE TABLE IF NOT EXISTS public.games (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  min_players int NOT NULL DEFAULT 1,
  max_players int NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- seed common game types (id values used by the client)
INSERT INTO public.games (id, title, description, min_players, max_players)
VALUES
  ('xo',       'Tic Tac Toe',    'Classic 3x3 Tic Tac Toe',               2, 2),
  ('connect4', 'Connect 4',      'Vertical connect four',                 2, 2),
  ('gomoku',   'Gomoku',         'Five-in-a-row (Gomoku)',               2, 2),
  ('rps',      'Rock Paper Scissors', 'Realtime RPS',                       2, 2),
  ('reaction', 'Reaction Speed', 'Realtime reaction test',                1, 8),
  ('memory',   'Memory Match',   'Card memory match',                     1, 4),
  ('typing',   'Typing Race',    'Realtime typing race',                  2, 8)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------
-- Rooms (multiplayer rooms / match instances)
-- - game_id references public.games(id) (text)
-- - host_id, player2_id reference profiles
-- ------------------------------
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL REFERENCES public.games(id) ON DELETE RESTRICT,
  host_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player2_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','active','finished','cancelled')),
  max_players int NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);

-- ------------------------------
-- Moves
-- Flexible schema: `game_id` is text to allow either a game-type id (e.g. 'xo') or a room id encoded as text,
-- and `room_id` is an explicit FK you can populate when you have the room uuid.
-- Storing move_data as jsonb keeps state lightweight per guidelines.
-- ------------------------------
CREATE TABLE IF NOT EXISTS public.moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text, -- flexible identifier used by the client for subscriptions/filters
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  move_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------
-- Game results / finished matches
-- ------------------------------
CREATE TABLE IF NOT EXISTS public.game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text,     -- game-type id or room identifier (flexible)
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  winner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  loser_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  draw boolean NOT NULL DEFAULT false,
  result_data jsonb,
  finished_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------
-- Leaderboard
-- Maintains aggregated wins / losses / draws and a computed win_rate.
-- ------------------------------
CREATE TABLE IF NOT EXISTS public.leaderboard (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  wins int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  draws int NOT NULL DEFAULT 0,
  win_rate numeric(7,5) NOT NULL DEFAULT 0.0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------
-- Indexes
-- ------------------------------
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms (status);
CREATE INDEX IF NOT EXISTS idx_moves_game_id ON public.moves (game_id);
CREATE INDEX IF NOT EXISTS idx_moves_room_id ON public.moves (room_id);
CREATE INDEX IF NOT EXISTS idx_game_results_finished_at ON public.game_results (finished_at);
CREATE INDEX IF NOT EXISTS idx_leaderboard_win_rate ON public.leaderboard (win_rate DESC);

-- ------------------------------
-- Functions: recompute win rate and update leaderboard on inserts
-- ------------------------------
CREATE OR REPLACE FUNCTION public.recompute_win_rate(p_user_id uuid) RETURNS VOID AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.leaderboard
  SET win_rate = CASE WHEN (wins + losses) = 0 THEN 0 ELSE wins::numeric / (wins + losses)::numeric END,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_game_result_insert() RETURNS trigger AS $$
BEGIN
  -- If it's a draw, increment draws for involved players (if provided)
  IF NEW.draw IS TRUE THEN
    IF NEW.winner_id IS NOT NULL THEN
      INSERT INTO public.leaderboard (user_id, wins, losses, draws, win_rate, updated_at)
      VALUES (NEW.winner_id, 0, 0, 1, 0, now())
      ON CONFLICT (user_id) DO UPDATE
        SET draws = draws + EXCLUDED.draws, updated_at = now();
    END IF;

    IF NEW.loser_id IS NOT NULL THEN
      INSERT INTO public.leaderboard (user_id, wins, losses, draws, win_rate, updated_at)
      VALUES (NEW.loser_id, 0, 0, 1, 0, now())
      ON CONFLICT (user_id) DO UPDATE
        SET draws = draws + EXCLUDED.draws, updated_at = now();
    END IF;
  ELSE
    -- non-draw: increment winner's wins and loser's losses
    IF NEW.winner_id IS NOT NULL THEN
      INSERT INTO public.leaderboard (user_id, wins, losses, draws, win_rate, updated_at)
      VALUES (NEW.winner_id, 1, 0, 0, 1.0, now())
      ON CONFLICT (user_id) DO UPDATE
        SET wins = wins + EXCLUDED.wins, updated_at = now();
    END IF;

    IF NEW.loser_id IS NOT NULL THEN
      INSERT INTO public.leaderboard (user_id, wins, losses, draws, win_rate, updated_at)
      VALUES (NEW.loser_id, 0, 1, 0, 0.0, now())
      ON CONFLICT (user_id) DO UPDATE
        SET losses = losses + EXCLUDED.losses, updated_at = now();
    END IF;
  END IF;

  -- Recompute win rates for the affected users
  IF NEW.winner_id IS NOT NULL THEN
    PERFORM public.recompute_win_rate(NEW.winner_id);
  END IF;
  IF NEW.loser_id IS NOT NULL THEN
    PERFORM public.recompute_win_rate(NEW.loser_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that updates leaderboard after a new game result is inserted
CREATE TRIGGER trg_game_results_after_insert
AFTER INSERT ON public.game_results
FOR EACH ROW
EXECUTE FUNCTION public.handle_game_result_insert();

-- ------------------------------
-- Convenience view: leaderboard with profile info
-- ------------------------------
CREATE OR REPLACE VIEW public.v_leaderboard AS
SELECT
  l.user_id,
  p.username,
  p.avatar_url,
  l.wins,
  l.losses,
  l.draws,
  l.win_rate,
  l.updated_at
FROM public.leaderboard l
JOIN public.profiles p ON p.id = l.user_id
ORDER BY l.win_rate DESC;

-- ------------------------------
-- Notes / optional policies
-- - Supabase: consider enabling Row Level Security (RLS) and creating policies that:
--   * Allow clients to insert/update their own `profiles` row
--   * Allow authenticated users to create/join rooms
--   * Allow public SELECT on `games`, `rooms`, `moves` if you want live browsing without auth
-- - Keep RLS/policies tailored to your auth model (username-only vs Supabase Auth).
-- ------------------------------
