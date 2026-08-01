import nmap

scanner = nmap.PortScanner()

def scan_target(target):
    """
    Perform an Nmap service/version scan.
    Returns structured JSON-like data.
    """

    scanner.scan(
        hosts=target,
        arguments="-Pn -F -T4"
    )

    results = []

    for host in scanner.all_hosts():

        host_data = {
            "host": host,
            "hostname": scanner[host].hostname(),
            "state": scanner[host].state(),
            "ports": []
        }

        for proto in scanner[host].all_protocols():

            ports = scanner[host][proto].keys()

            for port in sorted(ports):

                service = scanner[host][proto][port]

                host_data["ports"].append({
                    "port": port,
                    "protocol": proto,
                    "state": service.get("state"),
                    "service": service.get("name"),
                    "product": service.get("product"),
                    "version": service.get("version"),
                    "extrainfo": service.get("extrainfo")
                })

        results.append(host_data)

    return results
