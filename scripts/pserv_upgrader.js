export async function scan_pservs(ns) {
    let servs = ns.getPurchasedServers();
    let data = [];

    for (let i = 0; i < servs.length; i++) {
        data.push(info: ns.getServer(servs[i]), ps: ns.ps(servs[i]));
    }

    return data;
}

async function getAffordableUpgradeLevel(ns, server, current_money) {
    let current_ram = ns.getServer(server).maxRam;
    let next_ram = function ram_limit(current_ram) { ns.getPurchasedServerCost(current_ram) > current_money ? return current_ram / 2 : ram_limit(current_ram * 2) }

    return next_ram > current_ram ? next_ram : null
}

import { initialize_server } from '/utils/master_controller.js';

/** @param {NS} ns **/
export async function main(ns) {
    let empty_server_slots = ns.getPurchasedServerLimit() - ns.getPurchasedServers().length;
    let pservs = scan_pservs(ns);

    for (let i = 0; i < pservs.length; i++) {
        let current_money = ns.getServerMoneyAvailable("home");
        let pserv = pservs[i].info.hostname;
        let upgrade = getAffordableUpgrade(ns, pserv, current_money)

        if (upgrade) {
            await ns.killall(pserv)
            await ns.deleteServer(pserv);
            await ns.purchaseServer(pserv, upgrade);

            await initialize_server(ns, pserv);

            for (let j = 0; j < pservs[i].ps; j++) {
                let script = pservs[i].ps.filename;
            //    await ns.exec(script, pserv, Math.floor(ns.getServerMaxRam(pserv) / ns.getScriptRam(script)), ...pservs[i].ps.args);
            }
        }
    }

    await initialize_server(ns)
}