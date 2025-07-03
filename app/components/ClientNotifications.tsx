'use client'

import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Link from 'next/link'
import ProgressStepper from './ProgressStepper'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Notification {
  id: number
  message: string
  link: string
  artisan_id: number
  artisan_name: string
  status: 'pending' | 'accepted' | 'refused' | 'completed'
  besoin_id: number
}

interface Props {
  notifications: Notification[]
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
}

export default function ClientNotifications({ notifications, setNotifications }: Props) {

  const handleResponse = async (id: number, action: 'accepted' | 'refused' | 'completed') => {
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
      toast.success(`Demande ${action}`)
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la mise à jour de la notification.')
    }
  }

  if (notifications.length === 0) return <p>Aucune notification.</p>

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notif) => (
          <li key={notif.id} style={{ marginBottom: '1rem' }}>
            <p>{notif.message}</p>
            <Link href={notif.link}>
              Voir profil artisan
            </Link>
            <div>
              {notif.status === 'pending' && (
                <>
                  <button onClick={() => handleResponse(notif.id, 'accepted')}>Accepter</button>
                  <button onClick={() => handleResponse(notif.id, 'refused')}>Refuser</button>
                </>
              )}

              {notif.status === 'accepted' && (
                <div>
                  <ProgressStepper currentStep={2} />
                  <button onClick={() => handleResponse(notif.id, 'completed')}>
                    Marquer comme terminée
                  </button>
                </div>
              )}

              {notif.status === 'completed' && (
                <div>
                  <ProgressStepper currentStep={3} />
                  <p>Mission terminée ✅</p>
                </div>
              )}

              {notif.status === 'refused' && <p>Statut : Refusée</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}




