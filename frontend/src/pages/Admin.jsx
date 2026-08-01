import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { Settings as SettingsIcon, Users, Key, Save, Server, Shield } from 'lucide-react';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({});
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminAPI.getUsers().then((res) => setUsers(res.data));
    adminAPI.getLogs().then((res) => setLogs(res.data));
    adminAPI.getConfig().then((res) => setConfig(res.data));
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    await adminAPI.updateConfig({
      groq_api_key: groqKey,
      gemini_api_key: geminiKey,
      openai_api_key: openaiKey
    });
    setMsg('API Settings updated successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="bg-gradient-to-r from-slate-900 via-[#0E131F] to-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2 font-sans">
          <SettingsIcon className="w-6 h-6 text-cyan-400" /> SYSTEM & API CONFIGURATION
        </h2>
        <p className="text-slate-400 font-sans mt-1">Manage platform API credentials, LLM engine keys, system audit logs, and user roles.</p>
      </div>

      {/* API Key Form */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-base font-bold text-slate-200 font-sans mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400" /> LLM Engine Integration Keys
        </h3>
        {msg && <div className="p-3 mb-4 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">{msg}</div>}
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1">GROQ API KEY (LLAMA-3 70B)</label>
            <input 
              type="password" 
              placeholder="gsk_..." 
              value={groqKey} 
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">GOOGLE GEMINI API KEY</label>
            <input 
              type="password" 
              placeholder="AIzaSy..." 
              value={geminiKey} 
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">OPENAI API KEY (GPT-4O)</label>
            <input 
              type="password" 
              placeholder="sk-..." 
              value={openaiKey} 
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <button type="submit" className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-sans rounded-xl shadow-neon-cyan flex items-center gap-2">
            <Save className="w-4 h-4" /> SAVE CONFIGURATIONS
          </button>
        </form>
      </div>

      {/* Users & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-base font-bold text-slate-200 font-sans mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Platform Users
          </h3>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-200">{u.username} ({u.email})</div>
                  <div className="text-[10px] text-slate-500">{u.organization}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold border border-cyan-800">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-base font-bold text-slate-200 font-sans mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Audit Log Feed
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map((l) => (
              <div key={l.id} className="p-2.5 rounded bg-slate-900/40 border border-slate-800 text-[11px]">
                <span className="text-cyan-400 font-bold">[{l.action}]</span> {l.details}
                <div className="text-[10px] text-slate-500 mt-0.5">{l.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
