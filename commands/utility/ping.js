import emoji from '../../utils/emoji.js';
import { createEmbed } from '../../utils/embedBuilder.js';

export default {
    name: 'ping',
    description: 'Check bot latency',
    execute: async (message, args, client) => {
        const embed = createEmbed()
            .setDescription(`${emoji.success} Pong! Latency: **${client.ws.ping}ms**`);

        message.channel.send({ embeds: [embed] });
    }
};
