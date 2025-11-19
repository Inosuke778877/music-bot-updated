import { Plugin, Track } from 'riffy';

const REGEX = /https?:\/\/music\.apple\.com\/[a-zA-Z-]+\/(album|playlist|song)\/[a-zA-Z0-9\-.]+\/([0-9]+)(?:\?i=([0-9]+))?/;

export class AppleMusic extends Plugin {
    constructor(options = {}) {
        super();
        this.options = options;
        this.baseURL = "https://itunes.apple.com/lookup";

        this.functions = {
            song: this.getTrack.bind(this),
            album: this.getAlbum.bind(this),
            playlist: this.getPlaylist.bind(this),
        };
    }

    async load(riffy) {
        this.riffy = riffy;
        this._resolve = riffy.resolve.bind(riffy);
        riffy.resolve = this.resolve.bind(this);
    }

    check(query) {
        const finalQuery = query.query || query;
        return /music\.apple\.com/i.test(finalQuery);
    }

    async resolve({ query, requester }) {
        const node = this.riffy.leastUsedNodes[0];
        const trackLoaded = node.restVersion === "v4" ? "track" : "TRACK_LOADED";
        const playlistLoaded = node.restVersion === "v4" ? "playlist" : "PLAYLIST_LOADED";
        const loadFailed = node.restVersion === "v4" ? "error" : "LOAD_FAILED";

        const finalQuery = query.query || query;
        const [, type, id, trackId] = finalQuery.match(REGEX) || [];

        if (!type || !(type in this.functions)) return this._resolve({ query, requester });

        try {
            let data;
            if (type === "album" && trackId) {
                // If album URL has ?i=TRACK_ID, treat as a single track
                data = await this.getTrack(trackId);
            } else {
                data = await this.functions[type](id);
            }

            const loadType = type === "song" || trackId ? trackLoaded : playlistLoaded;
            const name = ["playlist", "album"].includes(type) && !trackId ? data.name : null;

            const tracks = await Promise.all(
                data.tracks.map(track => this.buildUnresolved(track, requester))
            );

            return this.buildResponse(loadType, tracks, name, null);
        } catch (e) {
            console.error('Apple Music resolve error:', e);
            return this.buildResponse(loadFailed, null, null, e.message || null);
        }
    }

    async getTrack(id) {
        const data = await fetch(`${this.baseURL}?id=${id}`).then(r => r.json());
        if (!data.results || !data.results.length) throw new Error("Track not found");

        const track = data.results[0];
        return {
            tracks: [{
                id: track.trackId,
                title: track.trackName,
                author: track.artistName,
                duration: track.trackTimeMillis || 0,
                // Replace 100x100 with larger sizes (up to 1200x1200 available)
                thumbnail: track.artworkUrl100?.replace("100x100", "600x600") || null,
                url: track.trackViewUrl,
            }],
        };
    }

    async getAlbum(id) {
        const data = await fetch(`${this.baseURL}?id=${id}&entity=song`).then(r => r.json());
        if (!data.results || !data.results.length) throw new Error("Album not found");

        const album = data.results[0];
        const tracks = data.results.filter(t => t.wrapperType === "track");

        // Get album artwork (high quality)
        const albumArtwork = album.artworkUrl100?.replace("100x100", "600x600") || null;

        return {
            name: album.collectionName,
            tracks: tracks.map(t => ({
                id: t.trackId,
                title: t.trackName,
                author: t.artistName,
                duration: t.trackTimeMillis || 0,
                // Use high-quality artwork
                thumbnail: t.artworkUrl100?.replace("100x100", "600x600") || albumArtwork,
                url: t.trackViewUrl,
            })),
        };
    }

    async getPlaylist(id) {
        // Apple Music playlists require Apple Music API token (not available via iTunes API)
        console.warn('Apple Music playlists are not fully supported without Apple Music API token');
        return {
            name: `Apple Music Playlist ${id}`,
            tracks: [],
        };
    }

    async buildUnresolved(track, requester) {
        if (!track) throw new ReferenceError("Apple Music track object not provided");
        const node = this.riffy.leastUsedNodes[0];

        return new Track({
            track: "",
            info: {
                identifier: track.id?.toString() || "",
                isSeekable: true,
                author: track.author || "Unknown",
                length: track.duration || 0,
                isStream: false,
                sourceName: "applemusic",
                title: track.title,
                uri: track.url || `https://music.apple.com/track/${track.id}`,
                artworkUrl: track.thumbnail || null,
                position: 0,
            },
        }, requester, node);
    }

    async buildResponse(loadType, tracks, name, error) {
        return {
            loadType,
            tracks,
            playlistInfo: name ? { name } : null,
            exception: error ? { message: error, severity: "COMMON" } : null,
        };
    }
}
