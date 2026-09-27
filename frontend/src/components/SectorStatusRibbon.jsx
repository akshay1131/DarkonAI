import React, { useState } from 'react';
import { 
  Zap, 
  Wheat, 
  Building2, 
  GraduationCap, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Play,
  Flame
} from 'lucide-react';

const SECTOR_META = {
  powergrid: {
    label: 'Power Grid',
    icon: Zap,
    badgeText: '⚡ KERALA GRID SCADA',
    description: '252 Substation Assets'
  },
  agriculture: {
    label: 'Agriculture',
    icon: Wheat,
    badgeText: '🌾 SMART AGRI & IOT',
    description: '13 Smart Farm Nodes'
  },
  hospital: {
    label: 'Hospital',
    icon: Building2,
    badgeText: '🏥 HEALTHCARE SOC',
    description: '12 Medical Assets'
  },
  education: {
    label: 'Education',
    icon: GraduationCap,
    badgeText: '🏫 CAMPUS CYBER SOC',
    description: '11 Academic Nodes'
  }
};

const SectorStatusRibbon = ({ 
  sectors = [], 
  activeSector = 'powergrid', 
  onSelectSector, 
  onTriggerTestEvent 
}) => {
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedTestSector, setSelectedTestSector] = useState('Hospital');
  const [selectedTestSeverity, setSelectedTestSeverity] = useState('CRITICAL');
  const [triggering, setTriggering] = useState(false);

  const handleTriggerTest = async () => {
    setTriggering(true);
    try {
      await onTriggerTestEvent(selectedTestSector, selectedTestSeverity);
      setTestModalOpen(false);
    } catch (err) {
      console.error('Failed to trigger test event:', err);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Header bar with test simulator trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>AUTONOMOUS MULTI-SECTOR CYBERSECURITY STATUS</span>
        </div>

        <button
          onClick={() => setTestModalOpen(true)}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all text-[11px]"
          title="Simulate Normal, Medium, High, or Critical threat events"
        >
          <Play className="w-3 h-3 text-cyan-300" />
          <span>SIMULATE TEST EVENT</span>
        </button>
      </div>

      {/* 4 Sector Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {['powergrid', 'agriculture', 'hospital', 'education'].map((sectorKey) => {
          const meta = SECTOR_META[sectorKey];
          const sectorData = sectors.find(s => s.sector_key === sectorKey) || {};
          const Icon = meta.icon;
          const isSelected = activeSector === sectorKey;

          const status = sectorData.status || 'NORMAL';
          const isCritical = status === 'CRITICAL';
          const isHigh = status === 'HIGH';
          const isWarning = status === 'WARNING';

          let statusBadgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
          let borderAccent = 'border-slate-800';
          let glowClass = '';

          if (isCritical) {
            statusBadgeColor = 'bg-red-950 text-red-300 border-red-700 animate-pulse';
            borderAccent = 'border-red-500/80';
            glowClass = 'shadow-[0_0_20px_rgba(239,68,68,0.2)]';
          } else if (isHigh) {
            statusBadgeColor = 'bg-amber-950 text-amber-300 border-amber-700';
            borderAccent = 'border-amber-500/80';
            glowClass = 'shadow-[0_0_20px_rgba(245,158,11,0.2)]';
          } else if (isWarning) {
            statusBadgeColor = 'bg-yellow-950 text-yellow-300 border-yellow-700';
            borderAccent = 'border-yellow-500/60';
          }

          return (
            <div
              key={sectorKey}
              onClick={() => onSelectSector(sectorKey)}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-md relative overflow-hidden ${borderAccent} ${glowClass} ${
                isSelected 
                  ? 'bg-gradient-to-b from-cyan-950/40 via-slate-900 to-[#0B0F19] ring-2 ring-cyan-500/50' 
                  : 'bg-gradient-to-b from-slate-900/90 to-[#0A0D15]/90 hover:bg-slate-800/60'
              }`}
            >
              {/* Top Row: Icon & Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                    isCritical 
                      ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                      : isHigh 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-100 font-sans text-sm">
                    {meta.label}
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border flex items-center gap-1 ${statusBadgeColor}`}>
                  {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
                  {status}
                </span>
              </div>

              {/* Subtitle & Assets (Dynamically calculated from database) */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-slate-300">
                  {sectorData.total_assets !== undefined ? `${sectorData.total_assets} Assets` : meta.description}
                </span>
                {sectorData.avg_risk_score !== undefined && (
                  <span className="font-bold text-slate-300">
                    Risk: <strong className={isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'}>{sectorData.avg_risk_score}/100</strong>
                  </span>
                )}
              </div>

              {/* Threat snippet if active incident or latest threat */}
              {(sectorData.latest_threat || sectorData.active_incident) && (
                <div className={`mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] truncate flex items-center gap-1 ${
                  isCritical ? 'text-red-300' : isHigh ? 'text-amber-300' : 'text-slate-400'
                }`}>
                  <Flame className={`w-3 h-3 shrink-0 ${isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-cyan-400'}`} />
                  <span className="truncate">{sectorData.latest_threat || sectorData.active_incident?.event || 'Continuous Monitoring'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Test Event Trigger Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border-slate-700 space-y-4 bg-[#0A0E17]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <Play className="w-4 h-4 text-cyan-400" />
                SIMULATE SECTOR SECURITY EVENT
              </div>
              <button 
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-400 text-xs">
              Manually trigger security scenarios across sectors to test real-time alerts, risk heat map shifts, and automated email dispatching.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">TARGET SECTOR</label>
                <select
                  value={selectedTestSector}
                  onChange={(e) => setSelectedTestSector(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Hospital">🏥 Hospital (Medical IT & ICU Infrastructure)</option>
                  <option value="Agriculture">🌾 Agriculture (Smart Farming IoT & Controllers)</option>
                  <option value="Education">🏫 Education (Campus LMS & Student DB)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">SEVERITY LEVEL</label>
                <select
                  value={selectedTestSeverity}
                  onChange={(e) => setSelectedTestSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="CRITICAL">🔴 CRITICAL (Triggers Screen Alert + Heatmap + Email)</option>
                  <option value="HIGH">🟠 HIGH (Triggers Screen Alert + Heatmap + Email)</option>
                  <option value="MEDIUM">🟡 MEDIUM (Heatmap & Dashboard update only)</option>
                  <option value="LOW">🟢 LOW (Normal Baseline telemetry)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={triggering}
                onClick={handleTriggerTest}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2"
              >
                {triggering ? 'TRIGGERING...' : 'TRIGGER EVENT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorStatusRibbon;
