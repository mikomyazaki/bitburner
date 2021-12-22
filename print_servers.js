function server(name, neighbours, files) {
    this.name = name;
    this.neighbours = neighbours,
    this.files = files;
}

/** @param {NS} ns **/
export async function main(ns) {
    let homeServer = new server("home", ns.scan("home"), ns.ls("home"));
    let serverList = ["home"];
    let serverObjList = [homeServer];
    for (let i = 0; i < serverList.length; i++) {
        for (let newServer of ns.scan(serverList[i])) {
            if (!serverList.includes(newServer)) {
                serverList.splice(i+1, 0, newServer);
                serverObjList.push(new server(newServer, ns.scan(newServer), ns.ls(newServer)));
            }
        }
    }

    for (let server of serverObjList) {
        ns.tprintf(server.name);

        let filesList = []
        for (let file of server.files) {
            if(file.match(/\.js$/g)) continue;
            if(!file.match(/\.cct$/g)) continue;
            filesList.push(file);
        }
        ns.tprint("-> " + filesList.concat().toString());
    }
}