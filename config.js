import dotenv from 'dotenv';
dotenv.config();

export default {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  prefix: process.env.PREFIX || '!',
  mongoUri: process.env.MONGO_URI,
  lavalink: {
    host: process.env.LAVALINK_HOST,
    port: parseInt(process.env.LAVALINK_PORT),
    password: process.env.LAVALINK_PASSWORD,
    secure: process.env.LAVALINK_SECURE === 'true'
  },
  embedColor: 0x00FF00 // Green color
};
