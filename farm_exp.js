import {getAllServers, availableThreads, rootAllServers} from 'tools.js'

/** @param {NS} ns **/
export async function main(ns) {
	const target = "joesguns";
	let script = "minimal_weaken.js"

	rootAllServers();
	while (true) {
		for (const server of getAllServers(ns)) {
			await ns.scp(script, ns.getHostname(), server);
			let avail_threads = availableThreads(ns, server, script);

			if (avail_threads > 0) {
				await ns.exec(script, server, avail_threads, target, 0);
			}
		}
		await ns.sleep(ns.getWeakenTime(target) * 1.01)
	}
}