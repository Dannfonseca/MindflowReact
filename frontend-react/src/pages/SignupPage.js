/*
  Arquivo: src/pages/SignupPage.js
  Descrição: Componente da página de cadastro. Contém o formulário para registro de novos usuários. Após o sucesso no registro, loga o usuário e o redireciona para a aplicação.
*/
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { API_URL } from '../api';
import Logo from '../assets/logo.svg';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        birthDate: '',
        email: '',
        password: '',
    });
    const { register } = useAuth();
    const { showNotification } = useNotifications();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.msg || 'Erro ao criar conta');
            }
            register(data.token);
            navigate('/app');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    return (
        <div className="relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden" style={{fontFamily: '"Work Sans", "Noto Sans", sans-serif'}}>
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e9edf1] px-10 py-3">
                    <Link to="/" className="flex items-center gap-4 text-[#101419]">
                         <div className="size-4">
                            <img src={Logo} alt="MindFlow Logo" />
                        </div>
                        <h2 className="text-[#101419] text-lg font-bold leading-tight tracking-[-0.015em]">MindFlow</h2>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">Já tem uma conta? Faça Login</Link>
                    </nav>
                </header>
                <div className="px-4 md:px-40 flex flex-1 justify-center items-center">
                    <div className="layout-content-container flex flex-col w-full max-w-lg py-5">
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-[#101419] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Crie sua conta</h2>
                            <div className="flex flex-col gap-4 px-4 py-3">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <label className="flex flex-col flex-1">
                                        <p className="text-[#101419] text-base font-medium leading-normal pb-2">Nome</p>
                                        <input id="firstName" type="text" required placeholder="Seu nome" value={formData.firstName} onChange={handleChange} className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101419] focus:outline-0 focus:ring-0 border border-[#d3dbe4] bg-gray-50 focus:border-[#d3dbe4] h-14 placeholder:text-[#58728d] p-[15px] text-base font-normal leading-normal" />
                                    </label>
                                    <label className="flex flex-col flex-1">
                                        <p className="text-[#101419] text-base font-medium leading-normal pb-2">Sobrenome</p>
                                        <input id="lastName" type="text" required placeholder="Seu sobrenome" value={formData.lastName} onChange={handleChange} className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101419] focus:outline-0 focus:ring-0 border border-[#d3dbe4] bg-gray-50 focus:border-[#d3dbe4] h-14 placeholder:text-[#58728d] p-[15px] text-base font-normal leading-normal" />
                                    </label>
                                </div>
                                <label className="flex flex-col">
                                    <p className="text-[#101419] text-base font-medium leading-normal pb-2">Usuário</p>
                                    <input id="username" type="text" required placeholder="Crie um nome de usuário" maxLength="20" value={formData.username} onChange={handleChange} className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101419] focus:outline-0 focus:ring-0 border border-[#d3dbe4] bg-gray-50 focus:border-[#d3dbe4] h-14 placeholder:text-[#58728d] p-[15px] text-base font-normal leading-normal" />
                                </label>
                                <label className="flex flex-col">
                                    <p className="text-[#101419] text-base font-medium leading-normal pb-2">Data de Nascimento</p>
                                    <input id="birthDate" type="date" required value={formData.birthDate} onChange={handleChange} className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101419] focus:outline-0 focus:ring-0 border border-[#d3dbe4] bg-gray-50 focus:border-[#d3dbe4] h-14 placeholder:text-[#58728d] p-[15px] text-base font-normal leading-normal" />
                                </label>
                                <label className="flex flex-col">
                                    <p className="text-[#101419] text-base font-medium leading-normal pb-2">Email</p>
                                    <input id="email" type="email" required placeholder="seu@email.com" value={formData.email} onChange={handleChange} className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101419] focus:outline-0 focus:ring-0 border border-[#d3dbe4] bg-gray-50 focus:border-[#d3dbe4] h-14 placeholder:text-[#58728d] p-[15px] text-base font-normal leading-normal" />
                                </label>
                                <label className="flex flex-col">
                                    <p className="text-[#101419] text-base font-medium leading-normal pb-2">Senha</p>
                                    <input id="password" type="password" required placeholder="Crie uma senha" value={formData.password} onChange={handleChange} className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101419] focus:outline-0 focus:ring-0 border border-[#d3dbe4] bg-gray-50 focus:border-[#d3dbe4] h-14 placeholder:text-[#58728d] p-[15px] text-base font-normal leading-normal" />
                                </label>
                            </div>
                            <div className="flex px-4 py-3">
                                <button type="submit" className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-[#1e88e5] hover:bg-[#1565c0] text-white text-base font-bold leading-normal tracking-[0.015em]">
                                    <span className="truncate">Criar conta</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;