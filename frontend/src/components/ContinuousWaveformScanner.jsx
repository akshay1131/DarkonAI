import React, { useEffect, useRef, useState } from 'react';
import { Radio, Activity, ShieldAlert, AlertTriangle, Zap, Crosshair } from 'lucide-react';

const ContinuousWaveformScanner = ({ activeIncident }) => {
  const canvasRef = useRef(null);
  const [hoveredThreat, setHoveredThreat] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // List of active threat peaks matching the drawing
  const [threatPeaks, setThreatPeaks] = useState([
    {
      id: 'PEAK-01',
      threatType: 'Unauthorized Modbus/TCP Write Attempt',
      target: 'Kalamassery Substation PLC 01 (10.10.1.45)',
      protocol: 'Modbus/TCP (Port 502)',
      mitre: 'T0855',
      cve: 'CVE-2022-3166',
      riskScore: 94.5,
      recommendation: 'Block source IP on Industrial Firewall & Isolate PLC coil logic.',
      peakRatio: 0.35 // Position along wave
    },
    {
      id: 'PEAK-02',
      threatType: 'Ransomware Binary Beaconing',
      target: 'Engineering Workstation 03 (10.10.3.88)',
      protocol: 'HTTPS (Port 443)',
      mitre: 'T1486',
      cve: 'CVE-2021-44228',
      riskScore: 96.8,
      recommendation: 'Isolate EWS endpoint from SCADA network segment.',
      peakRatio: 0.72
    }
  ]);

  // Synchronize dynamic active incident
  useEffect(() => {
    if (activeIncident && activeIncident.threat_type) {
      setThreatPeaks((prev) => [
        {
          id: 'PEAK-LIVE',
          threatType: activeIncident.threat_type,
          target: `${activeIncident.target_asset_name || 'Substation Node'} (${activeIncident.target_ip || '10.10.1.5'})`,
          protocol: activeIncident.protocol || 'Modbus TCP',
          mitre: activeIncident.mitre_id || 'T0855',
          cve: activeIncident.cve || 'CVE-2023-28341',
          riskScore: activeIncident.risk_score || 94.5,
          recommendation: 'Enforce MFA & IP Whitelisting for Port 502 / 104.',
          peakRatio: 0.35
        },
        prev[1] || prev[0]
      ]);
    }
  }, [activeIncident]);

  // HTML5 Canvas Oscilloscope Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let timeOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw Oscilloscope Grid Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Baseline
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Continuous Oscillating Waveform ("keeps scanning")
      ctx.beginPath();
      ctx.lineWidth = 2.5;

      const activePeaksList = [];

      for (let x = 0; x < width; x++) {
        const normX = x / width;
        
        // Base sine wave representing continuous scanning
        let amplitude = Math.sin(normX * 18 + timeOffset) * 22;
        amplitude += Math.sin(normX * 36 - timeOffset * 1.5) * 8;

        // High Sharp Threat Spikes/Peaks matching user sketch
        // Peak 1 around 35% width, Peak 2 around 72% width
        const spike1 = Math.exp(-Math.pow((normX - 0.35) * 18, 2)) * 110;
        const spike2 = Math.exp(-Math.pow((normX - 0.72) * 18, 2)) * 95;

        const totalAmplitude = amplitude - (spike1 + spike2);
        const y = centerY + totalAmplitude;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Detect Peak Tips for Threat Markers
        if (Math.abs(normX - 0.35) < 0.005 && spike1 > 80) {
          activePeaksList.push({ x, y, threat: threatPeaks[0] });
        }
        if (Math.abs(normX - 0.72) < 0.005 && spike2 > 70) {
          activePeaksList.push({ x, y, threat: threatPeaks[1] || threatPeaks[0] });
        }
      }

      // Waveform Gradient Stroke
      const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
      waveGrad.addColorStop(0, '#00F0FF');
      waveGrad.addColorStop(0.35, '#EF4444');
      waveGrad.addColorStop(0.55, '#00F0FF');
      waveGrad.addColorStop(0.72, '#EF4444');
      waveGrad.addColorStop(1, '#00F0FF');
      ctx.strokeStyle = waveGrad;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Glowing Shaded Red Peaks & "Threat Detected" Markers matching sketch
      activePeaksList.forEach(({ x, y, threat }) => {
        if (!threat) return;

        // Shaded Peak Cap (Matching pen drawing shaded tip)
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // "THREAT DETECTED" Pointer Arrow & Text Label
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText('↓ THREAT DETECTED', x - 45, y - 16);
      });

      timeOffset += 0.04;
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [threatPeaks]);

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const normX = mouseX / canvasRef.current.width;

    // Check if mouse is near Peak 1 (0.35) or Peak 2 (0.72)
    if (Math.abs(normX - 0.35) < 0.15) {
      setHoveredThreat(threatPeaks[0] || null);
      setTooltipPos({ x: e.clientX, y: e.clientY - 160 });
    } else if (Math.abs(normX - 0.72) < 0.15) {
      setHoveredThreat(threatPeaks[1] || threatPeaks[0] || null);
      setTooltipPos({ x: e.clientX, y: e.clientY - 160 });
    } else {
      setHoveredThreat(null);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border-cyan-500/30 space-y-4 relative font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          CONTINUOUS WAVEFORM SCANNER — SCADA THREAT DETECTOR
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-cyan-400 font-bold tracking-widest flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-spin" /> KEEPS SCANNING (LIVE FREQUENCY WAVE)
          </span>
          <span className="text-red-400 font-bold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> 2 THREAT PEAKS DETECTED
          </span>
        </div>
      </div>

      {/* Oscilloscope Canvas Waveform matching Drawing */}
      <div className="relative bg-[#04060A] rounded-xl border border-slate-800 p-2 overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={260}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredThreat(null)}
          className="w-full h-[260px] cursor-pointer"
        />

        <div className="absolute bottom-3 left-4 text-[10px] text-cyan-400 font-mono flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
          <Zap className="w-3 h-3 text-amber-400" /> Continuous Signal Baseline ("keeps scanning")
        </div>
      </div>

      {/* Interactive Threat Cards matching Drawing Peaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {threatPeaks.map((peak, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredThreat(peak)}
            onMouseLeave={() => setHoveredThreat(null)}
            className="p-4 rounded-xl bg-red-950/80 border border-red-500/60 shadow-neon-red hover:bg-red-900/90 transition-all cursor-pointer space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> THREAT DETECTED (PEAK #{idx + 1})
                </span>
                <div className="font-bold text-slate-100 text-xs mt-0.5">{peak.threatType}</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-900 text-red-100 text-[10px] font-bold border border-red-700">
                RISK {peak.riskScore}/100
              </span>
            </div>

            <div className="text-[11px] text-slate-300 space-y-1">
              <div>Target: <strong className="text-cyan-400">{peak.target}</strong></div>
              <div>Protocol: <strong className="text-slate-200">{peak.protocol}</strong></div>
              <div>MITRE Technique: <strong className="text-amber-400">{peak.mitre}</strong> | CVE: <strong className="text-red-400">{peak.cve}</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Hover Tooltip on Peak Hover */}
      {hoveredThreat && (
        <div
          style={{ top: `${tooltipPos.y}px`, left: `${tooltipPos.x}px` }}
          className="fixed z-50 w-80 p-4 rounded-2xl bg-slate-950/95 border border-red-500/80 shadow-2xl backdrop-blur-xl text-slate-100 space-y-2 pointer-events-none font-mono text-xs shadow-neon-red"
        >
          <div className="flex justify-between items-center border-b border-red-900/60 pb-2">
            <span className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400" /> THREAT DETECTED (WAVE PEAK)
            </span>
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold border border-red-800">
              MITRE {hoveredThreat.mitre}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-400">Threat Name:</span>
              <div className="font-bold text-slate-100 text-xs mt-0.5">{hoveredThreat.threatType}</div>
            </div>
            <div>
              <span className="text-slate-400">Target Endpoint:</span>
              <div className="text-cyan-400 font-bold">{hoveredThreat.target}</div>
            </div>
            <div className="flex justify-between">
              <span>CVE: <strong className="text-red-400">{hoveredThreat.cve}</strong></span>
              <span>Risk Score: <strong className="text-red-400">{hoveredThreat.riskScore}/100</strong></span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px]">
              <span className="text-cyan-400 font-bold">AI Mitigation Action:</span>
              <div className="text-slate-300 mt-0.5 font-sans leading-relaxed">{hoveredThreat.recommendation}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContinuousWaveformScanner;
