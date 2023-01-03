const ROOT = 'home';
const DELAY = 1000;
const MAX_EXPONENT = 20;

function createGUID() {
	function s4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	return (s4() + s4() + '-' + s4() + '-4' + s4().substring(0, 3) + '-' + s4() + '-' + s4() + s4() + s4()).toLowerCase();
}

/** 
 * @param {NS} ns 
 * @param {number} ram
*/
function ramFormat(ns, ram) {
	return ns.nFormat(ram * Math.pow(1000, 3), '0b');
}

/** @param {NS} ns */
export async function main(ns) {
	var servers = ns.getPurchasedServers();
	var exponent = 1;
	var ram = Math.pow(2, exponent);
	var cost = ns.getPurchasedServerCost(ram);

	while (servers.length < ns.getPurchasedServerLimit()) {
		while (ns.getServerMoneyAvailable(ROOT) < cost)
			await ns.sleep(DELAY);
		let name = createGUID();
		ns.purchaseServer(name, ram);
		servers.push(name);
		ns.tprintf('purchased server ' + name);
	}

	while (exponent <= MAX_EXPONENT) {
		exponent += 1;
		ram = Math.pow(2, exponent);
		cost = ns.getPurchasedServerCost(ram);

		servers = ns.getPurchasedServers();
		for (const server of servers) {
			let current_ram = ns.getServerMaxRam(server);
			if (current_ram >= ram)
				continue;

			while (ns.getServerMoneyAvailable(ROOT) < cost)
				await ns.sleep(DELAY);
			ns.upgradePurchasedServer(server, ram);
			ns.tprintf('upgraded server ' + server);
		}
	}
}