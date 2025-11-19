import mongoose from 'mongoose';
import { loadAllPrefixes } from '../handlers/prefixHandler.js';

export async function initializeDatabase(client) {
    await mongoose.connect(process.env.MONGODB_URI)
        .then(async () => {
            console.log('✅ Connected to MongoDB');
            await loadAllPrefixes(client);
        })
        .catch(err => console.error('❌ MongoDB error:', err));

    mongoose.connection.on('error', err => console.error('MongoDB error:', err));
    mongoose.connection.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));

    return mongoose;
}
