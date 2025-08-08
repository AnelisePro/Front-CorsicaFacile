import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import '../lib/chartConfig'
import { Artisan } from '../types/artisan'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './StatisticsTab.module.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BasicStatisticsData {
  type: 'basic';
  period: 'week' | 'month';
  data: {
    total_profile_views: number;
    total_contact_clicks: number;
    conversion_rate: number;
    average_rating: number;
    total_reviews: number;
  };
}

interface AdvancedStatisticsData {
  type: 'advanced';
  period: 'week' | 'month';
  data: {
    // Données de base
    total_profile_views: number;
    total_contact_clicks: number;
    conversion_rate: number;
    average_rating: number;
    total_reviews: number;
    // Données avancées
    views_evolution: { [date: string]: number };
    contacts_evolution: { [date: string]: number };
    visitor_locations: [string, number][];
    device_breakdown: { [device: string]: number };
    avg_session_duration: number;
    return_visitor_rate: number;
    reviews_distribution: { [rating: number]: number };
    avg_time_to_contact: string;
  };
}

type StatisticsData = BasicStatisticsData | AdvancedStatisticsData;


interface StatisticsTabProps {
  artisan: Artisan;
  token: string;
}

const StatisticsTab: React.FC<StatisticsTabProps> = ({ artisan, token }) => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const canViewStats = ['Pro', 'Premium'].includes(artisan?.membership_plan);
  const canViewAdvanced = artisan?.membership_plan === 'Premium';

  useEffect(() => {
    if (canViewStats) {
      fetchStatistics();
    } else {
      setLoading(false);
    }
  }, [period, canViewStats]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/v1/artisan_statistics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');

      const data: StatisticsData = await response.json();
      setStatistics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isAdvancedStatistics = (stats: StatisticsData): stats is AdvancedStatisticsData => {
    return stats.type === 'advanced';
  };

  if (!canViewStats) {
    return (
      <div className={styles.upgradePrompt}>
        <h3>📊 Statistiques disponibles avec Pro/Premium</h3>
        <div className={styles.planComparison}>
          <div className={styles.planCard}>
            <h4>🔹 Formule Pro — Statistiques limitées</h4>
            <p>Affichage basique, utile mais restreint :</p>
            <ul>
              <li>Nombre total de vues de profil (par semaine/mois)</li>
              <li>Nombre de fois contacté</li>
              <li>Note moyenne globale</li>
              <li>Nombre total d'avis</li>
              <li>Pas de ventilation détaillée</li>
            </ul>
          </div>
          
          <div className={styles.planCard}>
            <h4>🔸 Formule Premium — Statistiques complètes</h4>
            <p>Affichage avancé, utile pour améliorer votre présence :</p>
            <ul>
              <li>Tout ce que contient la formule Pro, plus :</li>
              <li>Évolution des vues dans le temps (graphiques)</li>
              <li>Géolocalisation des visiteurs</li>
              <li>Taux de conversion (clics contact vs vues)</li>
              <li>Analyse détaillée des avis clients</li>
              <li>Temps moyen avant 1er contact</li>
              <li>Taux de retour des visiteurs</li>
              <li>Répartition par dispositif (mobile/desktop)</li>
            </ul>
          </div>
        </div>
        
        <button className={styles.upgradeButton}>
          Passer à Pro/Premium
        </button>
      </div>
    );
  }

  if (loading) return <div className={styles.loading}>Chargement des statistiques...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!statistics) return <div className={styles.noData}>Aucune donnée disponible</div>;
  if (!canViewStats) return <div className={styles.upgrade}>Formule Pro ou Premium requise</div>;

  const { data } = statistics;

  return (
    <div className={styles.statisticsTab}>
      {/* En-tête avec sélection de période */}
      <div className={styles.header}>
        <div className={styles.periodSelector}>
          <button
            className={period === 'week' ? styles.active : ''}
            onClick={() => setPeriod('week')}
          >
            Cette semaine
          </button>
          <button
            className={period === 'month' ? styles.active : ''}
            onClick={() => setPeriod('month')}
          >
            Ce mois
          </button>
        </div>
      </div>

      {/* Statistiques de base (Pro + Premium) */}
      <div className={styles.basicStats}>
        <div className={styles.statCard}>
          <h3>👀 Vues du profil</h3>
          <div className={styles.statValue}>{data.total_profile_views}</div>
          <div className={styles.statPeriod}>sur {period === 'week' ? 'la semaine' : 'le mois'}</div>
        </div>

        <div className={styles.statCard}>
          <h3>📞 Contacts reçus</h3>
          <div className={styles.statValue}>{data.total_contact_clicks}</div>
          <div className={styles.statPeriod}>clics sur "Contacter"</div>
        </div>

        <div className={styles.statCard}>
          <h3>📈 Taux de conversion</h3>
          <div className={styles.statValue}>{data.conversion_rate}%</div>
          <div className={styles.statPeriod}>vues → contacts</div>
        </div>

        <div className={styles.statCard}>
          <h3>⭐ Note moyenne</h3>
          <div className={styles.statValue}>{data.average_rating}/5</div>
          <div className={styles.statPeriod}>{data.total_reviews} avis total</div>
        </div>
      </div>

      {/* ✅ Statistiques avancées */}
      {canViewAdvanced && isAdvancedStatistics(statistics) && (
        <>
          {/* Graphique d'évolution */}
          <div className={styles.chartSection}>
            <h3>📊 Évolution des vues et contacts</h3>
            <div className={styles.chartContainer}>
              <Line
                data={{
                  labels: Object.keys(statistics.data.views_evolution),
                  datasets: [
                    {
                      label: 'Vues du profil',
                      data: Object.values(statistics.data.views_evolution),
                      borderColor: 'rgb(54, 162, 235)',
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    },
                    {
                      label: 'Contacts reçus',
                      data: Object.values(statistics.data.contacts_evolution),
                      borderColor: 'rgb(255, 99, 132)',
                      backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const },
                    title: { display: true, text: 'Évolution dans le temps' },
                  },
                }}
              />
            </div>
          </div>

          {/* Géolocalisation */}
          <div className={styles.locationSection}>
            <h3>🌍 Provenance des visiteurs</h3>
            <div className={styles.locationList}>
              {statistics.data.visitor_locations.map(([location, count]) => (
                <div key={location} className={styles.locationItem}>
                  <span>{location}</span>
                  <span className={styles.locationCount}>{count} vues</span>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par dispositif */}
          <div className={styles.chartSection}>
            <h3>📱 Dispositifs utilisés</h3>
            <div className={styles.chartContainer}>
              <Doughnut
                data={{
                  labels: Object.keys(statistics.data.device_breakdown),
                  datasets: [
                    {
                      data: Object.values(statistics.data.device_breakdown),
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' as const },
                  },
                }}
              />
            </div>
          </div>

          {/* Distribution des avis */}
          <div className={styles.chartSection}>
            <h3>💬 Répartition des avis</h3>
            <div className={styles.chartContainer}>
              <Bar
                data={{
                  labels: ['5⭐', '4⭐', '3⭐', '2⭐', '1⭐'],
                  datasets: [
                    {
                      label: 'Nombre d\'avis',
                      data: [
                        statistics.data.reviews_distribution[5] || 0,
                        statistics.data.reviews_distribution[4] || 0,
                        statistics.data.reviews_distribution[3] || 0,
                        statistics.data.reviews_distribution[2] || 0,
                        statistics.data.reviews_distribution[1] || 0,
                      ],
                      backgroundColor: [
                        'rgba(255, 193, 7, 0.8)',   // 5 étoiles - doré
                        'rgba(40, 167, 69, 0.8)',   // 4 étoiles - vert
                        'rgba(255, 193, 7, 0.6)',   // 3 étoiles - jaune
                        'rgba(255, 108, 53, 0.8)',  // 2 étoiles - orange
                        'rgba(220, 53, 69, 0.8)',   // 1 étoile - rouge
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Métriques avancées */}
          <div className={styles.advancedMetrics}>
            <div className={styles.metricCard}>
              <h4>⏱️ Temps de session moyen</h4>
              <div className={styles.metricValue}>{statistics.data.avg_session_duration}s</div>
            </div>

            <div className={styles.metricCard}>
              <h4>🔁 Taux de retour</h4>
              <div className={styles.metricValue}>{statistics.data.return_visitor_rate}%</div>
            </div>

            <div className={styles.metricCard}>
              <h4>⚡ Temps avant contact</h4>
              <div className={styles.metricValue}>{statistics.data.avg_time_to_contact}</div>
            </div>
          </div>
        </>
      )}

      {/* Message d'upgrade pour les Pro */}
      {!canViewAdvanced && artisan?.membership_plan === 'Pro' && (
        <div className={styles.upgradePrompt}>
          <h3>Débloquez les statistiques avancées avec Premium !</h3>
          <p>Graphiques détaillés, géolocalisation, analyse comportementale et plus encore...</p>
          <button className={styles.upgradeButton}>
            Passer à Premium
          </button>
        </div>
      )}
    </div>
  );
};

export default StatisticsTab;
