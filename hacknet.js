const ROOT = "home";

/** @param {NS} ns */
export async function purchaseNode(ns) {
	while (ns.getServerMoneyAvailable(ROOT) < ns.hacknet.getPurchaseNodeCost())
		await ns.sleep(100);
	ns.hacknet.purchaseNode();
	await ns.sleep(100);
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	if (ns.getHostname() != ROOT) {
		let message = "calling " + ns.getScriptName() + " not from " + ROOT;
		ns.toast(message, ns.enums.ToastVariant.ERROR);
		ns.exit();
	}

	var data = ns.flags([
		["level", 200],
		["ram", 64],
		["cores", 16],
	]);

	const NODE_MAX_LEVEL = data.level;
	const NODE_MAX_RAM = data.ram;
	const NODE_MAX_CORES = data.cores;

	var currentNode = 0;
	var lastNode = ns.hacknet.maxNumNodes();
	if (ns.hacknet.numNodes() == 0) {
		await purchaseNode(ns);
		ns.toast("Purchased hacknet node " + currentNode);
	}

	while (currentNode < lastNode) {
		let stats = ns.hacknet.getNodeStats(currentNode);

		let level = stats.level;
		while (level < NODE_MAX_LEVEL) {
			while (ns.getServerMoneyAvailable(ROOT) < ns.hacknet.getLevelUpgradeCost(currentNode, 1))
				await ns.sleep(100);
			ns.hacknet.upgradeLevel(currentNode, 1);
			level += 1;
		}

		let ram = stats.ram;
		while (ram < NODE_MAX_RAM) {
			while (ns.getServerMoneyAvailable(ROOT) < ns.hacknet.getRamUpgradeCost(currentNode, 1))
				await ns.sleep(100);
			ns.hacknet.upgradeRam(currentNode, 1);
			ram *= 2;
		}

		let cores = stats.cores;
		while (cores < NODE_MAX_CORES) {
			while (ns.getServerMoneyAvailable(ROOT) < ns.hacknet.getCoreUpgradeCost(currentNode, 1))
				await ns.sleep(100);
			ns.hacknet.upgradeCore(currentNode, 1);
			cores += 1;
		}

		currentNode += 1;
		if (currentNode == ns.hacknet.numNodes()) {
			await purchaseNode(ns);
			ns.toast("Purchased hacknet node " + currentNode);
		}
	}

}