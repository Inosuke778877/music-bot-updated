import Playlist from '../../models/Playlist.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';
import { getThumbnail } from '../../utils/getThumbnail.js';

export default {
    name: 'loadplaylist',
    aliases: ['loadpl'],
    description: 'Load a playlist',
    execute: async (message, args, client) => {
        if (!message.member.voice.channel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in a voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Please provide a playlist name!`);
            return message.channel.send({ embeds: [embed] });
        }

        const name = args.join(' ');

        const playlist = await Playlist.findOne({ userId: message.author.id, name });

        if (!playlist) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Playlist not found!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!playlist.tracks.length) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} This playlist is empty!`);
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

        let firstTrack = null;

        for (const track of playlist.tracks) {
            const resolve = await client.riffy.resolve({ query: track.uri, requester: message.author });
            if (resolve && resolve.tracks.length) {
                player.queue.add(resolve.tracks[0]);
                if (!firstTrack) {
                    firstTrack = resolve.tracks[0];
                }
            }
        }

        const embed = createEmbed()
            .setTitle(`${emoji.load} Loaded Playlist`)
            .setDescription(`**${name}**`)
            .addFields(
                { name: `${emoji.music} Tracks`, value: `${playlist.tracks.length}`, inline: true }
            );

        // Add thumbnail from first track
        if (firstTrack) {
            const thumbnail = getThumbnail(firstTrack);
            if (thumbnail) {
                embed.setThumbnail(thumbnail);
            }
        }

        message.channel.send({ embeds: [embed] });

        if (!player.playing && !player.paused) {
            player.play();
        }
    }
};
