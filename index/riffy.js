import { Riffy } from 'riffy';

export function initializeRiffy(client) {
    const nodes = [{
        name: 'main-node',
        host: process.env.LAVALINK_HOST || 'localhost',
        port: parseInt(process.env.LAVALINK_PORT) || 2333,
        password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
        secure: process.env.LAVALINK_SECURE === 'true'
    }];

    client.riffy = new Riffy(client, nodes, {
        send: (payload) => {
            const guild = client.guilds.cache.get(payload.d.guild_id);
            if (guild) guild.shard.send(payload);
        },
        defaultSearchPlatform: "ytmsearch",
        restVersion: "v4"
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

    return client.riffy;
}
