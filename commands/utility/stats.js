import { version as djsVersion } from 'discord.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';
import os from 'os';

export default {
    name: 'stats',
    aliases: ['statistics', 'info', 'botinfo'],
    description: 'Show bot statistics',
    execute: async (message, args, client) => {
        const uptime = formatUptime(process.uptime());
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        const usedMem = memUsage.heapUsed;
        
        const memoryUsed = (usedMem / 1024 / 1024).toFixed(2);
        const memoryTotal = (totalMem / 1024 / 1024).toFixed(2);
        const memoryPercent = ((usedMem / totalMem) * 100).toFixed(2);

        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        const totalCommands = client.commands.size;

        const activePlayers = client.riffy.players.size;
        let totalQueued = 0;
        let totalPlaying = 0;

        let nodes = 1;

        client.riffy.players.forEach(player => {
            totalQueued += player.queue.length;
            if (player.playing) totalPlaying++;
        });

        const cpuUsage = process.cpuUsage();
        const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2);

        const embed = createEmbed()
            .setTitle(`${emoji.info} ${client.user.username} Statistics`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                {
                    name: `${emoji.info} General`,
                    value: [
                        `**Uptime:** ${uptime}`,
                        `**Ping:** ${client.ws.ping}ms`,
                        `**Node.js:** ${process.version}`,
                        `**Discord.js:** v${djsVersion}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: `<:emoji_37:1414635203934294138> Bot Stats`,
                    value: [
                        `**Guilds:** ${client.guilds.cache.size}`,
                        `**Users:** ${totalUsers.toLocaleString()}`,
                        `**Channels:** ${totalChannels}`,
                        `**Commands:** ${totalCommands}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: `${emoji.music} Music Stats`,
                    value: [
                        `**Active Players:** ${activePlayers}`,
                        `**Playing Now:** ${totalPlaying}`,
                        `**Queued Tracks:** ${totalQueued}`,
                        `**Lavalink Nodes:** ${nodes}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: `<:discotoolsxyzicon5:1415193715420561471> System`,
                    value: [
                        `**Memory:** ${memoryUsed}MB / ${memoryTotal}MB`,
                        `**Usage:** ${memoryPercent}%`,
                        `**CPU:** ${cpuPercent}%`,
                        `**Platform:** ${os.platform()}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: `<:shuffle:1424004241625972807> System Info`,
                    value: [
                        `**OS:** ${os.type()} ${os.release()}`,
                        `**CPU Cores:** ${os.cpus().length}`,
                        `**CPU Model:** ${os.cpus()[0].model.split(' ').slice(0, 3).join(' ')}`,
                        `**Arch:** ${os.arch()}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: `${emoji.playlist} Sources`,
                    value: [
                        `${emoji.youtube} YouTube`,
                        `${emoji.spotify} Spotify`,
                        `${emoji.applemusic} Apple Music`,
                        `${emoji.deezer} Deezer`
                    ].join('\n'),
                    inline: true
                }
            )
            .setFooter({ 
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
}
