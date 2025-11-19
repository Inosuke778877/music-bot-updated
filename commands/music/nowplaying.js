import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';
import { getThumbnail } from '../../utils/getThumbnail.js';

export default {
    name: 'nowplaying',
    aliases: ['np'],
    description: 'Show the currently playing song',
    execute: async (message, args, client) => {
        const player = client.riffy.players.get(message.guild.id);

        if (!player || !player.current) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Nothing is playing!`);
            return message.channel.send({ embeds: [embed] });
        }

        const track = player.current;
        const embed = createEmbed()
            .setTitle(`${emoji.music} Now Playing`)
            .setDescription(`**[${track.info.title}](${track.info.uri})**`)
            .addFields(
                { name: `${emoji.author} Author`, value: track.info.author, inline: true },
                { name: `${emoji.duration} Duration`, value: formatTime(track.info.length), inline: true }
            );

        // Add thumbnail
        const thumbnail = getThumbnail(track);
        if (thumbnail) {
            embed.setThumbnail(thumbnail);
        }

        message.channel.send({ embeds: [embed] });
    }
};

function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
