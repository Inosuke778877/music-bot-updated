import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'disconnect',
    aliases: ['dc', 'leave'],
    description: 'Disconnect the bot from voice channel',
    execute: async (message, args, client) => {
        const player = client.riffy.players.get(message.guild.id);

        if (!player) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Bot is not in a voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!message.member.voice.channel || message.member.voice.channel.id !== player.voiceChannel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in the same voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        player.twentyFourSeven = false;
        player.destroy();

        const embed = createEmbed()
            .setDescription(`${emoji.success} Disconnected from the voice channel!`);
        message.channel.send({ embeds: [embed] });
    }
};
