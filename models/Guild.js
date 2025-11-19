import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    prefix: {
        type: String,
        default: '!'
    },
    settings: {
        twentyFourSeven: {
            type: Boolean,
            default: false
        },
        autoplay: {
            type: Boolean,
            default: false
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Guild', guildSchema);
