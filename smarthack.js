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
 * */
function getAvailableThreads(ns, script, target) {
	let servers = getServers(ns);
	let ram = ns.getScriptRam(script);
	let total = 0;
	for (const server of servers)
		total += Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ram);
	return total;
}

/** 
 * @param {NS} ns 
 * @param {string} scripts 
 * @param {string} target 
 * @param {number} threads 
 * @param {number} delay
 * */
function execute(ns, script, target, threads, delay) {
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

/** 
 * @param {NS} ns 
 * @param {string} message 
 * @param {number} delay
 * */
export async function delay(ns, message, delay, target) {
	const STEP = 1000;
	const MONEY_TEXT = " | " + ns.nFormat(ns.getServerMaxMoney(target), "$(0.000)a");
	const SECURITY_TEXT = " | " + ns.nFormat(ns.getServerMinSecurityLevel(target), "0.000");
	while (delay > 0) {
		ns.clearLog();
		let money = ns.getServerMoneyAvailable(target);
		let security = ns.getServerSecurityLevel(target);
		ns.print(target);
		ns.print(ns.nFormat(money, "$(0.000)a") + MONEY_TEXT);
		ns.print(ns.nFormat(security, "0.000") + SECURITY_TEXT);
		ns.print(message);
		ns.print(ns.tFormat(delay));
		delay -= STEP;
		await ns.sleep(STEP);
	}
}


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	// ns.tail();

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

	let security = ns.getServerSecurityLevel(target);
	while (security > SECURITY_MIN) {
		let time = ns.getWeakenTime(target);
		let threads = Math.floor(1 + (security - SECURITY_MIN) / 0.05);
		execute(ns, WEAKEN_SCRIPT, target, threads, 0);
		await delay(ns, "pre weaken", time, target);
		security = ns.getServerSecurityLevel(target);
	}

	let money = ns.getServerMoneyAvailable(target);
	while (money < MONEY_MAX) {
		let time = ns.getWeakenTime(target);
		let grow_threads = Math.floor(1 + ns.growthAnalyze(target, MONEY_MAX / money));
		let weaken_threads = Math.floor(1 + (grow_threads * 0.004) / 0.05);

		let available = getAvailableThreads(ns, GROW_SCRIPT, target);
		if ((grow_threads + weaken_threads) > available) {
			weaken_threads = Math.floor(1 + (available * 0.004) / 0.05);
			grow_threads = available - weaken_threads;
		}

		execute(ns, GROW_SCRIPT, target, grow_threads, 0);
		execute(ns, WEAKEN_SCRIPT, target, weaken_threads, 0);
		await delay(ns, "grow " + grow_threads, time * 0.8, target);
		await delay(ns, "weaken " + weaken_threads, time * 0.2, target);
		money = ns.getServerMoneyAvailable(target);
	}


	while (true) {
		ns.clearLog();
		let money = ns.getServerMoneyAvailable(target);
		let time = ns.getWeakenTime(target);

		let grow_threads = Math.floor(1 + ns.growthAnalyze(target, MONEY_MAX / money));
		let hack_threads = Math.floor(1 + 0.6 / ns.hackAnalyze(target));
		let weaken_threads = Math.floor(1 + (grow_threads * 0.004 + hack_threads * 0.002) / 0.05);

		let rest = 0;
		let message = "weaken | grow | hack\n  ";
		rest = execute(ns, WEAKEN_SCRIPT, target, weaken_threads, 0);
		message += ns.nFormat((weaken_threads - rest) / weaken_threads, '000%') + " | ";

		rest = execute(ns, GROW_SCRIPT, target, grow_threads, 0);
		message += ns.nFormat((grow_threads - rest) / grow_threads, '000%') + " | ";

		rest = execute(ns, HACK_SCRIPT, target, hack_threads, time * 0.6);
		message += ns.nFormat((hack_threads - rest) / hack_threads, '000%') + "\n";

		await delay(ns, message + "grow", time * 0.8, target);
		money = ns.getServerMoneyAvailable(target);
		await delay(ns, message + "hack", time * 0.05, target);
		let hacked_money = money - ns.getServerMoneyAvailable(target);
		await delay(ns, message + "weaken", time * 0.15, target);
		if (hacked_money > 0)
			ns.tprintf("SUCCESS  " + ns.nFormat(hacked_money, "$(0.000)a") + " -> " + target);
		await ns.sleep(1000);
	}
}