import React, { useState } from 'react';
import { Server, Cpu, ShieldAlert, Activity, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

const PURDUE_ZONES = [
  {
    zoneName: 'PURDUE ZONE 0 & 1: FIELD PROCESS & CONTROL',
    description: 'PLCs, RTUs, Protection Relays, and Field Actuators',
    assets: [
      { id: 'PLC-01', name: 'Breaker Coil Control PLC', ip: '10.10.1.45', protocol: 'Modbus TCP (Port 502)', status: 'CRITICAL', temp: '54.2°C', cve: 'CVE-2022-3166', threat: 'Unauthorized Modbus Write' },
      { id: 'RTU-02', name: 'DNP3 Telemetry RTU', ip: '10.10.1.104', protocol: 'DNP3 / IEC-104', status: 'WARNING', temp: '46.8°C', cve: 'CVE-2023-28341', threat: 'IEC-104 APDU Burst' },
      { id: 'IED-03', name: 'Relion 670 Protection Relay', ip: '10.10.1.112', protocol: 'IEC 61850 GOOSE', status: 'HEALTHY', temp: '38.1°C', cve: 'N/A', threat: 'Normal Operation' },
      { id: 'MTR-04', name: 'Smart Meter Gateway Node', ip: '10.10.1.200', protocol: 'DLMS/COSEM', status: 'HEALTHY', temp: '34.5°C', cve: 'N/A', threat: 'Normal Operation' }
    ]
  },
  {
    zoneName: 'PURDUE ZONE 2: SUPERVISORY CONTROL & SCADA HMI',
    description: 'SCADA Historian Servers, Engineering Workstations, and HMI Consoles',
    assets: [
      { id: 'HMI-01', name: 'SLDC Master SCADA HMI Console', ip: '10.10.2.10', protocol: 'OPC-UA (Port 4840)', status: 'HEALTHY', temp: '42.0°C', cve: 'N/A', threat: 'Normal Telemetry Logging' },
      { id: 'EWS-02', name: 'Substation Engineering Workstation', ip: '10.10.2.88', protocol: 'RDP / SSH (Port 3389)', status: 'CRITICAL', temp: '58.4°C', cve: 'CVE-2021-44228', threat: 'Ransomware Beacon' },
      { id: 'HST-03', name: 'Historian Tag Database Server', ip: '10.10.2.120', protocol: 'SQL Server (Port 1433)', status: 'WARNING', temp: '48.2°C', cve: 'CVE-2022-0941', threat: 'OPC-UA Tag Inspection' }
    ]
  },
  {
    zoneName: 'PURDUE ZONE 3: ENTERPRISE & INDUSTRIAL DMZ',
    description: 'Industrial Firewalls, Intrusion Prevention Systems, and SIEM Forwarders',
    assets: [
      { id: 'FW-01', name: 'Industrial Security Firewall Gateway', ip: '10.10.0.1', protocol: 'HTTPS / SSH', status: 'HEALTHY', temp: '36.2°C', cve: 'N/A', threat: 'ACL Rules Active' },
      { id: 'SIEM-02', name: 'ArcSight CEF Syslog Collector', ip: '10.10.0.25', protocol: 'Syslog (Port 514)', status: 'HEALTHY', temp: '35.0°C', cve: 'N/A', threat: 'Log Ingestion Active' }
    ]
  }
];

const ScadaSystemHeatmap = () => {
  const [selectedAsset, setSelectedAsset] = useState(PURDUE_ZONES[0].assets[0]);

  return (
    <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-5 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
          <Layers className="w-5 h-5 text-cyan-400" />
          PURDUE ICS MODEL — SCADA ASSET HEALTH & THREAT MATRIX
        </div>
        <span className="text-cyan-400 font-bold flex items-center gap-1">
          <Activity className="w-3.5 h-3.5" /> 9 MONITORED CORE NODES
        </span>
      </div>

      {/* Purdue Model Zones Grid */}
      <div className="space-y-4">
        {PURDUE_ZONES.map((zone, zIdx) => (
          <div key={zIdx} className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>{zone.zoneName}</span>
              <span className="text-[10px] text-slate-500 font-sans">{zone.description}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {zone.assets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                const isCritical = asset.status === 'CRITICAL';
                const isWarning = asset.status === 'WARNING';

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 shadow-neon-cyan scale-[1.02]'
                        : isCritical
                        ? 'bg-red-950/80 border-red-500/60 shadow-neon-red hover:bg-red-900/90'
                        : isWarning
                        ? 'bg-amber-950/60 border-amber-500/50 hover:bg-amber-900/80'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-cyan-400 text-xs">{asset.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        isCritical ? 'bg-red-900 text-red-200 border border-red-700 animate-pulse' :
                        isWarning ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {asset.status}
                      </span>
                    </div>

                    <div className="font-bold text-slate-100 text-xs truncate">{asset.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{asset.protocol}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Asset Details Card */}
      {selectedAsset && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="text-cyan-400 font-bold text-xs uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> NODE INSPECTOR: {selectedAsset.name} ({selectedAsset.ip})
            </div>
            <div className="text-slate-200 text-xs">Protocol: <strong>{selectedAsset.protocol}</strong> | Temp: <strong>{selectedAsset.temp}</strong></div>
            <div className="text-red-400 font-bold text-xs">Active Threat: {selectedAsset.threat} ({selectedAsset.cve})</div>
          </div>

          <span className={`px-3 py-1.5 rounded font-bold text-xs ${
            selectedAsset.status === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}>
            STATUS: {selectedAsset.status}
          </span>
        </div>
      )}
    </div>
  );
};

export default ScadaSystemHeatmap;
