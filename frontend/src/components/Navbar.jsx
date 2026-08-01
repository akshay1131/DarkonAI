import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Bell, ShieldCheck, Terminal } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0A0D14]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>STATUS: THREAT LEVEL ALPHA</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Alert */}
        <button className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'SOC'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">{user?.username || 'Security Officer'}</div>
            <div className="text-[10px] text-slate-400 font-mono">{user?.role?.toUpperCase() || 'ANALYST'}</div>
          </div>
          {user && (
            <button 
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
