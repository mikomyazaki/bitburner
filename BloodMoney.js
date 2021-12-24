import { getAllServers, rootAllServers } from 'tools.js'

const scripts = {
    weakener: "minimal_weaken.js",
    grower: "minimal_grow.js",
    hacker: "minimal_hack.js"
};

class myServerInfo {
    pendingJobs = []
    constructor(hostname, ram, rooted) {
        this.hostname = hostname;
        this.ram = ram;
        this.rooted = rooted;
    }
}

class job {
    constructor(type, target, time) {
        this.type = type;
        this.target = target;
        this.time = time;
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
    
    const ratios = calculateThreadRatios(ns, target); // ratio of HGW threads
    const cycleTime = Math.max(ns.getWeakenTime(target), ns.getGrowTime(target), ns.getHackTime(target));  // time for one cycle to complete
    const minCycleSeparation = 1000; // minimum time between batches
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

    // grow-hack ratio
    const hackCashDelta = ns.hackAnalyze(target) * ns.hackAnalyzeChance(target);
    const growPerHack = Math.ceil(ns.growthAnalyze(target, 1/(1-hackCashDelta)));

    // weaken-grow ratio
    let weakenPerHack = Math.ceil(1 / Math.abs((hackSecDelta + growPerHack * growSecDelta) / weakenSecDelta));

    const ratios = {
        growThreads: growPerHack,
        hackThreads: 1,
        weakenThreads: weakenPerHack
    }

    ns.tprintf("Grow: " + ratios.growThreads + " Hack: " + ratios.hackThreads + " Weaken: " + ratios.weakenThreads);
}