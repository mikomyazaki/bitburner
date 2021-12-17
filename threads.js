export function avail_threads(ns, server, ram) {
    return Math.floor((ns.getServerRam(server) - getServerUsedRam(server) / ram);
}

export function generateWorkerPool(ns, avail_servers, threads, script)  {
    let workers = []
    let ram_cost = ns.get_script_ram(script);

    while (threads > 0) {
        for (const server in avail_servers) {
            let worker_threads = Math.min(avail_threads(ns, server, ram_cost), threads);
            workers.push([server, worker_threads]);
            threads -= worker_threads;
        }
    }

    return workers;
}