import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (client) => {
    const commandFolders = readdirSync(join(__dirname, '../commands'));

    for (const folder of commandFolders) {
        const commandFiles = readdirSync(join(__dirname, `../commands/${folder}`)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const module = await import(`../commands/${folder}/${file}`);
            const command = module.default;
            
            if (command && command.name) {
                command.category = folder;
                client.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name} [${folder}]`);
            }
        }
    }
};
