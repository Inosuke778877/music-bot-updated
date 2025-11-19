import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embedBuilder.js';
import emoji from '../../utils/emoji.js';

function paginateLyrics(lyrics, perPage = 20) {
    const lines = lyrics.split('\n').filter(Boolean);
    const pages = [];
    for (let i = 0; i < lines.length; i += perPage) {
        pages.push(lines.slice(i, i + perPage));
    }
    return pages;
}

export default {
    name: 'lyrics',
    description: 'Get lyrics for the currently playing song',
    execute: async (message, args, client) => {
        const player = client.riffy.players.get(message.guild.id);
        if (!player || !player.current) {
            const embed = createEmbed().setDescription(`${emoji.error} No song is playing!`);
            return message.channel.send({ embeds: [embed] });
        }
        const { title, author } = player.current.info;

        const res = await client.riffy.lyrics(title, author);
        if (!res || !res.lyrics) {
            const embed = createEmbed().setDescription(`${emoji.error} Lyrics not found for **${title}**.`);
            return message.channel.send({ embeds: [embed] });
        }

        const lyricPages = paginateLyrics(res.lyrics, 20);
        let page = 0;

        const makeEmbed = (idx) => new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`${emoji.music} Lyrics — ${res.song} by ${res.artist}`)
            .setURL(res.url)
            .setDescription(lyricPages[idx].join('\n'))
            .setFooter({ text: `Page ${idx + 1} of ${lyricPages.length}` });

        const buttons = (idx, max) => new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('⬅ Prev').setStyle(ButtonStyle.Secondary).setDisabled(idx === 0),
            new ButtonBuilder().setCustomId('next').setLabel('Next ➡').setStyle(ButtonStyle.Secondary).setDisabled(idx === max - 1),
            new ButtonBuilder().setCustomId('close').setLabel('❌ Close').setStyle(ButtonStyle.Danger)
        );

        const msg = await message.channel.send({
            embeds: [makeEmbed(page)],
            components: [buttons(page, lyricPages.length)]
        });

        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                await i.reply({ content: 'Only the command author can scroll.', ephemeral: true });
                return;
            }
            if (i.customId === 'close') {
                collector.stop();
                await i.update({ embeds: [makeEmbed(page)], components: [] });
                return;
            }
            if (i.customId === 'prev' && page > 0) page--;
            if (i.customId === 'next' && page < lyricPages.length - 1) page++;
            await i.update({
                embeds: [makeEmbed(page)],
                components: [buttons(page, lyricPages.length)]
            });
        });

        collector.on('end', async () => {
            await msg.edit({ components: [] });
        });
    }
};
