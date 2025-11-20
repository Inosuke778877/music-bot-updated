
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import commandHandler from '../handlers/commandHandler.js';
import eventHandler from '../handlers/eventHandler.js';
import { getThumbnail } from '../utils/getThumbnail.js';
import emoji from '../utils/emoji.js';
import { createEmbed } from '../utils/embedBuilder.js';
import { Dynamic } from 'musicard';

function formatTime(ms) {
    if (!ms || isNaN(ms)) return '00:00';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function initializeEvents(client) {
    client.riffy.nodes.forEach(node => {
    console.log('Node object keys:', Object.keys(node));
    console.log('Node object:', node);
});

client.riffy.on("trackStart", async (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    if (!channel) return;

    try {
        const thumbnail = getThumbnail(track);
        
        const musicCard = await Dynamic({
            thumbnailImage: thumbnail || 'https://cdn.discordapp.com/attachments/1220001571228880917/1220001571690123284/01.png',
            backgroundImage: thumbnail || 'https://cdn.discordapp.com/attachments/1220001571228880917/1220001571690123284/01.png',
            imageDarkness: 60,
            backgroundColor: '#070707',
            progress: 0,
            progressColor: '#ffffffff',
            progressBarColor: '#5F2D00',
            name: track.info.title.length > 30 ? track.info.title.substring(0, 30) + '...' : track.info.title,
            nameColor: '#ffffffff',
            author: track.info.author.length > 30 ? track.info.author.substring(0, 30) + '...' : track.info.author,
            authorColor: '#696969',
        });

        const attachment = new AttachmentBuilder(musicCard, { name: 'musiccard.png' });

        const embed = createEmbed()
            .setTitle(`${emoji.music} Now Playing`)
            .setDescription(`**[${track.info.title}](${track.info.uri})**`)
            .addFields(
                { name: `${emoji.author} Author`, value: track.info.author, inline: true },
                { name: `${emoji.duration} Duration`, value: formatTime(track.info.length), inline: true },
                { name: `${emoji.info} Source`, value: track.info.sourceName || 'Unknown', inline: true }
            )
            .setImage('attachment://musiccard.png');

        if (track.requester && track.requester.displayAvatarURL) {
            const avatarURL = track.requester.displayAvatarURL({ dynamic: true, size: 256 });
            embed.setThumbnail(avatarURL);
            embed.setFooter({ 
                text: `Requested by ${track.requester.tag || track.requester.username}`,
                iconURL: avatarURL
            });
        }

        const pauseButton = new ButtonBuilder()
            .setCustomId('pause')
            .setEmoji(emoji.pause)
            .setStyle(ButtonStyle.Secondary);

        const skipButton = new ButtonBuilder()
            .setCustomId('skip')
            .setEmoji(emoji.skip)
            .setStyle(ButtonStyle.Primary);

        const stopButton = new ButtonBuilder()
            .setCustomId('stop')
            .setEmoji(emoji.stop)
            .setStyle(ButtonStyle.Danger);

        const loopButton = new ButtonBuilder()
            .setCustomId('loop')
            .setEmoji(emoji.loop)
            .setStyle(ButtonStyle.Success);

        const shuffleButton = new ButtonBuilder()
            .setCustomId('shuffle')
            .setEmoji(emoji.shuffle)
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(pauseButton, skipButton, stopButton, loopButton, shuffleButton);

        const msg = await channel.send({ embeds: [embed], files: [attachment], components: [row] });

        const collector = msg.createMessageComponentCollector({ 
            time: track.info.length || 600000
        });

        collector.on('collect', async (interaction) => {
            const member = interaction.member;

            if (!member.voice.channel) {
                return interaction.reply({ content: `${emoji.error} You need to be in a voice channel!`, ephemeral: true });
            }

            if (player.voiceChannel !== member.voice.channel.id) {
                return interaction.reply({ content: `${emoji.error} You need to be in the same voice channel!`, ephemeral: true });
            }

            switch (interaction.customId) {
                case 'pause':
                    if (player.paused) {
                        player.pause(false);
                        await interaction.reply({ content: `${emoji.play} Resumed the music!`, ephemeral: true });
                        
                        pauseButton.setEmoji(emoji.pause);
                        await msg.edit({ components: [row] });
                    } else {
                        player.pause(true);
                        await interaction.reply({ content: `${emoji.pause} Paused the music!`, ephemeral: true });
                        
                        pauseButton.setEmoji(emoji.play);
                        await msg.edit({ components: [row] });
                    }
                    break;

                case 'skip':
                    if (!player.queue.length && !player.current) {
                        return interaction.reply({ content: `${emoji.error} No more songs in queue!`, ephemeral: true });
                    }
                    player.stop();
                    await interaction.reply({ content: `${emoji.skip} Skipped the song!`, ephemeral: true });
                    break;

                case 'stop':
                    player.queue.clear();
                    player.stop();
                    if (!player.twentyFourSeven) {
                        player.destroy();
                    }
                    await interaction.reply({ content: `${emoji.stop} Stopped the music!`, ephemeral: true });
                    collector.stop();
                    break;

                case 'loop':
                    if (player.loop === 'none') {
                        player.setLoop('track');
                        await interaction.reply({ content: `${emoji.loop} Looping current track!`, ephemeral: true });
                    } else if (player.loop === 'track') {
                        player.setLoop('queue');
                        await interaction.reply({ content: `${emoji.loop} Looping queue!`, ephemeral: true });
                    } else {
                        player.setLoop('none');
                        await interaction.reply({ content: `${emoji.loop} Loop disabled!`, ephemeral: true });
                    }
                    break;

                case 'shuffle':
                    if (player.queue.length < 2) {
                        return interaction.reply({ content: `${emoji.error} Not enough songs in queue to shuffle!`, ephemeral: true });
                    }
                    player.queue.shuffle();
                    await interaction.reply({ content: `${emoji.shuffle} Shuffled the queue!`, ephemeral: true });
                    break;
            }
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    pauseButton.setDisabled(true),
                    skipButton.setDisabled(true),
                    stopButton.setDisabled(true),
                    loopButton.setDisabled(true),
                    shuffleButton.setDisabled(true)
                );
            await msg.edit({ components: [disabledRow] }).catch(() => {});
        });

    } catch (error) {
        console.error('Error creating music card:', error);
        
        const embed = createEmbed()
            .setTitle(`${emoji.music} Now Playing`)
            .setDescription(`**[${track.info.title}](${track.info.uri})**`)
            .addFields(
                { name: `${emoji.author} Author`, value: track.info.author, inline: true },
                { name: `${emoji.duration} Duration`, value: formatTime(track.info.length), inline: true },
                { name: `${emoji.info} Source`, value: track.info.sourceName || 'Unknown', inline: true }
            );

        const trackThumbnail = getThumbnail(track);
        if (trackThumbnail) embed.setImage(trackThumbnail);

        if (track.requester && track.requester.displayAvatarURL) {
            const avatarURL = track.requester.displayAvatarURL({ dynamic: true, size: 256 });
            embed.setThumbnail(avatarURL);
            embed.setFooter({ 
                text: `Requested by ${track.requester.tag || track.requester.username}`,
                iconURL: avatarURL
            });
        }

        channel.send({ embeds: [embed] }).catch(console.error);
    }
});


    client.riffy.on("queueEnd", async (player) => {
        const channel = client.channels.cache.get(player.textChannel);
        
        if (player.twentyFourSeven) {
            if (channel && !player.isAutoplay) {
                const embed = createEmbed()
                    .setDescription(`${emoji.info} Queue ended. 24/7 mode is active, staying in voice channel.`);
                channel.send({ embeds: [embed] }).catch(console.error);
            }
            
            if (player.isAutoplay) {
                await player.autoplay(player);
            }
            return;
        }

        if (player.isAutoplay) {
            await player.autoplay(player);
        } else {
            if (channel) {
                const embed = createEmbed()
                    .setDescription(`${emoji.success} Queue has ended. Leaving voice channel.`);
                channel.send({ embeds: [embed] }).catch(console.error);
            }
            
            setTimeout(() => {
                if (player && !player.playing) player.destroy();
            }, 1000);
        }
    });

    client.riffy.on("trackError", async (player, track, error) => {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel) return;

        console.error(`Track error: ${track.info.title}`, error);

        const embed = createEmbed()
            .setDescription(`${emoji.error} Error playing **${track.info.title}**`);

        channel.send({ embeds: [embed] }).catch(console.error);
    });

    client.riffy.on("trackStuck", async (player, track, thresholdMs) => {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel) return;

        const embed = createEmbed()
            .setDescription(`${emoji.warning} Track **${track.info.title}** stuck. Skipping...`);

        channel.send({ embeds: [embed] }).catch(console.error);
        
        if (player.queue.length > 0) {
            player.stop();
        } else {
            player.destroy();
        }
    });

    await commandHandler(client);
    eventHandler(client);

    client.on("raw", d => {
        if (client.riffy) client.riffy.updateVoiceState(d);
    });

    client.once('clientReady', (c) => {
        console.log(`✅ Ready! Logged in as ${c.user.tag}`);
        console.log(`📊 Serving ${client.guilds.cache.size} guilds`);
        
        client.riffy.init(client.user.id);
        client.user.setActivity(`${client.prefix}help | Music 🎵`, { type: 2 });
    });

    client.on('error', error => console.error('Client error:', error));
    client.on('warn', info => console.warn('Client warning:', info));

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        process.exit(1);
    });
}

export { formatTime };
