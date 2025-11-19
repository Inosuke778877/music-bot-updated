import { getPrefix } from '../handlers/prefixHandler.js';
import emoji from '../utils/emoji.js';
import { createEmbed } from '../utils/embedBuilder.js';

export default {
    name: 'messageCreate',
    execute: async (message, client) => {
        if (message.author.bot || !message.guild) return;

        const prefix = await getPrefix(client, message.guild.id);
        
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || 
            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        try {
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            const embed = createEmbed()
                .setDescription(`${emoji.error} An error occurred while executing this command!`);
            message.channel.send({ embeds: [embed] });
        }
    }
};
