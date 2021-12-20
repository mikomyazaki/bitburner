export async function main(ns) {
    const args = ns.flags([["help", false]]);
    const target_server = args._[0];
    const delay = args._[1]

    await ns.sleep(delay) {
        ns.weaken(target_server);
    }
}