/*
  Arquivo: models/Flashcard.js
  Descrição: Novo Schema para armazenar os flashcards no banco de dados.
*/
import mongoose from 'mongoose';
const { Schema } = mongoose;

const FlashcardSchema = new Schema({
    map: {
        type: Schema.Types.ObjectId,
        ref: 'Map',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    front: {
        type: String,
        required: true,
        trim: true
    },
    back: {
        type: String,
        trim: true
    },
    sourceNodeId: {
        type: String,
    },
    sourceTopicText: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

FlashcardSchema.index({ map: 1 });

export default mongoose.model('Flashcard', FlashcardSchema);