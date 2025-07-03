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

interface Besoin {
  id: number
  type_prestation: string
  description: string
  address: string
  schedule: string
  images?: string[]
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

  const [editForm, setEditForm] = useState({
    type_prestation: '',
    description: '',
    address: '',
    schedule: '',
    images: [] as string[],
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

      await axios.put(`${apiUrl}/clients/me`, updatedClientData, {
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

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const url = await uploadToS3(file);
      if (url) {
        uploadedUrls.push(url);
      } else {
        toast.error(`Erreur lors de l'upload de l'image ${file.name}`);
      }
    }

    setEditForm(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }));
  };

  const handleUpdateBesoin = async (id: number) => {
    const token = localStorage.getItem('clientToken')
    if (!token) return

    try {
      await axios.put(`${apiUrl}/clients/besoins/${id}`, { besoin: {
        type_prestation: editForm.type_prestation,
        description: editForm.description,
        address: editForm.address,
        schedule: editForm.schedule,
        image_urls: editForm.images,
      } }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Annonce mise à jour.')

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
      <ToastContainer />

      <div className={styles.container}>
        <h1>Bienvenue, {client.first_name} {client.last_name}</h1>

        {/* Profil */}
        <section className={styles.profileSection}>
          {!isEditing ? (
            <>
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
              </div>

              <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                Modifier mon profil
              </button>
            </>
          ) : (
            <div className={styles.editForm}>
              <label>
                Prénom
                <input
                  type="text"
                  name="first_name"
                  value={client.first_name}
                  onChange={handleChange}
                />
              </label>
              <label>
                Nom
                <input
                  type="text"
                  name="last_name"
                  value={client.last_name}
                  onChange={handleChange}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={client.email}
                  onChange={handleChange}
                />
              </label>
              <label>
                Téléphone
                <input
                  type="tel"
                  name="phone"
                  value={client.phone}
                  onChange={handleChange}
                />
              </label>
              <label>
                Date de naissance
                <input
                  type="date"
                  name="birthdate"
                  value={client.birthdate}
                  onChange={handleChange}
                />
              </label>
              <label>
                Avatar
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </label>

              <div className={styles.editButtons}>
                <button onClick={handleUpdate}>Sauvegarder</button>
                <button onClick={() => setIsEditing(false)}>Annuler</button>
              </div>
            </div>
          )}
        </section>

        {/* Annonces (Besoins) */}
        <section className={styles.besoinsSection}>
          <h2>Mes annonces</h2>
          {besoins.length === 0 && <p>Aucune annonce.</p>}

          {besoins.map((besoin) => (
            <div key={besoin.id} className={styles.besoinCard}>
              {editingBesoinId === besoin.id ? (
                <div className={styles.editForm}>
                  <label>
                    Type de prestation
                    <input
                      type="text"
                      value={editForm.type_prestation}
                      onChange={(e) => setEditForm({ ...editForm, type_prestation: e.target.value })}
                    />
                  </label>
                  <label>
                    Description
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </label>
                  <label>
                    Adresse
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </label>
                  <label>
                    Horaires
                    <input
                      type="text"
                      value={editForm.schedule}
                      onChange={(e) => setEditForm({ ...editForm, schedule: e.target.value })}
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
                    {editForm.images.map((url, index) => (
                      <div key={index} className={styles.imageWrapper}>
                        <Image src={url} alt={`Image ${index + 1}`} width={100} height={100} />
                        <button
                          type="button"
                          onClick={() => {
                            setEditForm(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index),
                            }))
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => handleUpdateBesoin(besoin.id)}>Enregistrer</button>
                  <button onClick={() => setEditingBesoinId(null)}>Annuler</button>
                </div>
              ) : (
                <>
                  <p><strong>Type de prestation :</strong> {besoin.type_prestation}</p>
                  <p><strong>Description :</strong> {besoin.description}</p>
                  <p><strong>Adresse :</strong> {besoin.address}</p>
                  <p><strong>Horaires :</strong> {besoin.schedule}</p>

                  <div className={styles.imagesPreview}>
                    {(besoin.images || []).map((url, idx) => (
                      <Image key={idx} src={url} alt={`Image ${idx + 1}`} width={100} height={100} />
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setEditingBesoinId(besoin.id)
                      setEditForm({
                        type_prestation: besoin.type_prestation,
                        description: besoin.description,
                        address: besoin.address,
                        schedule: besoin.schedule,
                        images: besoin.images || [],
                      })
                    }}
                  >
                    Modifier
                  </button>
                  <button onClick={() => handleDeleteBesoin(besoin.id)}>Supprimer</button>
                </>
              )}
            </div>
          ))}
        </section>

        <section className={styles.deleteSection}>
          <button className={styles.deleteButton} onClick={confirmDelete}>
            Supprimer mon compte
          </button>
        </section>
      </div>
    </>
  )
}
















