const HOME = 'home';
const SCRIPT = '/scripts/share.js';

/** 
 * @param {NS} ns 
 * @param {String} server 
 * @param {String} parent 
 * @param {String[]} servers 
*/
function appendChildren(ns, server, parent, servers) {
	const children = ns.scan(server);
	for (const child of children) {
		if (['darkweb', HOME, parent].includes(child))
			continue;
		servers.push(child);
		appendChildren(ns, child, server, servers);
	}
}

/** @param {NS} ns */
function getServers(ns) {
	var servers = [];
	appendChildren(ns, HOME, '', servers);
	servers.sort();
	servers.push(HOME);
	return servers;
}

/** @param {NS} ns */
function killAll(ns) {
	let servers = getServers(ns);
	for (const server of servers)
		ns.scriptKill(SCRIPT, server);
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");

	var data = ns.flags([
		["kill", false],
		["percent", 0.5],
	]);

	if (data.percent <= 0 || data.percent > 1) {
		ns.tprintf("ERROR   percent has to be grateder than 0 and less or equals 1!");
		ns.exit();
	}

	let ram = ns.getScriptRam(SCRIPT);
	let servers = getServers(ns);
	let percent = data.percent;

	killAll(ns);
	if (data.kill)
		ns.exit();

	for (const server of servers) {
		let maxRAM = ns.getServerMaxRam(server);
		if (maxRAM == 0)
			continue;

		ns.scp(SCRIPT, server, HOME);
		let usedRAM = ns.getServerUsedRam(server);
		let threads = Math.floor((maxRAM * percent - usedRAM) / ram);
		if (threads <= 0)
			continue;

		ns.exec(SCRIPT, server, threads);
	}
}