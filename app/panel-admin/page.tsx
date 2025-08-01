'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

export default function AdminIndex() {
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/panel-admin/dashboard');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  // Loading spinner
  return (
    <div className={styles.loading}>
      <div className="text-center">
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Redirection vers le dashboard...</p>
      </div>
    </div>
  );
}
