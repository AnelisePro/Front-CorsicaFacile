'use client'

import React from 'react'
import styles from './NotificationButton.module.scss'

interface UsageStats {
  membership_plan: string
  responses_used: number
  response_limit: number
  can_respond: boolean
  usage_percentage: number
}

interface Props {
  usageStats: UsageStats
}

export default function UsageBanner({ usageStats }: Props) {
  // Ne pas afficher pour Premium (illimité)
  if (!usageStats || usageStats.membership_plan === 'Premium') return null

  const isNearLimit = usageStats.usage_percentage >= 80
  const isAtLimit = !usageStats.can_respond

  const bannerClass = `${styles.usageBanner} ${
    isAtLimit ? styles.atLimit : isNearLimit ? styles.nearLimit : styles.normal
  }`

  return (
    <div className={bannerClass}>
      <div className={styles.usageInfo}>
        <span className={styles.planBadge}>
          {usageStats.membership_plan}
        </span>
        <span className={styles.usageText}>
          Réponses ce mois : {usageStats.responses_used}/{usageStats.response_limit}
        </span>
        {isAtLimit && (
          <span className={styles.limitWarning}>
            ⚠️ Limite atteinte
          </span>
        )}
      </div>
      
      {(isNearLimit || isAtLimit) && (
        <button 
          onClick={() => window.location.href = '/artisan/dashboard'}
          className={styles.upgradeButton}
        >
          ⚡ Changer de formule
        </button>
      )}
    </div>
  )
}
