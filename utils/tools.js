export function num_port_hack_tools(ns) {
    const port_tools = ["BruteSSH.exe",
                                        "FTPCrack.exe",
                                        "relaySMTP.exe",
                                        "HTTPWorm.exe",
                                        "SQLInject.exe"];

    let count = 0;
    for (var tool of port_tools) {
        if (ns.fileExists(tool, "home")) {
            count++;
        }
    }
    return count;
}

export function run_port_hack_tools(ns, server) {
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(server);
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(server);
    }
    if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(server);
    }
    if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(server);
    }
    if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(server);
    }
}
