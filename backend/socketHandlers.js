/*
  Arquivo: socketHandlers.js
  Descrição: Atualizado o handler de 'edges:change' para conseguir processar a remoção de uma conexão específica pelo seu ID.
*/
import Map from './models/Map.js';
import Permission from './models/Permission.js';
import jwt from 'jsonwebtoken';

export default function initializeSocketHandlers(io) {

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token not provided.'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded.user;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token.'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Cliente autenticado conectado: ${socket.id}, UserID: ${socket.user.id}`);

        socket.on('map:join', async (mapId) => {
            try {
                const map = await Map.findById(mapId);
                if (!map) {
                    socket.emit('map:error', 'Mapa não encontrado.');
                    return;
                }

                const isOwner = map.user.toString() === socket.user.id;
                const hasPermission = await Permission.findOne({ map: mapId, user: socket.user.id });

                if (isOwner || hasPermission) {
                    socket.join(mapId);
                    console.log(`Cliente ${socket.id} entrou na sala do mapa ${mapId}`);
                    socket.emit('map:joined_successfully');
                } else {
                    socket.emit('map:error', 'Você não tem permissão para editar este mapa.');
                }
            } catch (error) {
                 socket.emit('map:error', 'Erro ao verificar permissões.');
            }
        });

        socket.on('map:leave', (mapId) => {
            socket.leave(mapId);
            console.log(`Cliente ${socket.id} saiu da sala do mapa ${mapId}`);
        });

        socket.on('nodes:change', async ({ mapId, changes }) => {
            if (socket.rooms.has(mapId)) {
                socket.to(mapId).emit('nodes:updated', changes);
                
                try {
                    const map = await Map.findById(mapId);
                    if (!map) return;
                    
                    changes.forEach(change => {
                        if (change.type === 'position' && change.position) {
                            const node = map.nodes.find(n => n.id === change.id);
                            if (node) {
                                node.left = `${change.position.x}px`;
                                node.top = `${change.position.y}px`;
                            }
                        }
                    });

                    map.markModified('nodes');
                    await map.save();
                } catch (error) {
                    console.error("Erro ao salvar mudança de nó:", error);
                }
            }
        });

        socket.on('edges:change', async ({ mapId, changes }) => {
            if (socket.rooms.has(mapId)) {
                socket.to(mapId).emit('edges:updated', changes);
                
                try {
                    const map = await Map.findById(mapId);
                    if (!map) return;
                    
                    changes.forEach(change => {
                        if (change.type === 'add') {
                            map.connections.push(change.item);
                        } else if (change.type === 'remove') {
                           map.connections = map.connections.filter(conn => conn.id !== change.id);
                        }
                    });
                    
                    map.markModified('connections');
                    await map.save();
                } catch (error) {
                    console.error("Erro ao salvar mudança de aresta:", error);
                }
            }
        });

        socket.on('disconnect', () => {
            console.log(`Cliente desconectado: ${socket.id}`);
        });
    });
}