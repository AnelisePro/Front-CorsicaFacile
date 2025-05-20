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
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Charger l'utilisateur depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          setUser(null)
        }
      }
    }
  }, [])

  // Sauvegarder l'utilisateur dans localStorage quand il change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('clientToken')
    localStorage.removeItem('artisanToken')
    setUser(null)
    router.push('/')
  }

  const value = useMemo(() => ({ user, setUser, logout }), [user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}





