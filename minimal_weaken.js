export async function main(ns) {
    const args = ns.flags([["help", false]]);
    const target_server = args._[0];

    ns.weaken(target_server);
}