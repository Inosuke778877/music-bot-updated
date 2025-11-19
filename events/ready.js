export default {
    name: 'clientReady',
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        // Initialize Riffy
        client.riffy.init(client.user.id);
        
        client.user.setActivity('Music 🎵', { type: 'LISTENING' });
    }
};
