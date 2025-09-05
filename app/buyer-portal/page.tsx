"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, ShoppingCart, Star, Package, Truck, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  category: string
  price: number
  supplier: string
  rating: number
  reviews: number
  image: string
  description: string
  inStock: boolean
  deliveryTime: string
}

export default function BuyerPortal() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<{ id: string; quantity: number }[]>([])
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false)
  const [quoteRequest, setQuoteRequest] = useState({
    quantity: 1,
    urgency: "standard",
    notes: "",
    deliveryAddress: "",
    contactPerson: "",
    phone: "",
  })
  const [quoteSuccess, setQuoteSuccess] = useState(false)

  const products: Product[] = [
    {
      id: "1",
      name: "HP LaserJet Pro M404n Printer",
      category: "IT Equipment",
      price: 85000,
      supplier: "TechSupply Nigeria",
      rating: 4.8,
      reviews: 24,
      image: "/hp-laser-printer.jpg",
      description:
        "Professional monochrome laser printer with fast printing speeds and reliable performance for office environments.",
      inStock: true,
      deliveryTime: "2-3 business days",
    },
    {
      id: "2",
      name: "Canon Ink Cartridge PG-245XL",
      category: "Office Supplies",
      price: 8500,
      supplier: "Office Essentials Ltd",
      rating: 4.6,
      reviews: 156,
      image: "/canon-ink-cartridge.jpg",
      description:
        "High-yield black ink cartridge compatible with Canon PIXMA printers. Delivers sharp, professional documents.",
      inStock: true,
      deliveryTime: "1-2 business days",
    },
    {
      id: "3",
      name: "Executive Office Chair",
      category: "Furniture",
      price: 45000,
      supplier: "Furniture Plus",
      rating: 4.7,
      reviews: 89,
      image: "/executive-office-chair.jpg",
      description: "Ergonomic executive chair with lumbar support, adjustable height, and premium leather upholstery.",
      inStock: true,
      deliveryTime: "3-5 business days",
    },
    {
      id: "4",
      name: "A4 Copy Paper (500 sheets)",
      category: "Stationery",
      price: 2500,
      supplier: "Paper World",
      rating: 4.5,
      reviews: 203,
      image: "/a4-copy-paper.jpg",
      description:
        "Premium quality A4 copy paper, 80gsm weight. Perfect for printing, copying, and general office use.",
      inStock: true,
      deliveryTime: "1-2 business days",
    },
    {
      id: "5",
      name: "Dell OptiPlex 3090 Desktop",
      category: "IT Equipment",
      price: 320000,
      supplier: "Computer Solutions",
      rating: 4.9,
      reviews: 45,
      image: "/dell-desktop-computer.jpg",
      description:
        "Compact business desktop with Intel Core i5 processor, 8GB RAM, and 256GB SSD. Perfect for office productivity.",
      inStock: true,
      deliveryTime: "3-5 business days",
    },
    {
      id: "6",
      name: "Sanitizer Dispenser (Automatic)",
      category: "Cleaning Supplies",
      price: 12000,
      supplier: "Health & Safety Co",
      rating: 4.4,
      reviews: 67,
      image: "/automatic-sanitizer-dispenser.jpg",
      description:
        "Touchless automatic hand sanitizer dispenser with sensor activation. Battery operated with adjustable volume.",
      inStock: true,
      deliveryTime: "2-3 business days",
    },
  ]

  const categories = ["all", "Office Supplies", "IT Equipment", "Furniture", "Stationery", "Cleaning Supplies"]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (productId: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId)
      if (existing) {
        return prev.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + quantity } : item))
      }
      return [...prev, { id: productId, quantity }]
    })
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleQuoteRequest = async () => {
    if (!selectedProduct) return

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setQuoteSuccess(true)
      setQuoteRequest({
        quantity: 1,
        urgency: "standard",
        notes: "",
        deliveryAddress: "",
        contactPerson: "",
        phone: "",
      })

      setTimeout(() => {
        setQuoteSuccess(false)
        setIsQuoteDialogOpen(false)
      }, 2000)
    } catch (error) {
      console.error("Quote request failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold">Viquoe</span>
              </Link>
              <Badge variant="secondary">Buyer Portal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart ({getCartItemCount()})
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Procurement Made Simple</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse thousands of verified products from trusted suppliers. Get competitive prices with guaranteed quality
            and compliance.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products, suppliers, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Verified Suppliers</h3>
              <p className="text-sm text-muted-foreground">All suppliers are pre-vetted and compliant</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Quick and reliable delivery nationwide</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Quality Assured</h3>
              <p className="text-sm text-muted-foreground">100% authentic products with warranty</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow-professional hover:shadow-professional-lg transition-shadow">
              <CardContent className="p-0">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">({product.reviews})</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">by {product.supplier}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-primary">₦{product.price.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{product.deliveryTime}</div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => addToCart(product.id)}>
                      Add to Cart
                    </Button>
                    <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex-1" onClick={() => setSelectedProduct(product)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Quote
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Request Quote</DialogTitle>
                          <DialogDescription>Get a custom quote for {product.name}</DialogDescription>
                        </DialogHeader>

                        {quoteSuccess ? (
                          <div className="text-center py-6">
                            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Quote Request Sent!</h3>
                            <p className="text-muted-foreground">
                              We'll get back to you within 24 hours with a competitive quote.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  min="1"
                                  value={quoteRequest.quantity}
                                  onChange={(e) =>
                                    setQuoteRequest({ ...quoteRequest, quantity: Number.parseInt(e.target.value) })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="urgency">Urgency</Label>
                                <Select
                                  value={quoteRequest.urgency}
                                  onValueChange={(value) => setQuoteRequest({ ...quoteRequest, urgency: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="standard">Standard (5-7 days)</SelectItem>
                                    <SelectItem value="urgent">Urgent (2-3 days)</SelectItem>
                                    <SelectItem value="emergency">Emergency (24 hours)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="contact">Contact Person</Label>
                              <Input
                                id="contact"
                                value={quoteRequest.contactPerson}
                                onChange={(e) => setQuoteRequest({ ...quoteRequest, contactPerson: e.target.value })}
                                placeholder="John Doe"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                value={quoteRequest.phone}
                                onChange={(e) => setQuoteRequest({ ...quoteRequest, phone: e.target.value })}
                                placeholder="+234 800 000 0000"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="address">Delivery Address</Label>
                              <Textarea
                                id="address"
                                value={quoteRequest.deliveryAddress}
                                onChange={(e) => setQuoteRequest({ ...quoteRequest, deliveryAddress: e.target.value })}
                                placeholder="Complete delivery address"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="notes">Additional Notes</Label>
                              <Textarea
                                id="notes"
                                value={quoteRequest.notes}
                                onChange={(e) => setQuoteRequest({ ...quoteRequest, notes: e.target.value })}
                                placeholder="Any special requirements or notes"
                              />
                            </div>

                            <Button onClick={handleQuoteRequest} className="w-full">
                              Submit Quote Request
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
