import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

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

        if (resolve.loadType === 'playlist' || resolve.loadType === 'PLAYLIST_LOADED') {
            for (const track of resolve.tracks) {
                track.requester = message.author;
                player.queue.add(track);
            }

            const embed = createEmbed()
                .setDescription(`${emoji.playlist} Added playlist **${resolve.playlistInfo.name}** with **${resolve.tracks.length}** tracks to the queue!`);

            message.channel.send({ embeds: [embed] });
        } else {
            const track = resolve.tracks[0];
            track.requester = message.author;
            player.queue.add(track);

            const embed = createEmbed()
                .setDescription(`${emoji.add} Added **[${track.info.title}](${track.info.uri})** to the queue!`);

            message.channel.send({ embeds: [embed] });
        }

        if (!player.playing && !player.paused) {
            player.play();
        }
    }
};
