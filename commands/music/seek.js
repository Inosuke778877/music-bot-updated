import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'seek',
    description: 'Seek to a specific time',
    execute: async (message, args, client) => {
        const player = client.riffy.players.get(message.guild.id);

        if (!player || !player.current) {
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
                .setDescription(`${emoji.error} Please provide a time (e.g., 1:30)!`);
            return message.channel.send({ embeds: [embed] });
        }

        const time = parseTime(args[0]);

        if (isNaN(time) || time < 0 || time > player.current.info.length) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Invalid time!`);
            return message.channel.send({ embeds: [embed] });
        }

        player.seek(time);

        const embed = createEmbed()
            .setDescription(`${emoji.success} Seeked to **${args[0]}**`);
        message.channel.send({ embeds: [embed] });
    }
};

function parseTime(time) {
    const parts = time.split(':').reverse();
    let seconds = 0;
    
    if (parts[0]) seconds += parseInt(parts[0]);
    if (parts[1]) seconds += parseInt(parts[1]) * 60;
    if (parts[2]) seconds += parseInt(parts[2]) * 3600;
    
    return seconds * 1000;
}
