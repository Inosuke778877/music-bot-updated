import Guild from '../models/Guild.js';

export async function getPrefix(client, guildId) {
    if (!guildId) return process.env.PREFIX || '!';

    if (client.guildPrefixes && client.guildPrefixes.has(guildId)) {
        return client.guildPrefixes.get(guildId);
    }

    try {
        const guildData = await Guild.findOne({ guildId });
        const prefix = guildData?.prefix || process.env.PREFIX || '!';
        
        if (client.guildPrefixes) {
            client.guildPrefixes.set(guildId, prefix);
        }
        
        return prefix;
    } catch (error) {
        console.error('Error fetching prefix:', error);
        return process.env.PREFIX || '$';
    }
}

export async function loadAllPrefixes(client) {
    try {
        const guilds = await Guild.find({});
        guilds.forEach(guild => {
            client.guildPrefixes.set(guild.guildId, guild.prefix);
        });
        console.log(`✅ Loaded ${guilds.length} guild prefixes`);
    } catch (error) {
        console.error('Error loading prefixes:', error);
    }
}
