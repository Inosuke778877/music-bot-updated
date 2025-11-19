import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'bassboost',
    aliases: ['bass'],
    description: 'Apply bassboost filter',
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

        const value = parseInt(args[0]) || 2;

        if (value < 1 || value > 5) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Value must be between 1 and 5!`);
            return message.channel.send({ embeds: [embed] });
        }

        player.filters.setBassboost(true, { value });

        const embed = createEmbed()
            .setDescription(`${emoji.filter} Applied bassboost filter with value **${value}**`);
        message.channel.send({ embeds: [embed] });
    }
};
