import React, { useEffect, useState } from 'react';
import { dashboardAPI, powergridAPI, incidentAPI, sectorsAPI } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import ThreatKillChainVisualizer from '../components/ThreatKillChainVisualizer';
import ScadaSystemHeatmap from '../components/ScadaSystemHeatmap';
import MitreAttackMatrix from '../components/MitreAttackMatrix';
import SOCChatbotPanel from '../components/SOCChatbotPanel';
import GlobalAlertBanner from '../components/GlobalAlertBanner';
import SectorStatusRibbon from '../components/SectorStatusRibbon';
import SectorHeatmap from '../components/SectorHeatmap';
import RiskHeatMap from '../components/RiskHeatMap';
import MitreExplainer from '../components/MitreExplainer';
import AttackAnalytics from '../components/AttackAnalytics';
import { 
  ShieldAlert, Radar, Bug, Server, TrendingUp, ArrowUpRight, 
  ShieldCheck, Activity, AlertTriangle, Download, Zap, Radio, Crosshair, CheckCircle2, Clock3,
  Wheat, Building2, GraduationCap, RefreshCw, Cpu, Database
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [gridData, setGridData] = useState(null);
  const [reportStatus, setReportStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Multi-Sector State
  const [activeSector, setActiveSector] = useState('powergrid');
  const [sectorsOverview, setSectorsOverview] = useState(null);
  const [activeBannerAlert, setActiveBannerAlert] = useState(null);
  const [sectorDetailData, setSectorDetailData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedMitreId, setSelectedMitreId] = useState('T0859');

  const fetchDashboardData = () => {
    // 1. Existing dashboard stats
    dashboardAPI.getStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));

    // 2. Existing power grid SCADA status
    powergridAPI.getStatus()
      .then((res) => setGridData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // 3. Multi-sector overview & real-time alerts
    sectorsAPI.getOverview()
      .then((res) => {
        setSectorsOverview(res.data);
        if (res.data.active_banner_alert) {
          setActiveBannerAlert(res.data.active_banner_alert);
        }
      })
      .catch((err) => console.error(err));

    // 4. Multi-sector analytics (Heat map, attack analytics, percentages)
    sectorsAPI.getAnalytics()
      .then((res) => setAnalyticsData(res.data))
      .catch((err) => console.error('Analytics fetch error:', err));

    // 5. Fetch specific sector data if not powergrid
    if (activeSector !== 'powergrid') {
      sectorsAPI.getSectorDetail(activeSector)
        .then((res) => setSectorDetailData(res.data))
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSector]);

  const handleDismissBanner = () => {
    setActiveBannerAlert(null);
    sectorsAPI.dismissAlert().catch((err) => console.error(err));
  };

  const handleTriggerTestEvent = async (sector, severity) => {
    const res = await sectorsAPI.triggerTestEvent({ sector, severity });
    fetchDashboardData();
    return res;
  };

  const downloadReport = async (filename) => {
    const response = await incidentAPI.downloadReport(filename);
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateAndDownloadReport = async () => {
    setReportStatus('Generating incident PDF...');
    try {
      const response = await incidentAPI.generateReport({ incident: activeIncident });
      await downloadReport(response.data.pdf_report);
      setReportStatus('Incident report downloaded successfully.');
      setTimeout(() => setReportStatus(''), 4000);
    } catch (err) {
      setReportStatus(err.response?.data?.error || 'Unable to generate the incident report.');
      setTimeout(() => setReportStatus(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 font-mono text-xs text-cyan-400">
        INITIALIZING DARKON AI MULTI-SECTOR SOC COMMAND DASHBOARD...
      </div>
    );
  }

  const telemetry = gridData?.telemetry || {};
  const activeIncident = gridData?.active_incident || {};

  return (
    <div className="space-y-6">
      {/* Header Banner (Preserved) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-[#0E131F] to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2 font-mono">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            DARKON AI — MULTI-SECTOR CYBER DEFENSE SOC COMMAND
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Continuous autonomous monitoring across Power Grid, Smart Agriculture, Hospital IT, and Educational Institutions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <button
            onClick={handleGenerateAndDownloadReport}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-cyan-300" /> GENERATE & DOWNLOAD REPORT
          </button>
        </div>
      </div>

      {reportStatus && (
        <div className="p-3 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs animate-pulse">
          {reportStatus}
        </div>
      )}

      {/* REAL-TIME GLOBAL THREAT ALERT BANNER (Visible across all tabs on HIGH/CRITICAL) */}
      {activeBannerAlert && (
        <GlobalAlertBanner 
          alert={activeBannerAlert} 
          onDismiss={handleDismissBanner}
          onSelectSector={(sectorKey) => setActiveSector(sectorKey)}
        />
      )}

      {/* MULTI-SECTOR LIVE STATUS RIBBON & SECTOR SWITCHER */}
      <SectorStatusRibbon
        sectors={sectorsOverview?.sectors || []}
        activeSector={activeSector}
        onSelectSector={(sectorKey) => setActiveSector(sectorKey)}
        onTriggerTestEvent={handleTriggerTestEvent}
      />

      {/* ============================================================= */}
      {/* MULTI-SECTOR CYBER RISK HEAT MAP & MITRE ATT&CK EXPLAINER      */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <RiskHeatMap 
          heatmapPoints={analyticsData?.heatmap_points || []}
          onSelectMitre={(mitreId) => {
            setSelectedMitreId(mitreId);
            const el = document.getElementById('mitre-explainer-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        <div id="mitre-explainer-section">
          <MitreExplainer selectedTechniqueId={selectedMitreId} />
        </div>
      </div>

      {/* ============================================================= */}
      {/* DYNAMIC ATTACK ANALYTICS & THREAT DISTRIBUTION                */}
      {/* ============================================================= */}
      <AttackAnalytics 
        analyticsData={analyticsData}
        onSelectMitre={(mitreId) => {
          setSelectedMitreId(mitreId);
          const el = document.getElementById('mitre-explainer-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* SECTOR VIEW 1: POWER GRID (100% PRESERVED ORIGINAL INTERFACE) */}
      {/* ------------------------------------------------------------- */}
      {activeSector === 'powergrid' && (
        <div className="space-y-6">
          {/* Live Cyber Threat Alert Bar */}
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/40 shadow-neon-red flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-red-400 animate-ping" />
              <div>
                <span className="font-bold text-red-400 uppercase tracking-widest text-sm">
                  ACTIVE THREAT INCIDENT: {activeIncident.threat_type || 'Unauthorized Modbus Write'}
                </span>
                <div className="text-slate-200 mt-0.5">
                  Target: {activeIncident.target_asset_name || 'Substation PLC'} ({activeIncident.target_ip || '10.10.1.5'}) • Protocol: {activeIncident.protocol || 'Modbus TCP'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-red-900 text-red-200 font-bold border border-red-700">
                MITRE {activeIncident.mitre_id || 'T0855'}
              </span>
              <span className="px-2.5 py-1 rounded bg-red-950 text-red-400 font-bold border border-red-800">
                RISK {activeIncident.risk_score || 94.5}/100
              </span>
            </div>
          </div>

          {/* Incident Command Brief */}
          <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-[#0d1420] to-slate-950 p-5 shadow-xl">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.16em] text-cyan-400">
                <Crosshair className="h-4 w-4" /> INCIDENT COMMAND BRIEF
              </div>
              <h3 className="mt-3 text-xl font-bold text-slate-100">Contain the active OT intrusion before lateral movement.</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {activeIncident.description || `DarkonAI has correlated anomalous ${activeIncident.protocol || 'industrial protocol'} activity against a critical grid asset. Prioritise isolation while preserving telemetry for investigation.`}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px]">
                <span className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-300">SOURCE {activeIncident.source_ip || '172.16.24.18'}</span>
                <span className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-300">DISTRICT {activeIncident.target_district || 'KERALA GRID'}</span>
                <span className="rounded border border-red-500/40 bg-red-950/60 px-2.5 py-1.5 text-red-300">SEVERITY {activeIncident.severity || 'CRITICAL'}</span>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
              <div className="mb-3 font-mono text-[10px] font-bold tracking-[0.16em] text-slate-500">RESPONSE SEQUENCE</div>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /><div><strong className="text-slate-200">1. Detect & validate</strong><p className="text-xs text-slate-500">MITRE mapping and asset context confirmed.</p></div></div>
                <div className="flex gap-3"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /><div><strong className="text-slate-200">2. Contain source</strong><p className="text-xs text-slate-500">Block origin and isolate the affected control channel.</p></div></div>
                <div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><div><strong className="text-slate-200">3. Preserve & recover</strong><p className="text-xs text-slate-500">Capture evidence, verify PLC logic, and restore normal operations.</p></div></div>
              </div>
            </div>
          </section>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">MONITORED ASSETS</span>
                <div className="text-2xl font-black text-slate-100 font-mono mt-1">252 Assets</div>
                <span className="text-[11px] text-cyan-400 font-mono">14 Industrial Subnets</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Server className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">GRID FREQUENCY</span>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{telemetry.frequency_hz || 50.02} Hz</div>
                <span className="text-[11px] text-emerald-400 font-mono">Normal (50.00 Hz)</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">TOTAL SYSTEM DEMAND</span>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">{telemetry.total_demand_mw || 2410.5} MW</div>
                <span className="text-[11px] text-amber-400 font-mono">{telemetry.grid_load_pct || 84.6}% Capacity</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">POSTURE RISK SCORE</span>
                <div className="text-2xl font-black text-red-400 font-mono mt-1">{telemetry.overall_risk_score || 18.5} / 100</div>
                <span className="text-[11px] text-red-400 font-mono animate-pulse">Scanning Continuously</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* THREAT KILL CHAIN SPECTRUM VISUALIZER */}
          <ThreatKillChainVisualizer activeIncident={activeIncident} />

          {/* PURDUE MODEL SCADA ASSET HEATMAP */}
          <ScadaSystemHeatmap />

          {/* MITRE ATT&CK Matrix */}
          <MitreAttackMatrix />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTOR VIEW 2: SMART AGRICULTURE & IOT                         */}
      {/* ------------------------------------------------------------- */}
      {activeSector === 'agriculture' && (
        <div className="space-y-6">
          {/* Active Threat Bar */}
          {sectorDetailData?.active_incident && (
            <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <Wheat className="w-5 h-5 text-amber-400 animate-pulse" />
                <div>
                  <span className="font-bold text-amber-400 uppercase tracking-widest text-sm">
                    AGRI IOT SECURITY INCIDENT: {sectorDetailData.active_incident.event}
                  </span>
                  <div className="text-slate-200 mt-0.5">
                    Target: {sectorDetailData.active_incident.asset} • MITRE: {sectorDetailData.active_incident.mitre_id}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-amber-900 text-amber-200 font-bold border border-amber-700">
                  {sectorDetailData.active_incident.severity}
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-400 font-bold border border-amber-800">
                  RISK {sectorDetailData.active_incident.risk_score}/100
                </span>
              </div>
            </div>
          )}

          {/* Sector Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">SMART FARM NODES</span>
                <div className="text-2xl font-black text-slate-100 mt-1">13 IoT Nodes</div>
                <span className="text-[11px] text-cyan-400">5 Micro-Zones Active</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Cpu className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">TELEMETRY THROUGHPUT</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">420 pkts/sec</div>
                <span className="text-[11px] text-emerald-400">MQTT TLS 1.3 Active</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">IRRIGATION AUTOMATION</span>
                <div className="text-2xl font-black text-cyan-400 mt-1">4 Controllers</div>
                <span className="text-[11px] text-cyan-400">Modbus TCP Enforced</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Wheat className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">AGRI RISK SCORE</span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {sectorDetailData?.active_incident?.risk_score || 18.2} / 100
                </div>
                <span className="text-[11px] text-amber-400">Autonomous Monitoring</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Sector Risk Heatmap */}
          <SectorHeatmap 
            sectorTitle="Smart Agriculture & IoT Infrastructure"
            sectorIcon="🌾"
            zones={sectorDetailData?.zones || []}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTOR VIEW 3: HOSPITAL IT & MEDICAL INFRASTRUCTURE           */}
      {/* ------------------------------------------------------------- */}
      {activeSector === 'hospital' && (
        <div className="space-y-6">
          {/* Active Threat Bar */}
          {sectorDetailData?.active_incident && (
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-red-400 animate-pulse" />
                <div>
                  <span className="font-bold text-red-400 uppercase tracking-widest text-sm">
                    HOSPITAL CYBERSECURITY INCIDENT: {sectorDetailData.active_incident.event}
                  </span>
                  <div className="text-slate-200 mt-0.5">
                    Target: {sectorDetailData.active_incident.asset} • MITRE: {sectorDetailData.active_incident.mitre_id}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-red-900 text-red-200 font-bold border border-red-700">
                  {sectorDetailData.active_incident.severity}
                </span>
                <span className="px-2.5 py-1 rounded bg-red-950 text-red-400 font-bold border border-red-800">
                  RISK {sectorDetailData.active_incident.risk_score}/100
                </span>
              </div>
            </div>
          )}

          {/* Sector Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">MEDICAL INFRASTRUCTURE</span>
                <div className="text-2xl font-black text-slate-100 mt-1">12 Clinical Assets</div>
                <span className="text-[11px] text-cyan-400">ICU, EHR, PACS, Pharmacy</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">EHR QUERY THROUGHPUT</span>
                <div className="text-2xl font-black text-cyan-400 mt-1">840 req/min</div>
                <span className="text-[11px] text-emerald-400">HIPAA Compliant Vault</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">ICU LIFE-SUPPORT NODES</span>
                <div className="text-2xl font-black text-red-400 mt-1">3 Life-Support Nodes</div>
                <span className="text-[11px] text-red-400">Air-gapped Medical VLAN</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">HOSPITAL RISK SCORE</span>
                <div className="text-2xl font-black text-red-400 mt-1">
                  {sectorDetailData?.active_incident?.risk_score || 22.5} / 100
                </div>
                <span className="text-[11px] text-red-400 animate-pulse">Zero Trust Gateway</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Sector Risk Heatmap */}
          <SectorHeatmap 
            sectorTitle="Hospital IT & Medical Infrastructure"
            sectorIcon="🏥"
            zones={sectorDetailData?.zones || []}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTOR VIEW 4: EDUCATIONAL INSTITUTION                        */}
      {/* ------------------------------------------------------------- */}
      {activeSector === 'education' && (
        <div className="space-y-6">
          {/* Active Threat Bar */}
          {sectorDetailData?.active_incident && (
            <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-amber-400 animate-pulse" />
                <div>
                  <span className="font-bold text-amber-400 uppercase tracking-widest text-sm">
                    CAMPUS CYBERSECURITY INCIDENT: {sectorDetailData.active_incident.event}
                  </span>
                  <div className="text-slate-200 mt-0.5">
                    Target: {sectorDetailData.active_incident.asset} • MITRE: {sectorDetailData.active_incident.mitre_id}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-amber-900 text-amber-200 font-bold border border-amber-700">
                  {sectorDetailData.active_incident.severity}
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-400 font-bold border border-amber-800">
                  RISK {sectorDetailData.active_incident.risk_score}/100
                </span>
              </div>
            </div>
          )}

          {/* Sector Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">CAMPUS IT ASSETS</span>
                <div className="text-2xl font-black text-slate-100 mt-1">11 Core Servers</div>
                <span className="text-[11px] text-cyan-400">LMS, Portal, Labs, Admin</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">CAMPUS WI-FI CLIENTS</span>
                <div className="text-2xl font-black text-cyan-400 mt-1">8,400 Users</div>
                <span className="text-[11px] text-emerald-400">802.1X Enterprise</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">CONCURRENT LMS LEARNERS</span>
                <div className="text-2xl font-black text-amber-400 mt-1">3,420 Active</div>
                <span className="text-[11px] text-amber-400">Exam Guard Active</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Server className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase">CAMPUS RISK SCORE</span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {sectorDetailData?.active_incident?.risk_score || 21.0} / 100
                </div>
                <span className="text-[11px] text-amber-400">RADIUS Intrusion Watch</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Sector Risk Heatmap */}
          <SectorHeatmap 
            sectorTitle="Educational Institution & Campus Cyber SOC"
            sectorIcon="🏫"
            zones={sectorDetailData?.zones || []}
          />
        </div>
      )}

      {/* Floating Chatbot Assistant (Preserved across all views) */}
      <SOCChatbotPanel />
    </div>
  );
};

export default Dashboard;
