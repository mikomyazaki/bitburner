import {getAllServers} from 'tools.js'

/** @param {NS} ns **/
export async function main(ns) {
	const target = "joesguns";

	while (true) {
		for (const server of getAllServers(ns)) {
			await ns.scp(["minimal_grow.js", "minimal_hack.js", "minimal_weaken.js"], ns.getHostname(), server);
			const avail_threads = Math.floor( ns.getServerMaxRam(server) / ns.getScriptRam("minimal_weaken.js") );
			if (avail_threads > 0) {
				await ns.exec("minimal_weaken.js", server, avail_threads, target);
			}
		}
		await ns.sleep(ns.getWeakenTime(target) * 1.05)
	}
}