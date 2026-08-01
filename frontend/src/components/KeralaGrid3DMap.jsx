import React, { useEffect, useRef, useState } from 'react';
import { Zap, MapPin, Radio, Activity, ShieldAlert, RefreshCw } from 'lucide-react';

const INITIAL_DISTRICTS_POS = [
  { name: 'Kasaragod', code: 'KSG', x: 120, y: 50, status: 'HEALTHY', voltage: 220.1 },
  { name: 'Kannur', code: 'KNR', x: 150, y: 100, status: 'HEALTHY', voltage: 219.8 },
  { name: 'Wayanad', code: 'WYD', x: 220, y: 120, status: 'HEALTHY', voltage: 110.2 },
  { name: 'Kozhikode', code: 'KKD', x: 180, y: 160, status: 'HEALTHY', voltage: 220.4 },
  { name: 'Malappuram', code: 'MLP', x: 210, y: 210, status: 'WARNING', voltage: 218.4 },
  { name: 'Palakkad', code: 'PKD', x: 280, y: 240, status: 'HEALTHY', voltage: 221.0 },
  { name: 'Thrissur', code: 'TCR', x: 240, y: 290, status: 'HEALTHY', voltage: 400.1 },
  { name: 'Ernakulam', code: 'EKM', x: 260, y: 350, status: 'CRITICAL', voltage: 216.5 },
  { name: 'Idukki', code: 'IDK', x: 340, y: 360, status: 'WARNING', voltage: 400.5 },
  { name: 'Kottayam', code: 'KTM', x: 290, y: 410, status: 'HEALTHY', voltage: 220.2 },
  { name: 'Alappuzha', code: 'ALP', x: 270, y: 450, status: 'HEALTHY', voltage: 220.0 },
  { name: 'Pathanamthitta', code: 'PTA', x: 330, y: 460, status: 'HEALTHY', voltage: 220.3 },
  { name: 'Kollam', code: 'KLM', x: 310, y: 510, status: 'HEALTHY', voltage: 220.1 },
  { name: 'Thiruvananthapuram', code: 'TVM', x: 330, y: 560, status: 'HEALTHY', voltage: 220.0 }
];

const TRANSMISSION_LINES = [
  [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [4, 6],
  [6, 7], [6, 8], [7, 8], [7, 9], [7, 10], [8, 9],
  [9, 10], [9, 11], [10, 12], [11, 12], [12, 13]
];

const KeralaGrid3DMap = ({ districtSummary = [], onSelectDistrict }) => {
  const canvasRef = useRef(null);
  const [districts, setDistricts] = useState(INITIAL_DISTRICTS_POS);
  const [selected, setSelected] = useState(INITIAL_DISTRICTS_POS[7]);

  // Synchronize dynamic statuses from live backend telemetry summary
  useEffect(() => {
    if (districtSummary && districtSummary.length > 0) {
      setDistricts((prev) =>
        prev.map((d) => {
          const match = districtSummary.find((s) => s.code === d.code || s.district === d.name);
          return match ? { ...d, status: match.status } : d;
        })
      );
    }
  }, [districtSummary]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let particleOffset = 0;
    let radarAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Cyber Grid Background Mesh
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Radar Sweep Line
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radarRadius = Math.max(canvas.width, canvas.height);
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radarRadius, radarAngle, radarAngle + 0.25);
      ctx.closePath();
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radarRadius);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Transmission Power Lines & Particle Flow
      TRANSMISSION_LINES.forEach(([fromIdx, toIdx]) => {
        const p1 = districts[fromIdx];
        const p2 = districts[toIdx];
        if (!p1 || !p2) return;
        
        const isLineCritical = p1.status === 'CRITICAL' || p2.status === 'CRITICAL';
        const isLineWarning = p1.status === 'WARNING' || p2.status === 'WARNING';
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = isLineCritical 
          ? 'rgba(239, 68, 68, 0.7)' 
          : isLineWarning ? 'rgba(245, 158, 11, 0.5)' : 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = isLineCritical ? 2.5 : 1.5;
        ctx.stroke();

        // Electricity Pulse Particles
        const progress = (particleOffset % 100) / 100;
        const px = p1.x + (p2.x - p1.x) * progress;
        const py = p1.y + (p2.y - p1.y) * progress;
        
        ctx.beginPath();
        ctx.arc(px, py, isLineCritical ? 4 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isLineCritical ? '#EF4444' : isLineWarning ? '#F59E0B' : '#00F0FF';
        ctx.shadowColor = isLineCritical ? '#EF4444' : '#00F0FF';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // District Substation Nodes
      districts.forEach((node) => {
        const isSelected = selected?.code === node.code;
        const isCritical = node.status === 'CRITICAL';
        const isWarning = node.status === 'WARNING';
        
        // Node Pulsing Ring for Critical Nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 18 : isCritical ? 14 : 10, 0, Math.PI * 2);
        ctx.fillStyle = isCritical ? 'rgba(239, 68, 68, 0.3)' : isWarning ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 240, 255, 0.15)';
        ctx.fill();

        // Core Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';
        ctx.shadowColor = isCritical ? '#EF4444' : '#10B981';
        ctx.shadowBlur = isCritical ? 14 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = isCritical ? '#EF4444' : isSelected ? '#00F0FF' : '#94A3B8';
        ctx.font = isCritical ? 'bold 11px JetBrains Mono, monospace' : '10px JetBrains Mono, monospace';
        ctx.fillText(`${node.code}${isCritical ? ' (CRITICAL)' : ''}`, node.x + 12, node.y + 4);
      });

      particleOffset += 1.0;
      radarAngle += 0.015;
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [districts, selected]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clickedNode = districts.find(
      (node) => Math.hypot(node.x - clickX, node.y - clickY) < 22
    );

    if (clickedNode) {
      setSelected(clickedNode);
      if (onSelectDistrict) onSelectDistrict(clickedNode.name);
    }
  };

  return (
    <div className="relative glass-card rounded-2xl p-5 overflow-hidden border-cyan-500/30">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-bold">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> KERALA SMART GRID DIGITAL TWIN (DYNAMIC THREAT MAP)
        </div>
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" /> CONTINUOUS 2-5S TELEMETRY SCAN
        </span>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
        <canvas
          ref={canvasRef}
          width={500}
          height={620}
          onClick={handleCanvasClick}
          className="cursor-pointer bg-[#05070A] rounded-xl border border-slate-800 w-full md:w-[500px] shadow-2xl"
        />

        {/* Selected District Telemetry Details */}
        <div className="flex-1 space-y-4 font-mono text-xs w-full">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" /> {selected.name} District Substation
              </span>
              <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                selected.status === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' :
                selected.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {selected.status}
              </span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between"><span>District Code:</span> <strong className="text-cyan-400">{selected.code}</strong></div>
              <div className="flex justify-between"><span>Busbar Voltage:</span> <strong className="text-slate-100">{selected.voltage} kV</strong></div>
              <div className="flex justify-between"><span>Monitored Assets:</span> <strong className="text-slate-100">18 Substation Devices</strong></div>
              <div className="flex justify-between"><span>Active Protocols:</span> <strong className="text-slate-100">Modbus, IEC-104, DNP3</strong></div>
              <div className="flex justify-between"><span>Substation Risk Score:</span> <strong className={selected.status === 'CRITICAL' ? 'text-red-400 font-extrabold' : 'text-emerald-400'}>{selected.status === 'CRITICAL' ? '92.4 / 100' : '12.8 / 100'}</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-cyan-400 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> CONTINUOUS SCADA THREAT SCANNER
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Threat status dynamically shifts across Kerala districts based on live telemetry anomalies and simulated SCADA cyber attacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeralaGrid3DMap;
