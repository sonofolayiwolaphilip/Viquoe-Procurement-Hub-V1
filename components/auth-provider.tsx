"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

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
    if (typeof window === "undefined") return

    // Check if user is logged in on mount
    const checkAuth = () => {
      const isAuth = localStorage.getItem("isAuthenticated")
      const userType = localStorage.getItem("userType") as "buyer" | "supplier" | "admin"
      const userEmail = localStorage.getItem("userEmail")

      if (isAuth === "true" && userType && userEmail) {
        setUser({
          email: userEmail,
          userType,
          organizationName: localStorage.getItem("organizationName") || undefined,
        })
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = (email: string, userType: "buyer" | "supplier" | "admin") => {
    if (typeof window === "undefined") return

    const userData = {
      email,
      userType,
      organizationName: localStorage.getItem("organizationName") || undefined,
    }

    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("userType", userType)
    localStorage.setItem("userEmail", email)
  }

  const logout = () => {
    if (typeof window === "undefined") return

    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("organizationName")
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
