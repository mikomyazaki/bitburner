export async function main(ns) {
    const target_server = ns.args[0];
    const delay = ns.args[1] || 0;

    await ns.sleep(delay);
    await ns.grow(target_server);

}