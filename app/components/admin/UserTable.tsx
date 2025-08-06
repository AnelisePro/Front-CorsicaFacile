import { User, UserTableProps } from '../../types/admin';
import styles from './UserTable.module.scss';

export default function UserTable({ users, onUserClick, onUserAction }: UserTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour gérer l'affichage du nom selon le type d'utilisateur
  const getUserDisplayName = (user: User) => {
    if (user.type === 'client') {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    } else {
      return user.companyName || user.fullName || 'Nom non défini';
    }
  };

  // Fonction pour gérer les initiales selon le type d'utilisateur  
  const getUserInitials = (user: User) => {
    if (user.type === 'client' && user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    } else if (user.companyName) {
      const words = user.companyName.split(' ');
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`;
      }
      return user.companyName.substring(0, 2);
    } else {
      return user.email.substring(0, 2).toUpperCase();
    }
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.scrollContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr className={`${styles.tableRow} ${styles.headerRow}`}>
              <th>Utilisateur</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Inscription</th>
              <th>Dernière connexion</th>
              <th>Activité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user.id} 
                className={`${styles.tableRow} ${styles.bodyRow}`}
                onClick={() => onUserClick(user)}
              >
                {/* Colonne Utilisateur */}
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>
                      <span className={styles.userInitials}>
                        {getUserInitials(user)}
                      </span>
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>
                        {getUserDisplayName(user)}
                      </div>
                      <div className={styles.userEmail}>
                        {user.email}
                      </div>
                      
                      {/* Badges spéciaux pour les artisans */}
                      <div className={styles.userBadges}>
                        {user.type === 'artisan' && user.verified && (
                          <div className={styles.verifiedBadge}>
                            ✅ Vérifié
                          </div>
                        )}
                        {user.type === 'artisan' && user.averageRating && (
                          <div className={styles.ratingBadge}>
                            ⭐ {user.averageRating}/5 ({user.totalReviews} avis)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Colonne Type */}
                <td>
                  <span className={`${styles.typeBadge} ${styles[user.type]}`}>
                    {user.type === 'client' ? 'Client' : 'Artisan'}
                  </span>
                </td>

                {/* Colonne Statut */}
                <td>
                  <span className={`${styles.statusBadge} ${user.banned ? styles.banned : styles.active}`}>
                    {user.banned ? 'Banni' : 'Actif'}
                  </span>
                </td>

                {/* Colonne Date d'inscription */}
                <td>
                  <div className={styles.dateCell}>
                    {formatDate(user.createdAt)}
                  </div>
                </td>

                {/* Colonne Dernière connexion */}
                <td>
                  <div className={styles.dateCell}>
                    {user.lastLogin ? (
                      <>{formatDate(user.lastLogin)}</>
                    ) : (
                      <span style={{ opacity: 0.6 }}>Jamais</span>
                    )}
                  </div>
                </td>

                {/* Colonne Activité */}
                <td>
                  <div className={styles.activityCell}>
                    {user.activityCount} actions
                  </div>
                </td>

                {/* Colonne Actions */}
                <td className={styles.actionCell}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher l'ouverture du modal
                      onUserAction(user.id, user.type, user.banned ? 'unban' : 'ban');
                    }}
                    className={`${styles.actionButton} ${user.banned ? styles.unban : styles.ban}`}
                  >
                    {user.banned ? 'Débannir' : 'Bannir'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* État vide */}
        {users.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Aucun utilisateur trouvé</p>
            <p className={styles.emptySubtitle}>Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
}

