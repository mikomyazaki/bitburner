import { getAllServers, rootAllServers, availableRAM, availableThreads } from 'tools.js'

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
    let serverList = await refreshServerList(ns);
    rootAllServers();

    if (!target) return;

    ns.tprintf("Generated list of " + serverList.length + " servers.");

    await prepServer(ns, serverList, target);
    
    const sizeMultiplier = 1;
    const ratios = calculateThreadRatios(ns, sizeMultiplier, target); // ratio of HGW threads
    const cycleTime = Math.max(ns.getWeakenTime(target), ns.getGrowTime(target), ns.getHackTime(target));  // time for one cycle to complete
    const growTime = ns.getGrowTime(target);
    const hackTime = ns.getHackTime(target);
    const weakenTime = ns.getWeakenTime(target);
    const minCycleSeparation = 500; // minimum time between batches
    const memHacker = ns.getScriptRam(scripts.hacker);
    const memGrower = ns.getScriptRam(scripts.grower);
    const memWeakener = ns.getScriptRam(scripts.weakener);
    const jobOffset = 5; // offset between individual hack/grow/weakens within a batch
    let lastBatchTime = -Infinity;

    let maxCycles = Math.floor(cycleTime / minCycleSeparation);
    ns.tprint("Running hack script -- Max concurrent jobs - " + maxCycles);
    ns.tprint("Cycle time is: " + Math.floor(cycleTime / 1e3) + " s.");
    ns.tprint("Cycle separation is: " + minCycleSeparation + " ms.");
    ns.tprint(`First cycle hits in ${Math.floor(ns.getWeakenTime(target) / 1e3) / 60} mins.`)
    
    while (true) {
        await ns.sleep(Math.max(Date.now() - lastBatchTime + minCycleSeparation, 0));
        serverList = await refreshServerList(ns);

        lastBatchTime = Date.now();
        let batchRAMCost = ratios.hackThreads * memHacker + ratios.growThreads * memGrower + ratios.weakenThreads * memWeakener;
        let workerServer = findOpenServer(ns, serverList, ratios.growThreads * memGrower);

        if (workerServer) {
            let growStartAt = cycleTime - growTime;
            ns.exec(scripts.grower, workerServer, ratios.growThreads, target, growStartAt, Date.now());
        }
        workerServer = findOpenServer(ns, serverList, ratios.hackThreads * memHacker);
        if (workerServer) {
            let hackStartAt = cycleTime - hackTime + jobOffset;
            ns.exec(scripts.hacker, workerServer, ratios.hackThreads, target, hackStartAt, Date.now());
        }
        workerServer = findOpenServer(ns, serverList, batchRAMCost);
        if (workerServer) {
            let weakenStartAt = cycleTime - weakenTime + 2*jobOffset;
            ns.exec(scripts.weakener, workerServer, ratios.weakenThreads, target, weakenStartAt, Date.now());
        }

    }
}


async function prepServer(ns, serverList, target) {
    // Prepare the target server
    while (true) {
        for (let server of serverList) {
            let workerServer = server.hostname;
            if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
                let threads = availableThreads(ns, workerServer, scripts.weakener);
                if (threads) {
                    ns.exec(scripts.weakener, workerServer, threads, target, 0)
                }
            } else if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
                let threads = availableThreads(ns, workerServer, scripts.grower);
    
                if (threads) {
                    ns.exec(scripts.grower, workerServer, threads, target, 0)
                }
            } else {
                return;
            }
        }

        ns.tprint("CASH -- " + Math.floor(ns.getServerMoneyAvailable(target)/1e6) + "M / " + Math.floor(ns.getServerMaxMoney(target)/1e6) + "M");
        await ns.sleep(ns.getWeakenTime(target)*0.05);
    }
}

function calculateThreadRatios(ns, sizeMultiplier, target) {
    const weakenSecDelta = -0.05;
    const growSecDelta = 0.004;
    const hackSecDelta = 0.002;

    // grow-hack ratio
    const hackCashDelta = ns.hackAnalyze(target) * ns.hackAnalyzeChance(target);
    const growPerHack = Math.ceil(ns.growthAnalyze(target, 1/(1-hackCashDelta)), 1);

    // weaken-grow ratio
    let weakenPerHack = Math.ceil(1 / Math.abs((hackSecDelta + growPerHack * growSecDelta) / weakenSecDelta));

    return new ratio(sizeMultiplier*growPerHack, sizeMultiplier, sizeMultiplier*weakenPerHack);
}

function findOpenServer(ns, serverList, batchRAMCost) {
    for (let server of serverList) {
        let hostname = server.hostname;
        if(hostname == "home") continue;
        if(!ns.hasRootAccess(hostname)) continue;
        if (availableRAM(ns, hostname) >= batchRAMCost) {
            return hostname;
        }
    }
    return null;
}

async function refreshServerList(ns) {
    let serverList = [];
    // Populate server objects
    let allServers = getAllServers(ns);
    allServers 
    for (let server of allServers) {
        let s = ns.getServer(server)
        serverList.push(
            new myServerInfo(s.hostname, s.maxRam, s.hasAdminRights)
        );

        await ns.scp([scripts.hacker, scripts.weakener, scripts.grower] , "home", s.hostname);
    }
    
    serverList.push( serverList.shift() );
    return serverList;
}