import Playlist from '../../models/Playlist.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'addtoplaylist',
    aliases: ['addpl'],
    description: 'Add current song to playlist',
    execute: async (message, args, client) => {
        const player = client.riffy.players.get(message.guild.id);

        if (!player || !player.current) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Nothing is playing!`);
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

        const track = player.current;

        playlist.tracks.push({
            title: track.info.title,
            author: track.info.author,
            uri: track.info.uri,
            length: track.info.length
        });

        await playlist.save();

        const embed = createEmbed()
            .setDescription(`${emoji.add} Added **${track.info.title}** to playlist **${name}**!`);
        message.channel.send({ embeds: [embed] });
    }
};
