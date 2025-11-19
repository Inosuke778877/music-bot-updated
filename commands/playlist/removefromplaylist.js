import Playlist from '../../models/Playlist.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'removefromplaylist',
    aliases: ['removepl'],
    description: 'Remove a song from playlist',
    execute: async (message, args, client) => {
        if (!args[0] || !args[1]) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Usage: !removefromplaylist <playlist name> <track number>`);
            return message.channel.send({ embeds: [embed] });
        }

        const trackIndex = parseInt(args[args.length - 1]) - 1;
        const name = args.slice(0, -1).join(' ');

        if (isNaN(trackIndex)) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Invalid track number!`);
            return message.channel.send({ embeds: [embed] });
        }

        const playlist = await Playlist.findOne({ userId: message.author.id, name });

        if (!playlist) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Playlist not found!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (trackIndex < 0 || trackIndex >= playlist.tracks.length) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Invalid track number!`);
            return message.channel.send({ embeds: [embed] });
        }

        const removed = playlist.tracks.splice(trackIndex, 1)[0];
        await playlist.save();

        const embed = createEmbed()
            .setDescription(`${emoji.remove} Removed **${removed.title}** from playlist **${name}**!`);
        message.channel.send({ embeds: [embed] });
    }
};
