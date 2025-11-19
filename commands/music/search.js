import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'search',
    aliases: ['s', 'find'],
    description: 'Search for songs from multiple sources',
    execute: async (message, args, client) => {
        if (!message.member.voice.channel) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need to be in a voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Please provide a search query!\nUsage: \`${client.prefix}search <song name>\``);
            return message.channel.send({ embeds: [embed] });
        }

        const query = args.join(' ');

        const searchingEmbed = createEmbed()
            .setDescription(`${emoji.search} Searching for **${query}**...\nSources: YouTube, Spotify, Apple Music, Deezer`);

        const searchMsg = await message.channel.send({ embeds: [searchingEmbed] });

        try {
            const results = [];

            const ytSearch = await client.riffy.resolve({ 
                query: `ytsearch:${query}`,
                requester: message.author 
            });
            
            if (ytSearch?.tracks?.length) {
                results.push(...ytSearch.tracks.slice(0, 3).map(track => ({
                    source: 'youtube',
                    track
                })));
            }

            if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
                try {
                    const spotifySearch = await client.riffy.resolve({ 
                        query: `spsearch:${query}`,
                        requester: message.author 
                    });
                    
                    if (spotifySearch?.tracks?.length) {
                        results.push(...spotifySearch.tracks.slice(0, 2).map(track => ({
                            source: 'spotify',
                            track
                        })));
                    }
                } catch (err) {
                    console.error('Spotify search error:', err);
                }
            }

            try {
                const amSearch = await client.riffy.resolve({ 
                    query: `amsearch:${query}`,
                    requester: message.author 
                });
                
                if (amSearch?.tracks?.length) {
                    results.push(...amSearch.tracks.slice(0, 2).map(track => ({
                        source: 'applemusic',
                        track
                    })));
                }
            } catch (err) {
                console.error('Apple Music search error:', err);
            }

            try {
                const deezerSearch = await client.riffy.resolve({ 
                    query: `dzsearch:${query}`,
                    requester: message.author 
                });
                
                if (deezerSearch?.tracks?.length) {
                    results.push(...deezerSearch.tracks.slice(0, 2).map(track => ({
                        source: 'deezer',
                        track
                    })));
                }
            } catch (err) {
                console.error('Deezer search error:', err);
            }

            if (!results.length) {
                const embed = createEmbed()
                    .setDescription(`${emoji.error} No results found for **${query}**`);
                return searchMsg.edit({ embeds: [embed] });
            }

            const sourceEmojis = {
                youtube: emoji.youtube,
                spotify: emoji.spotify,
                applemusic: emoji.applemusic,
                deezer: emoji.deezer
            };

            const options = results.slice(0, 25).map((result, index) => {
                const duration = formatTime(result.track.info.length);
                return new StringSelectMenuOptionBuilder()
                    .setLabel(`${result.track.info.title.substring(0, 90)}`)
                    .setDescription(`${result.track.info.author.substring(0, 40)} • ${duration}`)
                    .setValue(`${index}`)
                    .setEmoji(sourceEmojis[result.source]);
            });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('search_select')
                .setPlaceholder('Select songs to play')
                .setMinValues(1)
                .setMaxValues(Math.min(options.length, 10))
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const embed = createEmbed()
                .setTitle(`${emoji.search} Search Results`)
                .setDescription(`Found **${results.length}** results for **${query}**\n\nSelect up to 10 songs to play:`)
                .setFooter({ text: 'Selection expires in 60 seconds' });

            await searchMsg.edit({ embeds: [embed], components: [row] });

            const collector = searchMsg.createMessageComponentCollector({ 
                filter: i => i.user.id === message.author.id,
                time: 60000 
            });

            collector.on('collect', async (interaction) => {
                if (interaction.customId !== 'search_select') return;

                await interaction.deferUpdate();

                let player = client.riffy.players.get(message.guild.id);

                if (!player) {
                    player = client.riffy.createConnection({
                        guildId: message.guild.id,
                        voiceChannel: message.member.voice.channel.id,
                        textChannel: message.channel.id,
                        deaf: true
                    });
                }

                const selectedIndexes = interaction.values.map(v => parseInt(v));
                const selectedTracks = selectedIndexes.map(i => results[i]);

                for (const result of selectedTracks) {
                    result.track.requester = message.author;
                    player.queue.add(result.track);
                }

                const embed = createEmbed()
                    .setDescription(`${emoji.success} Added **${selectedTracks.length}** song(s) to the queue!`);

                await searchMsg.edit({ embeds: [embed], components: [] });

                if (!player.playing && !player.paused) {
                    player.play();
                }

                collector.stop();
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    const embed = createEmbed()
                        .setDescription(`${emoji.warning} Search selection timed out.`);
                    await searchMsg.edit({ embeds: [embed], components: [] }).catch(() => {});
                }
            });

        } catch (error) {
            console.error('Search error:', error);
            const embed = createEmbed()
                .setDescription(`${emoji.error} An error occurred while searching.`);
            await searchMsg.edit({ embeds: [embed] }).catch(() => {});
        }
    }
};

function formatTime(ms) {
    if (!ms || isNaN(ms)) return '00:00';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
