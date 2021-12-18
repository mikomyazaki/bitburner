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

export function rootServer(ns, server) {
    if (num_port_hack_tools(ns) <= ns.getServerNumPorts(server)) {
        if (!ns.hasRootAccess(server)) {
             tprintf("Gained access to server " + server + ".");
            run_port_hack_tools(ns, server);
            ns.nuke(server);
        }
    }
}

export async function getAllServers(ns) {
    let serverList = ["home"];
    for (let i = 0; i < serverList.length; i++) {
        for (let newServer of ns.scan(serverList[i])) {
            if (!serverList.includes(newServer)) {
                serverList.push(newServer);
            }
        }
    }

    return serverList;
}

export async function rootAllServers(ns) {
    for (let server in ns.getAllServers(ns)) {
        rootServer(ns, server);
    }
}