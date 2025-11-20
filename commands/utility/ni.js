export default {
    name: 'nodeinfo',
    aliases: ['ni'],
    description: 'Debug node information',
    execute: async (message, args, client) => {
        console.log('=== RIFFY NODE MAP ===');
        const allNodes = Array.from(client.riffy.nodeMap.values());
        
        allNodes.forEach(node => {
            console.log('Node name:', node.name);
            console.log('Node keys:', Object.keys(node));
            console.log('isConnected:', node.isConnected);
            console.log('==================');
        });
        
        message.channel.send(`Checked ${allNodes.length} nodes. See console for details.`);
    }
};
