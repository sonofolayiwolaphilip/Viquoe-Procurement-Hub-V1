"use client"

import { useState, FormEvent, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Eye, EyeOff, CheckCircle, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [isPasswordResetSession, setIsPasswordResetSession] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      // First check if there's a token in the URL hash (from email link)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hadToken = await extractTokenFromUrl()
        if (hadToken) {
          // If we just extracted a token from URL, mark this as a password reset session
          setIsPasswordResetSession(true)
          return
        }
      }
      
      // Then check for existing session
      const { data: { session } } = await supabase.auth.getSession()
      const hasSession = !!session
      setHasValidSession(hasSession)
      
      if (hasSession) {
        // Check if this session came from a password reset
        // We can check the URL or set a flag when extracting from URL
        const urlParams = new URLSearchParams(window.location.search)
        const type = urlParams.get('type')
        if (type === 'recovery' || window.location.hash.includes('access_token')) {
          setIsPasswordResetSession(true)
        } else {
          // If user is already logged in normally, redirect them
          router.push("/dashboard")
        }
      } else {
        setError("No valid session found. Please request a new password reset link.")
      }
    } catch (err) {
      console.error("Session check error:", err)
      setError("An error occurred while verifying your session.")
    }
  }

  // NEW FUNCTION: Extract token from URL hash and set session
  const extractTokenFromUrl = async () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash) {
        try {
          // Parse the hash parameters (format: #access_token=xxx&refresh_token=yyy...)
          const params = new URLSearchParams(hash.substring(1))
          const access_token = params.get('access_token')
          const refresh_token = params.get('refresh_token')
          const type = params.get('type') || 'recovery'
          
          if (access_token) {
            console.log("Found access token in URL, setting password reset session...")
            
            // Store original URL before clearing hash
            const originalUrl = window.location.href
            
            // Clear the hash from URL immediately for security
            window.history.replaceState(null, '', window.location.pathname + '?type=' + type)
            
            // Sign out any existing session first
            await supabase.auth.signOut()
            
            // Set the session using the token from URL
            // FIX: Handle null refresh_token by providing empty string
            const { data: { session }, error } = await supabase.auth.setSession({
              access_token,
              refresh_token: refresh_token || ''  // Handle null case
            })
            
            if (error) {
              console.error("Error setting session from URL token:", error)
              return false
            }
            
            if (session) {
              console.log("Password reset session successfully set from URL token")
              setHasValidSession(true)
              setIsPasswordResetSession(true)
              return true
            }
          }
        } catch (err) {
          console.error('Error extracting token from URL:', err)
        }
      }
    }
    return false
  }

  const validateForm = (): string | null => {
    if (!password) {
      return "Password is required"
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters"
    }
    if (password !== confirmPassword) {
      return "Passwords do not match"
    }
    return null
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    
    if (isLoading) return

    setIsLoading(true)
    setError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
        setIsLoading(false)
        return
      }

      setSuccess(true)
      
      // Force sign out immediately after password reset
      await supabase.auth.signOut()
      
      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push("/login?message=password_reset_success")
      }, 3000)
    } catch (err) {
      console.error("Password update error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelReset = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // If user has a session but it's not specifically for password reset
  if (hasValidSession && !isPasswordResetSession && !success) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <Card className="shadow-professional-lg">
            <CardHeader className="text-center">
              <CardTitle>Already Logged In</CardTitle>
              <CardDescription>
                You are already logged into your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  You are currently logged in. If you want to change your password, please use the "Change Password" option in your account settings.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={handleCancelReset} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!hasValidSession && !success) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
          <Card className="shadow-professional-lg">
            <CardContent className="p-6">
              <Alert variant="destructive">
                <AlertDescription>{error || "Invalid session. Please request a new password reset link."}</AlertDescription>
              </Alert>
              <Button asChild className="w-full mt-4">
                <Link href="/forgot-password">Request New Reset Link</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link 
            href="/login" 
            onClick={handleCancelReset}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel Reset
          </Link>
        </div>

        <Card className="shadow-professional-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold">Viquoe</span>
            </div>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              {isPasswordResetSession 
                ? "Enter your new password below" 
                : "Change your account password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Password Updated Successfully</h3>
                <p className="text-muted-foreground">
                  Your password has been reset. You have been signed out for security.
                  Redirecting to login page...
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-green-800 text-sm mb-2">Next Steps</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Use your new password to log in</li>
                    <li>• Consider setting up two-factor authentication</li>
                    <li>• Update your password in any password managers</li>
                  </ul>
                </div>
                <Button asChild className="w-full">
                  <Link href="/login">Go to Login Now</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {isPasswordResetSession && (
                  <Alert className="bg-blue-50">
                    <AlertDescription className="text-sm">
                      You are resetting your password via email link. After resetting, you will be signed out automatically.
                    </AlertDescription>
                  </Alert>
                )}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Updating Password..." : "Update Password"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelReset}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}