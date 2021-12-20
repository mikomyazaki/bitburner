import {getAllServers} from 'tools.js';

/** @param {NS} ns **/
export async function main(ns) {
    for (server in getAllServers(ns)) {
        ns.tprintf(server);
    }
}