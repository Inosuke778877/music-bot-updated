import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function eventHandler(client) {
    const eventsPath = join(__dirname, '../events');
    const eventFiles = await readdir(eventsPath);

    for (const file of eventFiles) {
        if (!file.endsWith('.js')) continue;

        const filePath = join(eventsPath, file);
        const event = await import(`file://${filePath}`);

        if (event.default && event.default.name) {
            if (event.default.once) {
                client.once(event.default.name, (...args) => event.default.execute(...args, client));
            } else {
                client.on(event.default.name, (...args) => event.default.execute(...args, client));
            }
            console.log(`Loaded event: ${event.default.name}`);
        }
    }
}
