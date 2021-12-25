import {getAllServers} from 'tools.js'

/** @param {NS} ns **/
export async function main(ns) {
    let serverList = getAllServers(ns);
	serverList = serverList.filter(x => x != 'home');
	
	for (let server of serverList) {
		ns.killall(server);
	}
}