import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'volume',
    aliases: ['vol'],
    description: 'Set the volume',
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
                .setDescription(`${emoji.volume} Current volume: **${player.volume}%**`);
            return message.channel.send({ embeds: [embed] });
        }

        const volume = parseInt(args[0]);

        if (isNaN(volume) || volume < 0 || volume > 200) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Volume must be between 0 and 200!`);
            return message.channel.send({ embeds: [embed] });
        }

        player.setVolume(volume);

        const embed = createEmbed()
            .setDescription(`${emoji.volume} Volume set to **${volume}%**`);
        message.channel.send({ embeds: [embed] });
    }
};
