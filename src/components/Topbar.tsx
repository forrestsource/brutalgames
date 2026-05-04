import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';

export default function Topbar({ username, onLogout }: { username?: string; onLogout?: () => void }) {
  return (
    <header className="flex items-center justify-between p-4 border-b-4 border-black bg-white">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 border-4 border-black bg-[#facc3c] flex items-center justify-center font-bold text-sm">
          {username?.[0]?.toUpperCase() || 'P'}
        </div>
        <div className="relative flex items-center border-2 border-black bg-white px-3 h-10">
          <Search size={16} />
          <input placeholder="Search games" className="ml-2 outline-none bg-transparent text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm font-bold">{username}</div>
        <button className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-gray-100">
          <Bell size={16} />
        </button>
        <button
          onClick={onLogout}
          className="w-10 h-10 border-2 border-black bg-[#f0a6d9] flex items-center justify-center hover:bg-pink-300 active:translate-y-1"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
