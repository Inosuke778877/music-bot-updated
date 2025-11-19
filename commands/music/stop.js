import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'stop',
    aliases: ['leave', 'disconnect'],
    description: 'Stop the music and clear the queue',
    execute: async (message, args, client) => {
        if (!message.member.voice.channel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in a voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        const player = client.riffy.players.get(message.guild.id);

        if (!player) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Nothing is playing!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (player.voiceChannel !== message.member.voice.channel.id) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in the same voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        player.queue.clear();
        player.stop();

        if (!player.twentyFourSeven) {
            player.destroy();
            
            const embed = createEmbed()
                .setDescription(`${emoji.stop} Stopped the music and left the voice channel!`);
            return message.channel.send({ embeds: [embed] });
        } else {
            const embed = createEmbed()
                .setDescription(`${emoji.stop} Stopped the music and cleared the queue!`)
                .setFooter({ text: '24/7 mode is active, bot will stay in VC' });
            return message.channel.send({ embeds: [embed] });
        }
    }
};
