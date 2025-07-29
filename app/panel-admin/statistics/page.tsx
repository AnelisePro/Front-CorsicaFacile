'use client';

import { useState, useEffect } from 'react';
import StatsChart from '../../components/admin/StatsChart';
import { adminApi } from '../../lib/admin/adminApi';
import styles from './page.module.scss'

interface Statistics {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  clientSignups: number;
  artisanSignups: number;
  messagesSent: number;
  announcementsPosted: number;
}

export default function AdminStatistics() {
  const [statistics, setStatistics] = useState<Statistics[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState({
    totalPageViews: 0,
    totalVisitors: 0,
    totalSignups: 0,
    avgDaily: 0
  });

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      // ✅ Correction 1: passer un objet avec groupBy
      const data = await adminApi.getStatistics({ groupBy: period });
      
      // ✅ Correction 2: data est directement le tableau StatisticData[]
      setStatistics(data);
      
      // Calculer les résumés
      const totalPageViews = data.reduce((sum: number, stat: Statistics) => sum + stat.pageViews, 0);
      const totalVisitors = data.reduce((sum: number, stat: Statistics) => sum + stat.uniqueVisitors, 0);
      const totalSignups = data.reduce((sum: number, stat: Statistics) => 
        sum + stat.clientSignups + stat.artisanSignups, 0);
      
      setSummaryStats({
        totalPageViews,
        totalVisitors,
        totalSignups,
        avgDaily: Math.round(totalPageViews / data.length)
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Statistiques</h1>
            <p className={styles.subtitle}>
              Analysez les performances et tendances de votre plateforme
            </p>
          </div>
          
          {/* Sélecteur de période */}
          <div className={styles.periodSelector}>
            {[
              { value: 'day', label: 'Jour' },
              { value: 'week', label: 'Semaine' },
              { value: 'month', label: 'Mois' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value as 'day' | 'week' | 'month')}
                className={`${styles.periodButton} ${
                  period === option.value ? styles.active : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résumé des statistiques */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.blue}`}>
          <div className={styles.cardContent}>
            <span className={styles.cardIcon}>👁️</span>
            <div className={styles.cardText}>
              <p className={styles.cardLabel}>Pages vues totales</p>
              <p className={styles.cardValue}>{summaryStats.totalPageViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className={`${styles.summaryCard} ${styles.green}`}>
          <div className={styles.cardContent}>
            <span className={styles.cardIcon}>👤</span>
            <div className={styles.cardText}>
              <p className={styles.cardLabel}>Visiteurs uniques</p>
              <p className={styles.cardValue}>{summaryStats.totalVisitors.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className={`${styles.summaryCard} ${styles.purple}`}>
          <div className={styles.cardContent}>
            <span className={styles.cardIcon}>📝</span>
            <div className={styles.cardText}>
              <p className={styles.cardLabel}>Inscriptions totales</p>
              <p className={styles.cardValue}>{summaryStats.totalSignups.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className={`${styles.summaryCard} ${styles.yellow}`}>
          <div className={styles.cardContent}>
            <span className={styles.cardIcon}>📊</span>
            <div className={styles.cardText}>
              <p className={styles.cardLabel}>Moyenne quotidienne</p>
              <p className={styles.cardValue}>{summaryStats.avgDaily.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Trafic du site</h3>
          <StatsChart
            data={statistics.map(stat => ({
              date: stat.date,
              'Pages vues': stat.pageViews,
              'Visiteurs uniques': stat.uniqueVisitors
            }))}
            type="line"
          />
        </div>
        
        <div className={styles.chartCard}>
          <h3>Nouvelles inscriptions</h3>
          <StatsChart
            data={statistics.map(stat => ({
              date: stat.date,
              'Clients': stat.clientSignups,
              'Artisans': stat.artisanSignups
            }))}
            type="bar"
          />
        </div>
        
        <div className={styles.chartCard}>
          <h3>Activité utilisateurs</h3>
          <StatsChart
            data={statistics.map(stat => ({
              date: stat.date,
              'Messages': stat.messagesSent,
              'Annonces': stat.announcementsPosted
            }))}
            type="line"
          />
        </div>
        
        <div className={styles.chartCard}>
          <h3>Répartition par type d'utilisateur</h3>
          <div className={styles.distributionContent}>
            {statistics.slice(-7).map((stat, index) => (
              <div key={index} className={styles.distributionItem}>
                <div className={styles.dateLabel}>
                  {new Date(stat.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </div>
                <div className={styles.barContainer}>
                  <div className={styles.bar}>
                    <div 
                      className={styles.clientBar}
                      style={{ 
                        width: `${(stat.clientSignups / (stat.clientSignups + stat.artisanSignups)) * 100 || 0}%` 
                      }}
                    ></div>
                    <div 
                      className={styles.artisanBar}
                      style={{ 
                        width: `${(stat.artisanSignups / (stat.clientSignups + stat.artisanSignups)) * 100 || 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className={styles.totalLabel}>
                  {stat.clientSignups + stat.artisanSignups}
                </div>
              </div>
            ))}
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.blue}`}></div>
                Clients
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.green}`}></div>
                Artisans
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3>Données détaillées</h3>
        </div>
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Pages vues</th>
                <th>Visiteurs uniques</th>
                <th>Clients inscrits</th>
                <th>Artisans inscrits</th>
                <th>Messages</th>
                <th>Annonces</th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((stat, index) => (
                <tr key={index}>
                  <td>{new Date(stat.date).toLocaleDateString('fr-FR')}</td>
                  <td>{stat.pageViews.toLocaleString()}</td>
                  <td>{stat.uniqueVisitors.toLocaleString()}</td>
                  <td>{stat.clientSignups}</td>
                  <td>{stat.artisanSignups}</td>
                  <td>{stat.messagesSent.toLocaleString()}</td>
                  <td>{stat.announcementsPosted.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

