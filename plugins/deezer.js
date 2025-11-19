import { Plugin, Track } from 'riffy';

const REGEX = /(?:https:\/\/(?:www\.deezer\.com|link\.deezer\.com)\/(?:[a-zA-Z-]+)\/)?(track|album|playlist)\/(\d+)/;

export class Deezer extends Plugin {
    constructor(options = {}) {
        super();
        this.baseURL = "https://api.deezer.com";
        this.options = options;

        this.functions = {
            track: this.getTrack.bind(this),
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
        return REGEX.test(finalQuery) && 
               (finalQuery.includes('deezer.com') || finalQuery.includes('link.deezer.com'));
    }

    async resolveLink(url) {
        if (!url.includes("link.deezer.com")) return url;
        try {
            const res = await fetch(url, { method: "HEAD", redirect: "follow" });
            return res.url;
        } catch (error) {
            console.error('Error resolving Deezer short link:', error);
            return url;
        }
    }

    async resolve({ query, requester }) {
        const node = this.riffy.leastUsedNodes[0];
        const trackLoaded = node.restVersion === "v4" ? "track" : "TRACK_LOADED";
        const playlistLoaded = node.restVersion === "v4" ? "playlist" : "PLAYLIST_LOADED";
        const loadFailed = node.restVersion === "v4" ? "error" : "LOAD_FAILED";

        const finalQuery = query.query || query;
        
        if (!this.check(finalQuery)) {
            return this._resolve({ query, requester });
        }
        
        const resolvedURL = await this.resolveLink(finalQuery);
        const [, type, id] = resolvedURL.match(REGEX) || [];

        if (type in this.functions) {
            try {
                const data = await this.functions[type](id);
                
                if (!data || !data.tracks || !data.tracks.length) {
                    console.error('Deezer: No tracks found');
                    return this._resolve({ query, requester });
                }

                const tracks = await Promise.all(
                    data.tracks.map(track => this.buildUnresolved(track, requester))
                );
                const name = ["playlist", "album"].includes(type) ? data.name : null;
                return this.buildResponse(type === "track" ? trackLoaded : playlistLoaded, tracks, name, null);
            } catch (e) {
                console.error('Deezer resolve error:', e.message);
                return this._resolve({ query, requester });
            }
        }

        return this._resolve({ query, requester });
    }

    async getTrack(id) {
        try {
            const data = await fetch(`${this.baseURL}/track/${id}`).then(res => res.json());
            
            if (data.error) {
                throw new Error(data.error.message || 'Deezer API error');
            }

            if (!data.id || !data.title) {
                throw new Error('Invalid track data from Deezer');
            }

            return {
                tracks: [{
                    id: data.id,
                    title: data.title,
                    author: data.artist?.name || data.contributors?.[0]?.name || "Unknown",
                    duration: data.duration * 1000,
                    thumbnail: data.album?.cover_xl || data.album?.cover_big || data.album?.cover_medium || data.album?.cover || null,
                }],
            };
        } catch (error) {
            console.error(`Deezer getTrack error for ID ${id}:`, error.message);
            throw error;
        }
    }

    async getAlbum(id) {
        try {
            const data = await fetch(`${this.baseURL}/album/${id}`).then(res => res.json());
            
            if (data.error) {
                throw new Error(data.error.message || 'Deezer API error');
            }

            if (!data.tracks || !data.tracks.data || !data.tracks.data.length) {
                throw new Error('No tracks found in album');
            }

            const albumCover = data.cover_xl || data.cover_big || data.cover_medium || data.cover || null;

            return {
                name: data.title,
                tracks: data.tracks.data.map(track => ({
                    id: track.id,
                    title: track.title,
                    author: track.artist?.name || data.artist?.name || "Unknown",
                    duration: track.duration * 1000,
                    thumbnail: albumCover,
                })),
            };
        } catch (error) {
            console.error(`Deezer getAlbum error for ID ${id}:`, error.message);
            throw error;
        }
    }

    async getPlaylist(id) {
        try {
            const data = await fetch(`${this.baseURL}/playlist/${id}`).then(res => res.json());
            
            if (data.error) {
                throw new Error(data.error.message || 'Deezer API error');
            }

            if (!data.tracks || !data.tracks.data || !data.tracks.data.length) {
                throw new Error('No tracks found in playlist');
            }

            return {
                name: data.title,
                tracks: data.tracks.data.map(track => ({
                    id: track.id,
                    title: track.title,
                    author: track.artist?.name || "Unknown",
                    duration: track.duration * 1000,
                    thumbnail: track.album?.cover_xl || track.album?.cover_big || track.album?.cover_medium || track.album?.cover || null,
                })),
            };
        } catch (error) {
            console.error(`Deezer getPlaylist error for ID ${id}:`, error.message);
            throw error;
        }
    }

    async buildUnresolved(track, requester) {
        if (!track) throw new ReferenceError("Deezer track object not provided");
        const node = this.riffy.leastUsedNodes[0];

        return new Track({
            track: "",
            info: {
                identifier: track.id.toString(),
                isSeekable: true,
                author: track.author || "Unknown",
                length: track.duration,
                isStream: false,
                sourceName: "deezer",
                title: track.title,
                uri: `https://www.deezer.com/track/${track.id}`,
                artworkUrl: track.thumbnail,
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
