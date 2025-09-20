"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

interface User {
  email: string
  userType: "buyer" | "supplier" | "admin"
  organizationName?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, userType: "buyer" | "supplier" | "admin") => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata
        setUser({
          email: session.user.email || '',
          userType: meta?.userType || 'buyer',
          organizationName: meta?.organizationName,
        })
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    })
    // Initial check
    const session = supabase.auth.getSession().then(({ data }) => {
      const session = data.session
      if (session?.user) {
        const meta = session.user.user_metadata
        setUser({
          email: session.user.email || '',
          userType: meta?.userType || 'buyer',
          organizationName: meta?.organizationName,
        })
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // login and logout are now handled by Supabase Auth
  const login = () => {}

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
