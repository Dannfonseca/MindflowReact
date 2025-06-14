/*
  Arquivo: routes/flashcards.js
  Descrição: Ajustada a rota GET para '/map/:mapId' para corresponder à chamada do frontend.
*/
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Map from '../models/Map.js';
import Permission from '../models/Permission.js';
import Flashcard from '../models/Flashcard.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    const { mapId, front, back, deck } = req.body;
    const userId = req.user.id;
    try {
        const map = await Map.findById(mapId);
        if (!map) return res.status(404).json({ msg: 'Mapa não encontrado.' });

        const isOwner = map.user.toString() === userId;
        const hasPermission = await Permission.findOne({ map: mapId, user: userId });

        if (!isOwner && !hasPermission) {
            return res.status(403).json({ msg: 'Você não tem permissão para adicionar flashcards a este mapa.' });
        }
        const newFlashcard = new Flashcard({ map: mapId, user: userId, front, back, deck });
        await newFlashcard.save();
        res.status(201).json(newFlashcard);
    } catch (err) {
        res.status(500).send('Erro no servidor');
    }
});

router.get('/map/:mapId', authMiddleware, async (req, res) => {
    try {
        const map = await Map.findById(req.params.mapId);
        if (!map) return res.status(404).json({ msg: 'Mapa não encontrado.' });
        
        const isOwner = map.user.toString() === req.user.id;
        const hasPermission = await Permission.findOne({ map: req.params.mapId, user: req.user.id });

        if (!isOwner && !hasPermission) {
            return res.status(403).json({ msg: 'Você não tem permissão para ver os flashcards deste mapa.' });
        }
        const flashcards = await Flashcard.find({ map: req.params.mapId }).sort({ createdAt: 'asc' });
        res.json(flashcards);
    } catch (err) {
        res.status(500).send('Erro no servidor');
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const flashcard = await Flashcard.findById(req.params.id);
        if (!flashcard) return res.status(404).json({ msg: 'Flashcard não encontrado.' });

        if (flashcard.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Ação não autorizada.' });
        }
        await flashcard.deleteOne();
        res.json({ msg: 'Flashcard removido com sucesso.' });
    } catch (err) {
        res.status(500).send('Erro no servidor');
    }
});

export default router;