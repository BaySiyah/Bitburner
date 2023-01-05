const HOME = 'home';
const REPO = "https://raw.githubusercontent.com/BaySiyah/Bitburner/main"

/** @param {NS} ns */
export async function main(ns) {

	ns.wget(REPO + "/weaken.js", "/scripts/weaken.js", HOME)
	ns.wget(REPO + "/grow.js", "/scripts/grow.js", HOME)
	ns.wget(REPO + "/hack.js", "/scripts/hack.js", HOME)

	ns.wget(REPO + "/root.js", "root.js", HOME)
	ns.wget(REPO + "/hacknet.js", "hacknet.js", HOME)
	ns.wget(REPO + "/buyServers.js", "buyServers.js", HOME)
	ns.wget(REPO + "/simplehack.js", "simplehack.js", HOME)
	ns.wget(REPO + "/smarthack.js", "smarthack.js", HOME)
	ns.wget(REPO + "/start_smarthack.js", "start_smarthack.js", HOME)

}