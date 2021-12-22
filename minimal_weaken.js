export async function main(ns) {
    const target_server = ns.args[0];
    await ns.weaken(target_server);
}