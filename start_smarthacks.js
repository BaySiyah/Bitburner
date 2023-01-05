const HOME = 'home';
const SCRIPT = "smarthack.js"

/** 
 * @param {NS} ns 
 * @param {String} server 
 * @param {String} parent 
 * @param {String[]} servers 
*/
function appendChildren(ns, server, parent, servers) {
	const children = ns.scan(server);
	for (const child of children) {
		let info = ns.getServer(child);
		if (info.purchasedByPlayer)
			continue;
		if (ns.getServerMaxMoney(child) == 0)
			continue;
		if (ns.getServerRequiredHackingLevel(child) > ns.getHackingLevel())
			continue;
		if (['darkweb', HOME, parent].includes(child))
			continue;
		if (!ns.hasRootAccess(child))
			continue;
		servers.push(child);
		appendChildren(ns, child, server, servers);
	}
}

/** @param {NS} ns */
function getServers(ns) {
	var servers = [];
	appendChildren(ns, HOME, '', servers);
	servers.sort((a, b) => {
		return ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b)
	});
	return servers;
}

/** @param {NS} ns */
export async function main(ns) {
	var data = ns.flags([
		["level", 0],
	]);

	if (data.level < 0) {
		ns.tprintf("ERROR    level has to be larger than 0!");
		ns.exit();
	}

	var levelLimit = data.level;
	let servers = getServers(ns);
	for (const server of servers) {
		if (ns.isRunning(SCRIPT, HOME, server))
			continue;
		if (levelLimit > 0 && ns.getServerRequiredHackingLevel(server) > levelLimit)
			continue;
		let pid = ns.exec(SCRIPT, HOME, 1, server);
		ns.tprintf("INFO     started smarthack: " + server + " (PID " + pid + ")");
	}
}