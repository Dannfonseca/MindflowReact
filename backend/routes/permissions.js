/*
  Arquivo: routes/permissions.js
  Descrição: Novas rotas de API para gerenciar o compartilhamento de mapas por convite: listar, convidar e remover colaboradores.
*/
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Map from '../models/Map.js';
import User from '../models/User.js';
import Permission from '../models/Permission.js';

const router = express.Router();

// @route   POST /api/permissions
// @desc    Convidar um usuário para colaborar em um mapa
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { mapId, email } = req.body;
    const inviterId = req.user.id;

    try {
        const map = await Map.findById(mapId);
        if (!map) return res.status(404).json({ msg: 'Mapa não encontrado.' });
        if (map.user.toString() !== inviterId) {
            return res.status(403).json({ msg: 'Apenas o dono do mapa pode convidar colaboradores.' });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) return res.status(404).json({ msg: `Nenhum usuário encontrado com o e-mail: ${email}` });
        if (userToInvite.id === inviterId) return res.status(400).json({ msg: 'Você não pode convidar a si mesmo.' });

        const existingPermission = await Permission.findOne({ map: mapId, user: userToInvite.id });
        if (existingPermission) return res.status(400).json({ msg: 'Este usuário já foi convidado.' });

        const newPermission = new Permission({
            map: mapId,
            user: userToInvite.id,
            grantedBy: inviterId,
            permissionLevel: 'edit'
        });

        await newPermission.save();
        const populatedPermission = await Permission.findById(newPermission._id).populate('user', 'firstName lastName email');
        
        res.status(201).json(populatedPermission);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// @route   GET /api/permissions/:mapId
// @desc    Listar colaboradores de um mapa
// @access  Private
router.get('/:mapId', authMiddleware, async (req, res) => {
    try {
        const permissions = await Permission.find({ map: req.params.mapId })
            .populate('user', 'firstName lastName email');
        res.json(permissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// @route   DELETE /api/permissions/:id
// @desc    Remover permissão de um colaborador
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const permission = await Permission.findById(req.params.id);
        if (!permission) return res.status(404).json({ msg: 'Permissão não encontrada.' });

        const map = await Map.findById(permission.map);
        if (!map) return res.status(404).json({ msg: 'Mapa associado não encontrado.' });
        if (map.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Apenas o dono do mapa pode remover colaboradores.' });
        }

        await permission.deleteOne();
        res.json({ msg: 'Colaborador removido com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

export default router;