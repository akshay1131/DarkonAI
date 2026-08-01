import random
import time
from datetime import datetime

class KeralaPowerGridTelemetrySimulator:
    """
    Simulates real-time telemetry updates for the Kerala Smart Power Grid Digital Twin.
    Generates dynamic voltage, frequency, load %, transformer temperature, renewable generation, 
    relay status, and breaker states updating every 2-5 seconds.
    """
    def __init__(self):
        self.base_frequency = 50.00 # Standard 50 Hz grid frequency in India
        self.total_generation_mw = 2850.0 # Peak load capacity
        self.total_demand_mw = 2410.5

    def get_live_grid_telemetry(self, assets):
        # Introduce subtle realistic fluctuations
        freq_offset = round(random.uniform(-0.12, 0.12), 2)
        current_freq = round(self.base_frequency + freq_offset, 2)
        
        load_fluctuation = round(random.uniform(-35.0, 45.0), 1)
        active_demand = round(max(self.total_demand_mw + load_fluctuation, 1800.0), 1)

        solar_output = round(random.uniform(420.0, 580.0), 1)
        wind_output = round(random.uniform(180.0, 260.0), 1)
        hydro_output = round(random.uniform(1450.0, 1850.0), 1) # Idukki + Sabarigiri hydro
        thermal_output = round(self.total_generation_mw - (solar_output + wind_output + hydro_output), 1)

        # Count healthy vs degraded assets
        healthy_count = len([a for a in assets if a.get("status") == "HEALTHY"])
        warning_count = len([a for a in assets if a.get("status") == "WARNING"])
        degraded_count = len([a for a in assets if a.get("status") == "DEGRADED"])
        critical_count = len([a for a in assets if a.get("status") == "CRITICAL"])

        avg_health = round(sum(a.get("health_score", 90.0) for a in assets) / len(assets), 1) if assets else 92.4
        avg_risk = round(100.0 - avg_health, 1)

        return {
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "grid_status": "OPERATIONAL_STABLE" if avg_risk < 20.0 else "ELEVATED_THREAT_LEVEL",
            "frequency_hz": current_freq,
            "system_voltage_kv": round(220.0 + random.uniform(-2.5, 2.5), 1),
            "total_demand_mw": active_demand,
            "total_capacity_mw": self.total_generation_mw,
            "grid_load_pct": round((active_demand / self.total_generation_mw) * 100, 1),
            "generation_breakdown": {
                "hydro_mw": hydro_output,
                "solar_mw": solar_output,
                "wind_mw": wind_output,
                "thermal_mw": max(thermal_output, 100.0)
            },
            "transformer_oil_temp_avg_c": round(random.uniform(42.5, 56.8), 1),
            "ups_battery_level_pct": 98.5,
            "relay_trip_status": "NORMAL",
            "circuit_breaker_status": "CLOSED",
            "overall_health_score": avg_health,
            "overall_risk_score": avg_risk,
            "total_assets": len(assets),
            "asset_status_summary": {
                "healthy": healthy_count,
                "warning": warning_count,
                "degraded": degraded_count,
                "critical": critical_count
            }
        }
