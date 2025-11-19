import Guild from '../../models/Guild.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'prefix',
    aliases: ['setprefix', 'changeprefix'],
    description: 'Change the bot prefix for this server',
    execute: async (message, args, client) => {
        if (!message.member.permissions.has('Administrator')) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} You need Administrator permission to change the prefix!`);
            return message.channel.send({ embeds: [embed] });
        }

        if (!args[0]) {
            let guildData = await Guild.findOne({ guildId: message.guild.id });
            const currentPrefix = guildData?.prefix || process.env.PREFIX || '!';

            const embed = createEmbed()
                .setTitle(`${emoji.info} Current Prefix`)
                .setDescription(`The current prefix for this server is: \`${currentPrefix}\``)
                .addFields({
                    name: 'Usage',
                    value: `\`${currentPrefix}prefix <new_prefix>\``
                });
            return message.channel.send({ embeds: [embed] });
        }

        const newPrefix = args[0];

        if (newPrefix.length > 5) {
            const embed = createEmbed()
                .setDescription(`${emoji.error} Prefix must be 5 characters or less!`);
            return message.channel.send({ embeds: [embed] });
        }

        try {
            let guildData = await Guild.findOne({ guildId: message.guild.id });

            if (guildData) {
                guildData.prefix = newPrefix;
                await guildData.save();
            } else {
                guildData = await Guild.create({
                    guildId: message.guild.id,
                    prefix: newPrefix
                });
            }

            if (client.guildPrefixes) {
                client.guildPrefixes.set(message.guild.id, newPrefix);
            }

            const embed = createEmbed()
                .setDescription(`${emoji.success} Prefix changed to \`${newPrefix}\``)
                .addFields({
                    name: 'Example',
                    value: `Try: \`${newPrefix}help\``
                });
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error changing prefix:', error);
            const embed = createEmbed()
                .setDescription(`${emoji.error} Failed to change prefix. Please try again.`);
            message.channel.send({ embeds: [embed] });
        }
    }
};
