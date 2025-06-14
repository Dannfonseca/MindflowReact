/*
  Arquivo: src/components/Sidebar.js
  Descrição: Adicionados três seletores de cores na seção "Estilo do Mapa" para controlar a cor do card, da fonte e do fundo do mapa, utilizando os novos estados do ThemeContext.
*/
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { user } = useAuth();
    const { nodeColor, setNodeColor, fontColor, setFontColor, mapBgColor, setMapBgColor } = useTheme();
    const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    }

    return (
        <aside id="app-sidebar" className={`w-64 p-4 space-y-4 glass-effect fixed top-0 md:top-16 left-0 h-full md:h-[calc(100vh-64px)] overflow-y-auto border-r border-gray-200/80 ${isOpen ? 'sidebar-mobile-open' : ''}`}>
            <nav className="flex flex-col space-y-2 mt-16 md:mt-0">
                <NavLink to="/app/dashboard" className="sidebar-link" onClick={handleLinkClick}>
                    <span className="material-icons sidebar-icon mr-3">dashboard</span>
                    Dashboard
                </NavLink>
                <NavLink to="/app/mindmap" className="sidebar-link" onClick={handleLinkClick}>
                    <span className="material-icons sidebar-icon mr-3">hub</span>
                    Novo Mapa
                </NavLink>
                {isAdmin && (
                    <NavLink to="/app/admin" className="sidebar-link" onClick={handleLinkClick}>
                        <span className="material-icons sidebar-icon mr-3">admin_panel_settings</span>
                        Administração
                    </NavLink>
                )}
            </nav>

            <div className="pt-4 border-t border-gray-200/80">
                <h3 className="px-2 text-xs font-semibold secondary-text uppercase tracking-wider mb-2">Estilo do Mapa</h3>
                <div className="setting-item px-2 justify-between">
                    <label className="setting-label text-sm">Cor do Card</label>
                    <input type="color" value={nodeColor} onChange={(e) => setNodeColor(e.target.value)} className="w-10 h-8 p-1 border border-gray-300 rounded-md cursor-pointer"/>
                </div>
                 <div className="setting-item px-2 justify-between">
                    <label className="setting-label text-sm">Cor da Fonte</label>
                    <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-10 h-8 p-1 border border-gray-300 rounded-md cursor-pointer"/>
                </div>
                 <div className="setting-item px-2 justify-between">
                    <label className="setting-label text-sm">Cor do Fundo</label>
                    <input type="color" value={mapBgColor} onChange={(e) => setMapBgColor(e.target.value)} className="w-10 h-8 p-1 border border-gray-300 rounded-md cursor-pointer"/>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;