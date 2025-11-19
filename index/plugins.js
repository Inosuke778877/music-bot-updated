import { Spotify } from '../plugins/spotify.js';
import { Deezer } from '../plugins/deezer.js';
import { AppleMusic } from '../plugins/applemusic.js';
import { Lyrics } from '../plugins/lyrics.js';

export function initializePlugins(client) {
    const lyricsPlugin = new Lyrics({ geniusKey: process.env.GENIUS_API_KEY });
    lyricsPlugin.load(client.riffy);

    if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
        const spotify = new Spotify({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET
        });
        spotify.load(client.riffy);
        console.log('✅ Spotify plugin loaded');
    }

    const deezer = new Deezer();
    deezer.load(client.riffy);
    console.log('✅ Deezer plugin loaded');

    const appleMusic = new AppleMusic();
    appleMusic.load(client.riffy);
    console.log('✅ Apple Music plugin loaded');
}
