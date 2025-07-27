'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'
import styles from './ReviewForm.module.scss'

interface Artisan {
  id: number
  company_name: string
}

interface Notification {
  id: number
  status: string
}

interface ReviewFormProps {
  notificationId: string
}

const ReviewForm = ({ notificationId }: ReviewFormProps) => {
  const [step, setStep] = useState<'question' | 'review'>('question')
  const [interventionSuccessful, setInterventionSuccessful] = useState<boolean | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>('')
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0);

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  
  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('clientToken')
        if (!token) {
          setError('Vous devez être connecté')
          return
        }

        const response = await axios.get(
          `${apiUrl}/reviews/for_notification/${notificationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data.can_review) {
          setArtisan(response.data.artisan)
          setNotification(response.data.notification)
        } else {
          setError(response.data.error || 'Impossible de laisser un avis')
        }
      } catch (error: any) {
        console.error('Erreur:', error)
        let errorMessage = 'Erreur lors du chargement des données'
        
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.response?.status === 403) {
          errorMessage = 'Accès non autorisé'
        } else if (error.response?.status === 404) {
          errorMessage = 'Notification non trouvée'
        } else if (error.response?.status === 422) {
          errorMessage = error.response.data.error || 'Mission non terminée ou avis déjà existant'
        }
        
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [notificationId])

  const handleQuestionResponse = (response: boolean) => {
    setInterventionSuccessful(response)
    setStep('review')
  }

  const handleStarClick = (starRating: number) => {
    setRating(starRating)
  }

  const handleStarHover = (starRating: number) => {
    setHoveredStar(starRating)
  }

  const handleStarLeave = () => {
    setHoveredStar(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  console.log('🚀 handleSubmit appelé')
  console.log('📊 Données:', { rating, comment: comment.trim(), interventionSuccessful, artisanId: artisan?.id, notificationId })
  
  if (rating === 0) {
    console.log('❌ Rating manquant')
    toast.error('Veuillez sélectionner une note')
    return
  }

  if (comment.trim().length < 10) {
    console.log('❌ Commentaire trop court')
    toast.error('Votre commentaire doit contenir au moins 10 caractères')
    return
  }

  if (interventionSuccessful === null) {
    console.log('❌ interventionSuccessful manquant')
    toast.error('Une erreur est survenue, veuillez recommencer')
    return
  }

  console.log('✅ Validation OK, envoi en cours...')
  setSubmitting(true)

  try {
    const token = localStorage.getItem('clientToken')
    
    if (!token) {
      console.log('❌ Token manquant')
      setError('Session expirée, veuillez vous reconnecter')
      setSubmitting(false)
      return
    }

    const payload = {
      review: {
        rating,
        comment: comment.trim(),
        intervention_successful: interventionSuccessful,
        artisan_id: artisan?.id,
        client_notification_id: parseInt(notificationId)
      }
    }

    console.log('📤 Payload envoyé:', payload)

    const response = await axios.post(
      `${apiUrl}/reviews`,
      payload,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    )

    console.log('✅ Réponse reçue:', response.data)

    setSuccess(true)
    toast.success('Merci pour votre avis !')

  } catch (error: any) {
    console.error('❌ Erreur complète:', error)
    console.error('❌ Response:', error.response?.data)
    console.error('❌ Status:', error.response?.status)
    console.error('❌ Headers:', error.response?.headers)
    
    let errorMessage = 'Erreur lors de l\'envoi de l\'avis'
    
    if (error.response?.data?.errors) {
      errorMessage = error.response.data.errors.join(', ')
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    } else if (error.response?.status === 401) {
      errorMessage = 'Session expirée, veuillez vous reconnecter'
    }
    
    console.log('❌ Message d\'erreur final:', errorMessage)
    setError(errorMessage)
    toast.error(errorMessage)
  } finally {
    setSubmitting(false)
  }
}

  const handleBackToQuestion = () => {
    setStep('question')
    setRating(0)
    setComment('')
    setHoveredStar(0)
  }

  // Fonction pour fermer manuellement
  const handleClose = () => {
    if (window.opener) {
      window.close()
    } else {
      router.push('/client/dashboard')
    }
  }

  // Affichage du loading
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    )
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>❌ Erreur</h2>
          <p>{error}</p>
          <div className={styles.actions}>
            <button onClick={handleClose} className={styles.closeButton}>
              Fermer
            </button>
            <button 
              onClick={() => router.push('/auth/login_client')} 
              className={styles.loginButton}
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Affichage du succès
  if (success) {
    return (
      <div className={styles.reviewContainer}>
        <div className={styles.reviewCard}>
          <div className={styles.successMessage}>
            <div className={styles.successIconWrapper}>
              <div className={styles.successIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#10b981"/>
                  <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <h2 className={styles.successTitle}>Merci pour votre avis !</h2>
            
            <p className={styles.successText}>
              Votre avis a été publié avec succès sur le profil de{' '}
              <span className={styles.artisanName}>{artisan?.company_name}</span>.
            </p>
            
            <div className={styles.successDetails}>
              <div className={styles.successDetail}>
                <span className={styles.successDetailIcon}>⭐</span>
                <span>Votre évaluation aide d'autres clients</span>
              </div>
              <div className={styles.successDetail}>
                <span className={styles.successDetailIcon}>🔍</span>
                <span>Visible sur le profil artisan</span>
              </div>
            </div>
            
            <button onClick={handleClose} className={styles.successBtn}>
              <span>Parfait, c'est noté !</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Vérification que les données sont chargées
  if (!artisan) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>❌ Erreur</h2>
          <p>Impossible de charger les données de l'artisan</p>
          <div className={styles.actions}>
            <button onClick={handleClose} className={styles.closeButton}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starIndex = index + 1;
      const isActive = starIndex <= rating;
      const isHovered = starIndex <= hoveredStar;
      
      return (
        <button
          key={index}
          type="button"
          className={`${styles.star} ${isActive || isHovered ? styles.starActive : styles.starEmpty}`}
          onClick={() => setRating(starIndex)}
          onMouseEnter={() => setHoveredStar(starIndex)}
          onMouseLeave={() => setHoveredStar(0)}
          disabled={submitting}
          aria-label={`Noter ${starIndex} étoile${starIndex > 1 ? 's' : ''}`}
        >
          {isActive || isHovered ? '★' : '☆'}
        </button>
      );
    });
  }

  return (
  <div className={styles.reviewContainer}>
    <div className={styles.reviewCard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Votre avis sur l'intervention de</h1>
        <div className={styles.artisanInfo}>
          <div className={styles.artisanAvatar}>
            {(artisan.company_name)?.charAt(0).toUpperCase()}
          </div>
          <h3 className={styles.artisanName}>
            {artisan.company_name}
          </h3>
        </div>
      </div>

      {step === 'question' && (
        <div className={styles.questionStep}>
          <div className={styles.questionContent}>
            <h2 className={styles.questionTitle}>
              Comment s'est déroulée l'intervention ?
            </h2>
            <p className={styles.questionSubtitle}>
              Votre retour nous aide à maintenir la qualité de nos services
            </p>
          </div>

          <div className={styles.responseButtons}>
            <button
              type="button"
              className={`${styles.responseBtn} ${styles.yesBtn}`}
              onClick={() => handleQuestionResponse(true)}
              disabled={submitting}
            >
              <span className={styles.btnIcon}>✨</span>
              <span className={styles.btnText}>
                <strong>Excellente intervention</strong>
                <small>Tout s'est parfaitement déroulé</small>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.responseBtn} ${styles.noBtn}`}
              onClick={() => handleQuestionResponse(false)}
              disabled={submitting}
            >
              <span className={styles.btnIcon}>⚠️</span>
              <span className={styles.btnText}>
                <strong>Des problèmes rencontrés</strong>
                <small>L'intervention ne s'est pas bien passée</small>
              </span>
            </button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className={styles.reviewStep}>
          {/* Header */}
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>
              {interventionSuccessful ? 'Notez votre expérience' : 'Partagez vos remarques'}
            </h2>
            <p className={styles.stepSubtitle}>
              Votre avis aidera les autres clients dans leur choix
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.reviewForm}>
            {/* Back Button */}
            <div className={styles.backButton}>
              <button
                type="button"
                onClick={handleBackToQuestion}
                className={styles.backBtn}
                disabled={submitting}
              >
                <span className={styles.backIcon}>←</span>
                <span className={styles.backText}>Retour à la question</span>
              </button>
            </div>

            {/* Section notation */}
            <div className={styles.ratingSection}>
              <div className={styles.sectionHeader}>
                <label className={styles.sectionLabel}>
                  <span className={styles.labelIcon}>⭐</span>
                  <span className={styles.labelText}>
                    Note globale 
                    <span className={styles.required}>*</span>
                  </span>
                </label>
              </div>
              
              <div className={styles.starsWrapper}>
                <div className={styles.starsContainer}>
                  {renderStars()}
                </div>
                <div className={styles.ratingFeedback}>
                  {rating > 0 ? (
                    <div className={styles.ratingDisplay}>
                      <span className={styles.ratingNumber}>{rating}/5</span>
                      <span className={`${styles.ratingLabel} ${styles[`rating${rating}`]}`}>
                        {rating === 1 && 'Décevant'}
                        {rating === 2 && 'Insuffisant'}
                        {rating === 3 && 'Correct'}
                        {rating === 4 && 'Très bien'}
                        {rating === 5 && 'Excellent'}
                      </span>
                    </div>
                  ) : (
                    <span className={styles.ratingPlaceholder}>
                      Cliquez sur les étoiles pour noter
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section commentaire */}
            <div className={styles.commentSection}>
              <div className={styles.sectionHeader}>
                <label htmlFor="comment" className={styles.sectionLabel}>
                  <span className={styles.labelIcon}>💬</span>
                  <span className={styles.labelText}>
                    Votre commentaire détaillé
                    <span className={styles.required}>*</span>
                  </span>
                </label>
              </div>
              
              <div className={styles.textareaContainer}>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    interventionSuccessful 
                      ? "Partagez votre expérience : ponctualité, professionnalisme, qualité du travail, propreté..."
                      : "Décrivez précisément les problèmes rencontrés : retards, qualité du travail, communication..."
                  }
                  className={styles.textarea}
                  rows={6}
                  disabled={submitting}
                  minLength={10}
                  maxLength={500}
                  required
                />
                <div className={styles.textareaFooter}>
                  <div className={styles.charCount}>
                    <span className={`${styles.charCountText} ${comment.length >= 10 ? styles.validLength : styles.invalidLength}`}>
                      {comment.length}/500
                    </span>
                    {comment.length < 10 && (
                      <span className={styles.minLengthWarning}>
                        Minimum 10 caractères requis
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section de soumission */}
            <div className={styles.submitSection}>
              <button
                type="submit"
                className={`${styles.submitBtn} ${
                  rating === 0 || comment.trim().length < 10 ? styles.submitDisabled : styles.submitEnabled
                }`}
                disabled={submitting || rating === 0 || comment.trim().length < 10}
              >
                <span className={styles.submitText}>
                  {submitting ? 'Publication en cours...' : 'Publier mon avis'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </div>
)
}

export default ReviewForm


