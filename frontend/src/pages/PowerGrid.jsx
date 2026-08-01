import React, { useEffect, useState } from 'react';
import { powergridAPI } from '../services/api';
import { Zap, Activity, AlertOctagon, ShieldAlert, Cpu, Server, Radio, RefreshCw } from 'lucide-react';

const PowerGrid = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    powergridAPI.getStatus()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <div className="p-8 text-center text-cyan-400 font-mono">FETCHING SCADA TELEMETRY...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-[#0E131F] to-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2 font-mono">
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            CRITICAL INFRASTRUCTURE & SCADA GRID SECURITY
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Real-time monitoring feed for electrical substations, Modbus TCP, DNP3, and IEC-104 telemetry.</p>
        </div>
        <button 
          onClick={fetchStatus}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs rounded-xl border border-slate-700 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> REFRESH SCADA FEED
        </button>
      </div>

      {/* Grid Status Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="glass-card p-5 rounded-2xl border-amber-500/30">
          <span className="text-xs text-slate-400">OVERALL GRID STATE</span>
          <div className="text-lg font-black text-amber-400 mt-1 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 animate-pulse" /> {data?.grid_status || 'DEGRADED'}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-slate-400">SUBSTATION POSTURE SCORE</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{data?.overall_health_score || 72.4}%</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-red-500/30">
          <span className="text-xs text-slate-400">EXPOSED SCADA VULNERABILITIES</span>
          <div className="text-2xl font-black text-red-400 mt-1">{data?.active_scada_vulnerabilities || 7} CVEs</div>
        </div>
      </div>

      {/* Substation Cards */}
      <div>
        <h3 className="text-base font-bold text-slate-200 mb-3 font-mono">SUBSTATION TELEMETRY NODES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {data?.substations?.map((sub) => (
            <div key={sub.id} className="glass-card p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-100">{sub.name}</div>
                  <div className="text-[10px] text-slate-500">{sub.id}</div>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  sub.status === 'HEALTHY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  sub.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                }`}>
                  {sub.status}
                </span>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800 text-slate-400">
                <div className="flex justify-between"><span>Voltage:</span> <strong className="text-slate-200">{sub.voltage_kv} kV</strong></div>
                <div className="flex justify-between"><span>Frequency:</span> <strong className="text-slate-200">{sub.frequency_hz} Hz</strong></div>
                <div className="flex justify-between"><span>Substation Load:</span> <strong className="text-slate-200">{sub.load_pct}%</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Security Alerts Table */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-base font-bold text-slate-200 mb-4 font-mono flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" /> ACTIVE SCADA PROTOCOL THREAT ALERTS
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 font-mono text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Substation</th>
                <th className="p-3">Threat Classification</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Protocol / Port</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.alerts?.map((alt, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 text-slate-500">{alt.timestamp}</td>
                  <td className="p-3 font-bold text-slate-200">{alt.substation}</td>
                  <td className="p-3 text-amber-400 font-bold">{alt.type}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                      {alt.severity}
                    </span>
                  </td>
                  <td className="p-3 text-cyan-400">{alt.protocol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PowerGrid;
