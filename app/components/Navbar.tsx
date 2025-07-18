'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth/AuthContext'
import styles from './Navbar.module.scss'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

   // DÉTECTION DU SCROLL
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const espaceLink = user
    ? user.role === 'artisan'
      ? '/dashboard/artisan'
      : '/dashboard/client'
    : '/mon-espace'

  const avatarUrl = useMemo(() => {
    if (!user?.avatar_url) return '/images/avatar.svg'

    // Si avatar_url est une URL complète (commence par http ou https)
    if (user.avatar_url.startsWith('http')) {
      return `${user.avatar_url}?t=${Date.now()}` // ajoute un timestamp pour forcer le rechargement si besoin
    }

    // Sinon on concatène avec le bucket S3
    return `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/${user.avatar_url}`
  }, [user?.avatar_url])

  const handleLogout = async () => {
    logout()
    toast.success('Déconnexion réussie !')

    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  return (
  <>
    <header className={styles.header}>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
       <div className={styles.logo}>
        <Link href="/">
          <Image
            src="/images/logoNav.svg"
            alt="Logo CorsicaFacile"
            width={0}
            height={0}
            priority
          />
        </Link>
      </div>

        <div
          className={`${styles.burger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div />
          <div />
          <div />
        </div>

        <ul className={`${styles.navLinks} ${menuOpen ? styles.show : ''}`}>
          <li>
            <Link href="/" className={pathname === '/' ? styles.active : ''}>
              Accueil
            </Link>
          </li>
          <li>
            <Link
              href="/qui-sommes-nous"
              className={pathname === '/qui-sommes-nous' ? styles.active : ''}
            >
              Qui sommes-nous
            </Link>
          </li>
          <li
            className={styles.dropdown}
            ref={dropdownRef}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>Comment ça marche</span>
            <ul className={`${styles.dropdownMenu} ${dropdownOpen ? styles.show : ''}`}>
              <li>
                <Link href="/comment-ca-marche/clients">Clients</Link>
              </li>
              <li>
                <Link href="/comment-ca-marche/artisans">Artisans</Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/besoin" className={pathname === '/besoin' ? styles.active : ''}>
              Déclarer mon besoin
            </Link>
          </li>
          {user?.role === 'artisan' && (
            <li>
              <Link href="/annonces" className={pathname === '/missions' ? styles.active : ''}>
                Annonces
              </Link>
            </li>
          )}
        </ul>

        <div className={styles.rightSection}>
          {user ? (
            <>
              <Link href={espaceLink} className={styles.avatarLink}>
                <Image
                  src={avatarUrl}
                  alt="Avatar utilisateur"
                  width={32}
                  height={32}
                  className={styles.avatar}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/avatar.svg'
                  }}
                />
              </Link>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/mon-espace" className={styles.cta}>
              Lancer l'application
            </Link>
          )}
        </div>
      </nav>
    </header>
  </>
)
}











