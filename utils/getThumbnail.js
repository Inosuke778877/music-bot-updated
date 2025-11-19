export function getThumbnail(track) {
    // Check both artworkUrl and thumbnail for compatibility
    if (track.info.artworkUrl) {
        return track.info.artworkUrl;
    }
    
    if (track.info.thumbnail) {
        return track.info.thumbnail;
    }

    // Spotify tracks
    if (track.info.sourceName === 'spotify') {
        return track.info.artworkUrl || track.info.thumbnail || null;
    }

    // Deezer tracks
    if (track.info.sourceName === 'deezer') {
        return track.info.artworkUrl || track.info.thumbnail || null;
    }

    // Apple Music tracks
    if (track.info.sourceName === 'applemusic') {
        return track.info.artworkUrl || track.info.thumbnail || null;
    }

    // YouTube tracks
    if (track.info.sourceName === 'youtube' || track.info.uri?.includes('youtube.com') || track.info.uri?.includes('youtu.be')) {
        let videoId = track.info.identifier;
        
        if (track.info.uri) {
            const match = track.info.uri.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (match) {
                videoId = match[1];
            }
        }

        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
    }

    // SoundCloud thumbnails
    if (track.info.sourceName === 'soundcloud' && track.pluginInfo?.artworkUrl) {
        return track.pluginInfo.artworkUrl;
    }

    return null;
}
