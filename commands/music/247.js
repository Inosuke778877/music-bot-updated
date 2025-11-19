import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: '247',
    aliases: ['24/7', 'stay', 'alwayson'],
    description: 'Toggle 24/7 mode (bot stays in VC even when queue ends)',
    execute: async (message, args, client) => {
        if (!message.member.voice.channel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in a voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        let player = client.riffy.players.get(message.guild.id);

        if (!player) {
            player = client.riffy.createConnection({
                guildId: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id,
                deaf: true
            });
        }

        if (player.voiceChannel && player.voiceChannel !== message.member.voice.channel.id) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in the same voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        player.twentyFourSeven = !player.twentyFourSeven;

        const embed = createEmbed()
            .setDescription(`${emoji.success} 24/7 mode is now **${player.twentyFourSeven ? 'enabled' : 'disabled'}**`)
            .addFields({
                name: `${emoji.info} Info`,
                value: player.twentyFourSeven 
                    ? 'The bot will stay in the voice channel even when the queue ends.' 
                    : 'The bot will leave the voice channel when the queue ends.'
            });

        message.channel.send({ embeds: [embed] });
    }
};
