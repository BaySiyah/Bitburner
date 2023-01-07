const ROOT = 'home';

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('ALL');

	var data = ns.flags([
		['stats', true],
		['ram', false],
	]);

	ns.tail();
	if (data.ram)
		await monitor_ram(ns);
	else
		await monitor_stats(ns);
}

/** 
 * @param {NS} ns 
 * @param {string} target 
 * */
export async function monitor_ram(ns) {
	async function update(ns) {
		var servers = getServers(ns);
		var used = 0;
		var total = 0;
		for (const server of servers) {
			if (!ns.hasRootAccess(server))
				continue;
			used += ns.getServerUsedRam(server);
			total += ns.getServerMaxRam(server);
		}
		used *= Math.pow(1000, 3);
		total *= Math.pow(1000, 3);
		ns.clearLog();
		ns.print('RAM     ' + ns.nFormat(used / total, '0.000 %'))
		ns.print('used    ' + ns.nFormat(used, '0.000 b'));
		ns.print('total   ' + ns.nFormat(total, '0.000 b'));
		await ns.sleep(1000);
	}
	while (true)
		await update(ns);
}


/** 
 * @param {NS} ns 
 * @param {string} target 
 * */
export async function monitor_stats(ns, target) {
	await ns.sleep(1000);
}


/** @param {NS} ns */
function getServers(ns) {
	function scanServers(ns, server, visited) {
		visited.push(server);
		let children = ns.scan(server);
		for (const child of children) {
			if (visited.indexOf(child) == -1)
				scanServers(ns, child, visited);
		}
	}
	var servers = [];
	scanServers(ns, ROOT, servers);
	servers.sort();
	return servers;
}