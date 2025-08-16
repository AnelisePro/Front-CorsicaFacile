'use client';

import { useState, useEffect } from 'react';
import StatsCard from '../../components/admin/StatsCard';
import { useAdminAuth } from '../../lib/admin/useAdminAuth';
import { adminApi } from '../../lib/admin/adminApi';
import styles from './page.module.scss';

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const fetchDashboardStats = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              Tableau de bord
            </h1>
            <p className={styles.subtitle}>
              Vue d'ensemble de l'activité de votre plateforme
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className={styles.statsGrid}>
        <StatsCard
          title="Total Clients"
          value={stats?.totalUsers.clients || 0}
          change={`${stats?.growth.usersGrowth || 0}%`}
          changeType="positive"
          icon="👥"
          color="blue"
          subtitle="Utilisateurs actifs"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Artisans"
          value={stats?.totalUsers.artisans || 0}
          change={`+${stats?.growth.usersGrowth || 0}%`}
          changeType="positive"
          icon="🔨"
          color="green"
          subtitle="Professionnels"
          isLoading={isLoading}
        />
        <StatsCard
          title="Annonces"
          value={stats?.totalActivity.announcements || 0}
          change={`+${stats?.growth.announcementsGrowth || 0}%`}
          changeType="positive"
          icon="📝"
          color="yellow"
          subtitle="Besoins publiés"
          isLoading={isLoading}
        />
        <StatsCard
          title="Messages"
          value={stats?.totalActivity.messages || 0}
          change={`+${stats?.growth.messagesGrowth || 0}%`}
          changeType="positive"
          icon="💬"
          color="purple"
          subtitle="Échanges"
          isLoading={isLoading}
        />
      </div>

      {/* Section Feedbacks */}
      <div className={styles.mainSection}>
        {stats?.feedbackStats && (
          <div className={`${styles.card} ${styles.feedbacksMainCard}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>💬</span>
              <h2 className={styles.cardTitle}>Gestion des Avis</h2>
              <button 
                onClick={() => window.location.href = '/panel-admin/feedbacks'}
                className={styles.viewAllBtn}
              >
                Voir tout
              </button>
            </div>

            {/* Mini stats cards */}
            <div className={styles.miniStatsGrid}>
              <div className={styles.miniStatsCard}>
                <div className={styles.miniStatsContent}>
                  <span className={styles.miniStatsIcon}>⭐</span>
                  <div className={styles.miniStatsText}>
                    <div className={styles.miniStatsValue}>{stats?.feedbackStats?.total || 0}</div>
                    <div className={styles.miniStatsLabel}>Total Feedbacks</div>
                  </div>
                </div>
              </div>

              <div className={styles.miniStatsCard}>
                <div className={styles.miniStatsContent}>
                  <span className={styles.miniStatsIcon}>⏳</span>
                  <div className={styles.miniStatsText}>
                    <div className={styles.miniStatsValue}>{stats?.feedbackStats?.pending || 0}</div>
                    <div className={styles.miniStatsLabel}>En attente</div>
                  </div>
                  {stats?.feedbackStats?.pending > 0 && (
                    <div className={`${styles.miniStatsChange} ${styles.warning}`}>
                      Action requise
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Liste des feedbacks récents */}
            <div className={styles.recentFeedbacksSection}>
              <h3 className={styles.sectionSubtitle}>Avis récents</h3>
              <div className={styles.feedbacksList}>
                {stats.recentFeedbacks && stats.recentFeedbacks.length ? (
                  stats.recentFeedbacks.slice(0, 3).map((feedback) => (
                    <div key={feedback.id} className={styles.feedbackItem}>
                      <div className={styles.feedbackContent}>
                        <div className={styles.feedbackMeta}>
                          <span className={styles.userType}>
                            {feedback.userType === 'Client' ? '👤' : '🔨'} {feedback.userName}
                          </span>
                          <span className={`${styles.status} ${styles[feedback.status]}`}>
                            {feedback.status === 'pending' ? 'En attente' : 'Répondu'}
                          </span>
                        </div>
                        <h4 className={styles.feedbackTitle}>{feedback.title}</h4>
                        <span className={styles.feedbackDate}>{feedback.createdAt}</span>
                      </div>
                      <button 
                        onClick={() => window.location.href = `/panel-admin/feedbacks`}
                        className={styles.respondBtn}
                      >
                        {feedback.status === 'pending' ? 'Répondre' : 'Voir'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📝</span>
                    <p>Aucun avis récent</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inscriptions récentes */}
        <div className={`${styles.card} ${styles.signupsCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>📈</span>
            <h2 className={styles.cardTitle}>Inscriptions récentes</h2>
          </div>
          
          <div className={styles.signupsContent}>
            <div className={styles.signupSection}>
              <div className={`${styles.sectionBorder} ${styles.today}`}>
                <h3 className={styles.sectionTitle}>Aujourd'hui</h3>
                <div className={styles.statsRow}>
                  <div className={`${styles.statItem} ${styles.clients}`}>
                    <div className={`${styles.statValue} ${styles.clients}`}>
                      +{stats?.recentSignups.clientsToday || 0}
                    </div>
                    <div className={styles.statLabel}>Clients</div>
                  </div>
                  <div className={`${styles.statItem} ${styles.artisans}`}>
                    <div className={`${styles.statValue} ${styles.artisans}`}>
                      +{stats?.recentSignups.artisansToday || 0}
                    </div>
                    <div className={styles.statLabel}>Artisans</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.signupSection}>
              <div className={`${styles.sectionBorder} ${styles.week}`}>
                <h3 className={styles.sectionTitle}>Cette semaine</h3>
                <div className={styles.statsRow}>
                  <div className={`${styles.statItem} ${styles.clients}`}>
                    <div className={`${styles.statValue} ${styles.clients}`}>
                      +{stats?.recentSignups.clientsThisWeek || 0}
                    </div>
                    <div className={styles.statLabel}>Clients</div>
                  </div>
                  <div className={`${styles.statItem} ${styles.artisans}`}>
                    <div className={`${styles.statValue} ${styles.artisans}`}>
                      +{stats?.recentSignups.artisansThisWeek || 0}
                    </div>
                    <div className={styles.statLabel}>Artisans</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className={`${styles.card} ${styles.actionsCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>⚡</span>
            <h2 className={styles.cardTitle}>Actions rapides</h2>
          </div>
          
          <div className={styles.actionsList}>
            <button 
              onClick={() => window.location.href = '/panel-admin/users'}
              className={`${styles.actionItem} ${styles.users}`}
            >
              <div className={styles.actionContent}>
                <span className={styles.actionIcon}>👥</span>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>Gérer les utilisateurs</div>
                  <div className={styles.actionDescription}>Voir tous les clients et artisans</div>
                </div>
                <span className={styles.actionArrow}>→</span>
              </div>
            </button>
            
            {/* Action Feedbacks */}
            {stats?.pendingFeedbacks !== undefined && (
              <button 
                onClick={() => window.location.href = '/panel-admin/feedbacks'}
                className={`${styles.actionItem} ${styles.feedbacks}`}
              >
                <div className={styles.actionContent}>
                  <span className={styles.actionIcon}>💬</span>
                  <div className={styles.actionText}>
                    <div className={styles.actionTitle}>Gérer les avis</div>
                    <div className={styles.actionDescription}>
                      {stats.pendingFeedbacks} avis en attente
                    </div>
                  </div>
                  <span className={styles.actionArrow}>→</span>
                </div>
              </button>
            )}
            
            <button 
              onClick={() => window.location.href = '/panel-admin/statistics'}
              className={`${styles.actionItem} ${styles.stats}`}
            >
              <div className={styles.actionContent}>
                <span className={styles.actionIcon}>📊</span>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>Voir les statistiques</div>
                  <div className={styles.actionDescription}>Analyse détaillée du trafic</div>
                </div>
                <span className={styles.actionArrow}>→</span>
              </div>
            </button>
            
            <button className={`${styles.actionItem} ${styles.config}`}>
              <div className={styles.actionContent}>
                <span className={styles.actionIcon}>⚙️</span>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>Configuration</div>
                  <div className={styles.actionDescription}>Paramètres de la plateforme (onglet inactif)</div>
                </div>
                <span className={styles.actionArrow}>→</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className={`${styles.card} ${styles.activityCard}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}>🕒</span>
          <h2 className={styles.cardTitle}>Activité récente</h2>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🚧</div>
          <p className={styles.emptyTitle}>Fonctionnalité en cours de développement</p>
          <p className={styles.emptySubtitle}>Bientôt disponible : flux d'activité en temps réel</p>
        </div>
      </div>
    </div>
  );
}



