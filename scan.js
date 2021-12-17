function scan(ns, parent, server, list) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent == child) {
            continue;
        }
        list.push(child);
        
        scan(ns, server, child, list);
    }
}

export function list_servers(ns) {
    let list = [];
    scan(ns, '', 'home', list);
    return list;
}

export function list_open_servers(ns) {
    return list_servers(ns).filter(s => ns.hasRootAccess(s)).concat(['home']);
}

export function servers_by_hacking_level(ns) {
    let list = [];
    for (let server of list_servers(ns)) {
        list.push([server, ns.getServerRequiredHackingLevel(server)]);
    }

    list = list.sort(function(a,b) { 
        return a[1] - b[1];
    });

    return list;
}