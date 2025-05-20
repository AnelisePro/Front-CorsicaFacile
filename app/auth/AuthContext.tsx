'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  email: string
  role: 'client' | 'artisan'
  avatar_url?: string | null
}

type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {
    throw new Error('setUser must be used within AuthProvider')
  },
  logout: () => {
    throw new Error('logout must be used within AuthProvider')
  },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser)
          // fallback par défaut
          if (!parsedUser.avatar_url) {
            parsedUser.avatar_url = '/images/avatar.svg'
          }
          setUserState(parsedUser)
        } catch (error) {
          console.error('Erreur lors du parsing du user depuis localStorage', error)
          setUserState(null)
          localStorage.removeItem('user')
        }
      }
    }
  }, [])

  const setUser = (user: User | null) => {
    if (user) {
      if (!user.avatar_url) {
        user.avatar_url = '/images/avatar.svg'
      }
      setUserState(user)
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      setUserState(null)
      localStorage.removeItem('user')
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('clientToken')
    localStorage.removeItem('artisanToken')
    setUserState(null)
    //router.push('/')
  }

  const value = useMemo(() => ({ user, setUser, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}








