// File: models/TokenFileMap.js

import mongoose from 'mongoose';

const TokenFileMapSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    filename: {
        type: String,
        required: true
    }
});

export default mongoose.models.TokenFileMap || mongoose.model('TokenFileMap', TokenFileMapSchema);
