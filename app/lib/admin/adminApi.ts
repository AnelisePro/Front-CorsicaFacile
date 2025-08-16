import { User, UserDetails } from '../../types/admin';

interface DashboardStats {
  totalUsers: {
    clients: number;
    artisans: number;
  };
  totalActivity: {
    announcements: number;
    messages: number;
  };
  recentSignups: {
    clientsToday: number;
    artisansToday: number;
    clientsThisWeek: number;
    artisansThisWeek: number;
  };
  growth: {
    usersGrowth: number;
    announcementsGrowth: number;
    messagesGrowth: number;
    feedbackGrowth?: number;
  };
  totalFeedbacks?: number;
  pendingFeedbacks?: number;
  recentFeedbacks?: Array<{
    id: number;
    title: string;
    userName: string;
    userType: string;
    status: string;
    createdAt: string;
    urgency: 'high' | 'normal';
  }>;
  feedbackStats?: {
    total: number;
    pending: number;
    responded: number;
    thisWeek: number;
    byUserType: {
      clients: number;
      artisans: number;
    };
  };
}

interface StatisticData {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  clientSignups: number;
  artisanSignups: number;
  messagesSent: number;
  announcementsPosted: number;
}

interface Feedback {
  id: number;
  title: string;
  content: string;
  user_name: string;
  user_email: string;
  user_type: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  responded_at: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class AdminApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des statistiques');
    }

    const data = await response.json();
    
    return {
      totalUsers: {
        clients: data.total_clients,
        artisans: data.total_artisans,
      },
      totalActivity: {
        announcements: data.total_besoins || 0,
        messages: data.total_messages || data.total_conversations || 0,
      },
      recentSignups: {
        clientsToday: data.recent_signups?.clients_today || 0,
        artisansToday: data.recent_signups?.artisans_today || 0,
        clientsThisWeek: data.recent_signups?.clients_this_week || 0,
        artisansThisWeek: data.recent_signups?.artisans_this_week || 0,
      },
      growth: {
        usersGrowth: 0,
        announcementsGrowth: 0,
        messagesGrowth: 0,
        feedbackGrowth: data.growth_stats?.feedbacks_growth || 0,
      },
       totalFeedbacks: data.total_feedbacks,
      pendingFeedbacks: data.pending_feedbacks,
      recentFeedbacks: data.recent_feedbacks?.map((feedback: any) => ({
        id: feedback.id,
        title: feedback.title,
        userName: feedback.user_name,
        userType: feedback.user_type,
        status: feedback.status,
        createdAt: feedback.created_at,
        urgency: feedback.urgency
      })),
      feedbackStats: data.feedback_stats ? {
        total: data.feedback_stats.total,
        pending: data.feedback_stats.pending,
        responded: data.feedback_stats.responded,
        thisWeek: data.feedback_stats.this_week,
        byUserType: {
          clients: data.feedback_stats.by_user_type?.clients || 0,
          artisans: data.feedback_stats.by_user_type?.artisans || 0,
        }
      } : undefined
    };
  }

  async getUsers(filters?: {
    type?: 'client' | 'artisan';
    status?: 'active' | 'banned';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number; totalPages: number }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

  const url = `${API_BASE_URL}/admin/users?${params.toString()}`;
  console.log('🌐 URL appelée:', url);
  
  const headers = this.getAuthHeaders();
  console.log('🔑 Headers:', headers);

  try {
    const response = await fetch(url, {
      headers: headers
    });

    console.log('📡 Réponse API Status:', response.status);
    console.log('📡 Réponse API StatusText:', response.statusText);
    console.log('📡 Réponse API Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API détaillée:', errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 Données reçues complètes:', data);
    console.log('📊 Type de data:', typeof data);
    console.log('📊 data.users existe?', !!data.users);
    console.log('📊 Nombre d\'users:', data.users?.length);
    
    return {
        users: data.users?.map((user: any) => ({
          id: user.id,
          type: user.type,
          email: user.email,
          // Client fields
          firstName: user.first_name,
          lastName: user.last_name,
          fullName: user.full_name,
          // Artisan fields
          companyName: user.company_name,
          verified: user.verified,
          averageRating: user.average_rating,
          totalReviews: user.total_reviews,
          // Common fields
          createdAt: user.created_at,
          banned: user.banned,
          lastLogin: user.last_login,
          activityCount: user.activity_count,
          phone: user.phone,
          city: user.city,
          address: user.address,
          siren: user.siren
        })) || [],
        total: data.total || data.users?.length || 0,
        totalPages: data.totalPages || 1
      };
    } catch (error) {
      console.error('❌ Erreur complète dans getUsers:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: number, userType: 'client' | 'artisan', action: 'ban' | 'unban'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/${action}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        user_type: userType,
        action 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la mise à jour du statut: ${errorText}`);
    }
  }

  async getStatistics(filters?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<StatisticData[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value);
        }
      });
    }

    console.log('🌐 URL appelée:', `${API_BASE_URL}/admin/statistics?${params.toString()}`);

    const response = await fetch(`${API_BASE_URL}/admin/statistics?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });

    console.log('📡 Réponse API:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Données reçues de l\'API:', data);
    console.log('📊 Type des données:', typeof data);
    console.log('📊 Nombre d\'éléments:', Array.isArray(data) ? data.length : 'Pas un tableau');

    return data;
  }

  async exportData(type: 'users' | 'statistics', format: 'csv' | 'xlsx'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/admin/export/${type}?format=${format}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'export des données');
    }

    return response.blob();
  }

  async getUserDetails(userId: number, userType: 'client' | 'artisan'): Promise<UserDetails> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}?user_type=${userType}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des détails utilisateur');
    }

    const data = await response.json();

    const baseUser: UserDetails = {
      id: data.user.id,
      type: data.user.type,
      email: data.user.email,
      firstName: data.user.first_name,
      lastName: data.user.last_name,
      fullName: data.user.full_name,
      companyName: data.user.company_name,
      verified: data.user.verified,
      averageRating: data.user.average_rating,
      totalReviews: data.user.total_reviews,
      createdAt: data.user.created_at,
      banned: data.user.banned,
      lastLogin: data.user.last_login,
      activityCount: data.user.activity_count,
      phone: data.user.phone,
      city: data.user.city,
      address: data.user.address,
      siren: data.user.siren,
      
      // Données spécifiques selon le type
      besoins: data.user.besoins || undefined,
      recentMessages: data.user.recent_messages || undefined,
      expertises: data.user.expertises || undefined,
      activeConversations: data.user.active_conversations || undefined,
      reviews: data.user.reviews || undefined
    };

    return baseUser;
  }

  async getFeedbacks(filters?: {
    status?: 'pending' | 'responded' | 'archived';
    user_type?: 'client' | 'artisan';
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<Feedback[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/admin/feedbacks?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors du chargement des feedbacks: ${errorText}`);
    }

    const data = await response.json();
    
    // Transformer les données pour correspondre à votre interface
    return data.feedbacks?.map((feedback: any) => ({
      id: feedback.id,
      title: feedback.title,
      content: feedback.content,
      user_name: feedback.user?.name || 'Utilisateur inconnu',
      user_email: feedback.user?.email || 'Email non disponible',
      user_type: feedback.user_type,
      status: feedback.status,
      admin_response: feedback.admin_response,
      created_at: feedback.created_at,
      responded_at: feedback.responded_at
    })) || [];
  }

  // Répondre à un feedback
  async respondToFeedback(feedbackId: number, adminResponse: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/feedbacks/${feedbackId}`, {
      method: 'PATCH', // Utilisez PATCH au lieu de PUT pour correspondre à votre backend
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        feedback: {
          admin_response: adminResponse,
          status: 'responded'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de l'envoi de la réponse: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.errors?.join(', ') || 'Erreur lors de l\'envoi de la réponse');
    }
  }

  // Méthode bonus : Actions en masse sur les feedbacks
  async bulkUpdateFeedbacks(feedbackIds: number[], action: 'archive' | 'mark_responded' | 'mark_pending'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/feedbacks/bulk_update`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        feedback_ids: feedbackIds,
        bulk_action: action
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la mise à jour en masse: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la mise à jour en masse');
    }
  }
}

export const adminApi = new AdminApi();

