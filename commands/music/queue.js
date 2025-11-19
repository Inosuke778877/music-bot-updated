import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'queue',
    aliases: ['q'],
    description: 'Show the current queue',
    execute: async (message, args, client) => {
        const player = client.riffy.players.get(message.guild.id);

        if (!player) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} No player found!`);
            return message.channel.send({ embeds: [embed] });
        }

        const current = player.current;
        const queue = player.queue;

        if (!current && queue.length === 0) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} The queue is empty!`);
            return message.channel.send({ embeds: [embed] });
        }

        const page = parseInt(args[0]) || 1;
        const perPage = 10;
        const totalPages = Math.ceil(queue.length / perPage);
        const start = (page - 1) * perPage;
        const end = start + perPage;

        let description = '';

        if (current) {
            description += `**${emoji.music} Now Playing:**\n`;
            description += `[${current.info.title}](${current.info.uri}) - ${current.info.author}\n\n`;
        }

        if (queue.length > 0) {
            description += `**${emoji.queue} Up Next:**\n`;
            const queueList = queue.slice(start, end).map((track, i) => 
                `\`${start + i + 1}.\` [${track.info.title}](${track.info.uri}) - ${track.info.author}`
            ).join('\n');
            description += queueList;
        }

        const embed = createEmbed()
            .setTitle(`${emoji.playlist} Queue for ${message.guild.name}`)
            .setDescription(description)
            .addFields(
                { name: `${emoji.info} Total Tracks`, value: `${queue.length}`, inline: true },
                { name: `${emoji.duration} Total Duration`, value: calculateTotalDuration(queue), inline: true },
                { name: `${emoji.loop} Loop`, value: player.loop || 'none', inline: true }
            );

        if (queue.length > perPage) {
            embed.setFooter({ text: `Page ${page}/${totalPages} • Use ${client.prefix}queue <page>` });
        }

        if (player.isAutoplay) {
            embed.addFields({ name: `${emoji.shuffle} Autoplay`, value: 'Enabled', inline: true });
        }

        if (player.twentyFourSeven) {
            embed.addFields({ name: `⏰ 24/7 Mode`, value: 'Enabled', inline: true });
        }

        message.channel.send({ embeds: [embed] });
    }
};

function calculateTotalDuration(queue) {
    if (!queue.length) return '0:00';
    
    const total = queue.reduce((acc, track) => acc + (track.info.length || 0), 0);
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / (1000 * 60)) % 60);
    const hours = Math.floor(total / (1000 * 60 * 60));

    return hours > 0
        ? `${hours}h ${minutes}m ${seconds}s`
        : minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;
}
