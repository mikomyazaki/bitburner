import { getAllServers, rootAllServers } from 'tools.js'

const scripts = {
    weakener: "minimal_weaken.js",
    grower: "minimal_grow.js",
    hacker: "minimal_hack.js"
};

class serverInfo {
    pendingJobs = []
    constructor(hostname, ram, rooted) {
        this.hostname = hostname;
        this.ram = ram;
        this.rooted = rooted;
    }
}

/** @param {NS} ns **/
export async function main(ns) {
    let serverList = [];
    rootAllServers();

    // Populate server objects
    for (let server of getAllServers()) {
        let s = ns.getServer(server)
        serverList.push(
            new serverInfo(s.hostname, s.maxRam, s.hasAdminRights);
        )
    }

    ns.tprintf("Generated list of " + serverList.length + " servers.");

    

}