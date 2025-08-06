'use client';

import { useState, useEffect } from 'react';
import styles from './StatsCard.module.scss';

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  subtitle?: string;
  isLoading?: boolean;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color,
  subtitle,
  isLoading = false
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation des nombres
  useEffect(() => {
    if (typeof value === 'number' && !isLoading) {
      setIsAnimating(true);
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
          setTimeout(() => setIsAnimating(false), 100);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, isLoading]);

  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('fr-FR');
    }
    return val;
  };

  return (
    <div className={`${styles.statsCard} ${isLoading ? styles.loading : ''}`}>
      {/* Barre de progression décorative */}
      <div className={styles.progressBar}></div>

      <div className={styles.cardHeader}>
        <div className={styles.cardContent}>
          
          {/* Section titre et icône */}
          <div className={styles.titleSection}>
            <div className={`${styles.iconContainer} ${styles[color]}`}>
              <span className={styles.icon}>{icon}</span>
            </div>
            
            <div className={styles.titleGroup}>
              <h3 className={styles.title}>{title}</h3>
              {subtitle && (
                <p className={styles.subtitle}>{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Section valeur et changement */}
          <div className={styles.valueSection}>
            <div className={styles.valueGroup}>
              <p className={`${styles.value} ${isAnimating ? styles.animate : ''}`}>
                {isLoading ? '' : formatValue(displayValue)}
              </p>
            </div>
            
            {change && !isLoading && (
              <div className={styles.changeIndicator}>
                <span className={`${styles.changeBadge} ${styles[changeType]}`}>
                  {change}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

