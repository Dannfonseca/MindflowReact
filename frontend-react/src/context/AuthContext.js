/*
  Arquivo: src/context/AuthContext.js
  Descrição: Contexto e provedor para o gerenciamento de estado de autenticação. Controla o token, os dados do usuário, e o estado de carregamento. Expõe funções para login, logout e registro, mantendo o estado de autenticação sincronizado em toda a aplicação.
*/
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { fetchWithAuth, API_URL } from '../api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
                logout();
                return;
            }

            const res = await fetchWithAuth(`${API_URL}/auth/user`);
            if (!res.ok) throw new Error('Falha ao buscar dados do usuário');
            
            const userData = await res.json();
            setUser(userData);

        } catch (error) {
            console.error(error);
            logout();
        } finally {
            setLoading(false);
        }
    }, [token]);
    
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };
    
    const register = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const value = {
        token,
        user,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        register,
        reloadUser: loadUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};