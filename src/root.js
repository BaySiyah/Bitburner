const ROOT = 'home';

/** 
 * @param {NS} ns 
 * @param {String} server 
 * @param {String} parent 
 * @param {String[]} servers 
*/
function appendChildren(ns, server, parent, servers) {
	const children = ns.scan(server);
	for (const child of children) {
		if (['darkweb', 'home', parent].includes(child))
			continue;
		servers.push(child);
		appendChildren(ns, child, server, servers);
	}
}

/** @param {NS} ns */
function getServers(ns) {
	var servers = [];
	appendChildren(ns, ROOT, '', servers);
	servers.sort();
	return servers;
}


/** @param {NS} ns */
export async function main(ns) {
	var servers = getServers(ns);

	var portFunctions = {
		ssh: ns.brutessh.bind(ns),
		ftp: ns.ftpcrack.bind(ns),
		smtp: ns.relaysmtp.bind(ns),
		http: ns.httpworm.bind(ns),
		sql: ns.sqlinject.bind(ns)
	};
	if (!ns.fileExists('BruteSSH.exe', ROOT))
		portFunctions.ssh = null;
	if (!ns.fileExists('FTPCrack.exe', ROOT))
		portFunctions.ftp = null;
	if (!ns.fileExists('relaySMTP.exe', ROOT))
		portFunctions.smtp = null;
	if (!ns.fileExists('HTTPWorm.exe', ROOT))
		portFunctions.http = null;
	if (!ns.fileExists('SQLInject.exe', ROOT))
		portFunctions.sql = null;

	for (const server of servers) {
		let data = ns.getServer(server);
		if (data.purchasedByPlayer || data.openPortCount == 5 && data.hasAdminRights)
			continue;

		if (!data.sshPortOpen && portFunctions.ssh != null)
			portFunctions.ssh(server);
		if (!data.ftpPortOpen && portFunctions.ftp != null)
			portFunctions.ftp(server);
		if (!data.smtpPortOpen && portFunctions.smtp != null)
			portFunctions.smtp(server);
		if (!data.httpPortOpen && portFunctions.http != null)
			portFunctions.http(server);
		if (!data.sqlPortOpen && portFunctions.sql != null)
			portFunctions.sql(server);

		if (data.hasAdminRights)
			continue;

		data = ns.getServer(server);
		if (data.openPortCount >= data.numOpenPortsRequired) {
			ns.nuke(server);
			ns.toast('Nuked ' + server, ns.enums.ToastVariant.SUCCESS);
		}
	}
}