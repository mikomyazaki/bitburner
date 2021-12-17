import {list_servers} from '/utils/scan.js';

/** @param {NS} ns **/
export async function main(ns) {
	const args = ns.flags([["help", false]]);
    if (args.help) {
        ns.tprint("This script lists all servers on which you can run scripts.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }

	const servers = list_servers(ns).filter(s => ns.hasRootAccess(s)).concat(['home']);
    for(const server of servers) {
        const used = ns.getServerUsedRam(server);
        const max = ns.getServerMaxRam(server);
        ns.tprint(`${server} is opened. ${used} GB / ${max} GB (${(100*used/max).toFixed(2)}%)`)
    }
}