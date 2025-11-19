import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'shuffle',
    description: 'Shuffle the queue',
    execute: async (message, args, client) => {
        const player = client.riffy.players.get(message.guild.id);

        if (!player || !player.queue.length) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} The queue is empty!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!message.member.voice.channel || message.member.voice.channel.id !== player.voiceChannel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in the same voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        player.queue.shuffle();

        const embed = createEmbed()
            .setDescription(`${emoji.shuffle} Shuffled the queue!`);
        message.channel.send({ embeds: [embed] });
    }
};
