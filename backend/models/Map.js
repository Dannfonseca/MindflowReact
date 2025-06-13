// Arquivo: /models/Map.js
// Descrição: Schema do mapa atualizado para suportar compartilhamento público e links nos tópicos.
import mongoose from 'mongoose';
const { Schema } = mongoose;

const LinkSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true }
}, { _id: false });

const TopicSchema = new Schema({
    text: { type: String, required: true },
    links: { type: [LinkSchema], default: [] }
}, { _id: false });

const NodeSchema = new Schema({
    id: { type: String, required: true },
    left: { type: String, required: true },
    top: { type: String, required: true },
    width: { type: String },
    height: { type: String },
    topics: { type: [TopicSchema], default: [] }
}, { _id: false });

const MapSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        default: 'Mapa Mental Sem Título'
    },
    nodes: {
        type: [NodeSchema],
        default: []
    },
    connections: {
        type: Array,
        default: []
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    shareId: {
        type: String,
        unique: true,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Map', MapSchema);