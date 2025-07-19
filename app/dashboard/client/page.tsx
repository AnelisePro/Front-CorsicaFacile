'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useAuth } from '../../auth/AuthContext'
import styles from './page.module.scss'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ClientNotifications from '../../components/ClientNotifications'
import MissionProgressBar from '../../components/MissionProgressBar'
import MessagingTab from '../../components/MessagingTab'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Client {
  id?: number
  first_name: string
  last_name: string
  email: string
  phone: string
  birthdate: string
  password?: string
  password_confirmation?: string
  avatar_url?: string | null
}

interface Schedule {
  date: string
  start: string
  end: string
}

// Ou pour gérer les deux formats
type ScheduleType = Schedule | [any, string, string, string] | any

interface Besoin {
  id: number
  type_prestation: string
  description: string
  address: string
  schedule: Schedule
  images?: string[]
  notification_status?: 'accepted' | 'in_progress' | 'completed' | null
  notification_id?: number
}

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

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const { logout, setUser } = useAuth()
  const [isClient, setIsClient] = useState(false)
  const [besoins, setBesoins] = useState<Besoin[]>([])
  const [editingBesoinId, setEditingBesoinId] = useState<number | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState<'annonces' | 'notifications' | 'points' | 'messagerie'>('annonces')
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const [editForm, setEditForm] = useState<{
    type_prestation: string,
    description: string,
    address: string,
    schedule: Schedule | string,
    images: string[],
  }>({
    type_prestation: '',
    description: '',
    address: '',
    schedule: {
      date: '',
      start: '',
      end: ''
    },
    images: [],
  })

  useEffect(() => {
    setIsClient(true)

    const fetchClient = async () => {
      const token = localStorage.getItem('clientToken')
      if (!token) {
        console.warn('Pas de token trouvé, utilisateur non authentifié')
        setLoading(false)
        return
      }

      try {
        const [clientRes, besoinsRes, notificationsRes] = await Promise.all([
          axios.get(`${apiUrl}/clients/me`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get(`${apiUrl}/clients/besoins`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get(`${apiUrl}/client_notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ])

        setClient(clientRes.data.client)
        
        // Associer les notifications aux besoins
        const besoinsData = besoinsRes.data
        const notificationsData = notificationsRes.data.notifications || []
        
        const besoinsWithNotifications = besoinsData.map((besoin: Besoin) => {
          const notification = notificationsData.find((notif: Notification) => 
            notif.besoin_id === besoin.id && ['accepted', 'in_progress', 'completed'].includes(notif.status)
          )
          
          return {
            ...besoin,
            notification_status: notification?.status || null,
            notification_id: notification?.id || null
          }
        })

        setBesoins(besoinsWithNotifications)
        setNotifications(notificationsData)
      } catch (error) {
        console.error('Erreur lors du chargement des données client :', error)
        setClient(null)
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [])

  // Fonction pour mettre à jour le statut d'une mission
  const handleStatusChange = (besoinId: number, newStatus: 'accepted' | 'in_progress' | 'completed') => {
    setBesoins(prevBesoins => 
      prevBesoins.map(besoin => 
        besoin.id === besoinId 
          ? { ...besoin, notification_status: newStatus }
          : besoin
      )
    )
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('clientToken')
        if (!token) throw new Error('Token manquant')

        const res = await axios.get(`${apiUrl}/client_notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setNotifications(res.data.notifications || [])
      } catch (error) {
        console.error(error)
        toast.error('Erreur lors du chargement des notifications.')
      }
    }

    fetchNotifications()
  }, [])

  // Indicateur de notifications
  useEffect(() => {
  if (activeTab === 'notifications') return

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('clientToken')
      if (!token) return

      const response = await axios.get(`${apiUrl}/client_notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const notificationsData = response.data.notifications || []
      
      // Compter les notifications qui demandent une action (pending)
      const pendingNotifications = notificationsData.filter((notif: Notification) => 
        notif.status === 'pending'
      )
      
      setUnreadCount(pendingNotifications.length)
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications", error)
    }
  }

  fetchUnreadCount()
  // Actualiser toutes les 30 secondes
  const interval = setInterval(fetchUnreadCount, 30000)
  return () => clearInterval(interval)
}, [activeTab])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!client) return
    setClient({ ...client, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const uploadToS3 = async (file: File) => {
    try {
      const token = localStorage.getItem('clientToken')
      if (!token) throw new Error('Token manquant')

      const presignRes = await axios.post(
        `${apiUrl}/presigned_url`,
        { filename: file.name, content_type: file.type },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )

      const { url, key } = presignRes.data

      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error('Erreur lors de l’upload sur S3')
      }

      return `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/${key}`
    } catch (error) {
      console.error('Erreur upload S3 :', error)
      toast.error('Erreur lors de l’upload de l’image.')
      return null
    }
  }

  const handleUpdate = async () => {
    const token = localStorage.getItem('clientToken')
    if (!token || !client) return

    try {
      let avatarUrl = client.avatar_url

      if (avatarFile) {
        const uploadedUrl = await uploadToS3(avatarFile)
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        } else {
          return
        }
      }

      const updatedClientData = { ...client, avatar_url: avatarUrl }
      delete updatedClientData.id

      await axios.put(`${apiUrl}/clients/me`, { client: updatedClientData }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      })

      toast.success('Profil mis à jour avec succès.')
      setIsEditing(false)
      setAvatarFile(null)

      const response = await axios.get(`${apiUrl}/clients/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      const updatedClient = response.data.client
      setClient(updatedClient)

      const updatedUser = {
        email: updatedClient.email,
        role: 'client' as const,
        avatar_url: updatedClient.avatar_url || '/images/avatar.svg',
      }

      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error)
      toast.error('Erreur lors de la mise à jour.')
    }
  }

  const handleDeleteBesoin = async (id: number) => {
    const token = localStorage.getItem('clientToken')
    if (!token) return

    try {
      await axios.delete(`${apiUrl}/clients/besoins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      toast.success('Annonce supprimée.')
      setBesoins((prev) => prev.filter((b) => b.id !== id))
    } catch (error) {
      console.error('Erreur suppression besoin :', error)
      toast.error('Erreur lors de la suppression.')
    }
  }

  const handleDelete = async () => {
    const token = localStorage.getItem('clientToken')
    if (!token) return

    try {
      await axios.delete(`${apiUrl}/clients/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Compte supprimé avec succès.')
      logout()
    } catch (error) {
      console.error('Erreur lors de la suppression du compte :', error)
      toast.error('Erreur lors de la suppression.')
    }
  }

  const confirmDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      handleDelete()
    }
  }

  const formatDateFr = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Ajoutez cette fonction de debug temporaire
const debugSchedule = (schedule: any, besoinId: number) => {
  console.log(`=== DEBUG SCHEDULE pour besoin ${besoinId} ===`)
  console.log('Type:', typeof schedule)
  console.log('Valeur:', schedule)
  console.log('Est un array:', Array.isArray(schedule))
  console.log('Est un objet:', schedule && typeof schedule === 'object')
  if (schedule && typeof schedule === 'object') {
    console.log('Clés:', Object.keys(schedule))
    console.log('schedule.date:', schedule.date)
    console.log('schedule.start:', schedule.start)
    console.log('schedule.end:', schedule.end)
  }
  console.log('=== FIN DEBUG ===')
}

const formatCreneauFromObject = (schedule: Schedule | any, besoinId?: number) => {
  // Debug temporaire
  if (besoinId) {
    debugSchedule(schedule, besoinId)
  }

  if (!schedule) {
    console.log('Schedule est null/undefined')
    return 'Créneau non défini'
  }

  // Si c'est un array (format base de données)
  if (Array.isArray(schedule)) {
    console.log('Schedule est un array:', schedule)
    if (schedule.length >= 4) {
      const [, date, start, end] = schedule
      console.log('Array values:', { date, start, end })
      if (!date) return 'Créneau non défini'
      
      const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      return `Le ${formattedDate}, de ${start} à ${end}`
    }
    return 'Créneau non défini (array trop court)'
  }

  // Si c'est un objet
  if (schedule && typeof schedule === 'object') {
    console.log('Schedule est un objet:', schedule)
    if (schedule.date && schedule.start && schedule.end) {
      const formattedDate = new Date(schedule.date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      return `Le ${formattedDate}, de ${schedule.start} à ${schedule.end}`
    }
    return 'Créneau non défini (propriétés manquantes)'
  }

  console.log('Schedule format non reconnu')
  return 'Créneau non défini'
}


  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const uploadedUrls: string[] = []

    for (const file of files) {
      const url = await uploadToS3(file)
      if (url) {
        uploadedUrls.push(url)
      } else {
        toast.error(`Erreur lors de l'upload de l'image ${file.name}`)
      }
    }

    setEditForm(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }))
  }

  const handleUpdateBesoin = async (id: number) => {
    const token = localStorage.getItem('clientToken')
    if (!token) return

    try {
      // S'assurer que le schedule est au bon format
      const scheduleData = typeof editForm.schedule === 'string' 
        ? { date: '', start: '', end: '' }
        : editForm.schedule

      await axios.put(`${apiUrl}/clients/besoins/${id}`, {
        besoin: {
          type_prestation: editForm.type_prestation,
          description: editForm.description,
          address: editForm.address,
          schedule: scheduleData,
          image_urls: editForm.images,
        }
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })

      toast.success('Annonce mise à jour.')
      setEditingBesoinId(null)

      // Rafraîchir la liste
      const res = await axios.get(`${apiUrl}/clients/besoins`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      
      // Traiter les besoins avec les notifications
      const besoinsData = res.data
      const besoinsWithNotifications = besoinsData.map((besoin: Besoin) => {
        const notification = notifications.find((notif: Notification) => 
          notif.besoin_id === besoin.id && ['accepted', 'in_progress', 'completed'].includes(notif.status)
        )
        
        return {
          ...besoin,
          notification_status: notification?.status || null,
          notification_id: notification?.id || null
        }
      })

      setBesoins(besoinsWithNotifications)
    } catch (error) {
      console.error('Erreur mise à jour besoin :', error)
      toast.error('Erreur lors de la mise à jour.')
    }
  }

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Chargement de votre dashboard...</p>
    </div>
  )

  if (!isClient || !client) {
    return <p>Vous devez être connecté en tant que client pour accéder à ce tableau de bord.</p>
  }

  return (
    <main className={styles.clientDashboard}>
      <ToastContainer />
      <section className={styles.profileSection}>
        {!isEditing ? (
          <div className={styles.profileContent}>
            <div className={styles.avatarWrapper}>
              <Image
                src={client.avatar_url || '/images/avatar.svg'}
                alt="Avatar"
                width={150}
                height={150}
                className={styles.avatar}
              />
            </div>

            <div className={styles.info}>
              <p><strong>Nom :</strong> {client.last_name}</p>
              <p><strong>Prénom :</strong> {client.first_name}</p>
              <p><strong>Email :</strong> {client.email}</p>
              <p><strong>Téléphone :</strong> {client.phone}</p>
              <p><strong>Date de naissance :</strong> {formatDateFr(client.birthdate)}</p>

              <div className={styles.profileButtons}>
                <button
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                  type="button"
                >
                  Modifier mon profil
                </button>
                <button
                  onClick={confirmDelete}
                  className={styles.deleteButton}
                  type="button"
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form
            className={styles.editForm}
            onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}
          >
            <div className={styles.editGroup}>
              <label htmlFor="first_name">Prénom</label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                value={client.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.editGroup}>
              <label htmlFor="last_name">Nom</label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                value={client.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.editGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={client.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.editGroup}>
              <label htmlFor="phone">Téléphone</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={client.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.editGroup}>
              <label htmlFor="birthdate">Date de naissance</label>
              <input
                id="birthdate"
                type="date"
                name="birthdate"
                value={client.birthdate}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.editGroup}>
              <label htmlFor="avatar">Avatar</label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <span className={styles.fileHint}>
                {avatarFile ? `Fichier sélectionné : ${avatarFile.name}` : 'Aucun fichier choisi'}
              </span>
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.saveButton}>
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={styles.cancelButton}
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Onglets */}
      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'annonces' ? styles.active : ''}`}
          onClick={() => setActiveTab('annonces')}
        >
          Mes Annonces
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'notifications' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('notifications')
            setUnreadCount(0)
          }}
          style={{ position: 'relative' }}
        >
          Notifications
          {activeTab !== 'notifications' && unreadCount > 0 && (
            <span className={styles.notificationBadge}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'points' ? styles.active : ''}`}
          onClick={() => setActiveTab('points')}
        >
          Points
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'messagerie' ? styles.active : ''}`}
          onClick={() => setActiveTab('messagerie')}
        >
          Messagerie
        </button>
      </nav>

      {/* Contenu des onglets */}
      <section className={styles.tabContent}>
        {activeTab === 'annonces' && (
          besoins.length === 0 ? (
            <p>Aucune annonce.</p>
          ) : (
            besoins.map((besoin) => {
              return (
                <div key={besoin.id} className={styles.besoinCard}>
                  {editingBesoinId === besoin.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleUpdateBesoin(besoin.id) }}>
                      <label>
                        Type de prestation
                        <input
                          type="text"
                          value={editForm.type_prestation || ''}
                          onChange={(e) => setEditForm({ ...editForm, type_prestation: e.target.value })}
                          required
                        />
                      </label>
                      <label>
                        Description
                        <textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          required
                        />
                      </label>
                      <label>
                        Adresse
                        <input
                          type="text"
                          value={editForm.address || ''}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          required
                        />
                      </label>
                      <label>
                        Date
                        <input
                          type="date"
                          value={typeof editForm.schedule === 'string' ? '' : editForm.schedule.date}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            schedule: {
                              ...(typeof editForm.schedule === 'string' ? { date: '', start: '', end: '' } : editForm.schedule),
                              date: e.target.value,
                            }
                          })}
                          required
                        />
                      </label>

                      <label>
                        Heure début
                        <input
                          type="time"
                          value={typeof editForm.schedule === 'string' ? '' : editForm.schedule.start}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            schedule: {
                              ...(typeof editForm.schedule === 'string' ? { date: '', start: '', end: '' } : editForm.schedule),
                              start: e.target.value,
                            }
                          })}
                          required
                        />
                      </label>

                      <label>
                        Heure fin
                        <input
                          type="time"
                          value={typeof editForm.schedule === 'string' ? '' : editForm.schedule.end}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            schedule: {
                              ...(typeof editForm.schedule === 'string' ? { date: '', start: '', end: '' } : editForm.schedule),
                              end: e.target.value,
                            }
                          })}
                          required
                        />
                      </label>
                      <label>
                        Images
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImagesChange}
                        />
                      </label>
                      <div className={styles.imagesPreview}>
                        {editForm.images.map((imgUrl, idx) => (
                          <Image key={idx} src={imgUrl} alt={`Image ${idx + 1}`} width={100} height={100} />
                        ))}
                      </div>
                      <button type="submit">Enregistrer</button>
                      <button type="button" onClick={() => setEditingBesoinId(null)}>Annuler</button>
                    </form>
                  ) : (
                    <>
                      <h4 className={styles.titleBesoin}>{besoin.type_prestation}</h4>
                      <p><strong>Description : </strong>{besoin.description}</p>
                      <p><strong>Adresse :</strong> {besoin.address}</p>
                      <p><strong>Créneau :</strong> {formatCreneauFromObject(besoin.schedule, besoin.id)}</p>

                      {/* Affichage de la MissionProgressBar si une mission est acceptée */}
                      {besoin.notification_status && besoin.notification_id && (
                        <div className={styles.missionProgress}>
                          <h5>Statut de la mission</h5>
                          <MissionProgressBar
                            status={besoin.notification_status}
                            notificationId={besoin.notification_id}
                            onStatusChange={(newStatus) => handleStatusChange(besoin.id, newStatus)}
                          />
                        </div>
                      )}

                      <div className={styles.besoinButtons}>
                        <button 
                          className={styles.modifyButton}
                          onClick={() => {
                            setEditingBesoinId(besoin.id)
                            setEditForm({
                              type_prestation: besoin.type_prestation || '',
                              description: besoin.description || '',
                              address: besoin.address || '',
                              schedule: besoin.schedule || { date: '', start: '', end: '' },
                              images: besoin.images || [],
                            })
                          }}
                        >
                          Modifier
                        </button>
                        <button 
                          className={styles.removeButton}
                          onClick={() => handleDeleteBesoin(besoin.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )
        )}

        {activeTab === 'notifications' && (
          <ClientNotifications notifications={notifications} setNotifications={setNotifications} />
        )}

        {activeTab === 'points' && (
          <p>Fonctionnalité Points à implémenter</p>
        )}

        {activeTab === 'messagerie' && (
          <div className={styles.messagerieContent}>
            <MessagingTab />
          </div>
        )}
      </section>
    </main>
  )
}




















