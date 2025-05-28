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

  const espaceLink = user
    ? user.role === 'artisan'
      ? '/dashboard/artisan'
      : '/dashboard/client'
    : '/mon-espace'

  const avatarUrl = useMemo(() => {
    return user?.avatar_url
      ? `${user.avatar_url}?t=${Date.now()}`
      : '/images/avatar.svg'
  }, [user?.avatar_url])

  const handleLogout = async () => {
    logout()
    toast.success('Déconnexion réussie !')

    // délai avant redirection pour laisser le temps à la toast de s'afficher
    setTimeout(() => {
      router.push('/') // redirige vers la page d'accueil après 1.5s
    }, 3000)
  }

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <Link href="/">
              <Image
                src="/images/logo1.png"
                alt="Logo CorsicaFacile"
                width={0}
                height={0}
                style={{ height: '100%', width: 'auto' }}
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
            <li><Link href="/" className={pathname === '/' ? styles.active : ''}>Accueil</Link></li>
            <li><Link href="/qui-sommes-nous" className={pathname === '/qui-sommes-nous' ? styles.active : ''}>Qui sommes-nous</Link></li>
            <li className={styles.dropdown} ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span>Comment ça marche ▾</span>
              <ul className={`${styles.dropdownMenu} ${dropdownOpen ? styles.show : ''}`}>
                <li><Link href="/comment-ca-marche/clients">Clients</Link></li>
                <li><Link href="/comment-ca-marche/artisans">Artisans</Link></li>
              </ul>
            </li>
            <li><Link href="/declarer-mon-besoin" className={pathname === '/declarer-mon-besoin' ? styles.active : ''}>Déclarer mon besoin</Link></li>
            <li><Link href="/annonces" className={pathname === '/annonces' ? styles.active : ''}>Annonces</Link></li>

            <li>
              {user ? (
                <Link href={espaceLink} className={styles.avatarLink}>
                  <Image
                    src={avatarUrl}
                    alt="Avatar utilisateur"
                    width={40}
                    height={40}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/avatar.svg'
                    }}
                  />
                </Link>
              ) : (
                <Link
                  href="/mon-espace"
                  className={`${styles.cta} ${
                    pathname.startsWith('/dashboard') || pathname === '/mon-espace'
                      ? styles.active
                      : ''
                  }`}
                >
                  Mon Espace
                </Link>
              )}
            </li>

            {user && (
              <li>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  Déconnexion
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>
    </>
  )
}










