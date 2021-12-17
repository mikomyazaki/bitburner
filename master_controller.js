import {root_all_servers} from 'tools.js';
import {list_open_servers, servers_by_hacking_level} from 'tools.js';
import {weaken_server, grow_server, hack_server} from 'tools.js';

export async function initialize_server(ns, server) {
    const files = ["minimal_hack.js",
"minimal_weaken.js",
"minimal_grow.js"];

    for (const file of files) {
        await ns.scp(file, "home", server);
    }

    if(server != ns.getHostname()) {
        ns.killall(server);
    }
}

const sec_threshold = 1.1;
const cash_threshold = 0.75;
const NO_TARGET_SERVER = "NO_TARGET_SERVER"

export async function main(ns) {
    // Make sure we have root access on all available servers
    root_all_servers(ns);
    let avail_servers = list_open_servers(ns);
    // Copy over necessary scripts
    for (const server of avail_servers) {
        await initialize_server(ns, server);
    }

    const server_list_by_hacking_level = servers_by_hacking_level(ns);
    let timers = []

    while (true) {
        // Find server to hack
        let hacking_level = ns.getHackingLevel();
        let target_level = 0;
        let i = -1;

        while (target_level <= hacking_level) {
            target_level = server_list_by_hacking_level[++i][1];
        }

        let target_server = NO_TARGET_SERVER

        for (j = i; j >= 0; j--) {
            let pending_timer = false;
            for (k = 0; k < timers.length; k++) {
                if (timers[k][0] == server_list_by_hacking_level[j][0]) {
                    pending_timer = true;
                }
            }

            if (!pending_timer) {
                target_server = server_list_by_hacking_level[j][0];
            }
        }

        if (target_server != NO_TARGET_SERVER) {

            // Run appropriate action on target server
            let timer = 0
            if (ns.getServerSecurityLevel() / ns.getServerMinSecurityLevel() > sec_threshold) {
                await weaken_server(ns, target_server, avail_servers, sec_threshold);
                timer = ns.getWeakenTime(target_server);
            } else if (ns.getServerMoneyAvailable(target_server) / ns.getServerMaxMoney(target_server) < cash_threshold) {
                await grow_server(ns, target_server, avail_servers, cash_threshold);
                timer = ns.getGrowTime(target_server);
            } else {
                await hack_server(ns, target_server, avail_servers, cash_threshold);
                timer = ns.getHackTime(target_server);
            }

            timers.push([target_server, timer]); 
        } else {
            await ns.sleep(15000)
        }
    }
}