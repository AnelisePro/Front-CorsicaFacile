'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.scss'
import { useAuth } from '@/app/auth/AuthContext'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/navigation'

export default function ArtisanConnexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [siren, setSiren] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !siren) {
      setError('Veuillez remplir tous les champs.')
      toast.error('Veuillez remplir tous les champs.')
      return
    }

    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artisans/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ artisan: { email, password, siren } }),
      })

      const data = await response.json()

      if (response.ok) {
        const authHeader = response.headers.get('Authorization') || response.headers.get('authorization')

        if (!authHeader) {
          setError('Jeton non reçu du serveur.')
          toast.error('Jeton non reçu du serveur.')
          return
        }

        const token = authHeader.split(' ')[1]

        const user = {
          email: data.artisan.email,
          role: 'artisan' as const,
          avatar_url: data.artisan.avatar_url || null,
        }

        localStorage.setItem('artisanToken', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)

        // Toast avec callback onClose pour redirection
        toast.success('Connexion réussie', {
          onClose: () => {
            router.push('/dashboard/artisan')
          },
          autoClose: 3000,
        })
      } else {
        setError(data.message || "Une erreur s'est produite.")
        toast.error(data.message || "Une erreur s'est produite.")
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      setError('Erreur réseau ou serveur.')
      toast.error('Erreur réseau ou serveur.')
    }
  }

  return (
    <>
      <div className={styles.splitContainer}>
        <div className={styles.leftSide}>
          <Image
            src="/images/landscape1.jpg"
            alt="Illustration de connexion"
            fill
            className={styles.image}
          />
        </div>

        <div className={styles.rightSide}>
          <div className={styles.card}>
            <h1 className={styles.title}>Connexion</h1>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Votre email"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="siren">Numéro SIREN</label>
                <input
                  type="text"
                  id="siren"
                  value={siren}
                  onChange={(e) => setSiren(e.target.value)}
                  required
                  placeholder="Ex: 123456789"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Votre mot de passe"
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Se connecter
              </button>

              <div className={styles.links}>
                <Link href="/auth/passwords/artisan" className={styles.link}>
                  Mot de passe oublié ?
                </Link>
                <Link href="/auth/register_artisan" className={styles.link}>
                  Pas encore inscrit ? Inscrivez-vous
                </Link>
              </div>
            </form>

            <Link href="/mon-espace" className={styles.backButton}>
              Retour à l'écran de choix
            </Link>
          </div>
        </div>
      </div>

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
    </>
  )
}











