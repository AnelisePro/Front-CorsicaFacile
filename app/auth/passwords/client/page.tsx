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

    setTimeout(() => {
      toast.success(
        `Un lien de réinitialisation a été envoyé à ${email} (simulation).`,
        { autoClose: 5000 }
      )
      setLoading(false)
      setEmail('')
    }, 1500)
  }

  return (
    <>
      <div className={styles.splitContainer}>
        <div className={styles.leftSide}>
          <Image
            src="/images/landscape1.jpg"
            alt="Illustration mot de passe oublié"
            fill
            className={styles.image}
          />
        </div>

        <div className={styles.rightSide}>
          <div className={styles.card}>
            <h1 className={styles.title}>Mot de passe oublié</h1>

            <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
              Entrez votre adresse email et nous vous enverrons un lien pour récupérer votre compte.
            </p>

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

              <Link href="/auth/login_client" className={styles.backButton}>
                Retour à la connexion
              </Link>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </>
  )
}

