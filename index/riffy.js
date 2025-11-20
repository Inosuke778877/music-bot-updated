import { Riffy } from 'riffy';
import client from './client.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { __dirname } from './client.js';

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
    console.log(`✅ Node "${node.name}" connected (${node.options.host}:${node.options.port})`);
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

export default client.riffy;
