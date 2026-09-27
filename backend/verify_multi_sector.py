import requests
import sys
import json
import time

BASE_URL = "http://127.0.0.1:5001"

def run_tests():
    print("==================================================================")
    print("DARKON AI — MULTI-SECTOR COMPREHENSIVE AUTOMATED VERIFICATION SUITE")
    print("==================================================================")

    # 1. Authenticate as SOC Admin
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={"username": "darkon.ai", "password": "admin123"})
    if login_res.status_code != 200:
        print(f"FAILED to authenticate: {login_res.text}")
        sys.exit(1)
    
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("✓ SOC Authentication Successful: Bearer Token obtained")

    # 2. Verify Power Grid is 100% Intact & Unchanged
    print("\n--- Test 1: Verify Power Grid / SCADA Preservation ---")
    pg_res = requests.get(f"{BASE_URL}/api/power-grid/status", headers=headers)
    assert pg_res.status_code == 200, f"Power grid status failed: {pg_res.status_code}"
    pg_data = pg_res.json()
    assert "telemetry" in pg_data, "Telemetry missing in power grid status"
    assert "district_summary" in pg_data, "district_summary missing"
    assert "active_incident" in pg_data, "active_incident missing"
    assert pg_data["total_assets_count"] >= 250, f"Expected >= 250 assets, got {pg_data.get('total_assets_count')}"
    print(f"✓ Power Grid intact: {pg_data['total_assets_count']} assets monitored across {len(pg_data['district_summary'])} Kerala districts")
    print(f"✓ SCADA Telemetry Frequency: {pg_data['telemetry']['frequency_hz']} Hz | Grid Load: {pg_data['telemetry']['grid_load_pct']}%")

    # 3. Test Normal Baseline Event (No Critical Alert)
    print("\n--- Test 2: Normal Event Scenario (No Screen Alert, Baseline Telemetry) ---")
    norm_res = requests.post(f"{BASE_URL}/api/sectors/test-event", headers=headers, json={"sector": "Agriculture", "severity": "LOW"})
    assert norm_res.status_code == 200
    norm_event = norm_res.json()["event"]
    assert norm_event["severity"] == "LOW"
    assert norm_event["risk_score"] < 30.0
    assert norm_event.get("email_sent") is False or norm_event.get("email_sent") == False, "Normal event should NOT dispatch alert email"
    print(f"✓ Normal event processed: Risk Score {norm_event['risk_score']}/100. No alert email sent.")

    # 4. Test Medium-Risk Event (Heatmap & Dashboard update only, No Email)
    print("\n--- Test 3: Medium-Risk Event Scenario (Heatmap & Dashboard Updates, No Email) ---")
    med_res = requests.post(f"{BASE_URL}/api/sectors/test-event", headers=headers, json={"sector": "Hospital", "severity": "MEDIUM"})
    assert med_res.status_code == 200
    med_event = med_res.json()["event"]
    assert med_event["severity"] == "MEDIUM"
    assert 30.0 <= med_event["risk_score"] < 60.0
    assert med_event.get("email_sent") is False, "Medium-risk event must NOT dispatch critical email"

    # Verify heatmap reflects status
    hm_res = requests.get(f"{BASE_URL}/api/sectors/heatmap", headers=headers)
    hm_data = hm_res.json()
    assert "hospital" in hm_data and "agriculture" in hm_data and "education" in hm_data
    hosp_assets = [a for z in hm_data["hospital"] for a in z["assets"]]
    med_match = [a for a in hosp_assets if a["id"] == med_event["asset_id"]]
    assert len(med_match) > 0, "Target asset should be found in hospital heatmap"
    print(f"✓ Medium event reflected in heatmap: Asset {med_match[0]['id']} status = {med_match[0]['status']}")
    print("✓ Confirmed: Zero email sent for Medium-risk event.")

    # 5. Test High-Risk Event (Screen Alert + Heatmap + Live Event + Email to akshayjoji0@gmail.com)
    print("\n--- Test 4: High-Risk Event Scenario (Screen Alert + Heatmap + Email to akshayjoji0@gmail.com) ---")
    high_res = requests.post(f"{BASE_URL}/api/sectors/test-event", headers=headers, json={"sector": "Education", "severity": "HIGH"})
    assert high_res.status_code == 200
    high_event = high_res.json()["event"]
    assert high_event["severity"] == "HIGH"
    assert 60.0 <= high_event["risk_score"] < 80.0
    assert high_event.get("email_sent") is True, "High-risk event MUST trigger automated email alert"

    # Check Overview shows Education with High risk / active alert
    ov_res = requests.get(f"{BASE_URL}/api/sectors/overview", headers=headers)
    ov_data = ov_res.json()
    assert ov_data["active_banner_alert"] is not None
    assert ov_data["active_banner_alert"]["sector"] == "Education"
    print(f"✓ High-risk screen alert active: [{ov_data['active_banner_alert']['severity']}] {ov_data['active_banner_alert']['event']}")
    print(f"✓ Automated email triggered for High-risk event to akshayjoji0@gmail.com (EmailSent = {high_event['email_sent']})")

    # 6. Test Critical Event (Screen Alert + Heatmap Red + Live Event + Email)
    print("\n--- Test 5: Critical Event Scenario (Immediate Screen Alert + Heatmap Red + Email) ---")
    crit_res = requests.post(f"{BASE_URL}/api/sectors/test-event", headers=headers, json={"sector": "Hospital", "severity": "CRITICAL"})
    assert crit_res.status_code == 200
    crit_event = crit_res.json()["event"]
    assert crit_event["severity"] == "CRITICAL"
    assert crit_event["risk_score"] >= 80.0
    assert crit_event.get("email_sent") is True, "Critical-risk event MUST trigger automated email alert"

    # Verify Global Banner Alert updated to Hospital Critical
    ov_res2 = requests.get(f"{BASE_URL}/api/sectors/overview", headers=headers)
    ov_data2 = ov_res2.json()
    assert ov_data2["active_banner_alert"]["severity"] == "CRITICAL"
    assert ov_data2["active_banner_alert"]["sector"] == "Hospital"
    print(f"✓ Critical screen alert active: [{ov_data2['active_banner_alert']['severity']}] {ov_data2['active_banner_alert']['asset']} — {ov_data2['active_banner_alert']['event']}")

    # Verify Heatmap shows affected Hospital node in CRITICAL state
    hm_res2 = requests.get(f"{BASE_URL}/api/sectors/heatmap", headers=headers)
    hosp_assets2 = [a for z in hm_res2.json()["hospital"] for a in z["assets"]]
    crit_asset = next(a for a in hosp_assets2 if a["id"] == crit_event["asset_id"])
    assert crit_asset["status"] == "CRITICAL", f"Expected CRITICAL status, got {crit_asset['status']}"
    print(f"✓ Hospital Heatmap node {crit_asset['id']} ({crit_asset['name']}) updated to CRITICAL (Risk: {crit_asset['risk_score']})")
    print(f"✓ Automated email dispatched to akshayjoji0@gmail.com with incident details (EmailSent = {crit_event['email_sent']})")

    # 7. Test Database Persistence
    print("\n--- Test 6: Verify Database Records in sector_security_events ---")
    alerts_res = requests.get(f"{BASE_URL}/api/sectors/alerts", headers=headers)
    assert alerts_res.status_code == 200
    alerts_data = alerts_res.json()
    assert len(alerts_data["recent_alerts"]) > 0
    print(f"✓ Recent alerts queue verified: {len(alerts_data['recent_alerts'])} active events logged")

    print("\n==================================================================")
    print("ALL 6 TEST SUITE SCENARIOS PASSED WITH ZERO ERRORS!")
    print("==================================================================")

if __name__ == "__main__":
    run_tests()
