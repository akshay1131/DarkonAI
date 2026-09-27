import React, { useEffect, useState } from 'react';
import { sectorsAPI } from '../services/api';
import { 
  Server, 
  Search, 
  Filter, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Wheat,
  Building2,
  GraduationCap,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const SECTOR_TABS = [
  { key: 'All', label: 'All Sectors', icon: Layers },
  { key: 'Power Grid', label: 'Power Grid', icon: Zap },
  { key: 'Agriculture', label: 'Smart Agriculture', icon: Wheat },
  { key: 'Hospital', label: 'Hospital IT', icon: Building2 },
  { key: 'Education', label: 'Education', icon: GraduationCap },
];

const SECTOR_ICONS = {
  'Power Grid': Zap,
  'Agriculture': Wheat,
  'Hospital': Building2,
  'Education': GraduationCap
};

const DISTRICTS_LIST = [
  'All Districts', 'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
  'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const AssetsInventory = () => {
  const [assets, setAssets] = useState([]);
  const [sectorCounts, setSectorCounts] = useState({});
  const [severityCounts, setSeverityCounts] = useState({});
  const [activeSector, setActiveSector] = useState('All');
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All Districts');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    setLoading(true);
    sectorsAPI.getUnifiedAssets({
      sector: activeSector !== 'All' ? activeSector : undefined,
      district: districtFilter !== 'All Districts' ? districtFilter : undefined,
      status: statusFilter !== 'All Statuses' ? statusFilter : undefined,
      search: search || undefined
    })
      .then((res) => {
        setAssets(res.data.assets || []);
        if (res.data.counts_by_sector) setSectorCounts(res.data.counts_by_sector);
        if (res.data.counts_by_severity) setSeverityCounts(res.data.counts_by_severity);
      })
      .catch((err) => console.error('Failed to load unified assets:', err))
      .finally(() => setLoading(false));
  }, [activeSector, districtFilter, statusFilter, search]);

  const totalAssetsCount = sectorCounts['All'] || 328;
  const totalPages = Math.ceil(assets.length / pageSize) || 1;
  const paginatedAssets = assets.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-[#0E131F] to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2 font-sans">
            <Server className="w-6 h-6 text-cyan-400" />
            MULTI-SECTOR CYBER DEFENSE ASSET INVENTORY
          </h2>
          <p className="text-slate-400 font-sans mt-1">
            Unified telemetry explorer for 328+ monitored physical and cyber nodes across Power Grid, Smart Agriculture, Hospital Healthcare, and Educational Institutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            TOTAL ASSETS: {totalAssetsCount}
          </span>
        </div>
      </div>

      {/* Summary KPI Cards Grid (Requirement 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Assets */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">TOTAL ASSETS</span>
          <div className="text-2xl font-black text-slate-100">{totalAssetsCount}</div>
          <span className="text-[10px] text-cyan-400">All 4 Sectors Combined</span>
        </div>

        {/* Power Grid */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">POWER GRID</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{sectorCounts['Power Grid'] || 252}</div>
          <span className="text-[10px] text-slate-400">14 Kerala Districts</span>
        </div>

        {/* Agriculture */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">AGRICULTURE</span>
            <Wheat className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{sectorCounts['Agriculture'] || 26}</div>
          <span className="text-[10px] text-slate-400">Smart Farm & IoT Nodes</span>
        </div>

        {/* Hospital */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">HOSPITAL</span>
            <Building2 className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{sectorCounts['Hospital'] || 25}</div>
          <span className="text-[10px] text-slate-400">Clinical & Life-Support</span>
        </div>

        {/* Education */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">EDUCATION</span>
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{sectorCounts['Education'] || 25}</div>
          <span className="text-[10px] text-slate-400">Campus IT & LMS DBs</span>
        </div>
      </div>

      {/* Severity Risk Distribution Badges (Requirement 2) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px]">
        <div className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>INFRASTRUCTURE POSTURE DISTRIBUTION:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-800 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            CRITICAL: {severityCounts['Critical'] || 4}
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
            HIGH / WARNING: {severityCounts['High'] || 32}
          </span>
          <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            MEDIUM / DEGRADED: {severityCounts['Medium'] || 45}
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            HEALTHY / LOW: {severityCounts['Low'] || 247}
          </span>
        </div>
      </div>

      {/* Sector Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {SECTOR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSector === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveSector(tab.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {sectorCounts[tab.key] || (tab.key === 'All' ? totalAssetsCount : 0)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Asset ID, Name, IP, Protocol, or MITRE (e.g. T0859)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:border-cyan-400 focus:outline-none text-xs"
          >
            {DISTRICTS_LIST.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:border-cyan-400 focus:outline-none text-xs"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="WARNING">WARNING / HIGH</option>
            <option value="DEGRADED">DEGRADED</option>
            <option value="HEALTHY">HEALTHY</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-slate-400 text-[11px]">
          <span>SHOWING {assets.length} FILTERED ASSETS</span>
          <span>SYSTEM TOTAL: {totalAssetsCount} ASSETS ACROSS 4 SECTORS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Sector</th>
                <th className="p-3">Asset Name & Type</th>
                <th className="p-3">Location / District</th>
                <th className="p-3">IP Address & Protocol</th>
                <th className="p-3">Vendor & Model</th>
                <th className="p-3">Status</th>
                <th className="p-3">Risk Index</th>
                <th className="p-3">MITRE Techniques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-cyan-400">
                    LOADING UNIFIED MULTI-SECTOR ASSETS...
                  </td>
                </tr>
              ) : paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500">
                    No matching assets found for current filter.
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => {
                  const Icon = SECTOR_ICONS[asset.sector] || Server;
                  const isCritical = asset.status === 'CRITICAL';
                  const isWarning = asset.status === 'WARNING';
                  const isDegraded = asset.status === 'DEGRADED';

                  let sectorBadgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-800';
                  if (asset.sector === 'Agriculture') sectorBadgeColor = 'bg-amber-950 text-amber-300 border-amber-800';
                  if (asset.sector === 'Hospital') sectorBadgeColor = 'bg-red-950 text-red-300 border-red-800';
                  if (asset.sector === 'Education') sectorBadgeColor = 'bg-blue-950 text-blue-300 border-blue-800';

                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-cyan-400 whitespace-nowrap">{asset.id}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 w-max ${sectorBadgeColor}`}>
                          <Icon className="w-3 h-3" />
                          {asset.sector}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-100">{asset.name || asset.asset_name}</div>
                        <div className="text-[10px] text-slate-400">{asset.asset_type}</div>
                      </td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">
                        <div>{asset.district}</div>
                        <div className="text-[10px] text-slate-500">{asset.location || asset.substation}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="text-slate-200 font-mono">{asset.ip_address}</div>
                        <div className="text-[10px] text-cyan-400">{asset.protocol || 'TCP/IP'}</div>
                      </td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        <div>{asset.vendor}</div>
                        <div className="text-[10px] text-slate-500">{asset.model}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isCritical ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' :
                          isWarning ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          isDegraded ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold whitespace-nowrap">
                        <span className={isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-slate-300'}>
                          {asset.risk_score} / 100
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {(asset.associated_mitre_techniques || asset.mitre_attack || []).slice(0, 2).map((m) => (
                            <span key={m} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[10px]">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-slate-400 text-xs">
            <span>Page {page} of {totalPages} ({assets.length} items)</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg border border-slate-800 flex items-center gap-1 text-slate-200"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg border border-slate-800 flex items-center gap-1 text-slate-200"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsInventory;
