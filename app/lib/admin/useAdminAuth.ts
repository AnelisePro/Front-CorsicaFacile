'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Admin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAdminAuth = (): AdminAuthState => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('admin_token');
      const adminData = localStorage.getItem('admin_data');
      
      if (!token || !adminData) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Pour l'instant, on fait confiance au localStorage
      // Plus tard, vous pourrez ajouter une vérification API
      try {
        const parsedAdmin = JSON.parse(adminData);
        setAdmin(parsedAdmin);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
        setIsAuthenticated(false);
        setAdmin(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/admins/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          admin: { email, password }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // ✅ Le token est dans le body, pas dans les headers
        if (data.token && data.admin) {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_data', JSON.stringify(data.admin));
          setAdmin(data.admin);
          setIsAuthenticated(true);
          
          // ✅ Redirection automatique
          router.push('/panel-admin/dashboard');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Pour l'instant, logout local seulement
      // Plus tard, vous pourrez ajouter un endpoint de logout
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_data');
      setIsAuthenticated(false);
      setAdmin(null);
      router.push('/panel-admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    admin,
    login,
    logout,
    checkAuth
  };
};




