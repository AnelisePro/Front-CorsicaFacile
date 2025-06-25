'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useAuth } from '../../auth/AuthContext'
import styles from './page.module.scss'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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

const fieldLabels: Record<string, string> = {
  email: 'Email',
  phone: 'Téléphone',
  birthdate: 'Date de naissance',
}

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const { logout, setUser } = useAuth()
  const [isClient, setIsClient] = useState(false)
  const [besoins, setBesoins] = useState<any[]>([])
  const [editingBesoinId, setEditingBesoinId] = useState<number | null>(null)
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  // Formulaire d'édition d'une annonce
  const [editForm, setEditForm] = useState({
    type_prestation: '',
    description: '',
    address: '',
    schedule: '',
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
        const [clientRes, besoinsRes] = await Promise.all([
          axios.get(`${apiUrl}/clients/me`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get(`${apiUrl}/clients/besoins`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
        ])

        setClient(clientRes.data.client)
        setBesoins(besoinsRes.data)
      } catch (error) {
        console.error('Erreur lors du chargement des données client :', error)
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

  const isValidDate = (dateStr: string) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    return !isNaN(d.getTime())
  }

  const handleUpdate = async () => {
    const token = localStorage.getItem('clientToken')
    if (!token || !client) return

    try {
      const formData = new FormData()

      Object.entries(client).forEach(([key, value]) => {
        if (key === 'avatar_url' || key === 'id' || value === undefined || value === null) return
        if (key === 'birthdate' && !isValidDate(value as string)) return
        formData.append(`client[${key}]`, value as string)
      })

      if (avatarFile) {
        formData.append('client[avatar]', avatarFile)
      }

      await axios.put(`${apiUrl}/clients/me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
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

  const confirmDelete = () => {
    toast.info(
      <div>
        <p>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
        <div className="mt-2 flex justify-end gap-2">
          <button onClick={() => { toast.dismiss(); handleDelete() }} className="bg-red-600 text-white px-3 py-1 rounded">
            Oui, supprimer
          </button>
          <button onClick={() => toast.dismiss()} className="bg-gray-400 text-white px-3 py-1 rounded">
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

  const handleDeleteBesoin = async (id: number) => {
    const token = localStorage.getItem('clientToken')
    if (!token) return

    try {
      await axios.delete(`${apiUrl}/clients/besoins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const formatDateFr = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // *** Nouvelle fonction pour mettre à jour une annonce ***
  const handleUpdateBesoin = async (id: number) => {
    const token = localStorage.getItem('clientToken')
    if (!token) return

    try {
      await axios.put(`${apiUrl}/clients/besoins/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Annonce mise à jour.')

      // Recharger les besoins après mise à jour
      const res = await axios.get(`${apiUrl}/clients/besoins`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBesoins(res.data)
      setEditingBesoinId(null)
    } catch (error) {
      console.error('Erreur mise à jour besoin :', error)
      toast.error('Erreur lors de la mise à jour.')
    }
  }

  if (loading) return <p>Chargement...</p>
  if (!client) return <p>Impossible de charger les informations client.</p>

  return (
    <>
      <div className={styles.container}>
        <div className={styles.dashboardGrid}>
          <section className={styles.profileSection}>
            {/* Avatar + Nom */}
            <div className={styles.card}>
              <div className={styles.avatarAndName}>
                <div className={styles.avatarWrapper}>
                  {avatarFile ? (
                    <Image src={URL.createObjectURL(avatarFile)} alt="Nouvel avatar" className={styles.avatar} width={96} height={96} />
                  ) : client.avatar_url ? (
                    <Image src={`${client.avatar_url}?t=${Date.now()}`} alt="Avatar" className={styles.avatar} width={96} height={96} />
                  ) : (
                    <Image src="/images/avatar.svg" alt="Avatar par défaut" width={96} height={96} className={styles.avatar} />
                  )}

                  {isEditing && (
                    <div className={styles.avatarInput}>
                      <label htmlFor="avatar-upload" className={styles.fileButton}>Changer la photo de profil</label>
                      <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className={styles.hiddenFileInput} />
                    </div>
                  )}
                </div>

                <h1 className={styles.clientName}>{client.first_name} {client.last_name}</h1>
              </div>
            </div>

            {/* Infos client */}
            <div className={styles.card}>
              <div className={styles.infoFields}>
                {['email', 'phone', 'birthdate'].map((field) => (
                  <div key={field} className={styles.infoField}>
                    <label className={styles.label}>{fieldLabels[field]}</label>
                    {isEditing ? (
                      <input type={field === 'birthdate' ? 'date' : 'text'} name={field} value={(client as any)[field] || ''} onChange={handleChange} className={styles.input} />
                    ) : (
                      <p className={styles.text}>
                        {field === 'birthdate'
                          ? formatDateFr((client as any)[field])
                          : (client as any)[field]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className={styles.passwordFields}>
                  <label>Nouveau mot de passe</label>
                  <input type="password" name="password" onChange={handleChange} className={styles.input} />
                  <label>Confirmation du mot de passe</label>
                  <input type="password" name="password_confirmation" onChange={handleChange} className={styles.input} />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              {isEditing ? (
                <>
                  <button onClick={handleUpdate} className={styles.saveBtn}>Enregistrer</button>
                  <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>Annuler</button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className={styles.editBtn}>Modifier</button>
                  <button onClick={confirmDelete} className={styles.deleteBtn}>Supprimer mon compte</button>
                </>
              )}
            </div>
          </section>

          <section className={styles.rightSection}>
            {/* Annonces */}
            <div className={styles.card}>
              <h2>Mes annonces</h2>
              {besoins.length === 0 ? (
                <p className={styles.empty}>Aucune annonce pour le moment.</p>
              ) : (
                <div className={styles.annonceList}>
                  {besoins.map((besoin) => (
                    <div key={besoin.id} className={styles.annonceCard}>
                      <div className={styles.annonceHeader}>
                        <h3>{besoin.type_prestation}</h3>
                      </div>

                      {!editingBesoinId || editingBesoinId !== besoin.id ? (
                        <>
                          <p>{besoin.description}</p>
                          <p><strong>Adresse :</strong> {besoin.address}</p>
                          <p><strong>Créé le :</strong> {formatDateFr(besoin.created_at)}</p>
                          <p><strong>Planifié pour :</strong> {besoin.schedule ? formatDateFr(besoin.schedule) : 'Non défini'}</p>

                          {besoin.image_urls && besoin.image_urls.length > 0 && (
                            <div className={styles.imagesList}>
                              {besoin.image_urls.map((url: string, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => setModalImageUrl(url)}
                                  className={styles.imageLink}
                                  type="button"
                                >
                                  Image {idx + 1}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Modal pour afficher l'image */}
                          {modalImageUrl && (
                            <div className={styles.modalOverlay} onClick={() => setModalImageUrl(null)}>
                              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setModalImageUrl(null)} className={styles.closeBtn}>X</button>
                                <img src={modalImageUrl} alt="Image annonce" className={styles.modalImage} />
                              </div>
                            </div>
                          )}

                          <div className={styles.annonceActions}>
                            <button
                              onClick={() => {
                                setEditingBesoinId(besoin.id)
                                setEditForm({
                                  type_prestation: besoin.type_prestation,
                                  description: besoin.description,
                                  address: besoin.address,
                                  schedule: besoin.schedule || '',
                                })
                              }}
                              className={styles.editBtn}
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteBesoin(besoin.id)}
                              className={styles.deleteBtn}
                            >
                              Supprimer
                            </button>
                          </div>
                        </>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleUpdateBesoin(besoin.id)
                          }}
                          className={styles.editForm}
                        >
                          <input
                            type="text"
                            value={editForm.type_prestation}
                            onChange={(e) => setEditForm({ ...editForm, type_prestation: e.target.value })}
                            placeholder="Type de prestation"
                            className={styles.input}
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Description"
                            className={styles.input}
                          />
                          <input
                            type="text"
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            placeholder="Adresse"
                            className={styles.input}
                          />
                          <input
                            type="date"
                            value={editForm.schedule}
                            onChange={(e) => setEditForm({ ...editForm, schedule: e.target.value })}
                            className={styles.input}
                          />
                          <div className={styles.editActions}>
                            <button type="submit" className={styles.saveBtn}>Enregistrer</button>
                            <button type="button" onClick={() => setEditingBesoinId(null)} className={styles.cancelBtn}>Annuler</button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
              </div>

            {/* Statistiques */}
            <div className={styles.card}>
              <h2>Historique</h2>
              <ul className={styles.statsList}>
                <li>Total d'annonces : {besoins.length}</li>
              </ul>
            </div>

            {/* Points */}
            <div className={styles.card}>
              <h2>Mes points gagnés</h2>
              <p className={styles.points}>0</p>
            </div>

          </section>
        </div>
      </div>

      <ToastContainer />
    </>
  )
}










