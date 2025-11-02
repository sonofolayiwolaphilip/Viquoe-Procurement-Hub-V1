"use client"

import type React from "react"
import { useState, useEffect, FormEvent } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Store, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

type UserType = "buyer" | "supplier"

interface FormData {
  organizationName: string
  email: string
  password: string
  confirmPassword: string
  contactPerson: string
  phone: string
  address: string
  organizationType: string
  businessRegistration: string
  description: string
  agreeToTerms: boolean
  businessSize: string
}

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType>("buyer")
  const [formData, setFormData] = useState<FormData>({
    organizationName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactPerson: "",
    phone: "",
    address: "",
    organizationType: "",
    businessRegistration: "",
    description: "",
    agreeToTerms: false,
    businessSize: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string
  }>({ score: 0, feedback: "" })

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "buyer" || type === "supplier") {
      setUserType(type)
    }
  }, [searchParams])

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let score = 0
    let feedback = ""

    if (password.length === 0) {
      setPasswordStrength({ score: 0, feedback: "" })
      return
    }

    if (password.length < 8) {
      feedback = "Too short"
    } else {
      score++
      if (password.length >= 12) score++
    }

    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2) feedback = "Weak"
    else if (score <= 4) feedback = "Fair"
    else if (score <= 5) feedback = "Good"
    else feedback = "Strong"

    setPasswordStrength({ score, feedback })
  }

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone validation (Nigerian format)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+?234|0)?[789]\d{9}$/
    const cleanPhone = phone.replace(/[\s-]/g, "")
    return phoneRegex.test(cleanPhone)
  }

  // Business registration validation (Nigerian format)
  const validateBusinessReg = (reg: string): boolean => {
    // RC followed by numbers, or BN followed by numbers
    const regRegex = /^(RC|BN)\d{5,}$/i
    return regRegex.test(reg.replace(/[\s-]/g, ""))
  }

  // Comprehensive form validation
  const validateForm = (): string | null => {
    // Required fields
    if (!formData.organizationName.trim()) {
      return "Organization name is required"
    }
    if (formData.organizationName.trim().length < 2) {
      return "Organization name must be at least 2 characters"
    }

    // Email validation
    if (!formData.email.trim()) {
      return "Email is required"
    }
    if (!validateEmail(formData.email)) {
      return "Please enter a valid email address"
    }

    // Contact person validation
    if (!formData.contactPerson.trim()) {
      return "Contact person name is required"
    }

    // Phone validation
    if (!formData.phone.trim()) {
      return "Phone number is required"
    }
    if (!validatePhone(formData.phone)) {
      return "Please enter a valid Nigerian phone number"
    }

    // Organization type validation
    if (!formData.organizationType) {
      return "Please select an organization type"
    }

    // Business size validation for buyers
    if (userType === "buyer" && !formData.businessSize) {
      return "Please select a business size"
    }

    // Business registration validation
    if (!formData.businessRegistration.trim()) {
      return "Business registration number is required"
    }
    if (!validateBusinessReg(formData.businessRegistration)) {
      return "Please enter a valid business registration number (e.g., RC123456)"
    }

    // Address validation
    if (!formData.address.trim()) {
      return "Address is required"
    }
    if (formData.address.trim().length < 10) {
      return "Please provide a complete address"
    }

    // Description validation for suppliers
    if (userType === "supplier") {
      if (!formData.description.trim()) {
        return "Business description is required for suppliers"
      }
      if (formData.description.trim().length < 20) {
        return "Business description must be at least 20 characters"
      }
    }

    // Password validation
    if (!formData.password) {
      return "Password is required"
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters"
    }
    if (!/[A-Z]/.test(formData.password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(formData.password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/[0-9]/.test(formData.password)) {
      return "Password must contain at least one number"
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match"
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      return "You must agree to the terms and conditions"
    }

    return null
  }

  // Updated handleSubmit function with better error handling
// Replace your existing handleSubmit function with this:

const handleSubmit = async (e: FormEvent) => {
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
    // Clean and prepare data
    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, "")
    const cleanBusinessReg = formData.businessRegistration.trim().toUpperCase().replace(/[\s-]/g, "")
    
    // Prepare metadata for Supabase Auth
    const metadata = {
      userType,
      organizationName: formData.organizationName.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: cleanPhone,
      address: formData.address.trim(),
      organizationType: formData.organizationType,
      businessRegistration: cleanBusinessReg,
      ...(userType === "supplier" && { description: formData.description.trim() }),
      ...(userType === "buyer" && { businessSize: formData.businessSize }),
    }

    console.log("Attempting signup with metadata:", metadata)

    // Supabase sign up
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      console.error("Signup error:", signUpError)
      
      // Handle specific Supabase errors
      if (signUpError.message.includes("already registered") || 
          signUpError.message.includes("User already registered")) {
        setError("This email is already registered. Please sign in instead.")
      } else if (signUpError.message.includes("Password")) {
        setError("Password does not meet requirements. Please try a stronger password.")
      } else if (signUpError.message.includes("Email") || 
                 signUpError.message.includes("email")) {
        setError("Invalid email address. Please check and try again.")
      } else if (signUpError.status === 500) {
        setError("Server error. Please ensure your database triggers are set up correctly or contact support.")
      } else {
        setError(signUpError.message || "Registration failed. Please try again.")
      }
      setIsLoading(false)
      return
    }

    if (!data.user) {
      setError("Registration failed. Please try again or contact support.")
      setIsLoading(false)
      return
    }

    console.log("Signup successful:", data.user.id)

    // Check if email confirmation is required
    if (data.user && !data.user.confirmed_at) {
      console.log("Email confirmation required")
    }

    // Success - show success message
    setSuccess(true)

    // Redirect after 3 seconds
    setTimeout(() => {
      router.push("/login?registered=true")
    }, 3000)
    
  } catch (err) {
    console.error("Registration error:", err)
    setError("An unexpected error occurred. Please check your internet connection and try again.")
    setIsLoading(false)
  }
}

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Check password strength when password changes
    if (field === "password" && typeof value === "string") {
      checkPasswordStrength(value)
    }

    // Clear error when user starts typing
    if (error) {
      setError("")
    }
  }

  const handleUserTypeChange = (newType: UserType) => {
    if (!isLoading) {
      setUserType(newType)
      setError("")
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-professional-lg">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-muted-foreground mb-4">
              {userType === "buyer"
                ? "Your organization has been registered. Please check your email to verify your account, then you can sign in."
                : "Your supplier application has been submitted for review. Please verify your email. We'll contact you within 2-3 business days."}
            </p>
            <p className="text-sm text-muted-foreground mb-4">Redirecting to sign in page...</p>
            <Button asChild>
              <Link href="/login">Go to Sign In Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
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
            <CardTitle className="flex items-center justify-center gap-2">
              {userType === "buyer" ? (
                <>
                  <Building2 className="h-5 w-5" />
                  Register Your Organization
                </>
              ) : (
                <>
                  <Store className="h-5 w-5" />
                  Become a Supplier
                </>
              )}
            </CardTitle>
            <CardDescription>
              {userType === "buyer"
                ? "Join Viquoe to streamline your procurement process"
                : "Apply to become a verified supplier in our network"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={userType === "buyer" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleUserTypeChange("buyer")}
                  className="rounded-md"
                  disabled={isLoading}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Buyer
                </Button>
                <Button
                  variant={userType === "supplier" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleUserTypeChange("supplier")}
                  className="rounded-md"
                  disabled={isLoading}
                >
                  <Store className="h-4 w-4 mr-2" />
                  Supplier
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">
                    {userType === "buyer" ? "Organization Name" : "Company Name"} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => updateFormData("organizationName", e.target.value)}
                    placeholder={userType === "buyer" ? "First Bank of Nigeria" : "ABC Supplies Ltd"}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationType">
                    {userType === "buyer" ? "Organization Type" : "Business Type"} <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => updateFormData("organizationType", value)} disabled={isLoading} value={formData.organizationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {userType === "buyer" ? (
                        <>
                          <SelectItem value="sme">Small/Medium Enterprise</SelectItem>
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="local-business">Local Business</SelectItem>
                          <SelectItem value="bank">Bank</SelectItem>
                          <SelectItem value="government">Government Agency</SelectItem>
                          <SelectItem value="ngo">NGO</SelectItem>
                          <SelectItem value="corporate">Large Corporate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="manufacturer">Manufacturer</SelectItem>
                          <SelectItem value="distributor">Distributor</SelectItem>
                          <SelectItem value="retailer">Retailer</SelectItem>
                          <SelectItem value="importer">Importer</SelectItem>
                          <SelectItem value="local-supplier">Local Supplier</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {userType === "buyer" && (
                <div className="space-y-2">
                  <Label htmlFor="businessSize">
                    Business Size <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => updateFormData("businessSize", value)} disabled={isLoading} value={formData.businessSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="micro">Micro (1-10 employees)</SelectItem>
                      <SelectItem value="small">Small (11-50 employees)</SelectItem>
                      <SelectItem value="medium">Medium (51-250 employees)</SelectItem>
                      <SelectItem value="large">Large (250+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="contact@organization.com"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    Contact Person <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => updateFormData("contactPerson", e.target.value)}
                    placeholder="John Doe"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+234 800 000 0000"
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Format: +234XXXXXXXXXX or 0XXXXXXXXXX</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessRegistration">
                    Business Registration Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessRegistration"
                    value={formData.businessRegistration}
                    onChange={(e) => updateFormData("businessRegistration", e.target.value)}
                    placeholder="RC123456"
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Format: RC123456 or BN123456</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  placeholder="Complete business address"
                  disabled={isLoading}
                  rows={3}
                  required
                />
              </div>

              {userType === "supplier" && (
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Business Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="Describe your products and services (minimum 20 characters)"
                    disabled={isLoading}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">{formData.description.length}/20 characters minimum</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
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
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < passwordStrength.score
                                ? passwordStrength.score <= 2
                                  ? "bg-red-500"
                                  : passwordStrength.score <= 4
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Strength: {passwordStrength.feedback}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Must be 8+ characters with uppercase, lowercase, and number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
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
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => updateFormData("agreeToTerms", checked === true)}
                  disabled={isLoading}
                  required
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline" target="_blank">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                    Privacy Policy
                  </Link>{" "}
                  <span className="text-red-500">*</span>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : `Register as ${userType === "buyer" ? "Buyer" : "Supplier"}`}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}