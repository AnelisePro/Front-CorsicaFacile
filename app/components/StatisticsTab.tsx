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
              <div className={styles.chartHeader}>
                <div className={styles.chartTitleContainer}>
                  <h3>Évolution des performances</h3>
                </div>
                <div className={styles.chartLegend}>
                  <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.viewsDot}`}></div>
                    <span>Vues du profil</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.contactsDot}`}></div>
                    <span>Contacts reçus</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.modernChartContainer}>
                <Line
                  data={{
                    labels: Object.keys(statistics.data.views_evolution),
                    datasets: [
                      {
                        label: 'Vues du profil',
                        data: Object.values(statistics.data.views_evolution),
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3498db',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                      },
                      {
                        label: 'Contacts reçus',
                        data: Object.values(statistics.data.contacts_evolution),
                        borderColor: '#81A04A',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#81A04A',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index' as const,
                      intersect: false,
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 12,
                        displayColors: true,
                        titleFont: { 
                          size: 14, 
                          weight: 'bold' as const 
                        },
                        bodyFont: { 
                          size: 13 
                        },
                      },
                    },
                    scales: {
                      x: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Période',
                          color: '#5E3E23',
                          font: {
                            size: 14,
                            weight: 'bold' as const,
                          },
                          padding: {
                            top: 10
                          }
                        },
                        grid: { 
                          display: false 
                        },
                        ticks: {
                          color: '#5E3E23',
                          font: { 
                            size: 12, 
                            weight: 500 
                          },
                        },
                      },
                      y: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Nombre de vues / contacts',
                          color: '#5E3E23',
                          font: {
                            size: 14,
                            weight: 'bold' as const,
                          },
                          padding: {
                            bottom: 10
                          }
                        },
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(107, 114, 128, 0.1)',
                        },
                        ticks: {
                          color: '#5E3E23',
                          font: { 
                            size: 12, 
                            weight: 500 
                          },
                          padding: 12,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

          {/* Géolocalisation */}
          <div className={styles.locationSection}>
            <div className={styles.locationHeader}>
              <div className={styles.locationTitleContainer}>
                <h3>Provenance des visiteurs</h3>
              </div>
            </div>
            
            <div className={styles.locationGrid}>
              {statistics.data.visitor_locations.map(([location, count], index) => (
                <div key={location} className={`${styles.locationCard} ${styles[`locationRank${Math.min(index + 1, 3)}`]}`}>
                  <div className={styles.locationCardHeader}>
                    <div className={styles.locationRank}>#{index + 1}</div>
                  </div>
                  <div className={styles.locationName}>{location}</div>
                  <div className={styles.locationStats}>
                    <span className={styles.locationCount}>{count}</span>
                    <span className={styles.locationLabel}>vues</span>
                  </div>
                  <div className={styles.locationProgress}>
                    <div 
                      className={styles.locationProgressBar}
                      style={{ 
                        width: `${(count / Math.max(...statistics.data.visitor_locations.map(([, c]) => c))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par dispositif */}
          <div className={styles.deviceSection}>
            <div className={styles.deviceHeader}>
              <div className={styles.deviceTitleContainer}>
                <h3>Dispositifs utilisés</h3>
              </div>
            </div>
            
            <div className={styles.deviceContent}>
              {/* Graphique compact à gauche */}
              <div className={styles.compactChart}>
                <Doughnut
                  data={{
                    labels: Object.keys(statistics.data.device_breakdown),
                    datasets: [
                      {
                        data: Object.values(statistics.data.device_breakdown),
                        backgroundColor: [
                          '#3498db',
                          '#81A04A',
                          '#e74c3c',
                          '#f39c12',
                          '#9b59b6',
                        ],
                        borderWidth: 0,
                        hoverBorderWidth: 0,
                        hoverBackgroundColor: [
                          '#3498db',
                          '#81A04A',
                          '#e74c3c',
                          '#f39c12',
                          '#9b59b6',
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    interaction: {
                      intersect: false,
                      mode: 'index' as const,
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        enabled: false,
                      },
                    },
                    onHover: (event, elements) => {
                      if (event.native?.target) {
                        (event.native.target as HTMLElement).style.cursor = 'default';
                      }
                    },
                    elements: {
                      arc: {
                        hoverBorderWidth: 0,
                      },
                    },
                  }}
                />
              </div>

              {/* Statistiques détaillées à droite */}
              <div className={styles.deviceStats}>
                {Object.entries(statistics.data.device_breakdown).map(([device, count], index) => {
                  const total = Object.values(statistics.data.device_breakdown).reduce((a: number, b: number) => a + b, 0);
                  const percentage = ((count / total) * 100).toFixed(1);
                  const colors = ['#3498db', '#81A04A', '#e74c3c', '#f39c12', '#9b59b6'];
                  
                  return (
                    <div key={device} className={styles.deviceItem}>
                      <div className={styles.deviceItemHeader}>
                        <div className={styles.deviceDot} style={{ backgroundColor: colors[index] }}></div>
                        <span className={styles.deviceName}>
                          {device === 'desktop' ? '🖥️ Ordinateur' :
                          device === 'mobile' ? '📱 Mobile' :
                          device === 'tablet' ? '📱 Tablette' :
                          device}
                        </span>
                      </div>
                      <div className={styles.deviceValues}>
                        <span className={styles.deviceCount}>{count}</span>
                        <span className={styles.devicePercentage}>{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.reviewsSection}>
            <div className={styles.reviewsHeader}>
              <h3>Répartition des avis</h3>
            </div>
            
            <div className={styles.reviewsContent}>
              {/* Résumé général à gauche */}
              <div className={styles.reviewsSummary}>
                <div className={styles.averageRating}>
                  <span className={styles.ratingNumber}>
                    {(() => {
                      const ratings = statistics.data.reviews_distribution;
                      const total = Object.values(ratings).reduce((a: number, b: number) => a + b, 0);
                      if (total === 0) return '0.0';
                      const sum = Object.entries(ratings).reduce((acc, [star, count]) => acc + (Number(star) * count), 0);
                      return (sum / total).toFixed(1);
                    })()}
                  </span>
                  <div className={styles.starsDisplay}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={styles.star}>⭐</span>
                    ))}
                  </div>
                  <span className={styles.totalReviews}>
                    {Object.values(statistics.data.reviews_distribution).reduce((a: number, b: number) => a + b, 0)} avis
                  </span>
                </div>
              </div>

              {/* Barres de progression à droite */}
              <div className={styles.reviewsBars}>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = statistics.data.reviews_distribution[rating] || 0;
                  const total = Object.values(statistics.data.reviews_distribution).reduce((a: number, b: number) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  const colors: { [key: number]: string } = {
                    5: '#FFD700',
                    4: '#28a745',
                    3: '#ffc107',
                    2: '#ff6c35',
                    1: '#dc3545',
                  };

                  return (
                    <div key={rating} className={styles.reviewBar}>
                      <div className={styles.reviewBarLabel}>
                        <span className={styles.starLabel}>{rating}⭐</span>
                        <span className={styles.reviewCount}>{count}</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: colors[rating],
                            animationDelay: `${(5 - rating) * 0.1}s`
                          }}
                        ></div>
                      </div>
                      <span className={styles.percentage}>{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Métriques avancées */}
          <div className={styles.advancedMetrics}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon}>
                  <span className={styles.iconBackground} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    ⏱️
                  </span>
                </div>
                <h4 className={styles.metricTitle}>Temps de session moyen</h4>
              </div>
              <div className={styles.metricStats}>
                <div className={styles.metricValue}>{statistics.data.avg_session_duration}s</div>
                <div className={styles.metricSubtext}>par visiteur</div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon}>
                  <span className={styles.iconBackground} style={{ backgroundColor: 'rgba(129, 160, 74, 0.1)' }}>
                    🔁
                  </span>
                </div>
                <h4 className={styles.metricTitle}>Taux de retour</h4>
              </div>
              <div className={styles.metricStats}>
                <div className={styles.metricValue}>{statistics.data.return_visitor_rate}%</div>
                <div className={styles.metricSubtext}>visiteurs fidèles</div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon}>
                  <span className={styles.iconBackground} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                    ⚡
                  </span>
                </div>
                <h4 className={styles.metricTitle}>Temps avant contact</h4>
              </div>
              <div className={styles.metricStats}>
                <div className={styles.metricValue}>{statistics.data.avg_time_to_contact}</div>
                <div className={styles.metricSubtext}>temps moyen</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Message d'upgrade pour les Pro */}
      {!canViewAdvanced && artisan?.membership_plan === 'Pro' && (
        <div className={styles.upgradePrompt}>
          <div className={styles.upgradeIcon}>
            <span className={styles.iconGradient}>🚀</span>
          </div>
          
          <div className={styles.upgradeContent}>
            <h3 className={styles.upgradeTitle}>
              Débloquez les <span className={styles.highlight}>statistiques avancées</span> avec Premium !
            </h3>
            
            <p className={styles.upgradeDescription}>
              Graphiques détaillés, géolocalisation, analyse comportementale et plus encore...
            </p>
            
            <div className={styles.featuresList}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📊</span>
                <span>Graphiques interactifs</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🌍</span>
                <span>Géolocalisation visiteurs</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🔍</span>
                <span>Analyse comportementale</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📈</span>
                <span>Rapports détaillés</span>
              </div>
            </div>
            
            <div className={styles.upgradeButton}>
              <span className={styles.buttonIcon}>⭐</span>
              Passer à Premium en modifiant votre formule 
            </div>
          </div>
          
          <div className={styles.decorativeElements}>
            <div className={styles.floatingShape1}></div>
            <div className={styles.floatingShape2}></div>
            <div className={styles.floatingShape3}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsTab;
