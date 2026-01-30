"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, LogOut, Building2, Store, Shield } from "lucide-react"
import Link from "next/link"

type UserType = "buyer" | "supplier" | "admin"

export default function ResetPasswordSuccessPage() {
  const [userType, setUserType] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [redirectCountdown, setRedirectCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    getUserType()
    
    // Countdown for auto-redirect
    const countdown = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown)
          redirectToDashboard()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdown)
  }, [])

  const getUserType = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const userMeta = session.user.user_metadata
        const storedUserType = userMeta?.userType as UserType | undefined
        
        if (storedUserType) {
          setUserType(storedUserType)
        } else if (userMeta?.role === "admin") {
          setUserType("admin")
        } else {
          setUserType("buyer")
        }
      }
    } catch (err) {
      console.error("Error getting user type:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const redirectToDashboard = () => {
    if (!userType) {
      router.push("/")
      return
    }

    switch (userType) {
      case "buyer":
        router.push("/buyer-dashboard")
        break
      case "supplier":
        router.push("/supplier-dashboard")
        break
      case "admin":
        router.push("/admin-dashboard")
        break
      default:
        router.push("/")
    }
  }

  const handleSignOutAll = async () => {
    await supabase.auth.signOut()
    router.push("/login?message=password_reset_success")
  }

  const getUserIcon = () => {
    switch (userType) {
      case "buyer":
        return <Building2 className="h-6 w-6" />
      case "supplier":
        return <Store className="h-6 w-6" />
      case "admin":
        return <Shield className="h-6 w-6" />
      default:
        return null
    }
  }

  const getUserDashboardName = () => {
    switch (userType) {
      case "buyer":
        return "Buyer Dashboard"
      case "supplier":
        return "Supplier Dashboard"
      case "admin":
        return "Admin Dashboard"
      default:
        return "Dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-professional-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold">Viquoe</span>
            </div>
            <CardTitle>Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been updated successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Your password has been updated. You are still logged in.
              </p>
              
              {userType && (
                <div className="flex items-center justify-center gap-2">
                  {getUserIcon()}
                  <span className="font-medium">Account: {userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Redirecting to {getUserDashboardName()} in {redirectCountdown} seconds...
              </p>
            </div>

            <Alert className="bg-green-50">
              <AlertDescription className="text-sm">
                For security, you can sign out of all devices if you reset your password from an unfamiliar location.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 pt-2">
              <Button onClick={redirectToDashboard} className="w-full">
                Go to {getUserDashboardName()} Now
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleSignOutAll}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out & Log In Again
              </Button>
              
              <Button asChild variant="ghost" className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Need to change your password again? Visit Security Settings in your dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}