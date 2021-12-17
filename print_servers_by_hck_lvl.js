import {servers_by_hacking_level} from 'tools.js';

/** @param {NS} ns **/
export async function main(ns) {
    let list = servers_by_hacking_level(ns);

    let output = ''

    for (let i = 0; i < list.length; i++) {
        output += 'Server: ' + list[i][0] + ' --- Hacking Level: ' + list[i][1] + '\n';
    }

    ns.tprint(output);
}