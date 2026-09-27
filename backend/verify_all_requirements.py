import os
import sys
import json
import requests
import time

BASE_URL = "http://127.0.0.1:5001"

def verify_all():
    print("=" * 70)
    print("DARKON AI — MULTI-SECTOR COMPREHENSIVE ACCEPTANCE TEST SUITE")
    print("=" * 70)

    # 1. Authenticate as SOC Admin
    print("\n--- 1. Authenticating as SOC Operator ---")
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={"username": "darkon.ai", "password": "admin123"})
    assert login_res.status_code == 200, f"Authentication failed: {login_res.text}"
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("✓ SOC Authentication Successful: Bearer Token obtained")

    # 2. Verify Power Grid is 100% Preserved
    print("\n--- 2. Verifying Power Grid Preservation ---")
    pg_res = requests.get(f"{BASE_URL}/api/power-grid/status", headers=headers)
    assert pg_res.status_code == 200, f"Power Grid status failed: {pg_res.status_code}"
    pg_data = pg_res.json()
    assert "telemetry" in pg_data, "Telemetry missing from Power Grid"
    assert "district_summary" in pg_data, "District summary missing"
    assert len(pg_data["district_summary"]) == 14, "Expected 14 Kerala districts"
    assert pg_data["total_assets_count"] >= 250, f"Expected >= 250 assets, got {pg_data['total_assets_count']}"
    print(f"✓ Power Grid Preserved: {pg_data['total_assets_count']} assets across 14 Kerala districts")
    print(f"✓ Telemetry Live: Frequency = {pg_data['telemetry']['frequency_hz']} Hz | Load = {pg_data['telemetry']['grid_load_pct']}%")

    # 3. Verify Multi-Sector Unified Assets (Requirement 2)
    print("\n--- 3. Verifying Multi-Sector Asset Inventory (All 4 Sectors) ---")
    assets_res = requests.get(f"{BASE_URL}/api/sectors/assets", headers=headers)
    assert assets_res.status_code == 200, f"Assets endpoint failed: {assets_res.status_code}"
    assets_data = assets_res.json()
    
    total_count = assets_data["total_count"]
    by_sector = assets_data["counts_by_sector"]
    by_sev = assets_data["counts_by_severity"]

    print(f"✓ Total Combined Assets: {total_count}")
    print(f"  - Power Grid:  {by_sector.get('Power Grid')}")
    print(f"  - Agriculture: {by_sector.get('Agriculture')}")
    print(f"  - Hospital:    {by_sector.get('Hospital')}")
    print(f"  - Education:   {by_sector.get('Education')}")

    assert total_count >= 320, f"Expected >= 320 assets, got {total_count}"
    assert by_sector.get('Power Grid') == 252, "Power Grid assets should be 252"
    assert by_sector.get('Agriculture') >= 25, "Agriculture assets should be >= 25"
    assert by_sector.get('Hospital') >= 25, "Hospital assets should be >= 25"
    assert by_sector.get('Education') >= 25, "Education assets should be >= 25"

    # Test sector filter: Hospital
    hosp_res = requests.get(f"{BASE_URL}/api/sectors/assets?sector=Hospital", headers=headers)
    assert hosp_res.status_code == 200
    hosp_list = hosp_res.json()["assets"]
    assert len(hosp_list) >= 25
    assert all(a["sector"] == "Hospital" for a in hosp_list)
    print("✓ Filtering by sector 'Hospital' successfully returned only hospital assets")

    # Test sector filter: Agriculture
    ag_res = requests.get(f"{BASE_URL}/api/sectors/assets?sector=Agriculture", headers=headers)
    assert ag_res.status_code == 200
    ag_list = ag_res.json()["assets"]
    assert len(ag_list) >= 25
    assert all(a["sector"] == "Agriculture" for a in ag_list)
    print("✓ Filtering by sector 'Agriculture' successfully returned only agriculture assets")

    # Test sector filter: Education
    edu_res = requests.get(f"{BASE_URL}/api/sectors/assets?sector=Education", headers=headers)
    assert edu_res.status_code == 200
    edu_list = edu_res.json()["assets"]
    assert len(edu_list) >= 25
    assert all(a["sector"] == "Education" for a in edu_list)
    print("✓ Filtering by sector 'Education' successfully returned only education assets")

    # 4. Verify Multi-Sector Analytics (Requirements 4, 5, 7, 8)
    print("\n--- 4. Verifying Multi-Sector Analytics & 5x5 Heat Map ---")
    ana_res = requests.get(f"{BASE_URL}/api/sectors/analytics", headers=headers)
    assert ana_res.status_code == 200, f"Analytics failed: {ana_res.status_code}"
    ana = ana_res.json()

    # Check 4 sector summaries
    sec_sums = ana["sector_summaries"]
    for s in ["Power Grid", "Agriculture", "Hospital", "Education"]:
        assert s in sec_sums, f"Sector {s} missing from summaries"
        s_info = sec_sums[s]
        assert s_info["asset_count"] > 0
        assert s_info["risk_score"] > 0
        assert s_info["status"] in ["NORMAL", "WARNING", "HIGH", "CRITICAL"]
        print(f"✓ Sector Card '{s}': {s_info['asset_count']} Assets | Risk: {s_info['risk_score']}/100 | Status: {s_info['status']} | Threat: {s_info['latest_threat'][:40]}...")

    # Check 5x5 Heatmap data points
    heatmap_pts = ana["heatmap_points"]
    assert len(heatmap_pts) >= 10, f"Expected >= 10 heatmap points, got {len(heatmap_pts)}"
    for pt in heatmap_pts:
        assert 1 <= pt["likelihood"] <= 5, f"Likelihood {pt['likelihood']} out of 1-5 range"
        assert 1 <= pt["impact"] <= 5, f"Impact {pt['impact']} out of 1-5 range"
        assert pt["zone"] in ["Critical", "High", "Medium", "Low"]
        assert len(pt["why_risky"]) > 10, "Why is this risky explanation missing"
        assert len(pt["recommended_action"]) > 10, "Recommended action missing"
    print(f"✓ 5x5 Cyber Risk Heat Map: {len(heatmap_pts)} detected incident points mapped to standard risk zones")

    # Check percentage sums
    sev_pcts = ana["severity_distribution"]["percentages"]
    sev_sum = round(sum(sev_pcts.values()), 1)
    assert 99.8 <= sev_sum <= 100.2, f"Severity percentages do not sum to 100%: {sev_sum}"
    print(f"✓ Severity Percentages verified: Sum = {sev_sum}% ({sev_pcts})")

    cat_pcts = ana["category_distribution"]["percentages"]
    cat_sum = round(sum(cat_pcts.values()), 1)
    assert 99.8 <= cat_sum <= 100.2, f"Category percentages do not sum to 100%: {cat_sum}"
    print(f"✓ Attack Category Percentages verified: Sum = {cat_sum}% ({cat_pcts})")

    sec_pcts = ana["sector_distribution"]["percentages"]
    sec_sum = round(sum(sec_pcts.values()), 1)
    assert 99.8 <= sec_sum <= 100.2, f"Sector percentages do not sum to 100%: {sec_sum}"
    print(f"✓ Sector Attack Percentages verified: Sum = {sec_sum}% ({sec_pcts})")

    # 5. Verify MITRE ATT&CK Knowledge Base (Requirement 6)
    print("\n--- 5. Verifying MITRE ATT&CK Knowledge Base ---")
    mitre_res = requests.get(f"{BASE_URL}/api/sectors/mitre-knowledge", headers=headers)
    assert mitre_res.status_code == 200
    mitre_db = mitre_res.json()
    
    required_mitre = ["T0859", "T0846", "T0886", "T0822", "T0813", "T0809", "T0858", "T0855", "T1190", "T1486"]
    for t_id in required_mitre:
        assert t_id in mitre_db, f"Required MITRE technique {t_id} missing from knowledge base"
        tech = mitre_db[t_id]
        assert "definition" in tech and len(tech["definition"]) > 10
        assert "tactics" in tech and len(tech["tactics"]) > 0
        assert "common_example" in tech and len(tech["common_example"]) > 10
        assert "detection_flow" in tech and len(tech["detection_flow"]) >= 3
        assert "affected_sectors" in tech and len(tech["affected_sectors"]) > 0
        assert "why_risky" in tech and len(tech["why_risky"]) > 10
        print(f"✓ MITRE {t_id} ({tech['name']}): Complete beginner-friendly explainer structure verified")

    # 6. Verify Multi-Sector PDF Generation (Requirements 10 & 11)
    print("\n--- 6. Verifying Multi-Sector PDF Report Generation ---")
    rep_res = requests.post(f"{BASE_URL}/api/incident/generate-report", headers=headers, json={})
    assert rep_res.status_code == 200, f"Report generation failed: {rep_res.text}"
    rep_info = rep_res.json()
    assert "pdf_report" in rep_info
    pdf_filename = rep_info["pdf_report"]
    print(f"✓ Report endpoint generated filename: {pdf_filename}")

    # Download report
    dl_res = requests.get(f"{BASE_URL}/api/incident/reports/{pdf_filename}", headers=headers)
    assert dl_res.status_code == 200, f"Download failed: {dl_res.status_code}"
    pdf_bytes = dl_res.content
    assert len(pdf_bytes) > 20000, f"PDF file size suspiciously small: {len(pdf_bytes)} bytes"
    
    # Check page markers
    page_markers = pdf_bytes.count(b'/Type /Page\n') + pdf_bytes.count(b'/Type /Page ')
    print(f"✓ Generated PDF size: {len(pdf_bytes)} bytes | Pages detected: {page_markers}")
    assert page_markers >= 7, f"Expected at least 7 pages, got {page_markers}"

    # Verify key sections exist in decompressed PDF streams
    import zlib, re
    streams = re.findall(b'stream[\r\n]+(.*?)[\r\n]+endstream', pdf_bytes, re.DOTALL)
    decompressed = b''
    for s in streams:
        try:
            decompressed += zlib.decompress(s)
        except Exception:
            decompressed += s

    assert b"MULTI-SECTOR CYBERSECURITY ASSESSMENT" in decompressed, "Cover Title missing in PDF"
    assert b"EXECUTIVE SUMMARY" in decompressed, "Executive Summary missing in PDF"
    assert b"SECTOR-BY-SECTOR CYBER RISK ANALYSIS" in decompressed, "Sector Risk Analysis missing in PDF"
    assert b"CYBER RISK HEAT MAP" in decompressed, "Risk Heat Map missing in PDF"
    assert b"ATTACK DISTRIBUTION" in decompressed, "Attack Distribution missing in PDF"
    assert b"MITRE ATT&CK THREAT MATRIX ANALYSIS" in decompressed, "MITRE Analysis missing in PDF"
    assert b"ATTACK 01:" in decompressed, "Individual Attack 01 missing in PDF"
    print("✓ All 7+ required pages verified in PDF: Cover, Executive Summary, Sector Analysis, Heat Map, Attack Distribution, MITRE Matrix, and Individual Attacks!")

    print("\n" + "=" * 70)
    print("ALL 6 VERIFICATION TEST SUITES PASSED FLAWLESSLY WITH ZERO ERRORS!")
    print("=" * 70)

if __name__ == "__main__":
    verify_all()
