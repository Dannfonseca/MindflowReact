/*
  Arquivo: src/pages/DashboardPage.js
  Descrição: O dashboard agora busca e exibe tanto os mapas do usuário quanto os mapas compartilhados com ele em seções separadas.
*/
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMapsAPI } from '../context/MapProvider';

const MapCard = ({ map }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col justify-between">
        <div>
            <h3 className="font-bold text-lg text-gray-800 truncate">{map.title}</h3>
            {map.user && <p className="text-xs text-gray-500 mt-1">Criado por: {map.user.firstName} {map.user.lastName}</p>}
        </div>
        <div className="mt-4 flex justify-end">
            <Link to={`/app/mindmap/${map._id}`} className="button-primary text-sm font-semibold py-2 px-4 rounded-full">
                Abrir Mapa
            </Link>
        </div>
    </div>
);

const DashboardPage = () => {
    const { myMaps, sharedMaps, loading, fetchAllMaps } = useMapsAPI();

    useEffect(() => {
        fetchAllMaps();
    }, [fetchAllMaps]);

    return (
        <div className="app-view active">
            <h1 className="text-3xl font-bold header-text mb-8">Dashboard</h1>
            
            <section>
                <h2 className="text-2xl font-semibold main-content-text mb-4">Meus Mapas</h2>
                {loading && <p>Carregando...</p>}
                {!loading && myMaps.length === 0 && (
                    <div className="text-center py-10 bg-gray-100 rounded-lg">
                        <p className="secondary-text mb-4">Você ainda não criou nenhum mapa.</p>
                        <Link to="/app/mindmap" className="button-primary font-semibold py-2 px-5 rounded-full shadow-md">
                            Criar meu primeiro mapa
                        </Link>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {myMaps.map(map => <MapCard key={map._id} map={map} />)}
                </div>
            </section>

             <section className="mt-12">
                <h2 className="text-2xl font-semibold main-content-text mb-4">Compartilhados Comigo</h2>
                {loading && <p>Carregando...</p>}
                {!loading && sharedMaps.length === 0 && (
                    <p className="secondary-text">Nenhum mapa foi compartilhado com você ainda.</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sharedMaps.map(map => <MapCard key={map._id} map={map} />)}
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;