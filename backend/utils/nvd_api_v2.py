import requests
import json
import time
import urllib.parse
from datetime import datetime, timedelta

class NVDAPIV2Client:
    """
    Official NIST National Vulnerability Database (NVD) REST API 2.0 Integration Client.
    Fetches real-time CVE details, CVSS v3.1 vector strings, and CISA Known Exploited Vulnerabilities (KEV).
    Includes in-memory/TTL caching to respect NVD rate limits (5 req / 30s without key).
    """
    BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

    def __init__(self, api_key=None):
        self.api_key = api_key
        self.cache = {}
        self.cache_ttl = timedelta(hours=12)

    def get_cve_details(self, cve_id):
        cve_id = cve_id.upper().strip()
        
        # Check cache
        if cve_id in self.cache:
            entry, cached_at = self.cache[cve_id]
            if datetime.utcnow() - cached_at < self.cache_ttl:
                return entry

        headers = {
            "User-Agent": "Darkon-AI-Cybersecurity-SOC-Platform/2.0"
        }
        if self.api_key:
            headers["apiKey"] = self.api_key

        try:
            params = {"cveId": cve_id}
            res = requests.get(self.BASE_URL, headers=headers, params=params, timeout=5)
            
            if res.status_code == 200:
                data = res.json()
                vulnerabilities = data.get("vulnerabilities", [])
                if vulnerabilities:
                    cve_item = vulnerabilities[0].get("cve", {})
                    parsed = self._parse_cve_item(cve_item)
                    self.cache[cve_id] = (parsed, datetime.utcnow())
                    return parsed
        except Exception as e:
            print(f"[NVD API v2] Network request error for {cve_id}: {e}")

        return None

    def search_by_keyword(self, keyword, limit=5):
        headers = {"User-Agent": "Darkon-AI-Cybersecurity-SOC-Platform/2.0"}
        if self.api_key:
            headers["apiKey"] = self.api_key

        try:
            params = {"keywordSearch": keyword, "resultsPerPage": limit}
            res = requests.get(self.BASE_URL, headers=headers, params=params, timeout=5)
            if res.status_code == 200:
                data = res.json()
                results = []
                for item in data.get("vulnerabilities", []):
                    parsed = self._parse_cve_item(item.get("cve", {}))
                    results.append(parsed)
                return results
        except Exception as e:
            print(f"[NVD API v2] Keyword search error for '{keyword}': {e}")
        return []

    def _parse_cve_item(self, cve):
        metrics = cve.get("metrics", {})
        cvss_v31 = metrics.get("cvssMetricV31", [{}])[0].get("cvssData", {}) if metrics.get("cvssMetricV31") else {}
        cvss_v30 = metrics.get("cvssMetricV30", [{}])[0].get("cvssData", {}) if metrics.get("cvssMetricV30") else {}
        
        cvss_data = cvss_v31 or cvss_v30
        
        descriptions = cve.get("descriptions", [])
        desc_en = next((d.get("value") for d in descriptions if d.get("lang") == "en"), "No description available.")

        cisa_kev = bool(cve.get("cisaExploitAdd"))

        return {
            "cve_id": cve.get("id"),
            "cvss_score": cvss_data.get("baseScore", 7.5),
            "cvss_vector": cvss_data.get("vectorString", "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"),
            "severity": cvss_data.get("baseSeverity", "HIGH"),
            "description": desc_en,
            "published_date": cve.get("published", "")[:10],
            "last_modified": cve.get("lastModified", "")[:10],
            "cisa_known_exploited": cisa_kev,
            "references": [ref.get("url") for ref in cve.get("references", [])[:3]]
        }
