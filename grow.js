/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args.shift();
	var delay = ns.args.shift() || 0;
	await ns.sleep(delay);
	await ns.grow(target, { stock: true });
}