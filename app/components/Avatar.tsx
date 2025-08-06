import { useState } from 'react';
import styles from './MessagingTab.module.scss';

interface AvatarProps {
  avatarUrl?: string | null;
  userName: string;
  archived?: boolean;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  avatarUrl, 
  userName, 
  archived = false, 
  size = 'default',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarClasses = [
    styles.avatar,
    archived ? styles.archivedAvatar : '',
    styles[`avatar${size.charAt(0).toUpperCase() + size.slice(1)}`] || '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={avatarClasses}>
      {avatarUrl && !imageError ? (
        // 👈 Afficher SEULEMENT l'image si URL existe et pas d'erreur
        <img
          src={avatarUrl}
          alt={`Avatar de ${userName}`}
          className={styles.avatarImage}
          onError={handleImageError}
        />
      ) : (
        // 👈 Afficher les initiales SEULEMENT si pas d'URL ou erreur
        <div className={styles.avatarInitials}>
          {getInitials(userName)}
        </div>
      )}
    </div>
  );
};

export default Avatar;



