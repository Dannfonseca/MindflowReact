/*
  Arquivo: src/pages/HomePage.js
  Descrição: Componente que representa a página inicial (landing page) do MindFlow. Apresenta a proposta de valor da ferramenta e direciona os usuários para o login ou cadastro. Substitui o antigo `index.html`.
*/
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.svg';

const HomePage = () => {
    return (
        <div className="relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden" style={{fontFamily: '"Work Sans", "Noto Sans", sans-serif'}}>
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e9edf1] px-10 py-3">
                    <div className="flex items-center gap-4 text-[#101419]">
                        <div className="size-4">
                            <img src={Logo} alt="MindFlow Logo" />
                        </div>
                        <h2 className="text-[#101419] text-lg font-bold leading-tight tracking-[-0.015em]">MindFlow</h2>
                    </div>
                    <nav className="flex items-center gap-6">
                        <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">Login</Link>
                        <Link to="/signup" className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full">Cadastre-se</Link>
                    </nav>
                </header>
                <main className="flex-grow flex items-center justify-center text-center">
                    <div className="hero-section">
                        <h1 className="text-5xl font-bold text-gray-800 mb-4">Organize Suas Ideias Sem Limites.</h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">MindFlow é uma ferramenta de mapa mental, projetada para ajudar você a visualizar, conectar e expandir seus pensamentos de forma intuitiva e sem restrições de espaço.</p>
                        <Link to="/signup" className="text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full">Comece a usar gratuitamente</Link>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HomePage;