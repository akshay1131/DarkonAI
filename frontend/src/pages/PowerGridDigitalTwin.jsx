import React, { useEffect, useState } from 'react';
import KeralaGrid3DMap from '../components/KeralaGrid3DMap';
import NetworkTopologyView from '../components/NetworkTopologyView';
import { powergridAPI } from '../services/api';
import { Zap, Activity, ShieldAlert, RefreshCw, Cpu, Radio } from 'lucide-react';

const PowerGridDigitalTwin = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('Ernakulam');

  const fetchTelemetry = () => {
    powergridAPI.getStatus()
      .then((res) => setTelemetry(res.data.telemetry))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-[#0E131F] to-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2 font-sans">
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            KERALA SMART POWER GRID DIGITAL TWIN
          </h2>
          <p className="text-slate-400 font-sans mt-1">
            Simulated 3D telemetry monitoring across 14 Kerala districts (250+ SCADA PLCs, RTUs, IEDs, and Smart Meters).
          </p>
        </div>
        <button
          onClick={fetchTelemetry}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs rounded-xl border border-slate-700 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> REFRESH LIVE TELEMETRY
        </button>
      </div>

      {/* Live Telemetry Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <span className="text-slate-400">GRID FREQUENCY</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{telemetry?.frequency_hz || 50.02} Hz</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <span className="text-slate-400">ACTIVE DEMAND</span>
          <div className="text-2xl font-black text-slate-100 mt-1">{telemetry?.total_demand_mw || 2410.5} MW</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <span className="text-slate-400">HYDRO GENERATION</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{telemetry?.generation_breakdown?.hydro_mw || 1650.0} MW</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <span className="text-slate-400">GRID LOAD CAPACITY</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{telemetry?.grid_load_pct || 84.6}%</div>
        </div>
      </div>

      {/* 3D Grid Map and Topology Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KeralaGrid3DMap onSelectDistrict={(d) => setSelectedDistrict(d)} />
        <NetworkTopologyView />
      </div>
    </div>
  );
};

export default PowerGridDigitalTwin;
