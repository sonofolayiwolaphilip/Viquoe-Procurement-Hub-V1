"use client"

import { useState, FormEvent } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Store, Shield, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type UserType = "buyer" | "supplier" | "admin"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<UserType>("buyer")
  const router = useRouter()

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Form validation
  const validateForm = (): string | null => {
    if (!email.trim()) {
      return "Email is required"
    }
    if (!validateEmail(email)) {
      return "Please enter a valid email address"
    }
    if (!password) {
      return "Password is required"
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters"
    }
    return null
  }

  const handleLogin = async (e: FormEvent, userType: UserType) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isLoading) return

    setIsLoading(true)
    setError("")

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      // Supabase sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        // Handle specific Supabase errors
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.")
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Please verify your email address before signing in.")
        } else {
          setError(signInError.message)
        }
        setIsLoading(false)
        return
      }

      if (!data.user) {
        setError("Authentication failed. Please try again.")
        setIsLoading(false)
        return
      }

      // Check user type from metadata
      const userMeta = data.user.user_metadata
      const storedUserType = userMeta?.userType as UserType | undefined

      // If user has a type in metadata, verify it matches
      if (storedUserType && storedUserType !== userType) {
        // Sign out the user since type mismatch
        await supabase.auth.signOut()
        setError(`This account is registered as a ${storedUserType}. Please select the correct account type.`)
        setIsLoading(false)
        return
      }

      // Redirect based on user type
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
          setError("Invalid account type")
          setIsLoading(false)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (!isLoading) {
      setActiveTab(value as UserType)
      setError("") // Clear errors when switching tabs
    }
  }

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
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
            <CardTitle>Sign In to Your Account</CardTitle>
            <CardDescription>Choose your account type and enter your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="buyer" className="text-xs" disabled={isLoading}>
                  <Building2 className="h-4 w-4 mr-1" />
                  Buyer
                </TabsTrigger>
                <TabsTrigger value="supplier" className="text-xs" disabled={isLoading}>
                  <Store className="h-4 w-4 mr-1" />
                  Supplier
                </TabsTrigger>
                <TabsTrigger value="admin" className="text-xs" disabled={isLoading}>
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="buyer" className="space-y-4 mt-6">
                <form onSubmit={(e) => handleLogin(e, "buyer")}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="buyer-email">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="buyer-email"
                        type="email"
                        placeholder="your.email@organization.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyer-password">Password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Input
                          id="buyer-password"
                          type={showPassword ? "text" : "password"}
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing In..." : "Sign In as Buyer"}
                    </Button>
                  </div>
                </form>
                <p className="text-sm text-center text-muted-foreground">
                  New organization?{" "}
                  <Link href="/register?type=buyer" className="text-primary hover:underline">
                    Register here
                  </Link>
                </p>
              </TabsContent>

              <TabsContent value="supplier" className="space-y-4 mt-6">
                <form onSubmit={(e) => handleLogin(e, "supplier")}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier-email">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="supplier-email"
                        type="email"
                        placeholder="supplier@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier-password">Password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Input
                          id="supplier-password"
                          type={showPassword ? "text" : "password"}
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing In..." : "Sign In as Supplier"}
                    </Button>
                  </div>
                </form>
                <p className="text-sm text-center text-muted-foreground">
                  Want to become a supplier?{" "}
                  <Link href="/register?type=supplier" className="text-primary hover:underline">
                    Apply here
                  </Link>
                </p>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <form onSubmit={(e) => handleLogin(e, "admin")}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@viquoe.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing In..." : "Sign In as Admin"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                Forgot your password?
              </Link>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}