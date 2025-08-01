'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Statistics | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [summaryStats, setSummaryStats] = useState({
    totalPageViews: 0,
    totalVisitors: 0,
    totalSignups: 0,
    avgDaily: 0
  });

  // Fonction de recherche
  const filteredStatistics = useMemo(() => {
    if (!searchTerm) return statistics;
    
    return statistics.filter(stat => 
      new Date(stat.date).toLocaleDateString('fr-FR').includes(searchTerm.toLowerCase()) ||
      stat.pageViews.toString().includes(searchTerm) ||
      stat.uniqueVisitors.toString().includes(searchTerm) ||
      stat.clientSignups.toString().includes(searchTerm) ||
      stat.artisanSignups.toString().includes(searchTerm) ||
      stat.messagesSent.toString().includes(searchTerm) ||
      stat.announcementsPosted.toString().includes(searchTerm)
    );
  }, [statistics, searchTerm]);

  // Fonction de tri
  const sortedStatistics = useMemo(() => {
    if (!sortConfig.key) return filteredStatistics;

    return [...filteredStatistics].sort((a, b) => {
      const aValue = sortConfig.key === 'date' 
        ? new Date(a[sortConfig.key!]).getTime()
        : a[sortConfig.key!];
      const bValue = sortConfig.key === 'date'
        ? new Date(b[sortConfig.key!]).getTime() 
        : b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredStatistics, sortConfig]);

  // Fonction de tri par colonne
  const handleSort = (key: keyof Statistics) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Fonction d'export CSV
  const handleExport = () => {
    const headers = [
      'Date',
      'Pages vues',
      'Visiteurs uniques',
      'Clients inscrits',
      'Artisans inscrits',
      'Messages',
      'Annonces'
    ];

    const csvData = [
      headers.join(','),
      ...sortedStatistics.map(stat => [
        new Date(stat.date).toLocaleDateString('fr-FR'),
        stat.pageViews,
        stat.uniqueVisitors,
        stat.clientSignups,
        stat.artisanSignups,
        stat.messagesSent,
        stat.announcementsPosted
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `statistiques_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction d'export Excel (optionnel)
  const handleExportExcel = () => {
    const data = sortedStatistics.map(stat => ({
      'Date': new Date(stat.date).toLocaleDateString('fr-FR'),
      'Pages vues': stat.pageViews,
      'Visiteurs uniques': stat.uniqueVisitors,
      'Clients inscrits': stat.clientSignups,
      'Artisans inscrits': stat.artisanSignups,
      'Messages': stat.messagesSent,
      'Annonces': stat.announcementsPosted
    }));

    // Ici vous pouvez utiliser une lib comme xlsx pour l'export Excel
    console.log('Export Excel:', data);
  };

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getStatistics({ groupBy: period });
      
      setStatistics(data);
      
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
          <div className={styles.chartHeader}>
            <div className={styles.chartIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 3v18h18" strokeWidth="2"/>
                <path d="M7 12l4-4 4 4 6-6" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h3>Trafic du site</h3>
              <p className={styles.chartSubtitle}>Pages vues et visiteurs uniques</p>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <StatsChart
              data={statistics.map(stat => ({
                date: stat.date,
                'Pages vues': stat.pageViews,
                'Visiteurs uniques': stat.uniqueVisitors
              }))}
              type="line"
            />
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h3>Nouvelles inscriptions</h3>
              <p className={styles.chartSubtitle}>Évolution des nouveaux membres</p>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <StatsChart
              data={statistics.map(stat => ({
                date: stat.date,
                'Clients': stat.clientSignups,
                'Artisans': stat.artisanSignups
              }))}
              type="bar"
            />
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h3>Activité utilisateurs</h3>
              <p className={styles.chartSubtitle}>Messages et annonces publiées</p>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <StatsChart
              data={statistics.map(stat => ({
                date: stat.date,
                'Messages': stat.messagesSent,
                'Annonces': stat.announcementsPosted
              }))}
              type="line"
            />
          </div>
        </div>
        
        {/* Répartition par type de user */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartIcon}>
              {/* Nouvelle icône pie chart */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" strokeWidth="2"/>
                <path d="M22 12A10 10 0 0 0 12 2v10z" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h3>Répartition par type d'utilisateur</h3>
              <p className={styles.chartSubtitle}>Distribution clients vs artisans</p>
            </div>
          </div>
          <div className={styles.chartContainer}>
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
                        data-tooltip={`Clients: ${stat.clientSignups}`}
                      ></div>
                      <div 
                        className={styles.artisanBar}
                        style={{ 
                          width: `${(stat.artisanSignups / (stat.clientSignups + stat.artisanSignups)) * 100 || 0}%` 
                        }}
                        data-tooltip={`Artisans: ${stat.artisanSignups}`}
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
      </div>


      {/* Tableau détaillé */}
      <div className={styles.tableCard}>
        <div className={styles.chartHeader}>
          <div className={styles.chartIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18" strokeWidth="2"/>
              <path d="M3 12h18" strokeWidth="2"/>
              <path d="M3 18h18" strokeWidth="2"/>
              <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <div>
            <h3>Données détaillées</h3>
            <p className={styles.chartSubtitle}>
              {filteredStatistics.length} entrée{filteredStatistics.length > 1 ? 's' : ''} 
              {searchTerm && ` (${statistics.length} au total)`}
            </p>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.tableContainer}>
            <div className={styles.tableControls}>
              <div className={styles.searchBox}>
                <div className={styles.searchIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                    <path d="M21 21l-4.35-4.35" strokeWidth="2"/>
                  </svg>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Rechercher dans les données..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                
                {searchTerm && (
                  <button 
                    className={styles.clearSearch}
                    onClick={() => setSearchTerm('')}
                    title="Effacer la recherche"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
                      <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
                    </svg>
                  </button>
                )}
                
                <div className={styles.searchResults}>
                  {searchTerm && (
                    <span className={styles.resultsCount}>
                      {filteredStatistics.length} résultat{filteredStatistics.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.tableActions}>
                <button 
                  className={`${styles.exportBtn} ${sortedStatistics.length === 0 ? styles.disabled : ''}`}
                  onClick={handleExport}
                  disabled={sortedStatistics.length === 0}
                >
                  <div className={styles.btnIconWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2"/>
                      <polyline points="7,10 12,15 17,10" strokeWidth="2"/>
                      <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2"/>
                    </svg>
                  </div>
                  <span className={styles.btnText}>Exporter</span>
                  {sortedStatistics.length > 0 && (
                    <span className={styles.btnCounter}>{sortedStatistics.length}</span>
                  )}
                </button>

                <div className={styles.exportDropdown}>
                  <button className={styles.exportDropdownBtn}>
                    <div className={styles.dropdownIconWrapper}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="6,9 12,15 18,9" strokeWidth="2"/>
                      </svg>
                    </div>
                  </button>
                  
                  <div className={styles.exportDropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <span>Formats d'export</span>
                    </div>
                    
                    <div className={styles.dropdownContent}>
                      <button 
                        className={styles.dropdownItem}
                        onClick={handleExport}
                      >
                        <div className={styles.itemIcon}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                            <line x1="9" y1="9" x2="15" y2="9" strokeWidth="2"/>
                            <line x1="9" y1="13" x2="15" y2="13" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div className={styles.itemContent}>
                          <span className={styles.itemTitle}>CSV</span>
                          <span className={styles.itemDesc}>Valeurs séparées par virgules</span>
                        </div>
                      </button>
                      
                      <button 
                        className={styles.dropdownItem}
                        onClick={handleExportExcel}
                      >
                        <div className={styles.itemIcon}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div className={styles.itemContent}>
                          <span className={styles.itemTitle}>Excel</span>
                          <span className={styles.itemDesc}>Feuille de calcul formatée</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    {[
                      { key: 'date', label: 'Date' },
                      { key: 'pageViews', label: 'Pages vues' },
                      { key: 'uniqueVisitors', label: 'Visiteurs uniques' },
                      { key: 'clientSignups', label: 'Clients inscrits' },
                      { key: 'artisanSignups', label: 'Artisans inscrits' },
                      { key: 'messagesSent', label: 'Messages' },
                      { key: 'announcementsPosted', label: 'Annonces' }
                    ].map(({ key, label }) => (
                      <th 
                        key={key}
                        className={styles.sortable}
                        onClick={() => handleSort(key as keyof Statistics)}
                      >
                        <span>{label}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedStatistics.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.noData}>
                        <div className={styles.noDataContent}>
                          <p>Aucune donnée trouvée</p>
                          {searchTerm && (
                            <button onClick={() => setSearchTerm('')}>
                              Effacer la recherche
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                  sortedStatistics.map((stat, index) => (
                    <tr key={index} className={styles.tableRow}>
                      <td className={styles.dateColumn}>
                        <div className={styles.dateWrapper}>
                          <span className={styles.dateMain}>
                            {new Date(stat.date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className={styles.dateDay}>
                            {new Date(stat.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                          </span>
                        </div>
                      </td>
                      <td className={styles.numberColumn}>
                        <div className={styles.numberWrapper}>
                          <span className={styles.numberValue}>
                            {stat.pageViews.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className={styles.numberColumn}>
                        <span className={styles.numberValue}>
                          {stat.uniqueVisitors.toLocaleString()}
                        </span>
                      </td>
                      <td className={styles.badgeColumn}>
                        <span className={`${styles.badge} ${styles.clientBadge}`}>
                          {stat.clientSignups}
                        </span>
                      </td>
                      <td className={styles.badgeColumn}>
                        <span className={`${styles.badge} ${styles.artisanBadge}`}>
                          {stat.artisanSignups}
                        </span>
                      </td>
                      <td className={styles.numberColumn}>
                        <span className={styles.numberValue}>
                          {stat.messagesSent.toLocaleString()}
                        </span>
                      </td>
                      <td className={styles.numberColumn}>
                        <span className={styles.numberValue}>
                          {stat.announcementsPosted.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className={styles.tablePagination}>
              <div className={styles.paginationInfo}>
                Affichage de 1 à {statistics.length} sur {statistics.length} entrées
              </div>
              <div className={styles.paginationControls}>
                <button className={styles.paginationBtn} disabled>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="15,18 9,12 15,6" strokeWidth="2"/>
                  </svg>
                </button>
                <span className={styles.currentPage}>1</span>
                <button className={styles.paginationBtn} disabled>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="9,18 15,12 9,6" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

