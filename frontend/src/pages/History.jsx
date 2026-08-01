import React, { useEffect, useState } from 'react';
import { scanAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Download, Search, Radar, Calendar } from 'lucide-react';

const History = () => {
  const [scans, setScans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    scanAPI.getHistory()
      .then((res) => setScans(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredScans = scans.filter((s) => 
    s.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.scan_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-[#0E131F] to-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2 font-mono">
            <HistoryIcon className="w-6 h-6 text-cyan-400" />
            CYBER SECURITY AUDIT HISTORY
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Review historical scans, posture evolution, and download archived PDF reports.</p>
        </div>
        
        <div className="relative w-full sm:w-64 font-mono text-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search target IP or mode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 font-mono text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase">
              <tr>
                <th className="p-3.5">Scan ID</th>
                <th className="p-3.5">Target Address</th>
                <th className="p-3.5">Mode</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Ports / CVEs</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 text-slate-500 font-bold">#{scan.id}</td>
                  <td className="p-3.5 font-bold text-slate-100">{scan.target}</td>
                  <td className="p-3.5 text-slate-400">{scan.scan_type}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      scan.risk_level === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {scan.risk_score} ({scan.risk_level})
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-cyan-400">{scan.open_ports_count} Ports</span> / <span className="text-red-400">{scan.vulnerabilities_count} CVEs</span>
                  </td>
                  <td className="p-3.5 text-slate-400">{scan.created_at?.substring(0, 10)}</td>
                  <td className="p-3.5 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate('/scan/results', { state: { scanData: scan } })}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
                    >
                      VIEW
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
                      className="p-1 rounded bg-cyan-950 text-cyan-400 hover:bg-cyan-900"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
