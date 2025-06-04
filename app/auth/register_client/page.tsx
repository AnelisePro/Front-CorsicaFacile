'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.scss'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/navigation'

export default function ClientInscription() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!firstName || !lastName || !email || !phone || !birthdate || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.')
      toast.error('Veuillez remplir tous les champs.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            birthdate,
            password,
            password_confirmation: confirmPassword,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        toast.success('Inscription réussie !', {
          autoClose: 3000,
          onClose: () => router.push('/auth/login_client'),
        })
      } else {
        const message = data.errors?.join(', ') || data.message || 'Erreur inconnue'
        setError(message)
        toast.error(message)
      }
    } catch (err) {
      console.error(err)
      setError('Erreur lors de la connexion au serveur.')
      toast.error('Erreur lors de la connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.splitContainer}>
        <div className={styles.leftSide}>
          <img
            src="/images/landscape1.jpg"
            alt="Illustration d'inscription"
            className={styles.image}
          />
        </div>

        <div className={styles.rightSide}>
          <div className={styles.card}>
            <h1 className={styles.title}>Inscription</h1>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="birthdate">Date de naissance</label>
                <input
                  type="date"
                  id="birthdate"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  required
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirmation du mot de passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Inscription en cours...' : "S'inscrire"}
              </button>

              <Link href="/auth/login_client" className={styles.backButton}>
                Retour vers la connexion
              </Link>
            </form>
          </div>

          {/* Carte d'informations en dehors du formulaire */}
          <div className={styles.infoCard}>
            <div className={styles.infoBox}>
              <p>
                L'inscription est <strong>totalement gratuite</strong>. À chaque intervention validée comme terminée, vous
                récoltez des points qui vous donnent droit à des cadeaux ou réductions chez nos partenaires (catalogue en cours de création).
              </p>
              <br />
              <p>
                Par exemple : <br />
                - 1 intervention validée = 10 points <br />
                - 100 points = 1 bon d'achat chez un partenaire <br />
                - +5 points gagnés si vous laissez un avis à l'artisan
              </p>
              <p>
                Profitez pleinement de nos services et récompenses !
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </>
  )
}





