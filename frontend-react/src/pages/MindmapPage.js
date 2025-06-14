/*
  Arquivo: src/pages/MindmapPage.js
  Descrição: Adicionada a funcionalidade de criar flashcards. Um modal é aberto ao clicar na opção, permitindo ao usuário preencher frente e verso do flashcard.
*/
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
} from 'reactflow';
import io from 'socket.io-client';
import { useMapsAPI } from '../context/MapProvider';
import { useFlashcards } from '../context/FlashcardProvider';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../hooks/useTheme';
import { API_BASE_URL } from '../api';
import CustomNode from '../components/Mindmap/CustomNode';
import LinkModal from '../components/LinkModal';
import ShareModal from '../components/ShareModal';
import FlashcardModal from '../components/FlashcardModal';

let nodeIdCounter = 1;

const MindmapFlow = () => {
    const { mapId } = useParams();
    const navigate = useNavigate();
    const { getMapById, saveMap, loading: mapsLoading } = useMapsAPI();
    const { createFlashcard } = useFlashcards();
    const { showNotification } = useNotifications();
    const { nodeColor, fontColor, mapBgColor } = useTheme();

    const [socket, setSocket] = useState(null);
    const [mapTitle, setMapTitle] = useState('Novo Mapa Mental');
    const [currentMap, setCurrentMap] = useState(null);
    const [isTitleEditing, setIsTitleEditing] = useState(false);
    const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
    const [edges, setEdges, onEdgesChangeInternal] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();
    
    const [nodeMenu, setNodeMenu] = useState(null);
    const [edgeMenu, setEdgeMenu] = useState(null);
    const [isLinkModalOpen, setLinkModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [isFlashcardModalOpen, setFlashcardModalOpen] = useState(false);
    const [activeTopic, setActiveTopic] = useState(null);
    const [activeFlashcardTopic, setActiveFlashcardTopic] = useState(null);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    const closeAllMenus = useCallback(() => {
        setNodeMenu(null);
        setEdgeMenu(null);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Autenticação necessária. Faça login novamente.', 'error');
            return;
        }

        const newSocket = io(API_BASE_URL, {
            auth: { token }
        });
        setSocket(newSocket);

        newSocket.on('connect_error', (err) => {
            showNotification(`Erro de conexão com o servidor: ${err.message}`, 'error');
        });
        
        newSocket.on('map:error', (errorMessage) => {
            showNotification(errorMessage, 'error');
            navigate('/app/dashboard');
        });
        
        newSocket.on('map:joined_successfully', () => {
            console.log('Conectado à sessão de edição em tempo real.');
        });

        const handleNodesUpdated = (changes) => setNodes((nds) => applyNodeChanges(changes, nds));
        const handleEdgesUpdated = (changes) => setEdges((eds) => applyEdgeChanges(changes, eds));

        newSocket.on('nodes:updated', handleNodesUpdated);
        newSocket.on('edges:updated', handleEdgesUpdated);

        return () => {
            newSocket.disconnect();
        };
    }, [navigate, showNotification, setNodes, setEdges]);

    useEffect(() => {
        if (socket && mapId) {
            socket.emit('map:join', mapId);
        }
        return () => {
            if (socket && mapId) {
                socket.emit('map:leave', mapId);
            }
        };
    }, [socket, mapId]);
    
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: { ...node.data, nodeColor, fontColor },
            }))
        );
    }, [nodeColor, fontColor, setNodes]);

    const onNodesChange = useCallback((changes) => {
        onNodesChangeInternal(changes);
        if (socket && mapId) socket.emit('nodes:change', { mapId, changes });
    }, [socket, mapId, onNodesChangeInternal]);

    const onEdgesChange = useCallback((changes) => {
        onEdgesChangeInternal(changes);
        if (socket && mapId) socket.emit('edges:change', { mapId, changes });
    }, [socket, mapId, onEdgesChangeInternal]);

    const onConnect = useCallback((params) => {
        const newEdge = { 
            id: `edge-${params.source}-${params.target}-${new Date().getTime()}`,
            ...params, 
            type: 'smoothstep', 
            animated: true 
        };
        onEdgesChange([{ item: newEdge, type: 'add' }]);
    }, [onEdgesChange]);
    
    const handleTopicContextMenu = useCallback((event, nodeId, topicIndex) => {
        event.preventDefault();
        closeAllMenus();
        setNodeMenu({ nodeId, topicIndex, top: event.clientY, left: event.clientX });
    }, [closeAllMenus]);

    const onEdgeContextMenu = useCallback((event, edge) => {
        event.preventDefault();
        closeAllMenus();
        setEdgeMenu({ id: edge.id, top: event.clientY, left: event.clientX });
    }, [closeAllMenus]);
    
    const handleDeleteEdge = useCallback((edgeIdToDelete) => {
        onEdgesChange([{ type: 'remove', id: edgeIdToDelete }]);
        closeAllMenus();
    }, [onEdgesChange, closeAllMenus]);

    const updateNodeData = useCallback((nodeId, newTopics) => {
        setNodes((nds) =>
            nds.map((node) => (node.id === nodeId) ? { ...node, data: { ...node.data, topics: newTopics } } : node)
        );
    }, [setNodes]);

    const deleteNode = useCallback((nodeId) => {
        onNodesChange([{ id: nodeId, type: 'remove' }]);
    }, [onNodesChange]);
    
    const convertToFlowData = useCallback((initialMapData) => {
        if (!initialMapData) return;
        const flowNodes = initialMapData.nodes.map(node => ({
            id: node.id, type: 'custom', position: { x: parseFloat(node.left), y: parseFloat(node.top) },
            data: { 
                topics: node.topics.map(t => ({...t, isEditing: false})),
                updateNodeData, onShowContextMenu: handleTopicContextMenu, onDeleteNode: deleteNode
            },
        }));
        setNodes(flowNodes);
        const flowEdges = initialMapData.connections.map((conn) => ({
            ...conn,
            type: 'smoothstep', animated: true
        }));
        setEdges(flowEdges);
        const maxId = initialMapData.nodes.reduce((max, node) => {
            const num = parseInt(node.id.split('-')[1], 10);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);
        nodeIdCounter = maxId + 1;
    }, [setNodes, setEdges, updateNodeData, handleTopicContextMenu, deleteNode]);
    
    useEffect(() => {
        if (mapId) {
            const existingMap = getMapById(mapId);
            if (existingMap) { setCurrentMap(existingMap); setMapTitle(existingMap.title); convertToFlowData(existingMap); }
            else if (!mapsLoading) { navigate('/app/dashboard'); }
        } else {
            setMapTitle('Novo Mapa Mental'); setNodes([]); setEdges([]);
            setCurrentMap({ title: 'Novo Mapa Mental', nodes: [], connections: [] });
        }
    }, [mapId, getMapById, navigate, mapsLoading, convertToFlowData, setNodes, setEdges]);
    
    const handleSave = useCallback(async (nodesToSave = nodes) => {
        const apiNodes = nodesToSave.map(node => ({
            id: node.id, left: `${node.position.x}px`, top: `${node.position.y}px`,
            width: `${node.width}px`, height: `${node.height}px`,
            topics: node.data.topics.map(({ isEditing, ...rest }) => rest),
        }));

        const apiConnections = edges
            .filter(edge => edge && edge.id && edge.source && edge.target)
            .map(({ id, source, target }) => ({ id, source, target }));

        const mapToSave = { id: currentMap?._id, title: mapTitle, nodes: apiNodes, connections: apiConnections };
        const saved = await saveMap(mapToSave);
        if (saved && !mapId) { navigate(`/app/mindmap/${saved._id}`, { replace: true }); }
        else if (saved) { setCurrentMap(saved); }
    }, [nodes, edges, mapTitle, currentMap, saveMap, mapId, navigate]);

    const addNode = useCallback(() => {
        const newId = `node-${nodeIdCounter++}`;
        const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        const newNode = {
            id: newId, type: 'custom', position,
            data: {
                topics: [{ text: 'Novo Tópico', links: [], isEditing: true }],
                updateNodeData, onShowContextMenu: handleTopicContextMenu, onDeleteNode: deleteNode,
            },
        };
        onNodesChange([{ item: newNode, type: 'add' }]);
    }, [screenToFlowPosition, onNodesChange, updateNodeData, handleTopicContextMenu, deleteNode]);
    
    const handleMenuAction = (action) => {
        if (!nodeMenu) return;
        const { nodeId, topicIndex } = nodeMenu;
        const node = nodes.find(n => n.id === nodeId);
        const topic = node?.data.topics[topicIndex];
        if (!topic) return;
        
        closeAllMenus();

        switch (action) {
            case 'edit':
                const newNodes = nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, topics: n.data.topics.map((t, i) => i === topicIndex ? { ...t, isEditing: true } : { ...t, isEditing: false }) } } : n);
                setNodes(newNodes);
                break;
            case 'links': 
                setActiveTopic({ nodeId, topicIndex, ...topic }); 
                setLinkModalOpen(true); 
                break;
            case 'flashcard': 
                setActiveFlashcardTopic(topic);
                setFlashcardModalOpen(true);
                break;
            case 'wordcloud': 
                showNotification('Funcionalidade "Nuvem de Palavras" ainda não implementada.', 'info'); 
                break;
            case 'audio': 
                showNotification('Funcionalidade "Gerar Áudio" ainda não implementada.', 'info'); 
                break;
            case 'questions': 
                showNotification('Funcionalidade "Trilha de Questões" ainda não implementada.', 'info'); 
                break;
            default: 
                showNotification(`Funcionalidade "${action}" não implementada.`, 'error'); 
                break;
        }
    };

    const handleCreateFlashcard = async (flashcardData) => {
        try {
            await createFlashcard(flashcardData);
            showNotification('Flashcard criado com sucesso!', 'success');
            setFlashcardModalOpen(false);
        } catch (error) {
            showNotification(error.message || 'Erro ao criar o flashcard.', 'error');
        }
    };

    const handleSaveLinks = async (nodeId, topicIndex, newLinks) => {
        const newNodes = nodes.map(n => 
            n.id === nodeId 
                ? { ...n, data: { ...n.data, topics: n.data.topics.map((t, i) => i === topicIndex ? { ...t, links: newLinks } : t) } } 
                : n
        );
        setNodes(newNodes);
        await handleSave(newNodes);
        showNotification('Links atualizados e mapa salvo com sucesso!', 'success');
    };

    if (!currentMap && mapId && !mapsLoading) {
        return <div className="flex justify-center items-center h-full">Mapa não encontrado ou você não tem permissão para vê-lo.</div>;
    }
    if (mapsLoading) {
        return <div className="flex justify-center items-center h-full">Carregando...</div>;
    }

    return (
         <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl shadow-sm flex justify-between items-center">
                <nav aria-label="breadcrumb">
                    <ol className="flex items-center text-lg sm:text-xl font-bold header-text">
                        <li><button onClick={() => navigate('/app/dashboard')} className="font-semibold secondary-text hover:text-accent">Dashboard</button></li>
                        <li><span className="mx-2 text-gray-400">/</span></li>
                        {isTitleEditing ? (
                            <input type="text" value={mapTitle} onChange={(e) => setMapTitle(e.target.value)} onBlur={() => setIsTitleEditing(false)} onKeyDown={(e) => e.key === 'Enter' && setIsTitleEditing(false)} className="font-bold bg-transparent outline-none ring-2 ring-accent rounded-md p-1" autoFocus />
                        ) : (
                            <li onClick={() => setIsTitleEditing(true)} className="header-text cursor-pointer hover:bg-gray-100 rounded-md p-1" title="Clique para editar o título">{mapTitle}</li>
                        )}
                    </ol>
                </nav>
                <button onClick={() => mapId ? setShareModalOpen(true) : showNotification('Salve o mapa antes de compartilhar.', 'error')} className="button-primary font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center text-sm">
                    <span className="material-icons text-sm mr-2">group_add</span>
                    Compartilhar
                </button>
            </div>
            <div className="flex-grow relative" style={{ height: '100%', backgroundColor: mapBgColor }}>
                <ReactFlow 
                    nodes={nodes} edges={edges} 
                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} 
                    nodeTypes={nodeTypes} onPaneClick={closeAllMenus} onNodeClick={closeAllMenus}
                    onEdgeContextMenu={onEdgeContextMenu}
                    fitView proOptions={{ hideAttribution: true }}
                >
                    <Controls />
                    <MiniMap nodeColor={(node) => node.data.nodeColor || '#ffffff'} nodeStrokeWidth={3} zoomable pannable />
                    <Background variant="dots" gap={12} size={1} />
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                        <button onClick={addNode} className="bg-white p-2.5 rounded-lg shadow-md hover:bg-gray-200 transition-colors" title="Adicionar novo card">
                            <span className="material-icons text-gray-700">add</span>
                        </button>
                        <button onClick={() => handleSave()} className="button-primary font-semibold py-2.5 px-5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center text-sm">
                            <span className="material-icons text-sm mr-2">save</span>
                            Salvar Mapa
                        </button>
                    </div>
                </ReactFlow>
                {nodeMenu && (
                    <div style={{ top: nodeMenu.top, left: nodeMenu.left }} className="topic-context-menu">
                        <button onClick={() => handleMenuAction('edit')}><span className="material-icons">edit</span> Editar Tópico</button>
                        <button onClick={() => handleMenuAction('links')}><span className="material-icons">link</span> Gerenciar Links</button>
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                        <button onClick={() => handleMenuAction('flashcard')}><span className="material-icons">style</span> Gerar Flashcard</button>
                        <button onClick={() => handleMenuAction('wordcloud')}><span className="material-icons">cloud</span> Nuvem de Palavras</button>
                        <button onClick={() => handleMenuAction('audio')}><span className="material-icons">volume_up</span> Gerar Áudio</button>
                        <button onClick={() => handleMenuAction('questions')}><span className="material-icons">quiz</span> Trilha de Questões</button>
                    </div>
                )}
                {edgeMenu && (
                    <div style={{ top: edgeMenu.top, left: edgeMenu.left }} className="edge-delete-menu">
                        <button onClick={() => handleDeleteEdge(edgeMenu.id)} className="edge-delete-button" title="Deletar conexão">
                            &times;
                        </button>
                    </div>
                )}
                {activeTopic && (
                    <LinkModal 
                        isOpen={isLinkModalOpen} 
                        onClose={() => setLinkModalOpen(false)}
                        topic={activeTopic}
                        onSave={handleSaveLinks}
                    />
                )}
                {activeFlashcardTopic && (
                    <FlashcardModal
                        isOpen={isFlashcardModalOpen}
                        onClose={() => setFlashcardModalOpen(false)}
                        topic={activeFlashcardTopic}
                        mapId={mapId}
                        onSubmit={handleCreateFlashcard}
                    />
                )}
                {mapId && (
                     <ShareModal
                        isOpen={isShareModalOpen}
                        onClose={() => setShareModalOpen(false)}
                        mapId={mapId}
                    />
                )}
            </div>
        </div>
    );
};

const MindmapPageWrapper = () => (<ReactFlowProvider> <MindmapFlow /> </ReactFlowProvider>);
export default MindmapPageWrapper;