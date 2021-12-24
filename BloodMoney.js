import { getAllServers, rootAllServers, availableRAM } from 'tools.js'

const scripts = {
    weakener: "minimal_weaken.js",
    grower: "minimal_grow.js",
    hacker: "minimal_hack.js"
};

class myServerInfo {
    activeJobs = []
    constructor(hostname, ram, rooted) {
        this.hostname = hostname;
        this.ram = ram;
        this.rooted = rooted;
    }
}

class myJob {
    constructor(type, target, startAt) {
        this.type = type;
        this.target = target;
        this.startAt = startAt;
    }
}

class ratio {
    constructor(growThreads, hackThreads, weakenThreads) {
        this.growThreads = growThreads,
        this.hackThreads = hackThreads,
        this.weakenThreads = weakenThreads
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
            new myServerInfo(s.hostname, s.maxRam, s.hasAdminRights)
        );
    }

    ns.tprintf("Generated list of " + serverList.length + " servers.");

    prepServer(ns, target);
    
    const ratios = calculateThreadRatios(ns, target); // ratio of HGW threads
    const cycleTime = Math.max(ns.getWeakenTime(target), ns.getGrowTime(target), ns.getHackTime(target));  // time for one cycle to complete
    const growTime = ns.getGrowTime(target);
    const hackTime = ns.getHackTime(target);
    const weakenTime = ns.getWeakenTime(target);
    const minCycleSeparation = 1000; // minimum time between batches
    const memHacker = ns.getScriptRam(scripts.hacker);
    const memGrower = ns.getScriptRam(scripts.grower);
    const memWeakener = ns.getScriptRam(scripts.weakener);
    const jobOffset = 10; // offset between individual hack/grow/weakens within a batch
    let currTime = Date.now()

    ns.tprint("Running hack script -- Max concurrent jobs - " + (3 * cycleTime / minCycleSeparation));
    
    while (true) {
        await ns.sleep(Math.max(Date.now() - currTime + minCycleSeparation, 0));

        currTime = Date.now();
        let batchRAMCost = ratios.hackThreads * memHacker + ratios.growThreads * memGrower + ratios.weakenThreads * memWeakener;
        let workerServer = findOpenServer(ns, serverList, batchRAMCost);

        if (workerServer) {    disableLog(ns.sleep);
                ns.tprintf("Starting job batch on " + workerServer + ".")
                let growStartAt = currTime + cycleTime - growTime;
                ns.exec(scripts.grower, workerServer, ratios.growThreads, target, growStartAt)
                let hackStartAt = currTime + cycleTime - hackTime + jobOffset;
                ns.exec(scripts.hacker, workerServer, ratios.hackThreads, target, hackStartAt)
                let weakenStartAt = currTime + cycleTime - weakenTime + 2*jobOffset;
                ns.exec(scripts.weakener, workerServer, ratios.weakenThreads, target, weakenStartAt)

            } else {
            ns.tprintf("No available worker found!")
        }
    }
}

async function prepServer(ns, target) {
    // Prepare the target server
    while (true) {
        if (ns.getServerSecurityLevel(hostname) > ns.getServerMinSecurityLevel(hostname)) {
            await ns.weaken(hostname);
        } else if (ns.getServerMoneyAvailable(hostname) < ns.getServerMaxMoney(hostname)) {
            await ns.grow(hostname);
        } else {
            return;
        }
    }
}

function calculateThreadRatios(ns, target) {
    const weakenSecDelta = -0.05;
    const growSecDelta = 0.004;
    const hackSecDelta = 0.002;

    // grow-hack ratio
    const hackCashDelta = ns.hackAnalyze(target) * ns.hackAnalyzeChance(target);
    const growPerHack = Math.ceil(ns.growthAnalyze(target, 1/(1-hackCashDelta)), 1);

    // weaken-grow ratio
    let weakenPerHack = Math.ceil(1 / Math.abs((hackSecDelta + growPerHack * growSecDelta) / weakenSecDelta));

    return new ratio(growPerHack, 1, weakenPerHack);
}

function findOpenServer(ns, serverList, batchRAMCost) {
    for (let server of serverList) {
        let hostname = server.hostname;
        if (availableRAM(ns, hostname) >= batchRAMCost) {
            return hostname;
        }
    }
    return false;
}