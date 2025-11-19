import Playlist from '../../models/Playlist.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'createplaylist',
    aliases: ['createpl'],
    description: 'Create a new playlist',
    execute: async (message, args, client) => {
        if (!args[0]) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Please provide a playlist name!`);
            return message.channel.send({ embeds: [embed] });
        }

        const name = args.join(' ');

        const existing = await Playlist.findOne({ userId: message.author.id, name });

        if (existing) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You already have a playlist with this name!`);
            return message.channel.send({ embeds: [embed] });
        }

        await Playlist.create({
            userId: message.author.id,
            name,
            tracks: []
        });

        const embed = createEmbed()
            .setDescription(`${emoji.success} Created playlist **${name}**!`);
        message.channel.send({ embeds: [embed] });
    }
};
