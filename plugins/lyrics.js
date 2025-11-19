import { Plugin } from 'riffy';
import fetch from 'node-fetch'; // or global fetch in Node 18+
import * as cheerio from 'cheerio';

export class Lyrics extends Plugin {
    constructor({ geniusKey }) {
        super();
        this.geniusKey = geniusKey;
    }

    async load(riffy) {
        this.riffy = riffy;
        this._resolve = riffy.resolve.bind(riffy);

        riffy.lyrics = async (title, author) => {
            // Search Genius
            const query = encodeURIComponent(`${title} ${author}`);
            const searchURL = `https://api.genius.com/search?q=${query}&access_token=${this.geniusKey}`;
            const res = await fetch(searchURL).then(r => r.json());

            if (!res.response.hits.length) return null;
            // Find hit with exact title and artist if possible
            let songHit = res.response.hits.find(h =>
                 h.result.title.toLowerCase().includes(title.toLowerCase())
                 && h.result.primary_artist.name.toLowerCase().includes(author.toLowerCase())
            ) || res.response.hits[0];

            const lyricsURL = songHit.result.url;
            // Scrape lyrics (Genius API does NOT directly return lyrics text)
            const page = await fetch(lyricsURL).then(r => r.text());
            const $ = cheerio.load(page);
            const lyricsBlocks = $('[data-lyrics-container="true"]');
            let lyrics = '';
            lyricsBlocks.each((_, el) => {
                // Convert <br>, <a> tags to text
                $(el).find('br').replaceWith('\n');
                $(el).find('a').replaceWith(function() { return $(this).text(); });
                lyrics += $(el).text() + '\n';
            });
            lyrics = lyrics.trim();

            return {
                lyrics,
                song: songHit.result.title,
                artist: songHit.result.primary_artist.name,
                url: lyricsURL
            };
        };
    }
}
