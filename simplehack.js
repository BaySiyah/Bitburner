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
export async function delay(ns, message, delay) {
	const STEP = 1000;
	while (delay > 0) {
		ns.clearLog();
		ns.print(message);
		ns.print(ns.tFormat(delay));
		delay -= STEP;
		await ns.sleep(STEP);
	}
}


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");

	const target = ns.args.shift();
	if (!ns.serverExists(target)) {
		ns.toast(target + " does not exists!", ns.enums.ToastVariant.ERROR);
		ns.exit();
	}

	let servers = getServers(ns);
	for (const server of servers)
		ns.scp(SCRIPTS, server, HOME);

	const MONEY_MAX = ns.getServerMaxMoney(target);
	const SECURITY_MIN = ns.getServerMinSecurityLevel(target);

	while (true) {
		await ns.sleep(1000);

		let security = ns.getServerSecurityLevel(target);
		let money = ns.getServerMoneyAvailable(target);

		if (security >= SECURITY_MIN + 3) {
			let threads = Math.ceil((security - SECURITY_MIN) / 0.05);
			let time = ns.getWeakenTime(target);
			let rest = execute(ns, WEAKEN_SCRIPT, target, threads, 0);
			let message = "weaken .." + (threads - rest) + " of " + threads + " threads"
			message += "\n   money: " + ns.nFormat(money, "$(0.000)a");
			message += "\nsecurity: " + ns.nFormat(security, "0.000");
			await delay(ns, message, time);
			continue;
		}

		if (money == 0)
			money = 1;
		if (money < MONEY_MAX * 0.9) {
			let threads = Math.ceil(ns.growthAnalyze(target, MONEY_MAX / money));;
			let time = ns.getGrowTime(target);
			let rest = execute(ns, GROW_SCRIPT, target, threads, 0);
			let message = "grow .." + (threads - rest) + " of " + threads + " threads";
			message += "\n   money: " + ns.nFormat(money, "$(0.000)a");
			message += "\nsecurity: " + ns.nFormat(security, "0.000");
			await delay(ns, message, time);
			continue;
		}

		let threads = Math.ceil(0.5 / ns.hackAnalyze(target));
		let time = ns.getHackTime(target);
		let rest = execute(ns, HACK_SCRIPT, target, threads, 0);
		let message = "hack .. " + (threads - rest) + " of " + threads + " threads";
		message += "\n   money: " + ns.nFormat(money, "$(0.000)a");
		message += "\nsecurity: " + ns.nFormat(security, "0.000");
		await delay(ns, message, time);
	}
}