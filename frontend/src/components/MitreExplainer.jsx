import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Crosshair, 
  Layers, 
  Zap, 
  Wheat, 
  Building2, 
  GraduationCap,
  Sparkles
} from 'lucide-react';

const SECTOR_ICONS = {
  'Power Grid': Zap,
  'Agriculture': Wheat,
  'Hospital': Building2,
  'Education': GraduationCap
};

// Fallback comprehensive knowledge base if API is loading or offline
const LOCAL_MITRE_DB = {
  "T0859": {
    id: "T0859",
    name: "Valid Accounts",
    tactics: ["Persistence", "Lateral Movement", "Initial Access"],
    definition: "An attacker uses legitimate or compromised credentials to gain unauthorized access to systems, bypassing normal authentication checks without creating brute-force alarms.",
    common_example: "An attacker obtains a valid administrator account for a SCADA engineering workstation or student database and logs in through legitimate channels.",
    detection_flow: [
      "Suspicious authenticated access from off-hours or abnormal IP",
      "Credential anomaly (concurrent logins or sudden privilege escalation)",
      "Unauthorized resource access to critical controllers or student vaults"
    ],
    affected_sectors: ["Power Grid", "Agriculture", "Hospital", "Education"],
    why_risky: "Because the attacker possesses legitimate credentials, security firewalls and intrusion prevention systems treat their commands as authorized operations, making detection very challenging.",
    recommended_action: "Mandate Multi-Factor Authentication (MFA), restrict remote logins to dedicated jump hosts with session recording, and establish user behavior anomaly detection."
  },
  "T0846": {
    id: "T0846",
    name: "Remote System Discovery",
    tactics: ["Discovery"],
    definition: "An attacker systematically scans the network to find other computers, PLCs, servers, and controllers to map out the entire environment before launching an attack.",
    common_example: "An attacker runs ARP and ICMP ping sweeps across 10.EKM.1.0/24 to identify which IP addresses belong to substation relays versus SCADA servers.",
    detection_flow: [
      "Rapid sequential ping/ARP queries from a single internal endpoint",
      "Internal port scanning activity traversing segmented subnets",
      "Asset discovery signatures flagged by network intrusion sensors"
    ],
    affected_sectors: ["Power Grid", "Agriculture", "Hospital", "Education"],
    why_risky: "Discovery is the key reconnaissance phase. Once an attacker maps out which systems control electricity or store patient data, they can launch targeted sabotage.",
    recommended_action: "Enforce micro-segmentation with zero-trust firewalls, disable unnecessary broadcast protocols, and alert on internal port probing."
  },
  "T0886": {
    id: "T0886",
    name: "Remote Services",
    tactics: ["Lateral Movement"],
    definition: "Adversaries leverage built-in administrative communication tools (like SSH, RDP, or VNC) to log in and control other machines across the facility.",
    common_example: "After gaining access to a hospital front-desk PC, an attacker uses RDP to log into the radiology PACS imaging server using captured admin tokens.",
    detection_flow: [
      "Unusual internal RDP/SSH sessions between non-IT subnets",
      "Remote logon sessions initiating outside standard operating hours",
      "Execution of remote administrative process execution utilities"
    ],
    affected_sectors: ["Power Grid", "Hospital", "Education"],
    why_risky: "Using built-in admin tools ('living off the land') means the attacker does not need to drop custom malware, helping them evade basic anti-virus scanners.",
    recommended_action: "Disable RDP and SSH on systems where not required; restrict remote administrative access to dedicated management jump-boxes with MFA."
  },
  "T0822": {
    id: "T0822",
    name: "External Remote Services",
    tactics: ["Initial Access", "Persistence"],
    definition: "Adversaries connect to external-facing remote access gateways (such as VPNs, Citrix portals, or web management interfaces) to establish initial footholds.",
    common_example: "An attacker connects to an unpatched corporate SSL-VPN gateway or exposed IoT farm portal using stolen employee credentials.",
    detection_flow: [
      "Logins originating from untrusted foreign IP addresses or VPNs",
      "Spike in failed login attempts followed by successful session creation",
      "Simultaneous active sessions under the same account from distinct locations"
    ],
    affected_sectors: ["Power Grid", "Agriculture", "Hospital", "Education"],
    why_risky: "Directly bridges external internet traffic into internal control networks, bypassing physical perimeter guards and security gates.",
    recommended_action: "Enforce phishing-resistant MFA on all external gateways, maintain strict patch cycles on VPN concentrators, and block untrusted IP ranges."
  },
  "T0813": {
    id: "T0813",
    name: "Denial of Control",
    tactics: ["Impair Process Control"],
    definition: "Adversaries disable or disrupt the human operator's ability to monitor, command, or safely shut down physical machinery, leaving systems operating blindly.",
    common_example: "Flooding a substation RTU communication line so engineers at the SLDC cannot open a circuit breaker during an active electrical overload.",
    detection_flow: [
      "Sudden loss of SCADA telemetry / communication timeout alerts",
      "Protocol buffer saturation or malformed packet bursts",
      "Unresponsive actuator or valve control loops"
    ],
    affected_sectors: ["Power Grid", "Agriculture"],
    why_risky: "Physical electrical equipment and high-pressure water pumps can explode, burn out, or flood communities if operators cannot intervene to halt operations.",
    recommended_action: "Install hardwired physical out-of-band kill switches, rate-limit control protocol links, and isolate control loops via unidirectional data diodes."
  },
  "T0809": {
    id: "T0809",
    name: "Data Destruction",
    tactics: ["Impact"],
    definition: "Adversaries permanently erase or wipe critical files, database records, PLC logic programs, or backups to cause lasting operational damage.",
    common_example: "A wiper script executed on university database servers that overwrites student records and drops grade database tables.",
    detection_flow: [
      "Mass file deletion or zero-filling commands executed via elevated shell",
      "Unusual disk I/O spikes associated with low-level storage drivers",
      "Sudden database service crashes with missing primary data files"
    ],
    affected_sectors: ["Hospital", "Education", "Power Grid"],
    why_risky: "Permanent loss of medical records, university credentials, or power grid configurations can paralyze critical institutions for weeks or months.",
    recommended_action: "Maintain immutable, air-gapped offsite backups; enforce strict least-privilege permissions on raw storage devices; and deploy write-protection."
  },
  "T0858": {
    id: "T0858",
    name: "Change Operating Mode",
    tactics: ["Execution", "Impair Process Control"],
    definition: "Adversaries change the operational state of a controller (such as switching a PLC from RUN to STOP or PROGRAM mode), disabling safety monitoring.",
    common_example: "Sending a command to switch a 220kV substation PLC from 'Remote Run' to 'Halt/Stop', causing automatic trip protections to turn off.",
    detection_flow: [
      "Controller state transition command logged on control network",
      "Controller mode switch telemetry mismatch with SCADA master",
      "Engineering workstation unauthorized command sequence"
    ],
    affected_sectors: ["Power Grid", "Agriculture"],
    why_risky: "Disabling automated safety protections leaves high-voltage physical equipment vulnerable to catastrophic damage during sudden electrical surges.",
    recommended_action: "Use physical key switches on PLCs locked in RUN mode to prevent software-initiated mode changes; verify message integrity."
  },
  "T0855": {
    id: "T0855",
    name: "Unauthorized Command Message",
    tactics: ["Impair Process Control"],
    definition: "Adversaries inject unauthorized, malformed, or out-of-sequence industrial protocol messages to actuate field equipment without operator consent.",
    common_example: "Injecting Modbus/TCP coil-force commands to open high-voltage substation circuit breakers or override automated farm irrigation valves.",
    detection_flow: [
      "Industrial protocol DPI alert: Modbus write command from unauthorized IP",
      "Telemetry anomaly: sudden actuator state change without operator trigger",
      "Sequence number mismatch in telemetry packets"
    ],
    affected_sectors: ["Power Grid", "Agriculture"],
    why_risky: "Directly causes physical changes in the real world: opening power lines, overloading transformers, or rupturing agricultural irrigation pipelines.",
    recommended_action: "Enforce IP/MAC whitelisting for protocol masters, deploy deep packet inspection firewalls, and enforce read-only commands for untrusted networks."
  },
  "T1486": {
    id: "T1486",
    name: "Data Encrypted for Impact",
    tactics: ["Impact"],
    definition: "Adversaries encrypt data and file systems using encryption algorithms, demanding ransom to restore operations (Ransomware).",
    common_example: "Ransomware deploying encryption across PACS hospital imaging archives and ICU workstation file systems, locking clinical staff out.",
    detection_flow: [
      "High frequency of file renaming and extension changes (.locked, .encrypted)",
      "Outbound beaconing to known ransomware C2 servers",
      "Ransom note text files dropped in multiple system directories"
    ],
    affected_sectors: ["Hospital", "Education", "Power Grid"],
    why_risky: "In hospitals, locked files prevent doctors from viewing CT/MRI scans and patient histories, directly endangering human lives.",
    recommended_action: "Deploy behavioral EDR with automated process containment, isolate critical storage on immutable backups, and train staff against phishing."
  },
  "T1190": {
    id: "T1190",
    name: "Exploit Public-Facing Application",
    tactics: ["Initial Access"],
    definition: "Adversaries exploit software vulnerabilities (like SQL injection or Log4Shell) in internet-facing web portals or APIs to gain unauthorized access.",
    common_example: "Exploiting SQL injection in a university course registration portal or hospital doctor portal to bypass authentication.",
    detection_flow: [
      "WAF rule trigger: SQL injection or RCE payload detected in HTTP request",
      "High rate of error 500 status codes from web application",
      "Spawning of interactive shell processes from web server daemon"
    ],
    affected_sectors: ["Education", "Hospital", "Power Grid"],
    why_risky: "Allows remote unauthenticated attackers on the internet to gain immediate administrative control over internal application databases.",
    recommended_action: "Apply immediate security patches, deploy a Web Application Firewall (WAF), and mandate parameterized database queries."
  }
};

const MitreExplainer = ({ selectedTechniqueId = 'T0859' }) => {
  const [activeId, setActiveId] = useState(selectedTechniqueId);

  // Sync if prop changes
  useEffect(() => {
    if (selectedTechniqueId && LOCAL_MITRE_DB[selectedTechniqueId]) {
      setActiveId(selectedTechniqueId);
    }
  }, [selectedTechniqueId]);

  const current = LOCAL_MITRE_DB[activeId] || LOCAL_MITRE_DB['T0859'];

  return (
    <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-5 font-mono text-xs bg-gradient-to-b from-slate-900/95 via-[#0A0E18] to-slate-950">
      {/* Header & Technique Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-cyan-400 font-bold uppercase tracking-widest text-[11px] flex items-center gap-1.5">
            <Crosshair className="w-4 h-4 text-cyan-400" /> MITRE ATT&CK EXPLAINER
          </span>
          <h3 className="text-base font-extrabold text-slate-100 font-sans mt-0.5">
            Cybersecurity Knowledge & Threat Mechanics
          </h3>
        </div>

        {/* Dropdown Selector */}
        <div className="w-full sm:w-auto">
          <select
            value={activeId}
            onChange={(e) => setActiveId(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:border-cyan-400 focus:outline-none text-xs font-mono font-bold"
          >
            {Object.values(LOCAL_MITRE_DB).map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} - {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Technique Card Title & Tactics */}
      <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            TECHNIQUE IDENTIFIER
          </div>
          <div className="text-xl font-black text-slate-100 font-sans mt-0.5">
            {current.id} — {current.name.toUpperCase()}
          </div>
        </div>

        {/* Tactics Badges */}
        <div className="flex flex-wrap gap-1.5">
          {current.tactics.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-lg bg-cyan-900/60 text-cyan-300 border border-cyan-700 text-[10px] font-bold"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 1. What does it mean? */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>WHAT DOES IT MEAN?</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-sans text-xs leading-relaxed">
          {current.definition}
        </div>
      </div>

      {/* 2. Common Real-World Example */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>COMMON REAL-WORLD EXAMPLE</span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 font-sans text-xs leading-relaxed">
          {current.common_example}
        </div>
      </div>

      {/* 3. Darkon Detection Flow Pipeline */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>DARKON SOC DETECTION CORRELATION PIPELINE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
          {current.detection_flow.map((step, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2 relative">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 text-[10px] font-bold">
                {idx + 1}
              </span>
              <div className="text-[11px] text-slate-300 leading-snug font-sans">
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Why is this risky? */}
      <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 space-y-1">
        <div className="text-red-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>WHY IS THIS RISKY? (SOC BEGINNER EXPLAINER)</span>
        </div>
        <p className="text-red-200/90 text-xs font-sans leading-relaxed">
          {current.why_risky}
        </p>
      </div>

      {/* 5. Sectors Affected & Recommended Defense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Sectors Affected */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SECTORS IMPACTED
          </span>
          <div className="flex flex-wrap gap-1.5">
            {current.affected_sectors.map((sec) => {
              const Icon = SECTOR_ICONS[sec] || ShieldCheck;
              return (
                <span
                  key={sec}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold flex items-center gap-1.5"
                >
                  <Icon className="w-3 h-3 text-cyan-400" />
                  {sec}
                </span>
              );
            })}
          </div>
        </div>

        {/* Recommended Defense */}
        <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> RECOMMENDED SOC DEFENSE
          </span>
          <p className="text-emerald-200/90 text-xs font-sans leading-snug">
            {current.recommended_action}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MitreExplainer;
