const ROOT = 'home';
const REPO = 'https://raw.githubusercontent.com/BaySiyah/Bitburner/main'

/** @param {NS} ns */
export async function main(ns) {

	var files = [
		'scripts/grow.js',
		'scripts/hack.js',
		'scripts/share.js',
		'scripts/weaken.js',
		'buyServers.js',
		'hacknet.js',
		'killAllScripts.js',
		'monitor.js',
		'root.js',
		'simplehack.js',
		'smarthack.js',
		'share.js',
		'start_smarthacks.js',
	]

	ns.tprintf('downloading files from ' + REPO);
	for (const file of files) {
		let source = file;
		let target = file;
		if (file.includes('/'))
			target = '/' + file

		if (ns.fileExists(target, ROOT))
			ns.rm(target, ROOT);
		ns.wget(REPO + source, target, ROOT);
		ns.tprintf('  -> ' + file);
		ns.tprintf('SUCCESS  downloaded ' + files.length + ' file(s)');
	}
}
