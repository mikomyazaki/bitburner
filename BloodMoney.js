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
    const target = ns.args[0];
    let serverList = [];
    rootAllServers();

    // Populate server objects
    for (let server of getAllServers(ns)) {
        let s = ns.getServer(server)
        serverList.push(
            new serverInfo(s.hostname, s.maxRam, s.hasAdminRights)
        );
    }

    ns.tprintf("Generated list of " + serverList.length + " servers.");

    prepareServer(ns, target);
    
    const ratios = calculateThreadRatios(ns, target);

}

function prepareServer(ns, target) {
    // Prepare the target server
    while (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target) || ns.getServerMaxMoney(target) != ns.getServerMoneyAvailable(target)) {
        if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
            await ns.weaken(target);
        } else if (ns.getServerMaxMoney(target) != ns.getServerMoneyAvailable(target)) {
            await ns.grow(target);
        }
    }
}

export function calculateThreadRatios(ns, target) {
    const weakenSecDelta = -0.05;
    const growSecDelta = 0.004;
    const hackSecDelta = 0.002;

    const hackCashDelta = ns.hackAnalyze(target) * ns.hackAnalyzeChance(target);
    const growPerHack = Math.ceil(ns.growthAnalyze(target, 1/(1-hackCashDelta)));

    ns.tprint("HackCashDelta : " + hackCashDelta);
    ns.tprint("growPerHack thread: " + target);
}