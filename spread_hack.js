import { getAllServers } from 'tools.js';

/** @param {NS} ns **/
export async function main(ns) {
	let target = "n00dles";
	let serverList = getAllServers(ns);
	ns.tprint(serverList.length);
	serverList = serverList.filter(x => x == 'home');

	await ns.scp(["minimal_grow.js", "minimal_hack.js", "minimal_weaken.js"], ns.getHostname(), target);

	let max_batches = serverList.length;
	while (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
		for (let server in serverList) {
			let weakenMem = ns.getScriptRam("minimal_weaken.js", "home");
			let freeRAM = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
			ns.exec("minimal_weaken.js", server, Math.floor(freeRam / weakenMem), target);

			await sleep(ns.getWeakenTime(target) + 1000);
		}
	}

	let cycle_duration = Math.max(ns.getWeakenTime(target), ns.getHackTime(target), ns.getGrowTime(target));
	let cycle_delay = cycle_duration / max_batches;
	let weakenMem = ns.getScriptRam("minimal_weaken.js", "home");
	let growMem = ns.getScriptRam("minimal_grow.js", "home");
	let hackMem = ns.getScriptRam("minimal_hack.js", "home");

	let hackSecDelta = ns.hackAnalyzeSecurity(1);
	let hackCashDelta = ns.hackAnalyze(target);
	let growSecDelta = ns.growthAnalyzeSecurity(1);
	let growCashDelta = ns.growthAnalyze(target, hackCashDelta, 1);
	let weakenSecDelta = ns.weakenAnalyze(1);

	let weakenDelay = cycleDuration - ns.getWeakenTime(target);
	let growDelay = cycleDuration - ns.getGrowTime(target);
	let hackDelay = cycleDuration - ns.getHackTime(target);

	// Thread ratios
	let growHackRatio = Math.ceil(growCashDelta / hackCashDelta);
	let weakenGrowRatio = Math.Ceil(weakenSecDelta / (growHackRatio * growSecDelta + hackSecDelta));
	let hgwMem = weakenGrowRatio * (growHackRatio * (hackMem) + growMem) + weakenMem;

	while (true) {
		for (let server in serverList) {
			ns.killall(server);
			let freeRAM = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
			let hwgCount = Math.floor(freeRam / hgwMem);

			ns.exec("minimal_weaken.js", server, hwgCount, target, weakenDelay);
			ns.exec("minimal_grow.js", server, hwgCount * weakenGrowRatio, growDelay);
			ns.exec("minimal_hack.js", server, hwgCount * weakenGrowRatio * growHackRatio);

			await ns.sleep(cycle_delay);
		}
		await ns.sleep(10000);
	}
}