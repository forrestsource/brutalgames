import React from 'react';
import { Home, Play, Users, Trophy, User, Settings } from 'lucide-react';

type NavItemProps = { icon: any; label: string; active?: boolean };

const NavItem = ({ icon: Icon, label, active }: NavItemProps) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 font-bold cursor-pointer border-2 border-black ${
      active ? 'bg-black text-white' : 'bg-white hover:translate-x-1'
    }`}
  >
    <Icon size={18} strokeWidth={2.5} />
    <span>{label}</span>
  </div>
);

export default function Sidebar() {
  return (
    <aside className="w-72 border-r-4 border-black bg-[#f7efe0] flex flex-col">
      <div className="p-6 border-b-4 border-black flex items-center gap-3">
        <div className="w-12 h-12 border-4 border-black flex items-center justify-center bg-[#facc3c]">
          <Play size={20} strokeWidth={3} />
        </div>
        <h1 className="font-mono text-2xl font-bold">BrutalGames</h1>
      </div>

      <nav className="p-4 flex-1 space-y-2">
        <NavItem icon={Home} label="Home" active />
        <NavItem icon={Play} label="Play" />
        <NavItem icon={Users} label="Multiplayer" />
        <NavItem icon={Trophy} label="Leaderboard" />
        <NavItem icon={User} label="Profile" />
      </nav>

      <div className="p-4 border-t-4 border-black">
        <NavItem icon={Settings} label="Settings" />
      </div>
    </aside>
  );
}
