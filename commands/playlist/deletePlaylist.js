import Playlist from '../../models/Playlist.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'deleteplaylist',
    aliases: ['deletepl'],
    description: 'Delete a playlist',
    execute: async (message, args, client) => {
        if (!args[0]) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Please provide a playlist name!`);
            return message.channel.send({ embeds: [embed] });
        }

        const name = args.join(' ');

        const playlist = await Playlist.findOneAndDelete({ userId: message.author.id, name });

        if (!playlist) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Playlist not found!`);
            return message.channel.send({ embeds: [embed] });
        }

        const embed = createEmbed()
            .setDescription(`${emoji.success} Deleted playlist **${name}**!`);
        message.channel.send({ embeds: [embed] });
    }
};
