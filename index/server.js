import http from 'http';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { __dirname } from './client.js';

export function initializeServer(client, mongoose) {
    const server = http.createServer(async (req, res) => {
        try {
            const filePath = join(__dirname, '../index.html');
            const content = await readFile(filePath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    });

    server.listen(3000, () => {
        console.log('🌐 HTTP server running on port 3000');
    });

    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down...');
        
        if (client.riffy && client.riffy.players) {
            client.riffy.players.forEach(player => {
                try {
                    player.destroy();
                } catch (err) {
                    console.error('Error destroying player:', err);
                }
            });
        }
        
        mongoose.connection.close(() => {
            console.log('✅ MongoDB closed');
        });
        
        server.close(() => {
            console.log('✅ HTTP server closed');
        });
        
        client.destroy();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('🛑 SIGTERM received');
        process.exit(0);
    });

    return server;
}
