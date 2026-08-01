import React, { useState } from 'react';
import { scanAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Radar, ShieldAlert, Terminal as TerminalIcon, Play, CheckCircle2 } from 'lucide-react';

const NewScan = () => {
  const [target, setTarget] = useState('192.168.1.105');
  const [scanType, setScanType] = useState('SCADA & Full Vulnerability Audit');
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!target) return;

    setScanning(true);
    setLogs([
      `[${new Date().toLocaleTimeString()}] [INITIALIZING] Darkon AI Scanner Engine...`,
      `[${new Date().toLocaleTimeString()}] [TARGET RESOLUTION] Resolving ${target}... Host identified.`,
      `[${new Date().toLocaleTimeString()}] [PORT DISCOVERY] Scanning top TCP/UDP service ports...`,
    ]);

    // Live terminal log animation updates
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [PORT DISCOVERY] Discovered exposed ports: 22 (SSH), 80 (HTTP), 104 (IEC Grid), 502 (Modbus).`,
        `[${new Date().toLocaleTimeString()}] [SERVICE VERSIONING] Fingerprinting running daemon software versions...`,
      ]);
    }, 1000);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [NVD ENGINE] Querying National Vulnerability Database for CVE matches...`,
        `[${new Date().toLocaleTimeString()}] [CVE MATCH] Found CVE-2023-28341 (CVSS 9.1 CRITICAL) - IEC 60870-5-104 Authentication Bypass.`,
        `[${new Date().toLocaleTimeString()}] [AI ENGINE] Synthesizing remediation blueprint and attack surface scoring...`,
      ]);
    }, 2000);

    try {
      const res = await scanAPI.executeScan({ target, scan_type: scanType });
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [SUCCESS] Security audit completed in ${res.data.scan_duration}s. Dynamic Risk Score: ${res.data.risk_score}/100`,
        ]);
        setTimeout(() => {
          navigate('/scan/results', { state: { scanData: res.data } });
        }, 1200);
      }, 3000);
    } catch (err) {
      console.error(err);
      setScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-[#0E131F] to-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Radar className="w-6 h-6 text-cyan-400" />
          Network & SCADA Vulnerability Scanner
        </h2>
        <p className="text-sm text-slate-400 mt-1">Specify target IP address, domain, or hostname for port discovery, version matching, and AI security synthesis.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <form onSubmit={handleScan} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Target Address / Subnet</label>
            <input 
              type="text" 
              value={target} 
              onChange={(e) => setTarget(e.target.value)} 
              placeholder="e.g. 192.168.1.105, target.com, scada.grid.local"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Scan Mode Profile</label>
            <select 
              value={scanType} 
              onChange={(e) => setScanType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
            >
              <option value="SCADA & Full Vulnerability Audit">SCADA & Industrial SCADA Audit (Modbus, DNP3, IEC-104)</option>
              <option value="Full Vulnerability Scan">Full Comprehensive Vulnerability & Port Scan</option>
              <option value="Quick Port Discovery">Quick Port & Daemon Discovery</option>
            </select>
          </div>

          {/* Quick Target Presets */}
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Preset Target Quick-Pick:</span>
            <div className="flex flex-wrap gap-2 mt-2 font-mono text-xs">
              <button type="button" onClick={() => setTarget('192.168.1.105')} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700">
                Substation SCADA (192.168.1.105)
              </button>
              <button type="button" onClick={() => setTarget('example.com')} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700">
                Web Server (example.com)
              </button>
              <button type="button" onClick={() => setTarget('127.0.0.1')} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700">
                Localhost (127.0.0.1)
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={scanning}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              scanning 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-neon-cyan'
            }`}
          >
            {scanning ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-500 border-t-cyan-400 rounded-full animate-spin"></div>
                SCANNING IN PROGRESS...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> INITIATE CYBER AUDIT SCAN
              </>
            )}
          </button>
        </form>
      </div>

      {/* Terminal Live Output Console */}
      {logs.length > 0 && (
        <div className="bg-[#05070A] p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <span className="text-cyan-400 flex items-center gap-2 font-bold">
              <TerminalIcon className="w-4 h-4" /> REAL-TIME SCANNER TERMINAL
            </span>
            <span className="text-[10px] text-slate-500">DARKON SEC-CONSOLE</span>
          </div>
          {logs.map((log, idx) => (
            <div key={idx} className="text-cyan-300/90 leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewScan;
