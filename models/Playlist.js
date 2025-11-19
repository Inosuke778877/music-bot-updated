import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    tracks: [{
        title: String,
        author: String,
        uri: String,
        length: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Playlist', playlistSchema);
