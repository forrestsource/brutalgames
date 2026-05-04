import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import DatabaseCheck from './pages/DatabaseCheck';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import GameInfoCard from './components/GameInfoCard';
import ActiveRoomsPanel from './components/ActiveRoomsPanel';
import StatsHistory from './components/StatsHistory';

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [dbChecked, setDbChecked] = useState(false);

  useEffect(() => {
    // Check if this is first load
    const hasCheckedDB = sessionStorage.getItem('dbChecked');
    if (!hasCheckedDB) {
      setDbChecked(false);
      sessionStorage.setItem('dbChecked', 'true');
    } else {
      setDbChecked(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#f3efe6] flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-2xl font-bold mb-4">BrutalGames</div>
          <p className="text-sm">Loading arena...</p>
        </div>
      </div>
    );
  }

  // Show database check on first page load
  if (!dbChecked) {
    return <DatabaseCheck />;
  }

  if (!user) {
    return <Landing onLogin={login} />;
  }

  const handlePlayNow = (gameId: string) => {
    alert(`Play ${gameId} - coming soon!`);
  };

  const handleCreateRoom = (gameId: string) => {
    alert(`Create room for ${gameId} - coming soon!`);
  };

  const handleJoinRoom = (roomId: string) => {
    alert(`Join room ${roomId} - coming soon!`);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f3efe6]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar username={user.username} onLogout={logout} />
        <main className="p-6 flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <GameInfoCard onPlayNow={handlePlayNow} onCreateRoom={handleCreateRoom} />
              <StatsHistory userId={user.id} />
            </div>
            <div>
              <ActiveRoomsPanel onJoinRoom={handleJoinRoom} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
