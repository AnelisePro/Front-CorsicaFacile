'use client';

import { useState, useEffect } from 'react';
import UserTable from '../../components/admin/UserTable';
import UserModal from '../../components/admin/UserModal';
import { adminApi } from '../../lib/admin/adminApi';
import { User } from '../../types/admin';
import styles from './page.module.scss';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data.users);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = users;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';  
        const companyName = user.companyName || '';
        const fullName = user.fullName || '';
        
        return firstName.toLowerCase().includes(searchLower) ||
               lastName.toLowerCase().includes(searchLower) ||
               companyName.toLowerCase().includes(searchLower) ||
               fullName.toLowerCase().includes(searchLower) ||
               user.email.toLowerCase().includes(searchLower);
      });
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(user => user.type === filters.type);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'banned' ? user.banned : !user.banned
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUserAction = async (userId: number, userType: 'client' | 'artisan', action: 'ban' | 'unban') => {
    try {
      await adminApi.updateUserStatus(userId, userType, action);
      await fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all'
    });
  };

  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.status !== 'all';

  // ✅ Calculer les statistiques
  const clientsCount = users.filter(user => user.type === 'client').length;
  const artisansCount = users.filter(user => user.type === 'artisan').length;
  const bannedCount = users.filter(user => user.banned).length;
  const totalUsers = users.length;

  if (isLoading) {
    return (
      <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingContent}>
              <div className={styles.spinner}></div>
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>Gestion des Utilisateurs</h1>
              <p className={styles.subtitle}>
                Administrez et modérez tous les utilisateurs de la plateforme
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={`${styles.statIcon} ${styles.total}`}>📊</span>
              <div className={styles.statLabel}>Total Utilisateurs</div>
            </div>
            <div className={styles.statValue}>{totalUsers}</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={`${styles.statIcon} ${styles.clients}`}>👤</span>
              <div className={styles.statLabel}>Clients</div>
            </div>
            <div className={styles.statValue}>{clientsCount}</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={`${styles.statIcon} ${styles.artisans}`}>🔨</span>
              <div className={styles.statLabel}>Artisans</div>
            </div>
            <div className={styles.statValue}>{artisansCount}</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={`${styles.statIcon} ${styles.banned}`}>⛔</span>
              <div className={styles.statLabel}>Utilisateurs Bannis</div>
            </div>
            <div className={styles.statValue}>{bannedCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <h2 className={styles.filtersTitle}>Filtrer les utilisateurs</h2>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>🔍 Recherche</label>
              <input
                type="text"
                placeholder="Nom, email, entreprise..."
                className={styles.searchInput}
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>👥 Type d'utilisateur</label>
              <select
                className={styles.selectInput}
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="all">Tous les types</option>
                <option value="client">👤 Clients</option>
                <option value="artisan">🔨 Artisans</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>📊 Statut</label>
              <select
                className={styles.selectInput}
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">✅ Actifs</option>
                <option value="banned">⛔ Bannis</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {(hasActiveFilters || filteredUsers.length !== users.length) && (
          <div className={styles.resultsInfo}>
            <div className={styles.resultsText}>
              <span className={styles.resultsCount}>{filteredUsers.length}</span> utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
              {filteredUsers.length !== users.length && ` sur ${users.length} au total`}
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className={styles.clearFilters}>
                ✕ Effacer les filtres
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className={styles.tableContainer}>
          <UserTable
            users={filteredUsers}
            onUserClick={handleUserClick}
            onUserAction={handleUserAction}
          />
        </div>

        {/* Modal */}
        {selectedUser && (
          <UserModal
            user={selectedUser}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAction={handleUserAction}
          />
        )}
      </div>
    </div>
  );
}

