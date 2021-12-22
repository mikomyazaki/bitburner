import { getAllServers } from 'tools.js';

/** @param {NS} ns **/
export async function main(ns) {
	let serverList = getAllServers(ns);
	serverList = serverList.filter(x => x != 'home');

	for (let server of serverList) {
		await ns.scp("basic_hack.js", "home", server);
		let threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam("basic_hack.js"))
		if (threads > 0) {
			await ns.exec("basic_hack.js", server, threads, server);
		}
	}
}