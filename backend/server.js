/*
  Arquivo: server.js
  Descrição: Adicionada a rota de API para gerenciar flashcards, corrigindo o erro 404.
*/
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import mapsRoutes from './routes/maps.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import permissionsRoutes from './routes/permissions.js';
import flashcardsRoutes from './routes/flashcards.js'; // Importa a rota de flashcards

import authMiddleware from './middleware/authMiddleware.js';
import adminMiddleware from './middleware/adminMiddleware.js';
import initializeSocketHandlers from './socketHandlers.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Conectado...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('API do MindFlow está rodando!'));
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/permissions', authMiddleware, permissionsRoutes);
app.use('/api/flashcards', authMiddleware, flashcardsRoutes); // Usa a rota de flashcards

initializeSocketHandlers(io);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));