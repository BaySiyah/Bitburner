const HOME = 'home';
const REPO = "https://raw.githubusercontent.com/BaySiyah/Bitburner/main"

/** @param {NS} ns */
export async function main(ns) {

	ns.wget(REPO + "/weaken.js", "/scripts/weaken.js", HOME)
	ns.wget(REPO + "/grow.js", "/scripts/grow.js", HOME)
	ns.wget(REPO + "/hack.js", "/scripts/hack.js", HOME)

	ns.wget(REPO + "/hacknet.js", "hacknet.js", HOME)
	ns.wget(REPO + "/purchaseServers.js", "purchaseServers.js", HOME)
	ns.wget(REPO + "/purchaseServerInfo.js", "purchaseServerInfo.js", HOME)
	ns.wget(REPO + "/root.js", "root.js", HOME)
	ns.wget(REPO + "/test.js", "test.js", HOME)

}