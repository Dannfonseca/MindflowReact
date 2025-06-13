// Arquivo: /routes/public.js
// Descrição: Novas rotas públicas para acessar dados sem autenticação, como mapas compartilhados.
import express from 'express';
import Map from '../models/Map.js';

const router = express.Router();

// @route   GET /api/public/maps/:shareId
// @desc    Busca um mapa público pelo seu ID de compartilhamento
// @access  Public
router.get('/maps/:shareId', async (req, res) => {
    try {
        const map = await Map.findOne({ shareId: req.params.shareId, isPublic: true });

        if (!map) {
            return res.status(404).json({ msg: 'Mapa compartilhado não encontrado ou o acesso foi revogado.' });
        }
        
        res.json(map);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

export default router;