"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Building2,
  Truck,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Shield,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function ContactPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    phone: "",
    orgType: "",
    country: "",
    challenges: "",
    budget: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Logout error:", error)
        alert("Failed to log out. Please try again.")
      } else {
        router.push("/")
      }
    } catch (err) {
      console.error("Unexpected logout error:", err)
      alert("An error occurred during logout.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    return user.userType === "buyer" ? "/buyer-dashboard" : "/supplier-dashboard"
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted:", formData)
      setIsSubmitting(false)
      alert("Thank you! We'll contact you soon.")
      setFormData({
        name: "",
        email: "",
        organization: "",
        role: "",
        phone: "",
        orgType: "",
        country: "",
        challenges: "",
        budget: "",
      })
    }, 1000)
  }

  const supplierCategories = [
    "Office Supplies",
    "IT Equipment",
    "Medical Supplies",
    "Construction Materials",
    "Professional Services",
    "Facility Management",
    "Cleaning Supplies",
    "Security Equipment",
    "Furniture",
    "Electrical Equipment",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Same as Homepage */}
      <nav className="border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <img 
                  src="/assets/images/logo/v1.png" 
                  alt="Viquoe Logo"
                  className="h-10 w-auto object-contain" 
                />
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/#marketplace"
                className="text-muted-foreground hover:text-primary transition-all duration-200 font-medium relative group"
              >
                Marketplace
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/#ai-features"
                className="text-muted-foreground hover:text-primary transition-all duration-200 font-medium relative group"
              >
                AI Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/#suppliers"
                className="text-muted-foreground hover:text-primary transition-all duration-200 font-medium relative group"
              >
                Suppliers
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/contact"
                className="text-primary font-medium relative group"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-secondary"></span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : isAuthenticated && user ? (
                <>
                  <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-semibold">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{user.email}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user.userType}</div>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={getDashboardLink()}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="border-primary/20 hover:border-primary/40 bg-transparent" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                    asChild
                  >
                    <Link href="/register">Join Marketplace</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-secondary/10 text-secondary-foreground border-secondary/30 px-4 py-2">
              <Clock className="mr-2 h-4 w-4" />
              Pre-Launch Phase
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
              Building the Future of{" "}
              <span className="text-primary relative">
                African Procurement
                <div className="absolute -bottom-0.5 left-0 w-full h-1 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
              </span>{" "}
              Together
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Viquoe is in active development, reimagining how institutions connect with verified suppliers across Africa. 
              We are currently focused on building foundational partnerships.
            </p>
            <p className="text-lg font-medium text-primary">
              Express your interest below to join our priority network and shape the platform with us.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Pathways */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Connect With Our Teams</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select your pathway to begin a conversation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Buyers Card */}
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">For Institutional Buyers & Partners</CardTitle>
                <CardDescription className="text-base">
                  Banks, NGOs, Government Agencies, Large Corporates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href="mailto:partners@viquoe.com" 
                      className="text-primary hover:underline font-medium"
                    >
                      partners@viquoe.com
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">+[Country Code] [XXX-XXX-XXXX]</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Our Current Focus:</strong> Understanding your procurement challenges and reserving your place in our early access program.
                </p>
                <div className="pt-4">
                  <h4 className="font-semibold mb-4 text-lg">Express Early Interest</h4>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organization">Organization Name *</Label>
                          <Input
                            id="organization"
                            name="organization"
                            value={formData.organization}
                            onChange={handleInputChange}
                            placeholder="Your Organization"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Job Title / Role *</Label>
                          <Input
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            placeholder="Procurement Manager"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Work Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@organization.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+XXX XXX XXX XXX"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="orgType">Organization Type *</Label>
                          <Select 
                            value={formData.orgType} 
                            onValueChange={(value) => handleSelectChange("orgType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank">Bank</SelectItem>
                              <SelectItem value="ngo">NGO/INGO</SelectItem>
                              <SelectItem value="government">Government Agency</SelectItem>
                              <SelectItem value="corporate">Large Corporate</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country of Operation *</Label>
                          <Select 
                            value={formData.country} 
                            onValueChange={(value) => handleSelectChange("country", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nigeria">Nigeria</SelectItem>
                              <SelectItem value="kenya">Kenya</SelectItem>
                              <SelectItem value="south-africa">South Africa</SelectItem>
                              <SelectItem value="ghana">Ghana</SelectItem>
                              <SelectItem value="rwanda">Rwanda</SelectItem>
                              <SelectItem value="uganda">Uganda</SelectItem>
                              <SelectItem value="tanzania">Tanzania</SelectItem>
                              <SelectItem value="ethiopia">Ethiopia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="challenges">What are your top 1-2 procurement challenges? *</Label>
                        <Textarea
                          id="challenges"
                          name="challenges"
                          value={formData.challenges}
                          onChange={handleInputChange}
                          placeholder="Describe your challenges..."
                          rows={3}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budget">Estimated Annual Procurement Budget (Optional)</Label>
                        <Select 
                          value={formData.budget} 
                          onValueChange={(value) => handleSelectChange("budget", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<500k">Under $500K</SelectItem>
                            <SelectItem value="500k-2m">$500K - $2M</SelectItem>
                            <SelectItem value="2m-10m">$2M - $10M</SelectItem>
                            <SelectItem value="10m+">Over $10M</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Join the Priority List"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      By submitting, you agree to our Privacy Policy. A partnerships team member will contact you within 1 business day.
                    </p>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Suppliers Card */}
            <Card className="border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">For Suppliers & Vendors</CardTitle>
                <CardDescription className="text-base">
                  Begin the pre-verification process for our launch network
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href="mailto:suppliers@viquoe.com" 
                      className="text-secondary hover:underline font-medium"
                    >
                      suppliers@viquoe.com
                    </a>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Purpose:</strong> Submit your business for review to become a founding verified supplier.
                </p>
                <div className="pt-4">
                  <h4 className="font-semibold mb-4 text-lg">Supplier Pre-Verification Application</h4>
                  <form className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplierName">Contact Person Name *</Label>
                        <Input id="supplierName" placeholder="Jane Smith" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company/Business Name *</Label>
                        <Input id="companyName" placeholder="Your Company Ltd" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyEmail">Official Company Email *</Label>
                          <Input id="companyEmail" type="email" placeholder="contact@company.com" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyPhone">Phone Number *</Label>
                          <Input id="companyPhone" type="tel" placeholder="+XXX XXX XXX XXX" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Company Website *</Label>
                        <Input id="website" type="url" placeholder="https://yourcompany.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supplierCountry">Country of Registration *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nigeria">Nigeria</SelectItem>
                            <SelectItem value="kenya">Kenya</SelectItem>
                            <SelectItem value="south-africa">South Africa</SelectItem>
                            <SelectItem value="ghana">Ghana</SelectItem>
                            <SelectItem value="rwanda">Rwanda</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Core Product/Service Categories *</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {supplierCategories.slice(0, 6).map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox id={category} />
                              <label
                                htmlFor={category}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearsInBusiness">Years in Business *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2">1-2 Years</SelectItem>
                            <SelectItem value="3-5">3-5 Years</SelectItem>
                            <SelectItem value="5-10">5-10 Years</SelectItem>
                            <SelectItem value="10+">10+ Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Brief company description & reason for interest *</Label>
                        <Textarea
                          id="description"
                          placeholder="Tell us about your company and why you want to join Viquoe..."
                          rows={3}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    >
                      Submit for Review
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Application review typically takes 3-5 business days. You'll receive email confirmation with next steps.
                    </p>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status and Info Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <CardTitle>Development Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    🟡 Active Development & Partnership Building
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    We're building Viquoe to solve real procurement challenges across African markets.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Where We Build</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Viquoe Ltd.</p>
                  <p className="text-sm text-muted-foreground">34, Amudalatu Opebiyi Street, Whitesand, Isheri-Osun</p>
                  <p className="text-sm text-muted-foreground">Lagos, Nigeria</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Serving pan-African procurement from our headquarters.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>General Inquiries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a 
                    href="mailto:nelson.ejimadu@viquoe.com" 
                    className="text-primary hover:underline font-medium block"
                  >
                    contact@viquoe.com
                  </a>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">+2348035293150</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    For press, partnerships, technical issues, or other questions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust & Verification Section */}
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-8 mb-16">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-green-50 text-green-800 border-green-200">
                <Shield className="mr-2 h-4 w-4" />
                Verification & Trust
              </Badge>
              <h3 className="text-2xl font-bold mb-4">Our Commitment to Quality</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-green-800" />
                </div>
                <h4 className="font-semibold">Rigorous Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Every supplier undergoes thorough background checks and verification.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-blue-800" />
                </div>
                <h4 className="font-semibold">Quality Assurance</h4>
                <p className="text-sm text-muted-foreground">
                  We verify product quality and service delivery standards.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                  <Building2 className="h-6 w-6 text-purple-800" />
                </div>
                <h4 className="font-semibold">Partnership Focus</h4>
                <p className="text-sm text-muted-foreground">
                  Building long-term relationships with verified partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Same as Homepage */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/assets/images/logo/v1.png" 
                  alt="Viquoe Logo"
                  className="h-5 w-auto object-contain" 
                />
              </div>
              <p className="text-muted-foreground text-sm">Streamlining institutional procurement across Africa</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/#marketplace" className="hover:text-foreground">
                    Office Supplies
                  </Link>
                </li>
                <li>
                  <Link href="/#marketplace" className="hover:text-foreground">
                    IT Equipment
                  </Link>
                </li>
                <li>
                  <Link href="/#marketplace" className="hover:text-foreground">
                    Facility Materials
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Viquoe. All rights reserved.</p>
            <p className="mt-2">Building the future of African procurement together.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
