import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'clearfilters',
    aliases: ['resetfilters', 'removefilters'],
    description: 'Clear all filters',
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

        player.filters.clearFilters();

        const embed = createEmbed()
            .setDescription(`${emoji.success} Cleared all filters!`);
        message.channel.send({ embeds: [embed] });
    }
};
