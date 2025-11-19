import Guild from '../../models/Guild.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'load',
    aliases: ['pl-load'],
    description: 'Load and play a saved playlist',
    execute: async (message, args, client) => {
        if (!message.member.voice.channel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in a voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Please provide a playlist name!\nUsage: \`${client.prefix}load <playlist name>\``);
            return message.channel.send({ embeds: [embed] });
        }

        const playlistName = args.join(' ').toLowerCase();

        try {
            const guildData = await Guild.findOne({ guildId: message.guild.id });

            if (!guildData || !guildData.playlists || guildData.playlists.length === 0) {
                const embed = createEmbed()
                    .setDescription(`${emoji.error} No playlists found for this server!`);
                return message.channel.send({ embeds: [embed] });
            }

            const playlistData = guildData.playlists.find(pl => pl.name.toLowerCase() === playlistName);

            if (!playlistData) {
                const embed = createEmbed()
                    .setDescription(`${emoji.error} Playlist **${playlistName}** not found!`);
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

            const loadingEmbed = createEmbed()
                .setDescription(`${emoji.load} Loading playlist **${playlistData.name}**...`);
            const msg = await message.channel.send({ embeds: [loadingEmbed] });

            let loaded = 0;
            for (const trackData of playlistData.tracks) {
                try {
                    const result = await client.riffy.resolve({ 
                        query: trackData.uri, 
                        requester: message.author 
                    });
                    
                    if (result && result.tracks && result.tracks.length > 0) {
                        const track = result.tracks[0];
                        track.requester = message.author;
                        player.queue.add(track);
                        loaded++;
                    }
                } catch (err) {
                    console.error(`Failed to load track ${trackData.title}:`, err);
                }
            }

            const embed = createEmbed()
                .setDescription(`${emoji.success} Loaded **${loaded}/${playlistData.tracks.length}** tracks from playlist **${playlistData.name}**!`);
            await msg.edit({ embeds: [embed] });

            if (!player.playing && !player.paused) {
                player.play();
            }

        } catch (error) {
            console.error('Load playlist error:', error);
            const embed = createEmbed()
                .setDescription(`${emoji.error} Failed to load playlist!`);
            message.channel.send({ embeds: [embed] });
        }
    }
};
