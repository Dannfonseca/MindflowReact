/*
  Arquivo: /routes/maps.js
  Descrição: Corrigida a lógica de salvamento para permitir que colaboradores com permissão de edição possam salvar alterações. Apenas o dono pode deletar o mapa.
*/
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/authMiddleware.js';
import Map from '../models/Map.js';
import Permission from '../models/Permission.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    const { id, title, nodes, connections } = req.body;
    const userId = req.user.id;

    try {
        const mapFields = { user: userId, title, nodes, connections };

        let map;
        if (id) {
            const existingMap = await Map.findById(id);
            if (!existingMap) {
                return res.status(404).json({ msg: 'Mapa não encontrado.' });
            }

            const isOwner = existingMap.user.toString() === userId;
            const hasPermission = await Permission.findOne({ map: id, user: userId, permissionLevel: 'edit' });

            if (!isOwner && !hasPermission) {
                return res.status(403).json({ msg: 'Você não tem permissão para salvar este mapa.' });
            }
            
            // Se tem permissão (dono ou colaborador), atualiza o mapa.
            map = await Map.findByIdAndUpdate(id, { $set: { title, nodes, connections } }, { new: true });

        } else {
            // Criando um novo mapa
            map = new Map(mapFields);
            await map.save();
        }
        
        res.status(201).json(map);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const maps = await Map.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(maps);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/shared-with-me', authMiddleware, async (req, res) => {
    try {
        const permissions = await Permission.find({ user: req.user.id }).populate({
            path: 'map',
            populate: {
                path: 'user',
                select: 'firstName lastName'
            }
        });

        const sharedMaps = permissions.map(p => p.map).filter(map => map != null);
        res.json(sharedMaps);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});


router.post('/:mapId/share', authMiddleware, async (req, res) => {
    try {
        const map = await Map.findOne({ _id: req.params.mapId, user: req.user.id });
        if (!map) {
            return res.status(404).json({ msg: 'Mapa não encontrado ou permissão negada.' });
        }

        if (!map.shareId) {
            map.shareId = uuidv4();
        }
        map.isPublic = true;
        await map.save();

        res.json({ shareId: map.shareId });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const map = await Map.findOne({ _id: req.params.id, user: req.user.id });

        if (!map) {
            return res.status(404).json({ msg: 'Mapa não encontrado ou você não é o proprietário.' });
        }

        await map.deleteOne();
        await Permission.deleteMany({ map: req.params.id });

        res.json({ msg: 'Mapa e todas as permissões associadas foram deletados.' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Mapa não encontrado.' });
        }
        res.status(500).send('Erro no servidor');
    }
});

export default router;