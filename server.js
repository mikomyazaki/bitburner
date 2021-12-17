import {generateWorkerPool} from '/utils/threads.js';

export async function weaken_server(ns, target_server, avail_servers, sec_threshold) {
    const script = "minimal_weaken.js"
    const threads = Min.ceil(ns.getServerSecurityLevel(target_server) - ns.getServerMinSecurityLevel(target_server)) / 0.05;
    const workers = generateWorkerPool(ns, avail_servers, threads, script);

    for (let i = 0; i < workers.length, i++) {
        await ns.exec(script, workers[i][0], workers[i][1], target_server);
    }
}

export async function grow_server(ns, target_server, avail_servers, cash_threshold) {
    const script = "minimal_grow.js"
    const threads = ns.growAnalyze(target_server, cash_threshold / (ns.getServerMoneyAvailable(target_server) / ns.getServerMaxMoney(target_server)));
    const workers = generateWorkerPool(ns, avail_servers, threads, script);

    for (let i = 0; i < workers.length, i++) {
        await ns.exec(script, workers[i][0], workers[i][1], target_server);
    }
}

export async function hack_server(ns, target_server, avail_servers, cash_threshold) {
    const script = "minimal_hack.js"
    const threads = Math.floor((100 * cash_threshold * 0.75) / (ns.hackAnalyze(target_server) * ns.hackAnalyzeChance(target_server)));
    const workers = generateWorkerPool(ns, avail_servers, threads, script);

    for (let i = 0; i < workers.length, i++) {
        await ns.exec(script, workers[i][0], workers[i][1], target_server);
    }
}