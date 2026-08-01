import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Radar, 
  Zap, 
  History, 
  Settings, 
  Activity,
  Server
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'SOC Command Center', path: '/', icon: LayoutDashboard },
    { name: '250+ Asset Inventory', path: '/assets', icon: Server },
    { name: 'New Cyber Scan', path: '/scan/new', icon: Radar },
    { name: 'Scan Results & Reports', path: '/scan/results', icon: ShieldAlert },
    { name: 'Scan History', path: '/history', icon: History },
    { name: 'System Admin', path: '/admin', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0A0D14] border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 font-mono">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-neon-cyan">
          <div className="w-full h-full bg-[#07090E] rounded-[10px] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-wider text-slate-100 flex items-center gap-1.5 font-sans">
            DARKON <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight">CYBER RADAR SOC</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2 font-mono">
          CONTINUOUS MONITORING
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-400 border border-cyan-500/30 shadow-neon-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 text-cyan-400/80" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-[#07090E]">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <div>
            <div className="font-bold text-slate-200">RADAR SCANNER ONLINE</div>
            <div className="text-[10px] text-slate-500 font-mono">250+ Assets • Active</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
