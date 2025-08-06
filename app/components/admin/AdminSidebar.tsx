'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '../../lib/admin/useAdminAuth';
import styles from './AdminSidebar.module.scss';

const menuItems = [
  {
    name: 'Tableau de bord',
    href: '/panel-admin/dashboard',
    icon: '📊',
    description: 'Vue d\'ensemble'
  },
  {
    name: 'Utilisateurs',
    href: '/panel-admin/users',
    icon: '👥',
    description: 'Gestion des comptes'
  },
  {
    name: 'Statistiques',
    href: '/panel-admin/statistics',
    icon: '📈',
    description: 'Analyses détaillées'
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // État pour rétracter/étendre

  const getDisplayName = (admin: any) => {
    if (admin?.first_name && admin?.last_name) {
      return `${admin.first_name} ${admin.last_name}`;
    }
    if (admin?.first_name) {
      return admin.first_name;
    }
    if (admin?.email) {
      const emailPrefix = admin.email.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return 'Administrateur';
  };

  const getInitials = (admin: any) => {
    if (admin?.first_name && admin?.last_name) {
      return `${admin.first_name.charAt(0)}${admin.last_name.charAt(0)}`.toUpperCase();
    }
    if (admin?.first_name) {
      return admin.first_name.charAt(0).toUpperCase();
    }
    if (admin?.email) {
      return admin.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  const getRoleDisplay = (role: string) => {
    const roles: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'Administrateur',
      'moderator': 'Modérateur'
    };
    return roles[role] || role;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Bouton Toggle Desktop */}
      <button
        onClick={toggleSidebar}
        className={`${styles.toggleButton} ${isCollapsed ? styles.collapsed : styles.expanded}`}
        title={isCollapsed ? 'Étendre la sidebar' : 'Rétracter la sidebar'}
      >
        <span className={styles.toggleIcon}>
          {isCollapsed ? '→' : '←'}
        </span>
      </button>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={styles.mobileMenuButton}
      >
        <div className={styles.hamburgerIcon}>
          <div className={`${styles.line} ${styles.line1} ${isMobileMenuOpen ? styles.open : ''}`}></div>
          <div className={`${styles.line} ${styles.line2} ${isMobileMenuOpen ? styles.open : ''}`}></div>
          <div className={`${styles.line} ${styles.line3} ${isMobileMenuOpen ? styles.open : ''}`}></div>
        </div>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${styles.sidebar} 
        ${isMobileMenuOpen ? styles.mobileOpen : ''} 
        ${isCollapsed ? styles.collapsed : ''}
      `}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Admin Panel</h1>
              <p className={styles.subtitle}>Plateforme de gestion</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <div className={styles.menuList}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                  title={isCollapsed ? item.name : undefined} // Tooltip sur hover quand rétractée
                >
                  {isActive && <div className={styles.activeIndicator}></div>}
                  
                  <div className={styles.menuIcon}>
                    <div className={styles.iconContainer}>
                      <span className={styles.icon}>{item.icon}</span>
                    </div>
                  </div>
                  
                  <div className={styles.menuText}>
                    <div className={styles.menuTitle}>{item.name}</div>
                    <div className={styles.menuDescription}>{item.description}</div>
                  </div>
                  
                  {isActive && <div className={styles.activeDot}></div>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatarContainer}>
                <div className={styles.userAvatar}>
                  {getInitials(admin)}
                </div>
                <div className={styles.userStatus}></div>
              </div>
              
              <div className={styles.userDetails}>
                <p className={styles.userName}>
                  {getDisplayName(admin)}
                </p>
                <p className={styles.userRole}>
                  {admin?.role ? getRoleDisplay(admin.role) : admin?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className={styles.logoutButton}
              title={isCollapsed ? 'Se déconnecter' : undefined}
            >
              <span className={styles.logoutIcon}>🚪</span>
              {!isCollapsed && (
                <div className={styles.tooltip}>
                  Se déconnecter
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}




