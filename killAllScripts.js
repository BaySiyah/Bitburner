/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args.shift();
    if (target != null) {
        if (!ns.serverExists(target)) {
            ns.tprintf('ERROR    "' + target + '" does not exist!', ns.enums.ToastVariant.INFO, 3000);
            ns.exit();
        }
        ns.killall(target);
        ns.toast('Killed all on ' + target, ns.enums.ToastVariant.INFO, 3000);
    }
    else {
        var servers = getServers(ns);
        for (const server of servers)
            ns.killall(server)
        ns.toast('Killed all scripts', ns.enums.ToastVariant.INFO, 3000);
    }
}

/** @param {NS} ns */
function getServers(ns) {
    function scanServers(ns, server, visited) {
        visited.push(server);
        let children = ns.scan(server);
        for (const child of children) {
            if (visited.indexOf(child) == -1)
                scanServers(ns, child, visited);
        }
    }
    var servers = [];
    scanServers(ns, ROOT, servers);
    servers.sort();
    return servers;
}