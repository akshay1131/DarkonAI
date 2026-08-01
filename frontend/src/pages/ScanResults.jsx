import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scanAPI, siemAPI } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import { 
  ShieldAlert, Download, Cpu, Server, AlertCircle, 
  CheckCircle2, Bot, ArrowLeft, Terminal, Shield, ExternalLink, Share2
} from 'lucide-react';

const ScanResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scan, setScan] = useState(location.state?.scanData || null);
  const [loading, setLoading] = useState(!location.state?.scanData);

  useEffect(() => {
    if (!scan) {
      // Fetch latest scan history if no scan passed in state
      scanAPI.getHistory()
        .then((res) => {
          if (res.data.length > 0) {
            setScan(res.data[0]);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-mono">LOADING AUDIT REPORT...</div>;
  }

  if (!scan) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl">
        <h3 className="text-lg font-bold text-slate-200">No Scan Results Found</h3>
        <p className="text-sm text-slate-400 mt-2">Run a new scan to view real-time network and CVE insights.</p>
        <button onClick={() => navigate('/scan/new')} className="mt-4 px-4 py-2 bg-cyan-500 text-black font-bold text-xs rounded-lg">
          START SCAN NOW
        </button>
      </div>
    );
  }

  const ai = scan.ai_summary || {};

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-[#0E131F] to-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 font-mono flex items-center gap-2">
              AUDIT REPORT: {scan.target}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Scan ID: #{scan.id} • Duration: {scan.scan_duration}s • OS: {scan.os_detected}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={async () => {
              const res = await siemAPI.exportCEF(scan.id);
              alert(`CEF LOG EXPORT:\n\n${res.data.cef_string}`);
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs rounded-xl border border-slate-700 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" /> EXPORT CEF / SIEM
          </button>
          <button
            onClick={async () => {
              const response = await scanAPI.downloadPdf(scan.id);
              const url = URL.createObjectURL(response.data);
              const link = document.createElement('a');
              link.href = url;
              link.download = `Darkon_Report_Scan_${scan.id}.pdf`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-neon-cyan transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> DOWNLOAD PDF REPORT
          </button>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <RiskGauge score={scan.risk_score} level={scan.risk_level} />
        </div>

        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Bot className="w-4 h-4" /> DARKON AI EXECUTIVE SUMMARY
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {ai.executive_summary || `Audit scan completed for ${scan.target}. Vulnerabilities and open ports correlated.`}
            </p>
          </div>

          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">ATTACK SURFACE CLASSIFICATIONS</div>
            <div className="flex flex-wrap gap-2">
              {scan.attack_categories?.map((cat, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Discovered Ports: <strong className="text-cyan-400">{scan.open_ports_count}</strong></span>
            <span>Matched CVEs: <strong className="text-red-400">{scan.vulnerabilities_count}</strong></span>
            <span>Status: <strong className="text-emerald-400">{scan.status}</strong></span>
          </div>
        </div>
      </div>

      {/* Discovered Services Table */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" /> Discovered Network & SCADA Services
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-mono text-slate-400 uppercase">
              <tr>
                <th className="p-3">Port</th>
                <th className="p-3">Protocol</th>
                <th className="p-3">State</th>
                <th className="p-3">Service Daemon</th>
                <th className="p-3">Fingerprinted Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-xs">
              {scan.ports?.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-cyan-400">{p.port}</td>
                  <td className="p-3 text-slate-400">{p.protocol}</td>
                  <td className="p-3"><span className="text-emerald-400 font-bold">OPEN</span></td>
                  <td className="p-3 font-bold text-slate-200">{p.service}</td>
                  <td className="p-3 text-slate-400">{p.version || 'Standard Binary'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CVE Vulnerability Cards */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" /> Matched CVE Vulnerabilities (NVD Database)
        </h3>
        <div className="space-y-4">
          {scan.vulnerabilities?.map((v, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-red-500/20 hover:border-red-500/50 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-mono font-bold text-red-400 text-sm flex items-center gap-2">
                  {v.cve_id}
                  <a href={v.references?.[0] || '#'} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-cyan-400">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </span>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-800">
                    CVSS {v.cvss_score} ({v.severity})
                  </span>
                  <span className="text-slate-400">{v.detected_service}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{v.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Threat Blueprint & Recommendations */}
      <div className="glass-card p-6 rounded-2xl border-cyan-500/30">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" /> AI Prioritized Fix Blueprint
        </h3>
        <div className="space-y-3 text-sm text-slate-300 font-sans">
          {Array.isArray(ai.recommended_fixes) ? (
            ai.recommended_fixes.map((fix, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{fix}</span>
              </div>
            ))
          ) : (
            <p>{ai.recommended_fixes}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanResults;
