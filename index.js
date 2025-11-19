import client from './index/client.js';
import { initializeRiffy } from './index/riffy.js';
import { initializePlugins } from './index/plugins.js';
import { initializeEvents } from './index/events.js';
import { initializeDatabase } from './index/database.js';
import { initializeServer } from './index/server.js';

(async () => {
    initializeRiffy(client);
    initializePlugins(client);
    initializeEvents(client);
    
    const mongoose = await initializeDatabase(client);
    initializeServer(client, mongoose);

    await client.login(process.env.DISCORD_TOKEN).catch(error => {
        console.error('❌ Failed to login:', error);
        process.exit(1);
    });
})();
