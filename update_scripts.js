/** @param {NS} ns **/
export async function main(ns) {
	let prefix = "https://raw.githubusercontent.com/mikomyazaki/bitburner/main"
    await ns.wget(prefix + "/file_list.txt", "file_list.txt");

	let urls = ns.read("file_list.txt");
	let arr = urls.split("\n");

	for (var i in arr) {
		if(arr[i].length) {
			await ns.wget(arr[i], arr[i].substring(prefix.length))
			ns.tprint("Downloaded: ", arr[i].substring(prefix.length))
		}
	}
}
