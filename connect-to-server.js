import {getAllServers} from 'tools.js'

function twod_includes_end(ns, array, comparison) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].slice(-1) == comparison) {
            return true;
        }
    }
    return false;
}

export async function main(ns) {
    let target = ns.args[0];
    let serverList = [["home"]];
    let route = [];
    for (let i = 0; i < serverList.length; i++) {
        let scanList = ns.scan(serverList[i].slice(-1));
        for (let newServer of scanList) {
            if(!twod_includes_end(ns, serverList, newServer)) {
                serverList.push(serverList[i].concat(newServer));
                }
            }
    }

    for (let i = 0; i < serverList.length; i++) {
        if (serverList[i].slice(-1) == target) {
            for (let j = 0; j < serverList[i].length; j++) {
                ns.connect(serverList[i][j])
            }
        }
    }
}