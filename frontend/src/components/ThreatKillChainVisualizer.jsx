import React, { useState } from 'react';
import { ShieldAlert, Crosshair, AlertTriangle, Activity, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

const KILL_CHAIN_STAGES = [
  {
    stage: '1. Reconnaissance',
    status: 'ACTIVE',
    description: 'Port scanning across SCADA subnetwork 10.10.1.0/24',
    threat: 'Substation Network SYN Scan',
    mitre: 'T1595',
    severity: 'MEDIUM',
    color: '#F59E0B'
  },
  {
    stage: '2. Initial Intrusion',
    status: 'CRITICAL',
    description: 'Exploiting OPC-UA anonymous authentication vulnerability',
    threat: 'OPC-UA Auth Bypass',
    mitre: 'T1190',
    cve: 'CVE-2022-0941',
    severity: 'HIGH',
    color: '#F97316'
  },
  {
    stage: '3. Command Override',
    status: 'CRITICAL',
    description: 'Unauthenticated coil write payload to Substation Breaker PLC',
    threat: 'Unauthorized Modbus Write',
    mitre: 'T0855',
    cve: 'CVE-2022-3166',
    severity: 'CRITICAL',
    color: '#EF4444'
  },
  {
    stage: '4. Lateral Pivot',
    status: 'HIGH',
    description: 'Pivot attempt to Regional Control Center telemetry gateway',
    threat: 'IEC-104 Telemetry Flood',
    mitre: 'T1021',
    cve: 'CVE-2023-28341',
    severity: 'HIGH',
    color: '#F97316'
  },
  {
    stage: '5. Grid Impact',
    status: 'CONTAINED',
    description: 'Automated AI playbook blocked source IP and isolated PLC coil logic',
    threat: 'Power Blackout Prevention',
    mitre: 'T0831',
    severity: 'SECURED',
    color: '#10B981'
  }
];

const ThreatKillChainVisualizer = ({ activeIncident }) => {
  const [selectedStage, setSelectedStage] = useState(KILL_CHAIN_STAGES[2]);

  return (
    <div className="glass-card p-6 rounded-2xl border-cyan-500/30 space-y-5 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
          <Crosshair className="w-5 h-5 text-cyan-400" />
          CYBER THREAT KILL-CHAIN SPECTRUM & IMPACT VISUALIZER
        </div>
        <div className="flex items-center gap-2 text-[11px] text-red-400 font-bold">
          <ShieldAlert className="w-4 h-4 animate-pulse" /> 5-STAGE ATTACK PATH CORRELATED
        </div>
      </div>

      {/* Interactive Kill Chain Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {KILL_CHAIN_STAGES.map((st, idx) => {
          const isSelected = selectedStage.stage === st.stage;
          const isCritical = st.severity === 'CRITICAL';
          const isHigh = st.severity === 'HIGH';

          return (
            <div
              key={idx}
              onClick={() => setSelectedStage(st)}
              className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-neon-cyan scale-[1.02]'
                  : isCritical
                  ? 'bg-red-950/70 border-red-500/60 shadow-neon-red hover:border-red-400'
                  : isHigh
                  ? 'bg-amber-950/60 border-amber-500/50 hover:border-amber-400'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{st.stage}</span>
                {idx < 4 && <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden md:block" />}
              </div>

              <div>
                <div className="font-bold text-slate-100 text-xs">{st.threat}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">MITRE {st.mitre}</div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                  style={{ backgroundColor: `${st.color}20`, color: st.color, border: `1px solid ${st.color}50` }}
                >
                  {st.severity}
                </span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Panel */}
      {selectedStage && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="text-cyan-400 font-bold text-xs uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> STAGE INSPECTOR: {selectedStage.stage}
            </div>
            <div className="text-slate-200 text-sm font-bold">{selectedStage.threat} ({selectedStage.mitre})</div>
            <p className="text-slate-400 text-[11px] font-sans leading-relaxed">{selectedStage.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {selectedStage.cve && (
              <span className="px-3 py-1 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                {selectedStage.cve}
              </span>
            )}
            <span className="px-3 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
              STATUS: {selectedStage.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatKillChainVisualizer;
