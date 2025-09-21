"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

interface User {
  email: string
  userType: "buyer" | "supplier" | "admin"
  organizationName?: string
import { supabase } from "@/lib/supabaseClient"
}

  email: string
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

interface User {
  email: string
  userType?: string
  organizationName?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
        const userMeta = data.session.user.user_metadata || {}
        setUser({
          email: data.session.user.email || '',
          userType: userMeta.userType,
  useEffect(() => {
    setIsLoading(true)
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session && data.session.user) {
        const userMeta = data.session.user.user_metadata || {}
        setUser({
          email: data.session.user.email || '',
          userType: userMeta.userType,
          organizationName: userMeta.organizationName,
          ...userMeta,
        })
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)

      setIsLoading(false)
      import React, { createContext, useContext, useEffect, useState } from "react"
      import { supabase } from "@/lib/supabaseClient"

      interface User {
        email: string
        userType?: string
        organizationName?: string
        [key: string]: any
      }

      interface AuthContextType {
        user: User | null
        isAuthenticated: boolean
        login: (email: string, password: string) => Promise<void>
        logout: () => Promise<void>
        isLoading: boolean
      }

      const AuthContext = createContext<AuthContextType | undefined>(undefined)

      export function AuthProvider({ children }: { children: React.ReactNode }) {
        const [user, setUser] = useState<User | null>(null)
        const [isAuthenticated, setIsAuthenticated] = useState(false)
        const [isLoading, setIsLoading] = useState(true)

        useEffect(() => {
          setIsLoading(true)
          const getSession = async () => {
            const { data } = await supabase.auth.getSession()
            if (data.session && data.session.user) {
              const userMeta = data.session.user.user_metadata || {}
              setUser({
                email: data.session.user.email || '',
                userType: userMeta.userType,
                organizationName: userMeta.organizationName,
                ...userMeta,
              })
              setIsAuthenticated(true)
            } else {
              setUser(null)
              setIsAuthenticated(false)
            }
            setIsLoading(false)
          }
          getSession()
          // Listen for auth state changes
          const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session && session.user) {
              const userMeta = session.user.user_metadata || {}
              setUser({
                email: session.user.email || '',
                userType: userMeta.userType,
                organizationName: userMeta.organizationName,
                ...userMeta,
              })
              setIsAuthenticated(true)
            } else {
              setUser(null)
              setIsAuthenticated(false)
            }
            setIsLoading(false)
          })
          return () => {
            listener?.subscription.unsubscribe()
          }
        }, [])

        const login = async (email: string, password: string) => {
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          // user state will be set by the auth state listener
        }

        const logout = async () => {
          await supabase.auth.signOut()
          // user state will be cleared by the auth state listener
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
