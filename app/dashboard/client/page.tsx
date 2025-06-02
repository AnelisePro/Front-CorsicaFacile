'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useAuth } from '../../auth/AuthContext'
import styles from './page.module.scss'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Client {
  first_name: string
  last_name: string
  email: string
  phone: string
  birthdate: string
  password?: string
  password_confirmation?: string
  avatar_url?: string | null
}

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const { logout, setUser } = useAuth()
  const [isClient, setIsClient] = useState(false)

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
        const response = await axios.get('http://localhost:3001/clients/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setClient(response.data.client)
      } catch (error) {
        console.error('Erreur lors du chargement du profil client :', error)
        setClient(null)
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!client) return
    setClient({ ...client, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleUpdate = async () => {
    const token = localStorage.getItem('clientToken')
    if (!token || !client) return

    try {
      const formData = new FormData()

      Object.entries(client).forEach(([key, value]) => {
        if (key !== 'avatar_url' && value !== undefined && value !== null) {
          formData.append(`client[${key}]`, value as string)
        }
      })

      if (avatarFile) {
        formData.append('client[avatar]', avatarFile)
      }

      await axios.put('http://localhost:3001/clients/me', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Profil mis à jour avec succès.')
      setIsEditing(false)
      setAvatarFile(null)

      const response = await axios.get('http://localhost:3001/clients/me', {
        headers: { Authorization: `Bearer ${token}` },
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

  const confirmDelete = () => {
    toast.info(
      <div>
        <p>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss()
              handleDelete()
            }}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Oui, supprimer
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Annuler
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        pauseOnHover: false,
      }
    )
  }

  const handleDelete = async () => {
    const token = localStorage.getItem('clientToken')
    if (!token) return

    try {
      await axios.delete('http://localhost:3001/clients/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Compte supprimé avec succès.')
      logout()
    } catch (error) {
      console.error('Erreur lors de la suppression du compte :', error)
      toast.error('Erreur lors de la suppression.')
    }
  }

  if (loading) return <p>Chargement...</p>
  if (!client) return <p>Impossible de charger les informations client.</p>

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.greeting}>Bonjour, {client.first_name} 👋</h1>

        <div className={styles.dashboardGrid}>
          {/* Infos à gauche */}
          <section className={styles.profileSection}>
            {/* Card 1 : avatar + nom */}
            <div className={styles.card}>
              <div className={styles.avatarWrapper}>
                {avatarFile ? (
                  <Image
                    src={URL.createObjectURL(avatarFile)}
                    alt="Nouvel avatar"
                    className={styles.avatar}
                    width={96}
                    height={96}
                  />
                ) : client.avatar_url ? (
                  <Image
                    src={`${client.avatar_url}?t=${Date.now()}`}
                    alt="Avatar"
                    className={styles.avatar}
                    width={96}
                    height={96}
                  />
                ) : (
                  <Image
                    src="/images/avatar.svg"
                    alt="Avatar par défaut"
                    width={96}
                    height={96}
                    className={styles.avatar}
                  />
                )}

                {(isEditing || !client.avatar_url) && (
                  <div className={styles.avatarInput}>
                    <label>Changer la photo de profil :</label>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                )}
              </div>

              <h2 className={styles.clientName}>
                {client.first_name} {client.last_name}
              </h2>
            </div>

            {/* Card 2 : infos */}
            <div className={styles.card}>
              <div className={styles.infoFields}>
                {['email', 'phone', 'birthdate'].map((field) => (
                  <div key={field} className={styles.infoField}>
                    <label className={styles.label}>{field.replace('_', ' ')} :</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name={field}
                        value={(client as any)[field]}
                        onChange={handleChange}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      <p className={styles.text}>{(client as any)[field]}</p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className={styles.passwordFields}>
                  <label>Nouveau mot de passe :</label>
                  <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    className={styles.input}
                  />
                  <label>Confirmation du mot de passe :</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              )}
            </div>

            {/* Boutons hors des cards */}
            <div className={styles.actions}>
              {isEditing ? (
                <>
                  <button onClick={handleUpdate} className={styles.saveBtn}>
                    Enregistrer
                  </button>
                  <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
                    Modifier
                  </button>
                  <button onClick={confirmDelete} className={styles.deleteBtn}>
                    Supprimer mon compte
                  </button>
                </>
              )}
            </div>
          </section>

        {/* Informations à droite */}
          <section className={styles.rightSection}>
            <div className={styles.card}>
              <h2>Mes annonces</h2>
              <p className={styles.empty}>Aucune annonce pour le moment.</p>
            </div>

            <div className={styles.card}>
              <h2>Suivi des interventions</h2>
              <ul>
                <li>En attente : 0</li>
                <li>En cours : 0</li>
                <li>Validées : 0</li>
              </ul>
            </div>

            <div className={styles.card}>
              <h2>Mes points gagnés</h2>
              <p className={styles.points}>0</p>
            </div>

            <div className={styles.card}>
              <h2>Historique des interventions</h2>
              <ul>
                <li>Passées : 0</li>
                <li>En cours : 0</li>
                <li>Futures : 0</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      {isClient && (
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      )}
    </>
  )
}





