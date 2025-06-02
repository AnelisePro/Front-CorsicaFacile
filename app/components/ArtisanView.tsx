import React from 'react'
import styles from './ArtisanView.module.scss'

type PlanInfo = {
  amount: number
  currency: string
  interval: string
}

type Artisan = {
  company_name: string
  address: string
  expertise_names: string[]
  description?: string
  siren: string
  email: string
  phone: string
  membership_plan: string
  avatar_url?: string
  kbis_url?: string
  insurance_url?: string
  images_urls: string[]
}

type ArtisanViewProps = {
  artisan: Artisan
  planInfo: PlanInfo | null
  intervalTranslations: Record<string, string>
  onEdit: () => void
  onDelete: () => void
}

export default function ArtisanView({
  artisan,
  planInfo,
  intervalTranslations,
  onEdit,
  onDelete,
}: ArtisanViewProps) {
  return (
    <div className={styles.artisanView}>

      {/* Card 1 : avatar + nom */}
      <div className={styles.cardProfile}>
        {artisan.avatar_url && (
          <img
            src={artisan.avatar_url}
            alt={`${artisan.company_name} avatar`}
            className={styles.avatar}
            loading="lazy"
          />
        )}
        <h1 className={styles.companyName}>{artisan.company_name}</h1>
      </div>

      {/* Card 2 : infos */}
      <div className={styles.cardInfo}>
        <div className={styles.infoField}>
          <label className={styles.label}>Adresse</label>
          <p className={styles.value}>{artisan.address}</p>
        </div>

        <div className={styles.infoField}>
          <label className={styles.label}>Domaine d'Expertise</label>
          <p className={styles.value}>
            {artisan.expertise_names.length > 0 ? artisan.expertise_names.join(', ') : 'Non spécifié'}
          </p>
        </div>

        {artisan.description && (
          <div className={styles.infoField}>
            <label className={styles.label}>Description</label>
            <p className={styles.value}>{artisan.description}</p>
          </div>
        )}

        <div className={styles.infoField}>
          <label className={styles.label}>SIREN</label>
          <p className={styles.value}>{artisan.siren}</p>
        </div>

        <div className={styles.infoField}>
          <label className={styles.label}>Email</label>
          <p className={styles.value}>{artisan.email}</p>
        </div>

        <div className={styles.infoField}>
          <label className={styles.label}>Téléphone</label>
          <p className={styles.value}>{artisan.phone}</p>
        </div>

        <div className={styles.infoField}>
          <label className={styles.label}>Abonnement</label>
          <p className={styles.value}>{artisan.membership_plan}</p>
        </div>

        {planInfo && (
          <div className={styles.infoField}>
            <label className={styles.label}>Tarif</label>
            <p className={styles.value}>
              {planInfo.amount / 100} {planInfo.currency.toUpperCase()} /{' '}
              {intervalTranslations[planInfo.interval] || planInfo.interval}
            </p>
          </div>
        )}

        <div className={styles.documents}>
          {artisan.kbis_url && (
            <a
              href={artisan.kbis_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.button}
            >
              Voir le KBIS
            </a>
          )}
          {artisan.insurance_url && (
            <a
              href={artisan.insurance_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.button}
            >
              Voir l'Assurance Pro
            </a>
          )}
        </div>
      </div>


      {/* Card 3 : galerie d’images */}
      <div className={styles.cardGallery}>
        <div className={styles.imagesGallery}>
          {artisan.images_urls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Image ${i + 1} de ${artisan.company_name}`}
              loading="lazy"
              className={styles.image}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button onClick={onEdit} className={styles.editBtn}>Modifier</button>
        <button onClick={onDelete} className={styles.deleteBtn}>Supprimer le compte</button>
      </div>
    </div>
  )
}


