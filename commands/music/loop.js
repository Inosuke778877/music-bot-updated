import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'loop',
    description: 'Toggle loop mode',
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

        const mode = args[0]?.toLowerCase();
        let loopMode;

        switch (mode) {
            case 'track':
            case 'song':
                loopMode = 'track';
                break;
            case 'queue':
                loopMode = 'queue';
                break;
            case 'off':
            case 'none':
                loopMode = 'none';
                break;
            default:
                loopMode = player.loop === 'none' ? 'track' : 'none';
        }

        player.setLoop(loopMode);

        const embed = createEmbed()
            .setDescription(`${emoji.loop} Loop mode set to **${loopMode}**`);
        message.channel.send({ embeds: [embed] });
    }
};
