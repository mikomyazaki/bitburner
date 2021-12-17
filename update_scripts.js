/** @param {NS} ns **/
export async function main(ns) {
	ns.rm("file_list.txt", "home")
	let prefix = "https://raw.githubusercontent.com/mikomyazaki/bitburner/main"
    await ns.wget(prefix + "/file_list.txt", "file_list.txt");

	let urls = ns.read("file_list.txt");
	let arr = urls.split("\n");

	let output = ""
	for (var i in arr) {
		if(arr[i].length) {
			await ns.wget(arr[i], arr[i].substring(prefix.length))
			output += "Downloaded: " + arr[i].substring(prefix.length) + "\n";
		}
	}

	ns.tprint(output);
}
