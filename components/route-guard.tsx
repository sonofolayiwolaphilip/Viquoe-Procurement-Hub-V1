"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

interface RouteGuardProps {
  children: React.ReactNode
  requiredUserType?: "buyer" | "supplier" | "admin"
  redirectTo?: string
}

export function RouteGuard({ children, requiredUserType, redirectTo = "/login" }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Wait for auth to be initialized
    if (isLoading) {
      return
    }

    console.log('🛡️ Route guard checking:', {
      isAuthenticated,
      userType: user?.userType,
      requiredUserType,
      userEmail: user?.email
    })

    // User not authenticated
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login')
      router.replace(redirectTo)
      return
    }

    // User authenticated but wrong type
    if (requiredUserType && user?.userType !== requiredUserType) {
      console.log('❌ Wrong user type, redirecting')
      
      // Redirect to appropriate dashboard based on user type
      switch (user?.userType) {
        case "buyer":
          router.replace("/buyer-dashboard")
          break
        case "supplier":
          router.replace("/supplier-dashboard")
          break
        case "admin":
          router.replace("/admin-dashboard")
          break
        default:
          router.replace("/login")
      }
      return
    }

    // All checks passed
    console.log('✅ Route guard passed')
    setIsChecking(false)
  }, [isAuthenticated, user, isLoading, requiredUserType, router, redirectTo])

  // Show loading state while checking
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show children if all checks pass
  return <>{children}</>
}