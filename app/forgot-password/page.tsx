"use client"

import { useState, FormEvent } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    
    if (isLoading) return

    setIsLoading(true)
    setError("")
    setSuccess(false)
    setDebugInfo("")

    if (!email.trim()) {
      setError("Email is required")
      setIsLoading(false)
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      // Get the current origin
      const origin = window.location.origin
      const redirectTo = `${origin}/auth/callback`
      
      console.log('Password reset attempt:', {
        email: email.trim(),
        redirectTo,
        origin,
        timestamp: new Date().toISOString()
      })

      setDebugInfo(`Sending to: ${email.trim()}\nRedirect: ${redirectTo}`)

      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: redirectTo,
        }
      )

      console.log('Reset response:', { data, error: resetError })

      if (resetError) {
        console.error('Reset error details:', resetError)
        setDebugInfo(`Error: ${resetError.message}\nStatus: ${resetError.status}`)
        
        if (resetError.message.includes('email')) {
          setError("This email address is not registered or cannot receive emails.")
        } else if (resetError.status === 429) {
          setError("Too many attempts. Please wait a few minutes before trying again.")
        } else {
          setError(`Failed to send reset email: ${resetError.message}`)
        }
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setDebugInfo(`Success! Email sent to: ${email.trim()}`)
      console.log('Password reset email sent successfully')
      
    } catch (err) {
      console.error("Password reset error:", err)
      setError("An unexpected error occurred. Please try again.")
      setDebugInfo(`Exception: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

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
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold">Viquoe</span>
            </div>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Debug info - remove in production */}
            {debugInfo && (
              <Alert className="mb-4 bg-blue-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-mono">
                  {debugInfo}
                </AlertDescription>
              </Alert>
            )}

            {success ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Mail className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Check Your Email</h3>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    If an account exists with <strong>{email}</strong>, you will receive a password reset link.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The link will expire in 24 hours.
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-amber-800 text-sm mb-2">Troubleshooting</h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Check your spam or junk folder</li>
                    <li>• Verify you entered the correct email address</li>
                    <li>• Wait a few minutes - emails may be delayed</li>
                    <li>• Contact support if you continue having issues</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-4">
                  <Button asChild className="w-full">
                    <Link href="/login">Back to Login</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSuccess(false)
                      setEmail("")
                      setDebugInfo("")
                    }}
                    className="w-full"
                  >
                    Try Another Email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}