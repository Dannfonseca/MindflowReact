/*
  Arquivo: src/hooks/useMaps.js
  Descrição: Hook customizado para acessar facilmente o contexto de mapas, permitindo que os componentes interajam com os dados dos mapas (buscar, salvar, deletar) de forma simples.
*/
import { useContext } from 'react';
import { MapContext } from '../context/MapProvider';

export const useMaps = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMaps deve ser usado dentro de um MapProvider');
    }
    return context;
};