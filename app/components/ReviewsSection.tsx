'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FaStar } from 'react-icons/fa'
import styles from './ReviewsSection.module.scss'

interface Review {
  id: number
  rating: number
  comment: string
  intervention_successful: boolean
  created_at: string
  client: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

interface ReviewsSectionProps {
  artisanId: string
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ artisanId }) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchReviews()
  }, [artisanId])

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${apiUrl}/artisans/${artisanId}/reviews`)
      const reviewsData = response.data.reviews
      
      setReviews(reviewsData)
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizeClass = size === 'small' ? styles.starSmall : 
                     size === 'large' ? styles.starLarge : styles.starMedium

    return (
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${styles.star} ${sizeClass} ${
              star <= rating ? styles.starFilled : styles.starEmpty
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>Chargement des avis...</div>
      </div>
    )
  }

  return (
    <div className={styles.reviewsSection}>
      {/* Header simplifié */}
      <div className={styles.reviewsHeader}>
        <h2>Avis clients</h2>
      </div>

      {/* Contenu scrollable */}
      <div className={styles.reviewsContent}>
        <div className={styles.reviewsList}>
          {reviews.length === 0 ? (
            <div className={styles.noReviews}>
              <p>Aucun avis pour le moment.</p>
              <p>Soyez le premier à laisser un avis après une intervention !</p>
            </div>
          ) : (
            <div className={styles.reviewsGrid}>
              {reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.reviewerAvatar}>
                        {review.client.avatar_url ? (
                          <img 
                            src={review.client.avatar_url} 
                            alt={`${review.client.first_name} ${review.client.last_name}`}
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {review.client.first_name.charAt(0)}{review.client.last_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className={styles.reviewerDetails}>
                        <h4>{review.client.first_name} {review.client.last_name.charAt(0)}.</h4>
                        <p className={styles.reviewDate}>{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <div className={styles.reviewContent}>
                    <div className={styles.interventionStatus}>
                      <span className={`${styles.statusBadge} ${
                        review.intervention_successful ? styles.successful : styles.unsuccessful
                      }`}>
                        {review.intervention_successful ? 'Intervention réussie' : 'Problème signalé'}
                      </span>
                    </div>
                    <p className={styles.reviewComment}>{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewsSection

