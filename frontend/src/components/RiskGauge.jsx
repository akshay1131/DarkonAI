import React from 'react';

const RiskGauge = ({ score = 0, level = 'Low' }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MEDIUM': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const color = getColor(level);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-44 h-44 transform -rotate-90">
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke="#1E293B"
          strokeWidth="12"
          fill="transparent"
        />
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">{score}</span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest font-mono">RISK SCORE</span>
        <span 
          className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider"
          style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
        >
          {level}
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;
