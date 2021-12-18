/** @param {NS} ns **/
export async function main(ns) {
	var target = "n00dles";

    await ns.scp(["minimal_grow.js", "minimal_hack.js", "minimal_weaken.js"], ns.getHostname(), target);

	var script_name = ns.getScriptName();
	var script_threads = 365;
    ns.tprint("Script running with " + script_threads + " threads.");

	var min_sec = ns.getServerMinSecurityLevel(target);
    ns.tprint("Server has " + (100*ns.getServerSecurityLevel(target)/min_sec) + "% security level.");

	while (ns.getServerSecurityLevel(target) > min_sec) {
		var sec_diff = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
		var threads_req = Math.min(script_threads, Math.floor(sec_diff / ns.weakenAnalyze(1, target)));

		await ns.weaken(target);
	}

	var weaken_time = ns.getWeakenTime(target);
	var grow_time = ns.getGrowTime(target);
	var hack_time = ns.getHackTime(target);
	var hack_perc = ns.hackAnalyze(target);
	var grow_perc = ns.growthAnalyze(target, 1+hack_perc);

	var weaken_num = 2;
	var hack_num = 11;
	var grow_num = 12;

	var batch_count = Math.floor(script_threads / (weaken_num + hack_num + grow_num));
	var batch_delay = Math.max(weaken_time, grow_time, hack_time);

	var batch_rate = batch_delay / batch_count;

	var weaken_latency = batch_delay - weaken_time;
	var hack_latency = batch_delay - hack_time;
	var grow_latency = batch_delay - grow_time;

	while (true) {
        ns.tprint("Loop... executing again in " + batch_rate)
		await ns.exec("minimal_weaken.js", target, weaken_num);
		await ns.exec("minimal_grow.js", target, grow_num);
		await ns.exec("minimal_hack.js", target, hack_num);

		ns.sleep(batch_rate);
	}
}