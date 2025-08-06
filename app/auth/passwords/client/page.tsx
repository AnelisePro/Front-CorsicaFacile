'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.scss'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ForgottenPasswordClient() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Veuillez entrer votre adresse email.')
      toast.error('Veuillez entrer votre adresse email.')
      return
    }

    setLoading(true)

    try {
      // 🔥 APPEL API RÉEL (plus de simulation !)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/password_resets/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message, { autoClose: 5000 })
        setEmail('')
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Erreur:', error)
      const errorMessage = 'Erreur de connexion au serveur'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.imageSection}>
            <img src="/images/img5.jpeg" alt="Image de fond" />
          </div>
          <div className={styles.contentSection}>
            <h1 className={styles.title}>Mot de passe oublié</h1>

            <div className={styles.description}>
              <p>Entrez votre adresse email et nous vous enverrons un lien pour récupérer votre compte.</p>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Adresse email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Votre adresse email"
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Réinitialiser'}
              </button>
            </form>

            <Link href="/auth/login_client" className={styles.backButton}>
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </>
  )
}


