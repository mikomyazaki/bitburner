export function scan_pservs(ns) {
    let servs = ns.getPurchasedServers();
    ns.tprint("Found " + servs.length + " servers");
    let data = [];

    for (let i = 0; i < servs.length; i++) {
        let serv_data = {info: ns.getServer(servs[i]), ps: ns.ps(servs[i])}
        ns.tprint("Adding data for " + serv_data.info.hostname);
        data.push(serv_data);
    }

    return data;
}

function getAffordableUpgradeLevel(ns, server, current_money) {
    let cost_table = [];
    for (let i = 1; i < 20; i++) {
        cost_table.push(ns.getPurchasedServerCost(2**i));
    }

    let current_ram = ns.getServerMaxRam(server);

    var i = 0;
    while (cost_table[i] < ns.getServerMoneyAvailable("home")) {
        i++;
    }

    let next_ram = 2**(--i);

    return ((next_ram > current_ram) ? next_ram : null)
}

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.getPurchasedServerLimit() > ns.getPurchasedServers().length) {
        for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
            let new_serv_name = "pserv-" + i;
            if (!ns.serverExists(new_serv_name)) {
                ns.purchaseServer(new_serv_name, 2)
            }
        }
    }

    let pservs = scan_pservs(ns);
    ns.tprint("Located " + pservs.length + " purchased servers.");

    let current_money = 0;
    let upgrade = null;

    for (let i = 0; i < pservs.length; i++) {
        current_money = ns.getServerMoneyAvailable("home");
        let pserv = pservs[i].info.hostname;
        upgrade = getAffordableUpgradeLevel(ns, pserv, current_money);
        let upgrade_level = upgrade ? upgrade : "n/a"
        ns.tprint("Checking server: " + pserv + "- Current RAM: " + ns.getServerMaxRam(pserv) + " - Upgrading to: " + upgrade_level);

        if (upgrade) {
            ns.killall(pserv);
            ns.deleteServer(pserv);
            ns.purchaseServer(pserv, upgrade);

            ns.tprint("Upgrading server " + pserv + " to " + upgrade + "GB. For a cost of $" + (55000*upgrade) + ".");
        }

        for (let j = 0; j < pservs[i].ps; j++) {
            let script = pservs[i].ps.filename;
            if (script) {
                //await ns.exec(script, pserv, Math.floor(ns.getServerMaxRam(pserv) / ns.getScriptRam(script)), ...pservs[i].ps[j].args);
            }
        }

        upgrade = null
    }
}