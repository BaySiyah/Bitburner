const HOME = 'home';
const TARGET = 'n00dles';

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
	var servers = [HOME];
	appendChildren(ns, HOME, '', servers);
	servers.sort();
	return servers;
}


/** @param {NS} ns */
export async function main(ns) {
	const MONEY_MAX = ns.getServerMaxMoney(TARGET);
	const SECURITY_MIN = ns.getServerMinSecurityLevel(TARGET);

	const WEAKEN_RAM = ns.getScriptRam(WEAKEN_SCRIPT, HOME);
	const GROW_RAM = ns.getScriptRam(GROW_SCRIPT, HOME);
	const HACK_RAM = ns.getScriptRam(HACK_SCRIPT, HOME);

	let servers = getServers(ns);
	for (const server of servers)
		ns.scp(SCRIPTS, server, HOME);

	while (true) {
		let money = ns.getServerMoneyAvailable(TARGET);
		let security = ns.getServerSecurityLevel(TARGET);

		const WEAKEN_TIME = ns.getWeakenTime(TARGET);

		if (SECURITY_MIN < security) {
			let threads_left = Math.ceil((security - SECURITY_MIN) / 0.05);
			for (const server of servers) {
				let free_ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
				let threads = Math.floor(free_ram / WEAKEN_RAM);
				if (threads == 0) continue;
				ns.exec(WEAKEN_SCRIPT, server, threads, TARGET);
				threads_left -= threads;
				if (threads_left <= 0) break;
			}
			await ns.sleep(WEAKEN_TIME);
		}

		let grow_threads = Math.ceil(ns.growthAnalyze(TARGET, MONEY_MAX / money));
		let hack_threads = Math.ceil(1 / ns.hackAnalyze(TARGET));
		let weaken_threads = Math.ceil((grow_threads * 0.004 + hack_threads * 0.002) / 0.05);

		for (const server of servers) {
			let free_ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
			let threads = Math.floor(free_ram / WEAKEN_RAM);
			if (threads == 0) continue;
			ns.exec(WEAKEN_SCRIPT, server, threads, TARGET);
			weaken_threads -= threads;
			if (weaken_threads <= 0) break;
		}

		for (const server of servers) {
			let free_ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
			let threads = Math.floor(free_ram / GROW_RAM);
			if (threads == 0) continue;
			ns.exec(GROW_SCRIPT, server, threads, TARGET);
			grow_threads -= threads;
			if (grow_threads <= 0) break;
		}

		for (const server of servers) {
			let free_ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
			let threads = Math.floor(free_ram / HACK_RAM);
			if (threads == 0) continue;
			ns.exec(HACK_SCRIPT, server, threads, TARGET, WEAKEN_TIME * 0.6);
			hack_threads -= threads;
			if (hack_threads <= 0) break;
		}

		await ns.sleep(WEAKEN_TIME + 1000);
	}
}