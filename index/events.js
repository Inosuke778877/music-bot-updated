import { AttachmentBuilder } from 'discord.js';
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
            progressColor: '#00FF00',
            progressBarColor: '#5F2D00',
            name: track.info.title.length > 30 ? track.info.title.substring(0, 30) + '...' : track.info.title,
            nameColor: '#00FF00',
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

        channel.send({ embeds: [embed], files: [attachment] }).catch(console.error);
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
