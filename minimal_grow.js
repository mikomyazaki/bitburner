export async function main(ns) {
    const target_server = ns.args[0];
    const delay = ns.args[1] || 0;

    while (Date.now() < delay) {
        await ns.sleep(10)
    }
    await ns.grow(target_server);

}