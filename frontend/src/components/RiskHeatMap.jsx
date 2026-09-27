import React, { useState } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  AlertTriangle, 
  Crosshair, 
  X, 
  Info, 
  ExternalLink, 
  Activity, 
  HelpCircle,
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

const LIKELIHOOD_LABELS = {
  1: '1 - Rare',
  2: '2 - Unlikely',
  3: '3 - Moderate',
  4: '4 - Likely',
  5: '5 - Almost Certain'
};

const IMPACT_LABELS = {
  5: '5 - Catastrophic',
  4: '4 - Major',
  3: '3 - Moderate',
  2: '2 - Minor',
  1: '1 - Insignificant'
};

const RiskHeatMap = ({ heatmapPoints = [], onSelectMitre }) => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [cellModalList, setCellModalList] = useState(null);

  // Group incidents into cells (likelihood, impact)
  const gridCells = {};
  for (let imp = 1; imp <= 5; imp++) {
    for (let lh = 1; lh <= 5; lh++) {
      gridCells[`${lh}-${imp}`] = [];
    }
  }

  heatmapPoints.forEach((point) => {
    const key = `${point.likelihood}-${point.impact}`;
    if (gridCells[key]) {
      gridCells[key].push(point);
    }
  });

  const getCellZoneStyle = (lh, imp) => {
    const score = lh * imp;
    if (score >= 20) {
      return {
        bg: 'bg-red-950/70 hover:bg-red-900/80 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
        badge: 'bg-red-900 text-red-300 border-red-700',
        zone: 'Critical',
        action: 'Act Now'
      };
    }
    if (score >= 10) {
      return {
        bg: 'bg-amber-950/70 hover:bg-amber-900/80 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
        badge: 'bg-amber-900 text-amber-300 border-amber-700',
        zone: 'High',
        action: 'Prioritize'
      };
    }
    if (score >= 5) {
      return {
        bg: 'bg-cyan-950/50 hover:bg-cyan-900/60 border-cyan-500/40',
        badge: 'bg-cyan-900 text-cyan-300 border-cyan-700',
        zone: 'Medium',
        action: 'Plan'
      };
    }
    return {
      bg: 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40',
      badge: 'bg-emerald-900 text-emerald-300 border-emerald-700',
      zone: 'Low',
      action: 'Monitor'
    };
  };

  const handleCellClick = (points, lh, imp) => {
    if (points.length === 0) return;
    if (points.length === 1) {
      setSelectedIncident(points[0]);
    } else {
      setCellModalList({ points, lh, imp });
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-5 font-mono text-xs">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400" />
            CYBER RISK HEAT MAP (5x5 LIKELIHOOD VS. IMPACT)
          </h3>
          <p className="text-slate-400 font-sans text-xs mt-1">
            Dynamic distribution of detected sector threats mapped to standard enterprise cybersecurity risk zones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            CRITICAL: ACT NOW
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
            HIGH: PRIORITIZE
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
            MEDIUM: PLAN
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
            LOW: MONITOR
          </span>
        </div>
      </div>

      {/* Matrix Display */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          {/* Y-axis label */}
          <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
            <Activity className="w-3.5 h-3.5" />
            <span>IMPACT (Y-AXIS) VS. LIKELIHOOD (X-AXIS)</span>
          </div>

          <div className="grid grid-cols-[110px_repeat(5,1fr)] gap-2">
            {/* Top-left corner placeholder */}
            <div className="flex items-center justify-end pr-2 text-slate-500 font-bold text-[10px]">
              IMPACT
            </div>
            {/* Column Headers: Likelihood 1 to 5 */}
            {[1, 2, 3, 4, 5].map((lh) => (
              <div key={lh} className="text-center font-bold text-slate-300 py-1 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px]">
                {LIKELIHOOD_LABELS[lh]}
              </div>
            ))}

            {/* Matrix Rows: Impact 5 down to 1 */}
            {[5, 4, 3, 2, 1].map((imp) => (
              <React.Fragment key={imp}>
                {/* Row Header: Impact */}
                <div className="flex items-center justify-end pr-2 font-bold text-slate-300 text-[10px] text-right">
                  {IMPACT_LABELS[imp]}
                </div>

                {/* 5 Cells in this row */}
                {[1, 2, 3, 4, 5].map((lh) => {
                  const points = gridCells[`${lh}-${imp}`] || [];
                  const zoneInfo = getCellZoneStyle(lh, imp);
                  const count = points.length;
                  const score = lh * imp;

                  return (
                    <div
                      key={`${lh}-${imp}`}
                      onClick={() => handleCellClick(points, lh, imp)}
                      className={`h-20 p-2 rounded-xl border transition-all duration-200 flex flex-col justify-between relative cursor-pointer ${zoneInfo.bg} ${
                        count > 0 ? 'ring-1 ring-white/20' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono text-slate-400 font-bold">
                          {score} pts
                        </span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase border ${zoneInfo.badge}`}>
                          {zoneInfo.zone}
                        </span>
                      </div>

                      {count > 0 ? (
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            <span className="font-bold text-slate-100 text-[11px]">
                              {count} {count === 1 ? 'Threat' : 'Threats'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-300 truncate font-sans">
                            {points[0].attack_name}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-[10px] text-slate-600 font-sans mt-2">
                          No Active Threat
                        </div>
                      )}

                      <div className="text-[9px] text-slate-400 text-right truncate">
                        {zoneInfo.action}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Bottom X-axis label */}
          <div className="text-center font-bold text-slate-400 mt-3 uppercase tracking-wider text-[11px]">
            LIKELIHOOD INDEX (1 - 5)
          </div>
        </div>
      </div>

      {/* Cell Multi-Incident Picker Modal */}
      {cellModalList && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border-slate-700 space-y-4 bg-[#0A0E17]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <span>THREATS IN CELL (Likelihood: {cellModalList.lh}, Impact: {cellModalList.imp})</span>
              </div>
              <button 
                onClick={() => setCellModalList(null)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Multiple security incidents detected in this risk matrix coordinate. Select an incident to view full SOC telemetry:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {cellModalList.points.map((pt) => {
                const Icon = SECTOR_ICONS[pt.sector] || ShieldAlert;
                return (
                  <div
                    key={pt.incident_id}
                    onClick={() => {
                      setSelectedIncident(pt);
                      setCellModalList(null);
                    }}
                    className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 text-xs">{pt.attack_name}</div>
                        <div className="text-[10px] text-slate-400">
                          {pt.sector} • {pt.affected_asset} • <span className="text-cyan-300">{pt.mitre_technique}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pt.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {pt.risk_score}/100
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Incident Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border-slate-700 space-y-4 bg-[#090D18] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    selectedIncident.severity === 'CRITICAL' 
                      ? 'bg-red-950 text-red-300 border-red-700 animate-pulse' 
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}>
                    {selectedIncident.severity} INCIDENT
                  </span>
                  <span className="text-slate-400 text-xs">ID: {selectedIncident.incident_id}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-1 font-sans">
                  {selectedIncident.attack_name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 uppercase block">SECTOR</span>
                <strong className="text-cyan-400 font-bold">{selectedIncident.sector}</strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase block">RISK SCORE</span>
                <strong className="text-red-400 font-bold">{selectedIncident.risk_score} / 100</strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase block">LIKELIHOOD</span>
                <strong className="text-slate-200">{selectedIncident.likelihood} / 5 ({LIKELIHOOD_LABELS[selectedIncident.likelihood].split('-')[1].trim()})</strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase block">IMPACT</span>
                <strong className="text-slate-200">{selectedIncident.impact} / 5 ({IMPACT_LABELS[selectedIncident.impact].split('-')[1].trim()})</strong>
              </div>
            </div>

            {/* Target Asset & MITRE Reference */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">AFFECTED INFRASTRUCTURE</span>
                  <div className="font-bold text-slate-200 text-xs">
                    {selectedIncident.affected_asset}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Asset ID: {selectedIncident.asset_id}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800 text-[10px]">
                    MITRE {selectedIncident.mitre_id}
                  </span>
                  {onSelectMitre && (
                    <button
                      onClick={() => {
                        onSelectMitre(selectedIncident.mitre_id);
                        setSelectedIncident(null);
                      }}
                      className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> EXPLAIN TECHNIQUE
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
                  <Info className="w-3.5 h-3.5" /> INCIDENT EXPLOITATION DETAILS
                </span>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  {selectedIncident.description}
                </p>
              </div>

              {/* "Why is this risky?" Explanation */}
              <div className="p-3.5 bg-amber-950/30 rounded-xl border border-amber-500/40">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> WHY IS THIS RISKY? (SOC BEGINNER EXPLAINER)
                </span>
                <p className="text-amber-200/90 leading-relaxed font-sans text-xs italic">
                  "{selectedIncident.why_risky}"
                </p>
              </div>

              {/* Recommended Action */}
              <div className="p-3.5 bg-emerald-950/30 rounded-xl border border-emerald-500/40">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
                  <Crosshair className="w-3.5 h-3.5" /> RECOMMENDED REMEDIATION ACTION
                </span>
                <p className="text-emerald-200/90 leading-relaxed font-sans text-xs">
                  {selectedIncident.recommended_action}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskHeatMap;
