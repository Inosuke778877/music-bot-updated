import Playlist from '../../models/Playlist.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'myplaylists',
    aliases: ['playlists'],
    description: 'Show your playlists',
    execute: async (message, args, client) => {
        const playlists = await Playlist.find({ userId: message.author.id });

        if (!playlists.length) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You don't have any playlists!`);
            return message.channel.send({ embeds: [embed] });
        }

        const list = playlists.map((pl, i) => 
            `${i + 1}. **${pl.name}** - ${pl.tracks.length} track(s)`
        ).join('\n');

        const embed = createEmbed()
            .setTitle(`${emoji.playlist} Your Playlists`)
            .setDescription(list);

        message.channel.send({ embeds: [embed] });
    }
};
