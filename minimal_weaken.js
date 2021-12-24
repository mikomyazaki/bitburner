export async function main(ns) {
    const target_server = ns.args[0];
    const delay = ns.args[1] || 0;
    disableLog(ns.sleep);

    while (Date.now() < delay) {
        await ns.sleep(10)
    }
    await ns.weaken(target_server);

}