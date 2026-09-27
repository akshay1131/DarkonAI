import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  PieChart, 
  Layers, 
  Crosshair,
  Zap,
  Wheat,
  Building2,
  GraduationCap
} from 'lucide-react';

const SECTOR_ICONS = {
  'Power Grid': Zap,
  'Agriculture': Wheat,
  'Hospital': Building2,
  'Education': GraduationCap
};

const AttackAnalytics = ({ analyticsData, onSelectMitre }) => {
  if (!analyticsData) {
    return null;
  }

  const topAttacks = analyticsData.top_mitre_attacks || [];
  const catDistribution = analyticsData.category_distribution || { counts: {}, percentages: {} };
  const sectorDistribution = analyticsData.sector_distribution || { counts: {}, percentages: {} };
  const severityDistribution = analyticsData.severity_distribution || { counts: {}, percentages: {} };

  return (
    <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-6 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            ATTACK ANALYTICS & THREAT DISTRIBUTION
          </h3>
          <p className="text-slate-400 font-sans text-xs mt-0.5">
            Real-time multi-sector telemetry correlations and calculated statistical distributions.
          </p>
        </div>
        <span className="text-[11px] text-cyan-400 font-bold bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
          DATABASE-SYNCHRONIZED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: TOP DETECTED ATTACKS */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-slate-300 font-bold uppercase text-[11px]">
            <span className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-red-400" /> TOP DETECTED THREAT TECHNIQUES
            </span>
            <span className="text-slate-500 text-[10px]">RANKED BY FREQUENCY</span>
          </div>

          <div className="space-y-2">
            {topAttacks.slice(0, 5).map((atk) => (
              <div
                key={atk.mitre_id}
                onClick={() => onSelectMitre && onSelectMitre(atk.mitre_id)}
                className="p-3 bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold">
                      {atk.mitre_id}
                    </span>
                    <span className="font-bold text-slate-100">{atk.technique_name}</span>
                  </div>
                  <span className="font-bold text-slate-300">
                    {atk.incident_count} {atk.incident_count === 1 ? 'incident' : 'incidents'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-red-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(12, atk.percentage * 2.5))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-sans">
                  <span>Sectors: {atk.affected_sectors.join(', ')}</span>
                  <span className="text-cyan-400 font-mono font-bold">{atk.percentage}% of total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: ATTACK CLASSIFICATION DISTRIBUTION */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-slate-300 font-bold uppercase text-[11px]">
            <span className="flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-amber-400" /> ATTACK CLASSIFICATION RATIO
            </span>
            <span className="text-slate-500 text-[10px]">SUM: 100%</span>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            {Object.entries(catDistribution.percentages || {}).map(([cat, pct]) => {
              const count = catDistribution.counts[cat] || 0;
              let barColor = 'from-cyan-500 to-blue-500';
              if (cat.includes('Access') || cat.includes('Credential')) barColor = 'from-amber-500 to-red-500';
              if (cat.includes('Malware')) barColor = 'from-red-500 to-pink-500';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300 font-bold">{cat}</span>
                    <span className="text-slate-400">
                      <strong className="text-slate-200">{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${barColor} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Sector-Wise Threat Distribution & Severity Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
        {/* Sector Distribution */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-slate-300 font-bold uppercase text-[11px]">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> SECTOR-WISE INCIDENT BREAKDOWN
            </span>
            <span className="text-slate-500 text-[10px]">4 SECTORS</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(sectorDistribution.percentages || {}).map(([sec, pct]) => {
              const count = sectorDistribution.counts[sec] || 0;
              const Icon = SECTOR_ICONS[sec] || ShieldAlert;
              return (
                <div key={sec} className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-200 font-bold text-xs">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      {sec}
                    </span>
                    <span className="text-cyan-400 font-bold text-xs">{pct}%</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    {count} {count === 1 ? 'incident' : 'incidents'} detected
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-1 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-slate-300 font-bold uppercase text-[11px]">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> RISK SEVERITY DISTRIBUTION
            </span>
            <span className="text-slate-500 text-[10px]">TOTAL INCIDENTS</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {['Critical', 'High', 'Medium', 'Low'].map((lvl) => {
              const count = severityDistribution.counts[lvl] || 0;
              const pct = severityDistribution.percentages[lvl] || 0;
              let borderCol = 'border-slate-800 text-slate-300';
              let badgeBg = 'bg-slate-900';

              if (lvl === 'Critical') {
                borderCol = 'border-red-500/50 text-red-400';
                badgeBg = 'bg-red-950/40';
              } else if (lvl === 'High') {
                borderCol = 'border-amber-500/50 text-amber-400';
                badgeBg = 'bg-amber-950/40';
              } else if (lvl === 'Medium') {
                borderCol = 'border-cyan-500/50 text-cyan-400';
                badgeBg = 'bg-cyan-950/40';
              } else {
                borderCol = 'border-emerald-500/50 text-emerald-400';
                badgeBg = 'bg-emerald-950/40';
              }

              return (
                <div key={lvl} className={`p-3 rounded-xl border ${borderCol} ${badgeBg} space-y-1`}>
                  <div className="text-[10px] uppercase font-bold">{lvl}</div>
                  <div className="text-lg font-black">{count}</div>
                  <div className="text-[10px] opacity-80">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackAnalytics;
