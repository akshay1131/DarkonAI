import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Radio, Activity, Crosshair, AlertTriangle, CheckCircle2, Zap, Server } from 'lucide-react';

const ContinuousCyberRadar = ({ activeIncident, telemetry }) => {
  const canvasRef = useRef(null);
  const [hoveredThreat, setHoveredThreat] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Simulated list of continuous scan target channels / nodes
  const [scannedChannels, setScannedChannels] = useState([
    { id: 'CH-01', target: 'Substation PLC 01 (10.10.1.45)', service: 'Modbus TCP (Port 502)', status: 'CRITICAL', threatType: 'Unauthorized Modbus/TCP Write Attempt', mitre: 'T0855', cve: 'CVE-2022-3166', riskScore: 94.5, recommendation: 'Block source IP & Isolate PLC coil logic.' },
    { id: 'CH-02', target: 'Telemetry Gateway (10.10.1.104)', service: 'IEC 60870-5-104 (Port 104)', status: 'HIGH', threatType: 'IEC-104 Telemetry APDU Flood', mitre: 'T0814', cve: 'CVE-2023-28341', riskScore: 82.0, recommendation: 'Apply firewall rate-limiting rules on Port 104.' },
    { id: 'CH-03', target: 'SCADA Historian Server (10.10.2.10)', service: 'OPC-UA (Port 4840)', status: 'HEALTHY', threatType: 'Normal Telemetry Logging', mitre: 'N/A', cve: 'N/A', riskScore: 8.2, recommendation: 'Continuous monitoring optimal.' },
    { id: 'CH-04', target: 'Engineering Workstation (10.10.3.88)', service: 'SSH / RDP (Port 22/3389)', status: 'CRITICAL', threatType: 'Ransomware Binary Beaconing', mitre: 'T1486', cve: 'CVE-2021-44228', riskScore: 96.8, recommendation: 'Isolate EWS endpoint from core SCADA network.' },
    { id: 'CH-05', target: 'Smart Meter Gateway (10.10.4.12)', service: 'MQTT / DLMS (Port 1883)', status: 'HEALTHY', threatType: 'Normal Power Grid Telemetry', mitre: 'N/A', cve: 'N/A', riskScore: 11.4, recommendation: 'System health normal.' },
    { id: 'CH-06', target: 'Industrial Security Firewall (10.10.0.1)', service: 'HTTPS Mgmt (Port 443)', status: 'WARNING', threatType: 'Substation Network Port Scan', mitre: 'T1046', cve: 'N/A', riskScore: 64.0, recommendation: 'Inspect TCP SYN scan source IPs.' }
  ]);

  // Update active incident when passed from props
  useEffect(() => {
    if (activeIncident && activeIncident.threat_type) {
      setScannedChannels((prev) => [
        {
          id: 'CH-LIVE',
          target: `${activeIncident.target_asset_name || 'Substation Node'} (${activeIncident.target_ip || '10.10.1.5'})`,
          service: activeIncident.protocol || 'Modbus TCP',
          status: 'CRITICAL',
          threatType: activeIncident.threat_type,
          mitre: activeIncident.mitre_id || 'T0855',
          cve: activeIncident.cve || 'CVE-2023-28341',
          riskScore: activeIncident.risk_score || 94.5,
          recommendation: 'Block source IP & Isolate PLC logic interface immediately.'
        },
        ...prev.slice(0, 5)
      ]);
    }
  }, [activeIncident]);

  // 360 Degree Continuous Radar Canvas Sweep Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 15;

      // Concentric Radar Rings
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1.0].forEach((rScale) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * rScale, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Radar Crosshair Lines
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.stroke();

      // Rotating Radar Sweep Line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + 0.35);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      // Draw Blinking Threat Dots on Radar
      scannedChannels.forEach((ch, idx) => {
        const dotAngle = (idx * (Math.PI * 2 / scannedChannels.length)) + (angle * 0.1);
        const dist = (radius * 0.35) + ((idx % 3) * 35);
        const dx = centerX + dist * Math.cos(dotAngle);
        const dy = centerY + dist * Math.sin(dotAngle);

        ctx.beginPath();
        ctx.arc(dx, dy, ch.status === 'CRITICAL' ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = ch.status === 'CRITICAL' ? '#EF4444' : ch.status === 'WARNING' ? '#F59E0B' : '#10B981';
        ctx.shadowColor = ch.status === 'CRITICAL' ? '#EF4444' : '#10B981';
        ctx.shadowBlur = ch.status === 'CRITICAL' ? 12 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      angle += 0.025;
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [scannedChannels]);

  const handleMouseEnter = (ch, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredThreat(ch);
    setTooltipPos({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 180
    });
  };

  const handleMouseLeave = () => {
    setHoveredThreat(null);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border-cyan-500/30 space-y-6 relative font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" /> CONTINUOUS CYBER THREAT RADAR & SPECTRUM SCANNER
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span> Critical Threat</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Healthy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Radar Sweeper Canvas */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#05070A] rounded-xl border border-slate-800 shadow-2xl relative">
          <canvas ref={canvasRef} width={280} height={280} className="w-full max-w-[280px]" />
          <div className="mt-3 text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 animate-spin" /> SCANNING ACTIVE NETWORK CHANNELS
          </div>
        </div>

        {/* Dynamic Interactive Threat Bars */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-slate-400 font-bold mb-2 flex justify-between items-center">
            <span>LIVE SCANNED NETWORK CHANNELS & THREAT BARS</span>
            <span className="text-[10px] text-slate-500">HOVER RED BAR TO INSPECT THREAT TYPE</span>
          </div>

          <div className="space-y-2.5">
            {scannedChannels.map((ch, idx) => {
              const isCritical = ch.status === 'CRITICAL';
              const isWarning = ch.status === 'WARNING';

              return (
                <div
                  key={idx}
                  onMouseEnter={(e) => handleMouseEnter(ch, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`relative p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isCritical
                      ? 'bg-red-950/80 border-red-500/80 shadow-neon-red hover:bg-red-900/90'
                      : isWarning
                      ? 'bg-amber-950/60 border-amber-500/60 hover:bg-amber-900/80'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        isCritical ? 'bg-red-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <div>
                        <div className="font-bold text-slate-100 text-xs font-mono">{ch.target}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ch.service}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      {isCritical && (
                        <span className="text-red-400 font-bold tracking-wider flex items-center gap-1 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                          <AlertTriangle className="w-3.5 h-3.5" /> THREAT DETECTED
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded font-bold ${
                        isCritical ? 'bg-red-900 text-red-100 border border-red-700' :
                        isWarning ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        RISK {ch.riskScore} / 100
                      </span>
                    </div>
                  </div>

                  {/* Progress / Severity Bar Visualizer */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isCritical ? 'bg-gradient-to-r from-red-600 to-red-400 w-full' :
                        isWarning ? 'bg-gradient-to-r from-amber-600 to-amber-400 w-[65%]' :
                        'bg-gradient-to-r from-emerald-600 to-emerald-400 w-[12%]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rich Interactive Hover Tooltip for Red Threat Bar */}
      {hoveredThreat && (
        <div
          style={{ top: `${tooltipPos.y}px`, left: `${tooltipPos.x}px` }}
          className="fixed z-50 w-80 p-4 rounded-2xl bg-slate-950/95 border border-red-500/60 shadow-2xl backdrop-blur-xl text-slate-100 space-y-2 pointer-events-none font-mono text-xs shadow-neon-red"
        >
          <div className="flex justify-between items-center border-b border-red-900/60 pb-2">
            <span className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400" /> {hoveredThreat.status} THREAT DETECTED
            </span>
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold border border-red-800">
              MITRE {hoveredThreat.mitre}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-400">Threat Classification:</span>
              <div className="font-bold text-slate-100 text-xs mt-0.5">{hoveredThreat.threatType}</div>
            </div>
            <div>
              <span className="text-slate-400">Target Endpoint:</span>
              <div className="text-cyan-400 font-bold">{hoveredThreat.target}</div>
            </div>
            <div className="flex justify-between">
              <span>Matched CVE: <strong className="text-red-400">{hoveredThreat.cve}</strong></span>
              <span>Risk Score: <strong className="text-red-400">{hoveredThreat.riskScore}/100</strong></span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px]">
              <span className="text-cyan-400 font-bold">AI Mitigation Guidance:</span>
              <div className="text-slate-300 mt-0.5 font-sans leading-relaxed">{hoveredThreat.recommendation}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContinuousCyberRadar;
