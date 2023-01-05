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
	var data = ns.flags([
		["exponent", 1],
		["delay", 5000],
	]);

	if (data.exponent < 1 || data.exponent > 20) {
		ns.tprint("ERROR   exponent has to be a number between 1 and 20!");
		ns.exit();
	}
	if (data.delay < 0) {
		ns.tprint("ERROR   delay must be greater than 0!");
		ns.exit();
	}

	var delay = data.delay;
	var exponent = data.exponent;
	var ram = Math.pow(2, exponent);

	var servers = ns.getPurchasedServers();
	var cost = ns.getPurchasedServerCost(ram);

	while (servers.length < ns.getPurchasedServerLimit()) {
		while (ns.getServerMoneyAvailable(ROOT) < cost)
			await ns.sleep(DELAY);
		let name = createGUID();
		ns.purchaseServer(name, ram);
		servers.push(name);
		ns.toast("Purchased a new server " + ramFormat(ns, ram), ns.enums.ToastVariant.INFO);
		await ns.sleep(delay);
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
			ns.toast("Upgraded server " + ramFormat(ns, ram), ns.enums.ToastVariant.INFO);
			await ns.sleep(delay);
		}
	}
}