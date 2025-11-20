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
        const memoryTotal = (totalMem / 1024 / 1024 / 1024).toFixed(2);
        const memoryPercent = ((usedMem / totalMem) * 100).toFixed(2);

        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        const totalCommands = client.commands.size;

        const activePlayers = client.riffy.players.size;
        let totalQueued = 0;
        let totalPlaying = 0;

        client.riffy.players.forEach(player => {
            totalQueued += player.queue.length;
            if (player.playing) totalPlaying++;
        });

        const nodeStats = [];
        let onlineNodes = 0;
        let offlineNodes = 0;

        const allNodes = Array.from(client.riffy.nodeMap.values());
        
        allNodes.forEach((node) => {
            const isConnected = node.connected === true;
            const status = isConnected ? '🟢 Online' : '🔴 Offline';
            
            if (isConnected) {
                onlineNodes++;
            } else {
                offlineNodes++;
            }

            const playersOnNode = Array.from(client.riffy.players.values()).filter(
                p => p.node && p.node.name === node.name
            ).length;

            const parts = [`**${node.name}** ${status}`, `Players: ${playersOnNode}`];
            
            if (node.stats && node.stats.uptime) {
                parts.push(`Uptime: ${formatUptime(node.stats.uptime / 1000)}`);
            }

            nodeStats.push(parts.join(' • '));
        });

        const embed = createEmbed()
            .setTitle(`${emoji.info} ${client.user.username} Statistics`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                {
                    name: `${emoji.info} General`,
                    value: [
                        `${emoji.uptime} **Uptime:** ${uptime}`,
                        `${emoji.ping} **Ping:** ${client.ws.ping}ms`,
                        `${emoji.server} **Node.js:** ${process.version}`,
                        `${emoji.commands} **Discord.js:** v${djsVersion}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: `${emoji.server} Bot Stats`,
                    value: [
                        `${emoji.server} **Guilds:** ${client.guilds.cache.size}`,
                        `${emoji.users} **Users:** ${totalUsers.toLocaleString()}`,
                        `${emoji.channels} **Channels:** ${totalChannels}`,
                        `${emoji.commands} **Commands:** ${totalCommands}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: `${emoji.music} Music Stats`,
                    value: [
                        `${emoji.play} **Active Players:** ${activePlayers}`,
                        `${emoji.music} **Playing Now:** ${totalPlaying}`,
                        `${emoji.queue} **Queued Tracks:** ${totalQueued}`,
                        `${emoji.node} **Nodes:** ${onlineNodes} 🟢 / ${offlineNodes} 🔴`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: `${emoji.memory} System Resources`,
                    value: [
                        `${emoji.memory} **Memory:** ${memoryUsed}MB / ${memoryTotal}GB`,
                        `${emoji.memory} **Usage:** ${memoryPercent}%`,
                        `${emoji.cpu} **Platform:** ${os.platform()}`,
                        `${emoji.cpu} **Arch:** ${os.arch()}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: `${emoji.cpu} System Info`,
                    value: [
                        `${emoji.server} **OS:** ${os.type()} ${os.release()}`,
                        `${emoji.cpu} **CPU Cores:** ${os.cpus().length}`,
                        `${emoji.cpu} **CPU Model:** ${os.cpus()[0].model.split(' ').slice(0, 3).join(' ')}`,
                        `${emoji.uptime} **System Uptime:** ${formatUptime(os.uptime())}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: `${emoji.music} Music Sources`,
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

        if (nodeStats.length > 0) {
            embed.addFields({
                name: `${emoji.node} Lavalink Nodes (${allNodes.length})`,
                value: nodeStats.join('\n'),
                inline: false
            });
        }

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
