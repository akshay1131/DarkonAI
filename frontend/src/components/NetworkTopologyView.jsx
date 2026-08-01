import React, { useEffect, useRef } from 'react';
import { Server, ShieldAlert, Cpu, Activity, Radio } from 'lucide-react';

const TOPOLOGY_NODES = [
  { id: 'SLDC', name: 'State Load Dispatch Centre (SLDC)', type: 'SLDC', x: 250, y: 50, color: '#00F0FF' },
  { id: 'RCC_S', name: 'Southern RCC (Trivandrum)', type: 'RCC', x: 120, y: 150, color: '#3B82F6' },
  { id: 'RCC_C', name: 'Central RCC (Ernakulam)', type: 'RCC', x: 250, y: 150, color: '#EF4444' }, // Compromised
  { id: 'RCC_N', name: 'Northern RCC (Kozhikode)', type: 'RCC', x: 380, y: 150, color: '#3B82F6' },
  { id: 'SUB_EKM', name: 'Kalamassery 220kV Substation', type: 'SUBSTATION', x: 180, y: 260, color: '#EF4444' },
  { id: 'SUB_IDK', name: 'Idukki Hydro Generation', type: 'SUBSTATION', x: 320, y: 260, color: '#F59E0B' },
  { id: 'PLC_01', name: 'Breaker Coil Control PLC', type: 'PLC', x: 140, y: 360, color: '#EF4444' },
  { id: 'RTU_02', name: 'DNP3 Telemetry RTU', type: 'RTU', x: 220, y: 360, color: '#10B981' },
  { id: 'IED_03', name: 'Relion 670 Protection Relay', type: 'IED', x: 320, y: 360, color: '#10B981' }
];

const LINKS = [
  ['SLDC', 'RCC_S'], ['SLDC', 'RCC_C'], ['SLDC', 'RCC_N'],
  ['RCC_C', 'SUB_EKM'], ['RCC_C', 'SUB_IDK'],
  ['SUB_EKM', 'PLC_01'], ['SUB_EKM', 'RTU_02'], ['SUB_IDK', 'IED_03']
];

const NetworkTopologyView = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Links & Moving Packets
      LINKS.forEach(([fromId, toId]) => {
        const n1 = TOPOLOGY_NODES.find((n) => n.id === fromId);
        const n2 = TOPOLOGY_NODES.find((n) => n.id === toId);

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = n1.color === '#EF4444' || n2.color === '#EF4444' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Packet Trail
        const progress = (offset % 100) / 100;
        const px = n1.x + (n2.x - n1.x) * progress;
        const py = n1.y + (n2.y - n1.y) * progress;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = n1.color === '#EF4444' ? '#EF4444' : '#00F0FF';
        ctx.fill();
      });

      // Draw Nodes
      TOPOLOGY_NODES.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}25`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(node.id, node.x - 15, node.y + 28);
      });

      offset += 1;
      frame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="glass-card p-4 rounded-2xl border-slate-800">
      <div className="flex justify-between items-center mb-3 font-mono text-xs">
        <span className="font-bold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" /> LIVE SCADA NETWORK TOPOLOGY & PACKET TRAILS
        </span>
        <span className="text-emerald-400">PACKET FLOW: ACTIVE</span>
      </div>

      <div className="relative flex justify-center bg-[#05070A] rounded-xl border border-slate-800 p-2">
        <canvas ref={canvasRef} width={500} height={420} className="w-full max-w-[500px]" />
      </div>
    </div>
  );
};

export default NetworkTopologyView;
