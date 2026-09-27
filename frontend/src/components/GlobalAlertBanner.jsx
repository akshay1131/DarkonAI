import React from 'react';
import { AlertTriangle, ShieldAlert, Radio, X, ArrowRight, ExternalLink } from 'lucide-react';

const GlobalAlertBanner = ({ alert, onDismiss, onSelectSector }) => {
  if (!alert) return null;

  const isCritical = alert.severity === 'CRITICAL';
  const sectorIcons = {
    agriculture: '🌾',
    hospital: '🏥',
    education: '🏫',
    powergrid: '⚡'
  };

  const sectorIcon = sectorIcons[alert.sector_key] || '🚨';

  return (
    <aside 
      aria-label="High-risk security alert" 
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl p-4 shadow-2xl transition-all duration-500 animate-pulse font-mono ${
        isCritical 
          ? 'bg-gradient-to-r from-red-950/95 via-[#18080A] to-red-950/95 border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.25)]' 
          : 'bg-gradient-to-r from-amber-950/95 via-[#181108] to-amber-950/95 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.25)]'
      }`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Icon & Alert Info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
            isCritical 
              ? 'bg-red-500/20 border-red-500 text-red-400' 
              : 'bg-amber-500/20 border-amber-500 text-amber-400'
          }`}>
            <Radio className="w-5 h-5 animate-ping" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase border ${
                isCritical ? 'bg-red-900/80 text-red-200 border-red-700' : 'bg-amber-900/80 text-amber-200 border-amber-700'
              }`}>
                {isCritical ? 'CRITICAL SECURITY ALERT' : 'HIGH RISK ALERT'}
              </span>
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                {sectorIcon} {alert.sector?.toUpperCase()} SECTOR
              </span>
              <span className="text-[10px] text-slate-400">
                • {alert.timestamp || 'Active Telemetry'}
              </span>
            </div>

            <div className="mt-1 text-sm font-bold text-slate-100 flex flex-wrap items-center gap-2">
              <span className={isCritical ? 'text-red-400' : 'text-amber-400'}>
                {alert.asset}:
              </span>
              <span>{alert.event}</span>
            </div>

            <p className="mt-1 text-xs text-slate-300 max-w-4xl line-clamp-1 font-sans">
              {alert.detected_activity || alert.description}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
          <div className="text-right hidden sm:block mr-2">
            <div className="text-[10px] text-slate-400 uppercase">RISK SCORE</div>
            <div className={`text-base font-black ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
              {alert.risk_score || 90}/100
            </div>
          </div>

          <button
            onClick={() => onSelectSector(alert.sector_key || 'hospital')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg ${
              isCritical
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-600/30'
            }`}
          >
            <span>INSPECT SECTOR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDismiss}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default GlobalAlertBanner;
