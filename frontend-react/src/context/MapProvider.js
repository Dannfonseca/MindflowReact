/*
  Arquivo: src/context/MapProvider.js
  Descrição: Corrigido reimplementando a lógica das funções saveMap, deleteMap e generateShareLink, que estavam ausentes, restaurando a funcionalidade de salvar e compartilhar mapas.
*/
import React, { createContext, useState, useCallback, useContext } from 'react';
import { fetchWithAuth, API_URL } from '../api';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';

export const MapContext = createContext(null);

export const useMapsAPI = () => {
    return useContext(MapContext);
};

export const MapProvider = ({ children }) => {
    const [myMaps, setMyMaps] = useState([]);
    const [sharedMaps, setSharedMaps] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotifications();
    const { isAuthenticated } = useAuth();

    const fetchAllMaps = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const [myMapsRes, sharedMapsRes] = await Promise.all([
                fetchWithAuth(`${API_URL}/maps`),
                fetchWithAuth(`${API_URL}/maps/shared-with-me`)
            ]);

            if (!myMapsRes.ok) throw new Error('Falha ao buscar seus mapas');
            if (!sharedMapsRes.ok) throw new Error('Falha ao buscar mapas compartilhados');
            
            const myMapsData = await myMapsRes.json();
            const sharedMapsData = await sharedMapsRes.json();
            
            setMyMaps(myMapsData);
            setSharedMaps(sharedMapsData);
        } catch (err) {
            showNotification(err.message, 'error');
            setMyMaps([]);
            setSharedMaps([]);
        } finally {
            setLoading(false);
        }
    }, [showNotification, isAuthenticated]);
    
    const saveMap = async (mapData) => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/maps`, { 
                method: 'POST', 
                body: JSON.stringify(mapData) 
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.msg || 'Falha ao salvar o mapa');
            }
            const savedMap = await res.json();
            
            // Atualiza o estado local para refletir o mapa salvo
            const isShared = sharedMaps.some(m => m._id === savedMap._id);
            if(isShared) {
                setSharedMaps(prev => prev.map(m => m._id === savedMap._id ? savedMap : m));
            } else {
                 setMyMaps(prev => {
                    const index = prev.findIndex(m => m._id === savedMap._id);
                    if (index > -1) {
                        const newMaps = [...prev];
                        newMaps[index] = savedMap;
                        return newMaps;
                    }
                    return [savedMap, ...prev];
                });
            }

            showNotification('Mapa salvo com sucesso!', 'success');
            return savedMap;
        } catch (err) {
            showNotification(err.message, 'error');
            return null;
        } finally {
            setLoading(false);
        }
    };
    
    const deleteMap = async (mapId) => {
        if (!window.confirm('Tem certeza que deseja apagar este mapa permanentemente?')) return;
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/maps/${mapId}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.msg || 'Falha ao deletar o mapa');
            }
            setMyMaps(prevMaps => prevMaps.filter(m => m._id !== mapId));
            showNotification('Mapa deletado com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const getMapById = (mapId) => {
        return [...myMaps, ...sharedMaps].find(m => m._id === mapId);
    }

    const generateShareLink = async (mapId) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/maps/${mapId}/share`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Falha ao gerar link');
            return `${window.location.origin}/view/${data.shareId}`;
        } catch (err) {
            showNotification(err.message, 'error');
            return null;
        }
    };
    
    const getCollaborators = async (mapId) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/permissions/${mapId}`);
            if(!res.ok) throw new Error('Falha ao buscar colaboradores');
            return await res.json();
        } catch (err) {
            showNotification(err.message, 'error');
            return [];
        }
    };
    
    const inviteCollaborator = async (mapId, email) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/permissions`, {
                method: 'POST',
                body: JSON.stringify({ mapId, email })
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.msg || 'Falha ao convidar');
            showNotification('Convite enviado com sucesso!', 'success');
            return data;
        } catch (err) {
            showNotification(err.message, 'error');
            return null;
        }
    };

    const removeCollaborator = async (permissionId) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/permissions/${permissionId}`, { method: 'DELETE' });
            if(!res.ok) throw new Error('Falha ao remover colaborador');
            showNotification('Colaborador removido.', 'success');
            return true;
        } catch (err) {
            showNotification(err.message, 'error');
            return false;
        }
    };

    const value = {
        myMaps,
        sharedMaps,
        loading,
        fetchAllMaps,
        saveMap,
        deleteMap,
        getMapById,
        generateShareLink,
        getCollaborators,
        inviteCollaborator,
        removeCollaborator
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};