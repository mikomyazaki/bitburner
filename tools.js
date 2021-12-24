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
    if (num_port_hack_tools(ns) >= ns.getServerNumPortsRequired(server)) {
        if (!ns.hasRootAccess(server)) {
            ns.tprintf("Gained access to server " + server + ".");
            run_port_hack_tools(ns, server);
            ns.nuke(server);
            return true;
        } 
    }
    return false;
}

export function getAllServers(ns) {
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
    let serverList = getAllServers(ns);
    let rooted_servers = 0;
    for (let i = 0; i < serverList.length; i++) {
        if(rootServer(ns, serverList[i])) rooted_servers++;;
    }

    ns.tprintf("Rooted: " + rooted_servers + " new servers. ")
}

export function availableRAM(ns, server) {
    let ram_used = 0
    let ps = ns.ps(server)

    for (let i = 0; i < ps.length; i++) {
        ram_used += ns.getScriptRam(ps[i].filename, server) * ps[i].threads;
    }
    return ns.getServerMaxRam(server) - ram_used;
}

export function availableThreads(ns, server, script) {
    return Math.floor(availableRAM(ns, server) / ns.getScriptRam(script));
}