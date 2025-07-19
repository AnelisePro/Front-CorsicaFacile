'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './PricingModal.module.scss'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h1 className={styles.h1}>Nos Formules Artisan</h1>

        <p className={styles.intro}>
          Choisissez la formule qui correspond le mieux à vos besoins.
        </p>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Standard</h2>
            <div className={styles.cardContent}>
              <ul className={styles.cardList}>
                <li><span className={styles.bullet}>✔</span> Accès aux annonces</li>
                <li><span className={styles.bullet}>✔</span> Réponse limitée à 3 annonces par mois</li>
                <li><span className={styles.bullet}>✔</span> Visibilité de base sur la plateforme</li>
              </ul>
            </div>
            <p className={styles.cardPrice}>29,99 € / mois</p>
          </div>

          <div className={`${styles.card} ${styles.recommended}`}>
            <div className={styles.tag}>Recommandée</div>
            <h2 className={styles.cardTitle}>Pro</h2>
            <div className={styles.cardContent}>
              <ul className={styles.cardList}>
                <li><span className={styles.bullet}>✔</span> Accès aux annonces</li>
                <li><span className={styles.bullet}>✔</span> Réponse limitée à 6 annonces par mois</li>
                <li><span className={styles.bullet}>✔</span> Visibilité prioritaire dans les recherches</li>
                <li><span className={styles.bullet}>✔</span> Statistiques limitées</li>
              </ul>
            </div>
            <p className={styles.cardPrice}>49,99 € / mois</p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Premium</h2>
            <div className={styles.cardContent}>
              <ul className={styles.cardList}>
                <li><span className={styles.bullet}>✔</span> Accès aux annonces</li>
                <li><span className={styles.bullet}>✔</span> Réponse illimitée aux annonces</li>
                <li><span className={styles.bullet}>✔</span> Mise en avant sur la page d'accueil</li>
                <li><span className={styles.bullet}>✔</span> Statistiques complètes</li>
                <li><span className={styles.bullet}>✔</span> Badge Premium sur votre profil</li>
                <li><span className={styles.bullet}>✔</span> Accompagnement personnalisé</li>
              </ul>
            </div>
            <p className={styles.cardPrice}>69,99 € / mois</p>
          </div>
        </div>
      </div>
    </div>,
    document.body // 🎯 Portal vers le body pour s'ouvrir au centre de la page !
  )
}