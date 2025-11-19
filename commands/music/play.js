import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';
import { getThumbnail } from '../../utils/getThumbnail.js';

export default {
    name: 'play',
    aliases: ['p'],
    description: 'Play a song',
    execute: async (message, args, client) => {
        if (!message.member.voice.channel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in a voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Please provide a song name or URL!`);
            return message.channel.send({ embeds: [embed] });
        }

        const query = args.join(' ');

        let player = client.riffy.players.get(message.guild.id);

        if (!player) {
            player = client.riffy.createConnection({
                guildId: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id,
                deaf: true
            });
        }

        const resolve = await client.riffy.resolve({ query, requester: message.author });

        if (!resolve || !resolve.tracks || resolve.tracks.length === 0) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} No results found!`);
            return message.channel.send({ embeds: [embed] });
        }

        // Check if player is currently playing or has songs in queue
        const isPlaying = player.playing || player.queue.length > 0;

        if (resolve.loadType === 'playlist') {
            for (const track of resolve.tracks) {
                player.queue.add(track);
            }

            const embed = createEmbed()
                .setTitle(`${emoji.playlist} Playlist Added`)
                .setDescription(`**${resolve.playlistInfo.name}**`)
                .addFields(
                    { name: `${emoji.music} Tracks`, value: `${resolve.tracks.length}`, inline: true }
                );
            
            // Add thumbnail from first track
            const thumbnail = getThumbnail(resolve.tracks[0]);
            if (thumbnail) {
                embed.setThumbnail(thumbnail);
            }

            message.channel.send({ embeds: [embed] });
        } else {
            const track = resolve.tracks[0];
            player.queue.add(track);

            // Only send "Added to Queue" message if something is already playing
            if (isPlaying) {
                const embed = createEmbed()
                    .setTitle(`${emoji.add} Added to Queue`)
                    .setDescription(`**[${track.info.title}](${track.info.uri})**`)
                    .addFields(
                        { name: `${emoji.author} Author`, value: track.info.author, inline: true },
                        { name: `${emoji.duration} Duration`, value: formatTime(track.info.length), inline: true },
                        { name: `${emoji.queue} Position`, value: `${player.queue.length}`, inline: true }
                    );

                // Add thumbnail
                const thumbnail = getThumbnail(track);
                if (thumbnail) {
                    embed.setThumbnail(thumbnail);
                }

                message.channel.send({ embeds: [embed] });
            }
        }

        if (!player.playing && !player.paused) {
            player.play();
        }
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
