import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';
import { readdirSync } from 'fs';

export default {
    name: 'help',
    aliases: ['h', 'commands'],
    description: 'Show all available commands',
    execute: async (message, args, client) => {
        if (args[0]) {
            const commandName = args[0].toLowerCase();
            const command = client.commands.get(commandName) || 
                client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) {
                const embed = createEmbed()
                    .setDescription(`${emoji.error} Command **${commandName}** not found!`);
                return message.channel.send({ embeds: [embed] });
            }

            const embed = createEmbed()
                .setTitle(`${emoji.info} Command: ${command.name}`)
                .addFields(
                    { name: 'Description', value: command.description || 'No description', inline: false },
                    { name: 'Aliases', value: command.aliases?.length ? command.aliases.join(', ') : 'None', inline: true },
                    { name: 'Usage', value: `\`${client.prefix}${command.name}\``, inline: true }
                );

            return message.channel.send({ embeds: [embed] });
        }

        const categories = {};

        client.commands.forEach((command, commandName) => {
            if (!command.category) command.category = 'other';
            
            if (!categories[command.category]) {
                categories[command.category] = [];
            }
            
            categories[command.category].push(command);
        });

        const categoryEmojis = {
            music: emoji.music,
            playlist: emoji.playlist,
            filters: emoji.filter,
            utility: emoji.info,
            other: '📂'
        };

        const mainEmbed = createEmbed()
            .setTitle(`${emoji.info} ${client.user.username} Help`)
            .setDescription(`Total Commands: **${client.commands.size}**\nPrefix: \`${client.prefix}\`\n\nSelect a category from the dropdown below to view commands.`)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                Object.keys(categories).map(cat => ({
                    name: `${categoryEmojis[cat] || '📂'} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
                    value: `${categories[cat].length} commands`,
                    inline: true
                }))
            )
            .setFooter({ text: `Use ${client.prefix}help <command> for detailed info` });

        const options = Object.keys(categories).map(cat => 
            new StringSelectMenuOptionBuilder()
                .setLabel(cat.charAt(0).toUpperCase() + cat.slice(1))
                .setDescription(`View ${categories[cat].length} ${cat} commands`)
                .setValue(cat)
                .setEmoji(categoryEmojis[cat] || '📂')
        );

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category')
            .setPlaceholder('Select a category')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const helpMsg = await message.channel.send({ embeds: [mainEmbed], components: [row] });

        const collector = helpMsg.createMessageComponentCollector({ 
            filter: i => i.user.id === message.author.id,
            time: 120000 
        });

        collector.on('collect', async (interaction) => {
            if (interaction.customId !== 'help_category') return;

            await interaction.deferUpdate();

            const category = interaction.values[0];
            const commands = categories[category];

            const categoryEmbed = createEmbed()
                .setTitle(`${categoryEmojis[category] || '📂'} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
                .setDescription(
                    commands.map(cmd => 
                        `\`${client.prefix}${cmd.name}\`${cmd.aliases?.length ? ` (${cmd.aliases.join(', ')})` : ''} - ${cmd.description || 'No description'}`
                    ).join('\n')
                )
                .setFooter({ text: `${commands.length} commands • Use ${client.prefix}help <command> for details` });

            await helpMsg.edit({ embeds: [categoryEmbed], components: [row] });
        });

        collector.on('end', async () => {
            await helpMsg.edit({ components: [] }).catch(() => {});
        });
    }
};
