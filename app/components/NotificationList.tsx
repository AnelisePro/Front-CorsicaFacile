'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

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
        console.log('notifications:', res.data) // Pour debug
        setNotifications(res.data)

        const acceptedMissions = res.data
          .filter((n: Notification) => n.status === 'accepted' || n.status === 'completed')
          .map((n: Notification) => ({
            id: n.id,
            status: n.status || 'accepted',
          }))

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

  const handleNotificationClick = async (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    )

    await markAsRead(notification.id)

    // Debug console log
    console.log('Navigating to:', notification.besoin_id ? `/annonces/${notification.besoin_id}` : notification.link)

    if (notification.besoin_id) {
      router.push(`/annonces/${notification.besoin_id}`)
    } else if (notification.link) {
      router.push(notification.link)
    } else {
      router.push('/annonces')
    }
  }

  if (notifications.length === 0) return <p>Aucune notification.</p>

  return (
    <div>
      <h3>Notifications</h3>
      <ul>
        {notifications.map((n) => (
          <li
            key={n.id}
            style={{ fontWeight: n.read ? 'normal' : 'bold', marginBottom: '10px' }}
          >
            <span
              onClick={() => handleNotificationClick(n)}
              style={{
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
                marginRight: 10,
              }}
            >
              {n.message}
            </span>
            <br />
            <small>{new Date(n.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}









