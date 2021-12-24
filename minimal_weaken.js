export async function main(ns) {
    const target_server = ns.args[0];
    const delay = ns.args[1]

    await ns.sleep(delay) {
        ns.weaken(target_server);
    }
}