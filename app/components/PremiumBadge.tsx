'use client'

import React from 'react'
import styles from './PremiumBadge.module.scss'

interface PremiumBadgeProps {
  membershipPlan?: string | null
  className?: string
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ membershipPlan, className }) => {
  if (membershipPlan !== 'Premium') return null

  return (
    <div className={`${styles.badgeContainer} ${className || ''}`}>
      <div className={styles.premiumBadge}>
        <span className={styles.starIcon}>✦</span>
        <span className={styles.badgeText}>Premium</span>
      </div>
    </div>
  )
}

export default PremiumBadge




