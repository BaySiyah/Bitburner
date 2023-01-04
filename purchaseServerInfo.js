/** @param {NS} ns */
export async function main(ns) {
	let servers = ns.getPurchasedServers();
	for (const server of servers) {
		let ram = ns.getServerMaxRam(server);
		ns.tprintf(server + " RAM: " + ns.nFormat(ram * Math.pow(1000, 3), '0b'));
	}

}