import { EmbedBuilder } from 'discord.js';

export function createEmbed() {
    return new EmbedBuilder()
        .setColor('#000000')
        .setTimestamp();
}
