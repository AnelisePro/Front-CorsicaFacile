'use client'

import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import styles from './MissionProgressBar.module.scss'

interface MissionProgressBarProps {
  status: 'accepted' | 'in_progress' | 'completed' | 'refused'
  notificationId: number
  onStatusChange?: (newStatus: 'accepted' | 'in_progress' | 'completed' | 'refused') => void
  isArtisan?: boolean
}

const MissionProgressBar = ({
  status,
  notificationId,
  onStatusChange,
  isArtisan = false
}: MissionProgressBarProps) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const getCurrentStep = () => {
    switch(status) {
      case 'accepted': return 0
      case 'in_progress': return 1
      case 'completed': return 2
      case 'refused': return -1  // Statut spécial pour refusé
      default: return -1
    }
  }

  const currentStep = getCurrentStep()

  const steps = [
    { id: 0, label: 'Acceptée', status: 'accepted' },
    { id: 1, label: 'En cours', status: 'in_progress' },
    { id: 2, label: 'Terminée', status: 'completed' }
  ]

  // Si la mission est refusée, tout afficher en grisé
  if (status === 'refused') {
    return (
      <div className={`${styles.progressContainer} ${styles.refused}`}>
        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div key={step.id} className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${styles.refusedCircle}`}>
                {step.id + 1}
              </div>
              <div className={`${styles.stepLabel} ${styles.refusedLabel}`}>
                {step.label}
              </div>
              {index < steps.length - 1 && (
                <div className={`${styles.stepConnector} ${styles.refusedConnector}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Fonction pour mettre à jour le statut - seulement pour les clients
  const updateMissionStatus = async (newStatus: 'in_progress' | 'completed') => {
    if (isArtisan) return // Bloque l'action pour les artisans

    try {
      const token = localStorage.getItem('clientToken')
      if (!token) {
        toast.error('Vous devez être connecté pour effectuer cette action')
        return
      }

      const response = await axios.put(
        `${apiUrl}/client_notifications/${notificationId}`,
        { client_notification: { status: newStatus } },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.status === 200) {
        const messages = {
          'in_progress': 'La mission a été marquée comme En Cours par le client',
          'completed': 'La mission a été marquée comme Terminée par le client'
        }

        toast.success(messages[newStatus])

        if (onStatusChange) {
          onStatusChange(newStatus)
        }

        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      toast.error('Erreur lors de la mise à jour du statut de la mission')
    }
  }

  // Fonction pour gérer le clic sur un cercle
  const handleCircleClick = (step: any) => {
    if (isArtisan) return // Pas de clic pour les artisans

    const isClickable = (
      (step.status === 'in_progress' && status === 'accepted') ||
      (step.status === 'completed' && (status === 'accepted' || status === 'in_progress'))
    )

    if (isClickable) {
      updateMissionStatus(step.status as 'in_progress' | 'completed')
    }
  }

  return (
    <div className={`${styles.progressContainer} ${isArtisan ? styles.artisanView : ''}`}>
      <div className={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isActive = step.id <= currentStep
          const isCurrent = step.id === currentStep

          // Détermine si le cercle est cliquable (seulement pour les clients)
          const isClickable = !isArtisan && (
            (step.status === 'in_progress' && status === 'accepted') ||
            (step.status === 'completed' && (status === 'accepted' || status === 'in_progress'))
          )

          return (
            <div key={step.id} className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${isActive ? styles.active : styles.inactive} ${isCurrent ? styles.current : ''} ${isClickable ? styles.clickable : ''}`}
                onClick={() => handleCircleClick(step)}
                title={isClickable ? `Cliquez pour marquer comme ${step.label}` : ''}
              >
                {step.id + 1}
              </div>
              <div className={`${styles.stepLabel} ${isActive ? styles.activeLabel : ''}`}>
                {step.label}
              </div>
              {index < steps.length - 1 && (
                <div className={`${styles.stepConnector} ${isActive ? styles.activeConnector : ''}`}></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MissionProgressBar






