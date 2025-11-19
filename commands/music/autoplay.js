import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'autoplay',
    aliases: ['ap'],
    description: 'Toggle autoplay mode',
    execute: async (message, args, client) => {
        const player = client.riffy.players.get(message.guild.id);

        if (!player) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} No player found!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!message.member.voice.channel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in a voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (player.voiceChannel !== message.member.voice.channel.id) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in the same voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        player.isAutoplay = !player.isAutoplay;

        const embed = createEmbed()
            .setDescription(`${emoji.shuffle} Autoplay is now **${player.isAutoplay ? 'enabled' : 'disabled'}**!`);

        message.channel.send({ embeds: [embed] });
    }
};
