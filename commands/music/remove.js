import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'remove',
    aliases: ['rm'],
    description: 'Remove a track from the queue',
    execute: async (message, args, client) => {
        const player = client.riffy.players.get(message.guild.id);

        if (!player) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Nothing is playing!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!message.member.voice.channel || message.member.voice.channel.id !== player.voiceChannel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in the same voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Please provide a track position! Usage: \`${client.prefix}remove <position>\``);
            return message.channel.send({ embeds: [embed] });
        }

        const position = parseInt(args[0]) - 1;

        if (isNaN(position) || position < 0 || position >= player.queue.length) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Invalid position! Must be between 1 and ${player.queue.length}`);
            return message.channel.send({ embeds: [embed] });
        }

        const removed = player.queue.remove(position);

        const embed = createEmbed()
            .setDescription(`${emoji.remove} Removed **[${removed.info.title}](${removed.info.uri})** from the queue!`);

        message.channel.send({ embeds: [embed] });
    }
};
