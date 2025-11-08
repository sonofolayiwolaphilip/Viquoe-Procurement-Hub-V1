
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Shield,
  CheckCircle,
  Building2,
  Truck,
  CreditCard,
  MapPin,
  Globe,
  Zap,
  Brain,
  Target,
  Users,
  LogOut,
  LayoutDashboard,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  // Get dashboard link based on user type
  const getDashboardLink = () => {
    if (!user) return "/login"
    return user.userType === "buyer" ? "/buyer-dashboard" : "/supplier-dashboard"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Revolutionary Navigation */}
      <nav className="border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-xl">V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">Viquoe</span>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-secondary/20 text-secondary-foreground border-secondary/30"
                  >
                    B2B • B2G
                  </Badge>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#marketplace"
                className="text-muted-foreground hover:text-primary transition-all duration-200 font-medium relative group"
              >
                Marketplace
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="#ai-features"
                className="text-muted-foreground hover:text-primary transition-all duration-200 font-medium relative group"
              >
                AI Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="#suppliers"
                className="text-muted-foreground hover:text-primary transition-all duration-200 font-medium relative group"
              >
                Suppliers
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="#contact"
                className="text-muted-foreground hover:text-primary transition-all duration-200 font-medium relative group"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full"></span>
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

      {/* Revolutionary Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-6">
              <Badge className="mb-4 bg-secondary/10 text-secondary-foreground border-secondary/30 px-4 py-2">
                Revolutionary Procurement Platform
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-8 text-balance">
              Built from {" "} //built from Africa, designed for emerging markets & global commerce
              <span className="text-primary relative">
                Africa,
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                designed for Emerging Markets
              </span>{" "}
              & global Commerce
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl font-medium text-muted-foreground mb-12 text-pretty leading-relaxed max-w-4xl mx-auto">
              Experience the future of institutional procurement with AI-powered supplier matching, revolutionary
              compliance automation, and seamless multi-currency transactions across African markets.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isAuthenticated && user ? (
                <>
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground text-lg px-10 py-4 rounded-xl font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-2xl hover:shadow-3xl"
                    asChild
                  >
                    <Link href={getDashboardLink()}>
                      <LayoutDashboard className="mr-3 h-5 w-5" />
                      Go to Dashboard
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Link>
                  </Button>
                  {user.userType === "buyer" && (
                    <Button
                      size="lg"
                      className="bg-secondary text-secondary-foreground text-lg px-10 py-4 rounded-xl font-semibold hover:bg-secondary/90 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                      asChild
                    >
                      <Link href="/buyer-portal">
                        <Zap className="mr-3 h-5 w-5" />
                        Browse Products
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground text-lg px-10 py-4 rounded-xl font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-2xl hover:shadow-3xl"
                    asChild
                  >
                    <Link href="/login">
                      <Zap className="mr-3 h-5 w-5" />
                      Explore Marketplace
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    className="bg-secondary text-secondary-foreground text-lg px-10 py-4 rounded-xl font-semibold hover:bg-secondary/90 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                    asChild
                  >
                    <Link href="/register">
                      <Building2 className="mr-3 h-5 w-5" />
                      Become a Supplier
                    </Link>
                  </Button>
                </>
              )}
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Verified Suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">African Cities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Business Context Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
              Built for Africa
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Designed for African Businesses</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding local business needs across African markets and regulatory environments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6 text-blue-800" />
                </div>
                <CardTitle className="text-lg">Local Suppliers</CardTitle>
                <CardDescription className="text-sm">
                  Connect with verified regional suppliers for faster delivery and competitive pricing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-blue-100">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-6 w-6 text-blue-800" />
                </div>
                <CardTitle className="text-lg">Multi-Currency</CardTitle>
                <CardDescription className="text-sm">
                  Flexible payment options with local currency support and business-friendly terms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-blue-100">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-blue-800" />
                </div>
                <CardTitle className="text-lg">Compliance Ready</CardTitle>
                <CardDescription className="text-sm">
                  Built-in compliance for regional procurement regulations and government standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-blue-100">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-blue-800" />
                </div>
                <CardTitle className="text-lg">Regional Network</CardTitle>
                <CardDescription className="text-sm">
                  Expanding supplier network across African markets with local expertise
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Revolutionary AI Features Section */}
      <section id="ai-features" className="py-20 bg-gradient-to-br from-muted/30 to-secondary/5 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent-foreground border-accent/30 px-4 py-2">
              <Brain className="mr-2 h-4 w-4" />
              AI-Powered Intelligence
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground mb-6 relative">
              Revolutionary Procurement Intelligence
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl font-medium text-muted-foreground max-w-3xl mx-auto">
              Our AI engine transforms how African businesses discover, evaluate, and procure from suppliers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="bg-card border border-border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="h-8 w-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">Smart Supplier Matching</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  AI analyzes your procurement history, budget, and requirements to instantly match you with the perfect
                  suppliers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Automated Compliance</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Revolutionary compliance engine automatically handles regulatory requirements across African markets
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Brain className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Predictive Analytics</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Advanced forecasting helps optimize inventory, predict demand, and reduce procurement costs by up to
                  30%
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Intelligent Negotiations</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  AI-powered negotiation assistant helps secure better prices and terms based on market intelligence
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Marketplace Categories */}
      <section id="marketplace" className="py-20 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground mb-6 relative">
              Revolutionary Marketplace Experience
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl font-medium text-muted-foreground max-w-3xl mx-auto">
              Discover thousands of verified products through our intelligent, category-based marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <Card className="bg-card border border-border rounded-xl shadow-lg hover:shadow-xl cursor-pointer hover:scale-[1.02] hover:border-accent/30 transition-all duration-300 backdrop-blur-sm">
              <CardHeader className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">🖥️</span>
                </div>
                <CardTitle className="text-xl mb-4">Office Supplies</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Premium stationery, printing materials, ink cartridges, and office essentials from verified suppliers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <Button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Explore Category
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-lg hover:shadow-xl cursor-pointer hover:scale-[1.02] hover:border-accent/30 transition-all duration-300 backdrop-blur-sm">
              <CardHeader className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">💻</span>
                </div>
                <CardTitle className="text-xl mb-4">IT Equipment</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Cutting-edge computers, printers, networking equipment, and enterprise technology solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <Button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Explore Category
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-lg hover:shadow-xl cursor-pointer hover:scale-[1.02] hover:border-accent/30 transition-all duration-300 backdrop-blur-sm">
              <CardHeader className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">🏢</span>
                </div>
                <CardTitle className="text-xl mb-4">Facility Materials</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Professional furniture, cleaning supplies, security equipment, and facility maintenance products
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <Button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Explore Category
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              SME-Friendly
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Built for Growing Businesses</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From startups to established SMEs, access enterprise-grade procurement with flexible, budget-conscious
              solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-lg border-emerald-100">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Budget-Friendly</CardTitle>
                <CardDescription className="text-sm">
                  Competitive pricing with volume discounts and flexible payment terms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-emerald-100">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 font-bold">🏪</span>
                </div>
                <CardTitle className="text-lg">Local Suppliers</CardTitle>
                <CardDescription className="text-sm">
                  Priority access to local suppliers for faster delivery and better prices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-emerald-100">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 font-bold">📈</span>
                </div>
                <CardTitle className="text-lg">Scalable Plans</CardTitle>
                <CardDescription className="text-sm">
                  Start free and upgrade as your business grows with our tiered access
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-emerald-100">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 font-bold">⚡</span>
                </div>
                <CardTitle className="text-lg">Quick Setup</CardTitle>
                <CardDescription className="text-sm">
                  Get started in minutes with simplified onboarding for small businesses
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Revolutionary How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground mb-6 relative">
              Revolutionary Process Flow
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl font-medium text-muted-foreground max-w-3xl mx-auto">
              Experience seamless, AI-powered procurement that transforms traditional buying processes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Building2 className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="bg-gradient-to-r from-primary to-secondary w-8 h-1 mx-auto mb-4 rounded-full"></div>
              <h3 className="text-xl font-bold mb-4 text-primary">1. Smart Discovery</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered marketplace helps organizations discover and compare products from verified suppliers
                instantly
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all duration-300">
                <CheckCircle className="h-10 w-10 text-secondary-foreground" />
              </div>
              <div className="bg-gradient-to-r from-secondary to-accent w-8 h-1 mx-auto mb-4 rounded-full"></div>
              <h3 className="text-xl font-bold mb-4 text-primary">2. Automated Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Revolutionary compliance engine handles bids, documentation, and regulatory requirements automatically
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Truck className="h-10 w-10 text-accent-foreground" />
              </div>
              <div className="bg-gradient-to-r from-accent to-primary w-8 h-1 mx-auto mb-4 rounded-full"></div>
              <h3 className="text-xl font-bold mb-4 text-primary">3. Intelligent Fulfillment</h3>
              <p className="text-muted-foreground leading-relaxed">
                Smart logistics network ensures quality delivery with real-time tracking and predictive scheduling
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/80 to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all duration-300">
                <CreditCard className="h-10 w-10 text-white" />
              </div>
              <div className="bg-gradient-to-r from-primary to-secondary w-8 h-1 mx-auto mb-4 rounded-full"></div>
              <h3 className="text-xl font-bold mb-4 text-primary">4. Seamless Settlement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced payment processing with multi-currency support, flexible terms, and automated reconciliation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Benefits */}
      <section id="suppliers" className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Join Our Supplier Network</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with institutional buyers across Africa and grow your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <Building2 className="h-12 w-12 text-blue-800 mb-4" />
                <CardTitle>Access to Institutions</CardTitle>
                <CardDescription>
                  Reach banks, government agencies, NGOs, and corporations looking for your products
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-blue-800 mb-4" />
                <CardTitle>Compliance Support</CardTitle>
                <CardDescription>
                  We handle regulatory compliance, making it easier for you to win institutional contracts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CreditCard className="h-12 w-12 text-blue-800 mb-4" />
                <CardTitle>Guaranteed Payments</CardTitle>
                <CardDescription>
                  Secure payment processing with options for advance payments and invoice discounting
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-blue-800 hover:bg-blue-900" asChild>
              <Link href="/register">
                Apply to Become a Supplier <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Procurement?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of African businesses already using Viquoe marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-blue-800 hover:bg-gray-100"
              asChild
            >
              <Link href="/login">Start Buying</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white hover:text-blue-800 bg-transparent"
              asChild
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold">Viquoe</span>
              </div>
              <p className="text-muted-foreground text-sm">Streamlining institutional procurement across Africa</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/office-supplies" className="hover:text-foreground">
                    Office Supplies
                  </Link>
                </li>
                <li>
                  <Link href="/it-equipment" className="hover:text-foreground">
                    IT Equipment
                  </Link>
                </li>
                <li>
                  <Link href="/facility-materials" className="hover:text-foreground">
                    Facility Materials
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-foreground">
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
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Viquoe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}