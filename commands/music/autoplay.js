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
                .setDescription(`${emoji.error} Nothing is playing!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!message.member.voice.channel || message.member.voice.channel.id !== player.voiceChannel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in the same voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        player.isAutoplay = !player.isAutoplay;

        const embed = createEmbed()
            .setDescription(`${emoji.shuffle} Autoplay is now **${player.isAutoplay ? 'enabled' : 'disabled'}**`)
            .addFields({
                name: `${emoji.info} Info`,
                value: player.isAutoplay 
                    ? 'The bot will automatically play related songs when the queue ends.' 
                    : 'The bot will stop playing when the queue ends.'
            });

        message.channel.send({ embeds: [embed] });
    }
};
