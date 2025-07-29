'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useAdminAuth } from '../lib/admin/useAdminAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Ne pas afficher la sidebar sur la page de login
  const showSidebar = isAuthenticated && pathname !== '/panel-admin/login';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
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
