'use client'

import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Link from 'next/link'
import styles from './ClientNotifications.module.scss'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Notification {
  id: number
  message: string
  link: string
  artisan_id: number
  artisan_name: string
  status: 'pending' | 'accepted' | 'refused' | 'in_progress' | 'completed'
  besoin_id: number
  annonce_title: string
}

interface Props {
  notifications: Notification[]
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
}

export default function ClientNotifications({ notifications, setNotifications }: Props) {
  const handleResponse = async (id: number, action: 'accepted' | 'refused') => {
    try {
      const token = localStorage.getItem('clientToken')
      if (!token) throw new Error('Token manquant')

      await axios.put(`${apiUrl}/client_notifications/${id}`, {
        client_notification: {
          status: action,
        },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, status: action } : notif
        )
      )
      toast.success(`Demande ${action === 'accepted' ? 'acceptée' : 'refusée'}`)
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la mise à jour de la notification.')
    }
  }

  const handleDeleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem('clientToken')
      if (!token) throw new Error('Token manquant')

      await axios.delete(`${apiUrl}/client_notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
      toast.success('Notification supprimée')
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la suppression de la notification.')
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Acceptée'
      case 'refused':
        return 'Refusée'
      case 'in_progress':
        return 'En Cours'
      case 'completed':
        return 'Terminée'
      default:
        return 'En attente'
    }
  }

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'accepted':
        return styles.statusAccepted
      case 'refused':
        return styles.statusRefused
      case 'in_progress':
        return styles.statusInProgress
      case 'completed':
        return styles.statusCompleted
      default:
        return styles.statusPending
    }
  }

  if (notifications.length === 0) return <p>Aucune notification.</p>

  return (
    <div>
      <ul className={styles.notificationList}>
        {notifications.map((notif) => (
          <li key={notif.id} className={styles.notificationItem}>
            <div className={styles.notificationContent}>
              <p className={styles.notificationMessage}>
                Un artisan est intéressé par votre annonce{' '}
                <span className={styles.annonceTitle}>{notif.annonce_title}</span>
              </p>
              
              <Link href={notif.link} className={styles.profileLink}>
                Voir profil artisan
              </Link>

              <div className={styles.statusTag}>
                <span className={`${styles.statusBadge} ${getStatusClassName(notif.status)}`}>
                  {getStatusLabel(notif.status)}
                </span>
              </div>

              {notif.status === 'pending' && (
                <div className={styles.actionButtons}>
                  <button
                    onClick={() => handleResponse(notif.id, 'accepted')}
                    className={styles.acceptButton}
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleResponse(notif.id, 'refused')}
                    className={styles.refuseButton}
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleDeleteNotification(notif.id)}
              aria-label="Supprimer la notification"
              className={styles.deleteButton}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}









