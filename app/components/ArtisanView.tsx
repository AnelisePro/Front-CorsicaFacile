'use client'

import React from 'react'
import styles from './ArtisanView.module.scss'
import { Artisan } from '../types/artisan'
import Image from 'next/image'
import PremiumBadge from './PremiumBadge'

type PlanInfo = {
  amount: number
  currency: string
  interval: string
}

type ArtisanViewProps = {
  artisan: Artisan
  planInfo: PlanInfo | null
  onEdit: () => void
  onDelete: () => void
  intervalTranslations?: Record<string, string>
}

function capitalizeFirstOnly(text: string) {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export default function ArtisanView({
  artisan,
  planInfo,
  onEdit,
  onDelete,
  intervalTranslations = { day: 'jour', week: 'semaine', month: 'mois', year: 'an' }
}: ArtisanViewProps) {
  return (
    <div className={styles.profileContent}>
      {/* Avatar à gauche */}
      <div className={styles.avatarWrapper}>
        {artisan.avatar_url ? (
          <Image
            src={artisan.avatar_url}
            alt={`${artisan.company_name} avatar`}
            className={styles.avatar}
            width={150}
            height={150}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div className={styles.avatar}>
            {artisan.company_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Informations en 2 colonnes */}
      <div className={styles.info}>
        <div className={styles.infoColumns}>
          {/* Colonne 1 */}
          <div className={styles.infoColumn}>
            <div className={styles.nameContainer}>
              <strong>Nom :</strong>
              <p> {artisan.company_name} </p>
              <PremiumBadge
                membershipPlan={artisan.membership_plan}
                className={styles.companyNameBadge}
              />
            </div>
            <p><strong>Adresse :</strong> {artisan.address}</p>
            <p><strong>Expertise :</strong> {artisan.expertise_names.join(', ')}</p>
            <p><strong>Email :</strong> {artisan.email}</p>
          </div>

          {/* Colonne 2 */}
          <div className={styles.infoColumn}>
            <p><strong>Téléphone :</strong> {artisan.phone}</p>
            <p><strong>SIREN :</strong> {artisan.siren}</p>
            {artisan.description && (
              <p><strong>Description :</strong> {artisan.description}</p>
            )}
            <p>
              <strong>Plan :</strong> {capitalizeFirstOnly(artisan.membership_plan)}
              {planInfo && (
                <span> - {planInfo.amount / 100}€/{intervalTranslations[planInfo.interval] || planInfo.interval}</span>
              )}
            </p>
          </div>
        </div>

        {/* Section Documents */}
        <div className={styles.documents}>
          <a
            href={artisan.kbis_url || '#'}
            target={artisan.kbis_url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={`${styles.button} ${!artisan.kbis_url ? styles.disabled : ''}`}
            onClick={(e) => !artisan.kbis_url && e.preventDefault()}
          >
            📄 {artisan.kbis_url ? 'Voir le KBIS' : 'KBIS non disponible'}
          </a>

          <a
            href={artisan.insurance_url || '#'}
            target={artisan.insurance_url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={`${styles.button} ${!artisan.insurance_url ? styles.disabled : ''}`}
            onClick={(e) => !artisan.insurance_url && e.preventDefault()}
          >
            🛡️ {artisan.insurance_url ? 'Voir l\'Assurance Pro' : 'Assurance non disponible'}
          </a>
        </div>

        {/* Boutons d'action */}
        <div className={styles.profileButtons}>
          <button onClick={onEdit} className={styles.editButton}>
            Modifier mon profil
          </button>
          <button onClick={onDelete} className={styles.deleteButton}>
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  )
}











