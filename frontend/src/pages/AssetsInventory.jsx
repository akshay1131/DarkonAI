import React, { useEffect, useState } from 'react';
import { powergridAPI } from '../services/api';
import { Server, Search, Filter, ShieldAlert, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';

const KERALA_DISTRICTS_LIST = [
  'All Districts', 'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
  'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const AssetsInventory = () => {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All Districts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    powergridAPI.getAssets()
      .then((res) => setAssets(res.data.assets || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()) || a.ip_address.includes(search);
    const matchesDistrict = districtFilter === 'All Districts' || a.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-[#0E131F] to-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2 font-sans">
            <Server className="w-6 h-6 text-cyan-400" />
            250+ KERALA SMART GRID ASSET INVENTORY
          </h2>
          <p className="text-slate-400 font-sans mt-1">
            Complete metadata explorer for PLCs, RTUs, IEDs, Smart Meters, and SCADA Servers across 14 Kerala Districts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Asset ID, IP, or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            {KERALA_DISTRICTS_LIST.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4 text-slate-400">
          <span>SHOWING {filteredAssets.length} ASSETS</span>
          <span>SYSTEM TOTAL: 252 ASSETS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase">
              <tr>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Name / Substation</th>
                <th className="p-3">District</th>
                <th className="p-3">Protocol</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Vendor & Model</th>
                <th className="p-3">Status</th>
                <th className="p-3">Risk Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAssets.slice(0, 50).map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-cyan-400">{asset.id}</td>
                  <td className="p-3 font-bold text-slate-100">{asset.name}</td>
                  <td className="p-3 text-slate-400">{asset.district}</td>
                  <td className="p-3 text-cyan-300">{asset.protocol}</td>
                  <td className="p-3 text-slate-400">{asset.ip_address}</td>
                  <td className="p-3 text-slate-400">{asset.vendor} {asset.model}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      asset.status === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      asset.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold">{asset.risk_score} / 100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetsInventory;
