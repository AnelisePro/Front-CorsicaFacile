export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const adminAuth = {
  async login(email: string, password: string): Promise<{ token: string; admin: AdminUser } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/admins/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin: {
            email,
            password
          }
        })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return null; // Identifiants incorrects ou compte inactif
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        token: data.token || data.jwt,
        admin: {
          id: data.admin.id,
          name: data.admin.first_name && data.admin.last_name 
            ? `${data.admin.first_name} ${data.admin.last_name}`.trim()
            : data.admin.email,
          email: data.admin.email,
          role: data.admin.role
        }
      };

    } catch (error) {
      console.error('Erreur lors de la connexion admin:', error);
      throw error;
    }
  },

  async verifyToken(token: string): Promise<AdminUser | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return {
        id: data.admin.id,
        name: data.admin.first_name && data.admin.last_name 
          ? `${data.admin.first_name} ${data.admin.last_name}`.trim()
          : data.admin.email,
        email: data.admin.email,
        role: data.admin.role
      };

    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return null;
    }
  },

  async logout(): Promise<boolean> {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return true;

      const response = await fetch(`${API_BASE_URL}/admin/admins/sign_out`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return response.ok;

    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return false;
    }
  }
};


