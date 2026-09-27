import React, { useState } from 'react';
import { 
  Layers, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Server, 
  Radio, 
  Terminal,
  ExternalLink
} from 'lucide-react';

const SectorHeatmap = ({ sectorTitle, sectorIcon, zones = [] }) => {
  const allAssets = zones.flatMap(z => z.assets || []);
  const initialAsset = allAssets.find(a => a.status === 'CRITICAL') || allAssets[0];
  const [selectedAsset, setSelectedAsset] = useState(initialAsset);

  // Keep selection valid if zones change
  const currentSelected = allAssets.find(a => a.id === selectedAsset?.id) || allAssets[0];

  const totalNodes = allAssets.length;
  const criticalCount = allAssets.filter(a => a.status === 'CRITICAL').length;
  const highCount = allAssets.filter(a => a.status === 'HIGH').length;
  const warnCount = allAssets.filter(a => a.status === 'WARNING').length;

  return (
    <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-5 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>{sectorIcon} {sectorTitle.toUpperCase()} — CYBERSECURITY RISK HEATMAP</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-cyan-400 font-bold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> {totalNodes} MONITORED NODES
          </span>
          {criticalCount > 0 && (
            <span className="text-red-400 font-bold flex items-center gap-1 animate-pulse">
              🔴 {criticalCount} CRITICAL
            </span>
          )}
          {highCount > 0 && (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              🟠 {highCount} HIGH
            </span>
          )}
        </div>
      </div>

      {/* Zones Grid */}
      <div className="space-y-4">
        {zones.map((zone, zIdx) => (
          <div key={zIdx} className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>{zone.zone_name || zone.zoneName}</span>
              <span className="text-[10px] text-slate-500 font-sans">{zone.description}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(zone.assets || []).map((asset) => {
                const isSelected = currentSelected?.id === asset.id;
                const isCritical = asset.status === 'CRITICAL';
                const isHigh = asset.status === 'HIGH';
                const isWarning = asset.status === 'WARNING';

                let cardBg = 'bg-slate-900/60 border-slate-800 hover:border-slate-700';
                let dotColor = 'bg-emerald-400';

                if (isCritical) {
                  cardBg = 'bg-red-950/40 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse';
                  dotColor = 'bg-red-400';
                } else if (isHigh) {
                  cardBg = 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
                  dotColor = 'bg-amber-400';
                } else if (isWarning) {
                  cardBg = 'bg-yellow-950/40 border-yellow-500/60';
                  dotColor = 'bg-yellow-400';
                }

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer space-y-2 relative overflow-hidden ${cardBg} ${
                      isSelected ? 'ring-2 ring-cyan-400 border-cyan-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <span className={`w-2 h-2 rounded-full ${dotColor} ${isCritical ? 'animate-ping' : ''}`} />
                        <span className="truncate">{asset.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {asset.id}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>IP: {asset.ip}</span>
                      <span className={`font-bold ${isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {asset.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-800/80">
                      {asset.metrics || asset.protocol}
                    </div>

                    {asset.threat && asset.threat !== 'Normal Telemetry' && asset.threat !== 'Operating Normally' && (
                      <div className={`text-[10px] truncate font-bold ${isCritical ? 'text-red-300' : isHigh ? 'text-amber-300' : 'text-slate-400'}`}>
                        ⚡ {asset.threat}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Node Inspector Card */}
      {currentSelected && (
        <div className="mt-4 p-4 rounded-xl bg-[#090D16] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                NODE INSPECTOR: {currentSelected.id}
              </span>
              <span className="font-bold text-slate-100">{currentSelected.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                currentSelected.status === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                currentSelected.status === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                currentSelected.status === 'WARNING' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {currentSelected.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] text-slate-300 pt-1">
              <div><span className="text-slate-500">IP ADDRESS:</span> {currentSelected.ip}</div>
              <div><span className="text-slate-500">PROTOCOL:</span> {currentSelected.protocol}</div>
              <div><span className="text-slate-500">RISK SCORE:</span> <strong className="text-red-400">{currentSelected.risk_score || 18}/100</strong></div>
              <div><span className="text-slate-500">CVE ID:</span> {currentSelected.cve || 'N/A'}</div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1 font-sans">
              <span className="text-cyan-400 font-mono font-bold">TELEMETRY & STATUS:</span> {currentSelected.metrics} • Threat Analysis: {currentSelected.threat || 'Normal Baseline'}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 hidden lg:inline">CONTINUOUS TELEMETRY LIVE</span>
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorHeatmap;
