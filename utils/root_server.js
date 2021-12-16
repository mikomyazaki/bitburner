import {num_port_hack_tools, run_port_hack_tools} from '/utils/tools.js';

export function root_server(ns, server) {

	if (!ns.serverExists(server)) {
		ns.tprint(`Server '${server}' does not exist. Aborting.`);
		return;
	}

    if(ns.hasRootAccess(server)) {
        ns.tprint(`Already have root access on '${server}'. Aborting.`);
        return;
    }

    const req_ports = ns.getServerNumPortsRequired(server)

    if(req_ports > num_port_hack_tools(ns)) {
        ns.tprint(`Server '${server}' requires too many open ports: '${req_ports}'. Aborting.`);
        return;
    }

    run_port_hack_tools(ns, server);

    ns.nuke(server);

    if(ns.hasRootAccess(server)) {
        ns.tprint(`Root access granted for '${server}'.`);
    } else {
        ns.tprint(`Failed to gain root access for '${server}'.`);
    }

    return;
}

import {list_servers} from '/utils/scan.js';

export function root_all_servers(ns) {
    const server_list = list_servers(ns);

    for (const server of server_list) {
        root_server(ns, server);
    }
}