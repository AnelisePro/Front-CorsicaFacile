'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import styles from './NotificationList.module.scss'
import MissionProgressBar from './MissionProgressBar'
import { FaTimes } from 'react-icons/fa'

type Notification = {
  id: number
  message: string
  link: string
  read: boolean
  created_at: string
  status?: string
  besoin_id?: number
}

export default function NotificationList({ onActiveMissionsChange }: { onActiveMissionsChange?: (missions: { id: number, status: string }[]) => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('artisanToken')
    if (!token) return

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/artisans/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.notifications || res.data
        setNotifications(Array.isArray(data) ? data : [])

        const acceptedMissions = Array.isArray(data)
          ? data.filter((n: Notification) =>
              n.status === 'accepted' ||
              n.status === 'in_progress' ||
              n.status === 'completed')
            .map((n: Notification) => ({
              id: n.id,
              status: n.status || 'accepted',
            }))
          : []

        if (onActiveMissionsChange) onActiveMissionsChange(acceptedMissions)
      })
      .catch((err) => {
        console.error('Erreur chargement notifications:', err)
        setNotifications([])
      })
  }, [])

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem('artisanToken')
    if (!token) return

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/artisans/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (err) {
      console.error('Erreur marquage notif comme lue:', err)
    }
  }

  const deleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const token = localStorage.getItem('artisanToken')
    if (!token) return

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/artisans/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Erreur suppression notification:', err)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    )
    await markAsRead(notification.id)

    if (notification.besoin_id) {
      router.push(`/annonces/${notification.besoin_id}`)
    } else if (notification.link) {
      router.push(notification.link)
    } else {
      router.push('/annonces')
    }
  }

  const normalizeStatus = (status: string): 'accepted' | 'in_progress' | 'completed' | 'refused' => {
    switch(status) {
      case 'accepted':
      case 'in_progress':
      case 'completed':
      case 'refused':
        return status
      default:
        return 'accepted'
    }
  }

  const getStatusText = (status: string): string => {
    switch(status) {
      case 'pending': return 'En attente'
      case 'accepted': return 'Acceptée'
      case 'in_progress': return 'En cours'
      case 'completed': return 'Terminée'
      case 'refused': return 'Refusée'
      default: return status
    }
  }

  if (notifications.length === 0) return <p>Aucune notification.</p>

  return (
    <div className={styles.notificationWrapper}>
      <div className={styles.notificationCardContainer}>
        {notifications.length === 0 ? (
          <div className={styles.emptyCard}>
            <p className={styles.emptyState}>Aucune notification.</p>
          </div>
        ) : (
          <div className={styles.notificationScrollContainer}>
            <ul className={styles.notificationList}>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`
                    ${styles.notificationCard}
                    ${!n.read ? styles.unread : ''}
                    ${n.status ? styles[n.status] : ''}
                  `}
                  onClick={() => handleNotificationClick(n)}
                >
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => deleteNotification(n.id, e)}
                    aria-label="Supprimer la notification"
                  >
                    <FaTimes />
                  </button>

                  <div className={styles.notificationContent}>
                    <p>{n.message.replace(/Nouveau besoin:/g, 'Nouveau besoin :')}</p>
                    {n.status && (
                      <>
                        <span className={`${styles.notificationStatus} ${styles[n.status]}`}>
                          {getStatusText(n.status)}
                        </span>
                        <div className={styles.progressBarWrapper}>
                          <MissionProgressBar
                            status={normalizeStatus(n.status)}
                            notificationId={n.id}
                            onStatusChange={(newStatus) => {
                              setNotifications(prev =>
                                prev.map(notif =>
                                  notif.id === n.id ? { ...notif, status: newStatus } : notif
                                )
                              )
                            }}
                            isArtisan={true}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className={styles.notificationMeta}>
                    <span className={styles.notificationTime}>
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}














