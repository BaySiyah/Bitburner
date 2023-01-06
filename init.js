const HOME = 'home';
const REPO = "https://raw.githubusercontent.com/BaySiyah/Bitburner/main"

/** @param {NS} ns */
export async function main(ns) {

	ns.wget(REPO + "/scripts/weaken.js", "/scripts/weaken.js", HOME)
	ns.wget(REPO + "/scripts/grow.js", "/scripts/grow.js", HOME)
	ns.wget(REPO + "/scripts/hack.js", "/scripts/hack.js", HOME)
	ns.wget(REPO + "/scripts/share.js", "/scripts/share.js", HOME)

	ns.wget(REPO + "/buyServers.js", "buyServers.js", HOME)
	ns.wget(REPO + "/hacknet.js", "hacknet.js", HOME)
	ns.wget(REPO + "/killAllScripts.js", "killAllScripts.js", HOME)
	ns.wget(REPO + "/root.js", "root.js", HOME)
	ns.wget(REPO + "/smarthack.js", "smarthack.js", HOME)
	ns.wget(REPO + "/start_share.js", "start_share.js", HOME)
	ns.wget(REPO + "/start_smarthacks.js", "start_smarthacks.js", HOME)
}