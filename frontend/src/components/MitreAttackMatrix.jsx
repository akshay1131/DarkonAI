import React from 'react';
import { ShieldAlert, Crosshair, AlertTriangle } from 'lucide-react';

const TACTICS = [
  { name: 'Reconnaissance', tech: [{ id: 'T1595', name: 'Active Scanning', active: true }] },
  { name: 'Initial Access', tech: [{ id: 'T1190', name: 'Exploit Public App', active: true }, { id: 'T0859', name: 'OPC-UA Auth Abuse', active: true }] },
  { name: 'Execution', tech: [{ id: 'T1059', name: 'Command Scripting', active: false }, { id: 'T0855', name: 'Unauthorized Command', active: true }] },
  { name: 'Persistence', tech: [{ id: 'T0857', name: 'System Firmware Modification', active: true }] },
  { name: 'Privilege Escalation', tech: [{ id: 'T1068', name: 'Exploit Vulnerability', active: false }] },
  { name: 'Defense Evasion', tech: [{ id: 'T0820', name: 'Spoof Reporting Message', active: true }] },
  { name: 'Credential Access', tech: [{ id: 'T1110', name: 'Brute Force', active: true }] },
  { name: 'Discovery', tech: [{ id: 'T1046', name: 'Network Service Discovery', active: true }] },
  { name: 'Lateral Movement', tech: [{ id: 'T1021', name: 'Remote Services (SSH/RDP)', active: true }] },
  { name: 'Collection', tech: [{ id: 'T0802', name: 'Automated I/O Collecting', active: false }] },
  { name: 'Exfiltration', tech: [{ id: 'T1041', name: 'Exfiltration Over C2 Channel', active: false }] },
  { name: 'Impact', tech: [{ id: 'T0831', name: 'Manipulation of Control', active: true }, { id: 'T1486', name: 'Data Encrypted for Impact', active: true }] }
];

const MitreAttackMatrix = () => {
  return (
    <div className="glass-card p-5 rounded-2xl border-slate-800 space-y-4">
      <div className="flex justify-between items-center font-mono text-xs">
        <span className="font-bold text-slate-100 flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" /> MITRE ATT&CK FOR INDUSTRIAL CONTROL SYSTEMS (ICS) MATRIX
        </span>
        <span className="text-red-400 font-bold flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> 8 DETECTED THREAT TECHNIQUES
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 min-w-[900px] font-mono text-[10px]">
          {TACTICS.map((tactic, idx) => (
            <div key={idx} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-cyan-400 uppercase tracking-tighter truncate border-b border-slate-800 pb-1">
                {tactic.name}
              </div>

              <div className="space-y-1.5">
                {tactic.tech.map((t) => (
                  <div
                    key={t.id}
                    className={`p-1.5 rounded font-bold border transition-all ${
                      t.active
                        ? 'bg-red-950/80 text-red-400 border-red-800 shadow-neon-red animate-pulse'
                        : 'bg-slate-800/40 text-slate-500 border-slate-800'
                    }`}
                  >
                    <div className="text-[9px] opacity-75">{t.id}</div>
                    <div className="leading-tight">{t.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MitreAttackMatrix;
