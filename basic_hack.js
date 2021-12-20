export async function main(ns) {
    const args = ns.flags([['help', false]]);
    const hostname = args._[0];
    if(args.help || !hostname) {
        ns.tprint("This script will generate money by hacking a target server.");
        ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} n00dles`);
        return;
    }
    while (true) {
        if (ns.getServerSecurityLevel(hostname) > 1.1 * ns.getServerMinSecurityLevel(hostname)) {
            await ns.weaken(hostname);
        } else if (ns.getServerMoneyAvailable(hostname) < ns.getServerMaxMoney(hostname)) {
            await ns.grow(hostname);
        } else {
            ns.tprintf(ns.hackAnalyze(hostname).toString())
            let hackThreads = Math.floor(0.25/ns.hackAnalyze(hostname));
            ns.tprintf("Hacking server: " + hostname + " with " + hackThreads + " threads.");
            await ns.hack(hostname, { threads : hackThreads });
        }
    }
}