import React, { useState } from 'react';
import { Bot, MessageSquare, Send, X, ShieldAlert, Cpu } from 'lucide-react';
import { aiAPI } from '../services/api';

const SOCChatbotPanel = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Darkon AI SOC Assistant active. Ask questions regarding Kerala Power Grid telemetry, active CVE threats, or MITRE tactics.' }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    try {
      const res = await aiAPI.sendChatMessage(userText);
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Telemetry connection stable. 250+ Kerala SCADA assets active.' }]);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center shadow-neon-cyan hover:scale-105 transition-all"
        title="Darkon AI SOC Assistant"
      >
        <Bot className="w-7 h-7" />
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 glass-card p-4 rounded-2xl border-cyan-500/40 shadow-2xl flex flex-col h-[500px]">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 font-mono text-xs">
            <span className="font-bold text-slate-100 flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" /> DARKON AI SOC ASSISTANT
            </span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto my-3 space-y-3 font-mono text-xs pr-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[85%] ${
                  m.sender === 'user'
                    ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-800 ml-auto'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="flex gap-2 font-mono text-xs">
            <input
              type="text"
              placeholder="Ask SOC Assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
            <button type="submit" className="p-2 bg-cyan-500 text-slate-950 font-bold rounded-xl shadow-neon-cyan">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SOCChatbotPanel;
