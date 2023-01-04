const HOME = 'home';

const WEAKEN_SCRIPT = "/scripts/weaken.js";
const GROW_SCRIPT = "/scripts/grow.js";
const HACK_SCRIPT = "/scripts/hack.js";

const SCRIPTS = [WEAKEN_SCRIPT, GROW_SCRIPT, HACK_SCRIPT];

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
		if (!ns.hasRootAccess(child))
			continue;
		if (ns.getServerMaxRam(child) == 0)
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

/** 
 * @param {NS} ns 
 * @param {string} scripts 
 * @param {string} target 
 * @param {number} threads 
 * @param {number} delay
 * */
function start_threads(ns, script, target, threads, delay) {
	let servers = getServers(ns);
	let ram = ns.getScriptRam(script);
	for (const server of servers) {
		let free_ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
		let server_threads = Math.floor(free_ram / ram);
		if (server_threads == 0)
			continue;
		if (threads - server_threads < 0)
			server_threads = threads;
		ns.exec(script, server, server_threads, target, delay);
		threads -= server_threads;
		if (threads <= 0) break;
	}
	return threads;
}


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");

	const target = ns.args.shift();
	if (!ns.serverExists(target)) {
		ns.toast(target + " does not exists!", ns.enums.ToastVariant.ERROR);
		ns.exit();
	}

	const MONEY_MAX = ns.getServerMaxMoney(target);
	const SECURITY_MIN = ns.getServerMinSecurityLevel(target);

	let servers = getServers(ns);
	for (const server of servers)
		ns.scp(SCRIPTS, server, HOME);

	while (true) {
		ns.clearLog();
		let money = ns.getServerMoneyAvailable(target);
		let security = ns.getServerSecurityLevel(target);

		const WEAKEN_TIME = ns.getWeakenTime(target);

		if (SECURITY_MIN < security) {
			let weaken_threads = Math.ceil((security - SECURITY_MIN) / 0.05);
			ns.print("starting pre weaken threads (" + weaken_threads + ")");
			let rest = start_threads(ns, WEAKEN_SCRIPT, target, weaken_threads, 0);
			ns.print("starting pre weaken threads (" + (weaken_threads - rest) + " of " + weaken_threads + ")");
			await ns.sleep(WEAKEN_TIME);
		}

		let grow_threads = Math.ceil(ns.growthAnalyze(target, MONEY_MAX / money));
		let hack_threads = Math.ceil(1 / ns.hackAnalyze(target));
		let weaken_threads = Math.ceil((grow_threads * 0.004 + hack_threads * 0.002) / 0.05);

		let rest = 0;
		rest = start_threads(ns, WEAKEN_SCRIPT, target, weaken_threads, 0);
		ns.print("starting weaken threads (" + (weaken_threads - rest) + " of " + weaken_threads + ")");

		rest = start_threads(ns, GROW_SCRIPT, target, grow_threads, 0);
		ns.print("starting grow threads (" + (grow_threads - rest) + " of " + grow_threads + ")");

		rest = start_threads(ns, HACK_SCRIPT, target, hack_threads, WEAKEN_TIME * 0.6);
		ns.print("starting hack threads (" + (hack_threads - rest) + " of " + hack_threads + ")");

		await ns.sleep(WEAKEN_TIME + 1000);
	}
}