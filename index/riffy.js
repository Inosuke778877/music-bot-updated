import { Riffy } from 'riffy';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function initializeRiffy(client) {
    const lavalinkConfig = JSON.parse(
        readFileSync(join(__dirname, '../lavalink.json'), 'utf8')
    );

    const nodes = lavalinkConfig.nodes.map(node => ({
        name: node.name,
        host: node.host,
        port: parseInt(node.port),
        password: node.password,
        secure: node.secure || false
    }));

    client.riffy = new Riffy(client, nodes, {
        send: (payload) => {
            const guild = client.guilds.cache.get(payload.d.guild_id);
            if (guild) guild.shard.send(payload);
        },
        defaultSearchPlatform: lavalinkConfig.options.defaultSearchPlatform || "ytmsearch",
        restVersion: lavalinkConfig.options.restVersion || "v4"
    });

    client.riffy.on("nodeConnect", node => {
        console.log(`✅ Node "${node.name}" connected`);
    });

    client.riffy.on("nodeError", (node, error) => {
        console.error(`❌ Node "${node.name}" error:`, error.message);
    });

    client.riffy.on("nodeDisconnect", (node) => {
        console.log(`⚠️ Node "${node.name}" disconnected`);
    });

    client.riffy.on("nodeReconnect", (node) => {
        console.log(`🔄 Node "${node.name}" reconnecting...`);
    });

    return client.riffy;
}
