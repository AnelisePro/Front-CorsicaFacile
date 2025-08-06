'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useAdminAuth } from '../lib/admin/useAdminAuth';
import styles from './AdminLayout.module.scss';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Ne pas afficher la sidebar sur la page de login
  const showSidebar = isAuthenticated && pathname !== '/panel-admin/login';

  // ✅ Votre loading spinner personnalisé
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Chargement du panel admin...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      {showSidebar && <AdminSidebar />}
      <div className={`flex-1 ${showSidebar ? 'ml-64' : ''}`}>
        {children}
      </div>
    </div>
  );
}
