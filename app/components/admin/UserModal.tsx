import { User, UserModalProps } from '../../types/admin';
import styles from './UserModal.module.scss';

export default function UserModal({ user, isOpen, onClose, onAction }: UserModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ NOUVELLES FONCTIONS: Mêmes que dans UserTable
  const getUserDisplayName = (user: User) => {
    if (user.type === 'client') {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    } else {
      return user.companyName || user.fullName || 'Nom non défini';
    }
  };

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
  <div className={styles.modal}>
    <div className={styles.overlay} onClick={onClose}></div>

    <div className={styles.content} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{getUserInitials(user)}</div>
          <div className={styles.nameBlock}>
            <div className={styles.name}>{getUserDisplayName(user)}</div>
            <div className={styles.email}>{user.email}</div>
            <div className={`${styles.badge} ${user.type === 'client' ? styles.client : styles.artisan}`}>
              {user.type === 'client' ? 'Client' : 'Artisan'}
            </div>
          </div>
        </div>
        <button onClick={onClose} className={styles.closeBtn} type='button'>✕</button>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Section: Informations générales */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>📋 Informations générales</div>
          <div className={styles.row}>
            <div>
              <div className={styles.label}>Type de compte</div>
              <div className={`${styles.badgeType} ${user.type === 'client' ? styles.client : styles.artisan}`}>
                {user.type === 'client' ? 'Client' : 'Artisan'}
              </div>
            </div>
            <div>
              <div className={styles.label}>Statut</div>
              <div className={`${styles.badgeStat} ${user.banned ? styles.ban : styles.unban}`}>
                {user.banned ? 'Banni' : 'Actif'}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Client */}
        {user.type === 'client' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>👤 Informations client</div>
            <div className={styles.row}>
              <div>
                <div className={styles.label}>Prénom</div>
                <div className={styles.value}>{user.firstName || 'Non renseigné'}</div>
              </div>
              <div>
                <div className={styles.label}>Nom</div>
                <div className={styles.value}>{user.lastName || 'Non renseigné'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Artisan */}
        {user.type === 'artisan' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>🔨 Informations artisan</div>
            <div className={styles.row}>
              <div>
                <div className={styles.label}>Entreprise</div>
                <div className={styles.value}>{user.companyName || 'Non renseigné'}</div>
              </div>
              {user.siren && (
                <div>
                  <div className={styles.label}>SIREN</div>
                  <div className={styles.value}>{user.siren}</div>
                </div>
              )}
              <div>
                <div className={styles.label}>Vérifié</div>
                <div className={styles.value}>{user.verified ? '✅ Oui' : '❌ Non'}</div>
              </div>
              {user.averageRating && (
                <div>
                  <div className={styles.label}>Note moyenne</div>
                  <div className={styles.value}>
                    ⭐ {user.averageRating}/5 ({user.totalReviews} avis)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section: Contact */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>📞 Contact</div>
          <div className={styles.row}>
            <div>
              <div className={styles.label}>Email</div>
              <div className={styles.value}>{user.email}</div>
            </div>
            {user.phone && (
              <div>
                <div className={styles.label}>Téléphone</div>
                <div className={styles.value}>{user.phone}</div>
              </div>
            )}
            {user.city && (
              <div>
                <div className={styles.label}>Adresse</div>
                <div className={styles.value}>{user.city}</div>
              </div>
            )}
            {user.address && (
              <div>
                <div className={styles.label}>Adresse</div>
                <div className={styles.value}>{user.address}</div>
              </div>
            )}
          </div>
        </div>

        {/* Section: Activité */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>📊 Activité</div>
          <div className={styles.row}>
            <div>
              <div className={styles.label}>Inscription</div>
              <div className={styles.value}>{formatDate(user.createdAt)}</div>
            </div>
            <div>
              <div className={styles.label}>Dernière connexion</div>
              <div className={styles.value}>
                {user.lastLogin ? formatDate(user.lastLogin) : 'Jamais connecté'}
              </div>
            </div>
            <div>
              <div className={styles.label}>Actions effectuées</div>
              <div className={styles.value}>📈 {user.activityCount} actions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={styles.actions}>
        <button
          onClick={() => {
            onAction(user.id, user.type, user.banned ? 'unban' : 'ban');
            onClose();
          }}
          className={`${styles.button} ${user.banned ? styles.unban : styles.ban}`}
        >
          {user.banned ? 'Débannir l\'utilisateur' : 'Bannir l\'utilisateur'}
        </button>

        <button
          onClick={onClose}
          className={`${styles.button} ${styles.cancel}`}
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
);
}

