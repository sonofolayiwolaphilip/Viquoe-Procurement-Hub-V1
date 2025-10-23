"use client"

import { useState, useEffect, useRef, useMemo } from "react"
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
} from "@/components/ui/dialog"
import { Search, Filter, ShoppingCart, Star, Package, Truck, Shield, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number              // ← Added: actual stock quantity
  image: string
  sku: string               // ← Added: from database
  categoryId: string        // ← Added: from database
  supplierId: string
  minOrder: number          // ← Added: from database
  isActive: boolean         // ← Added: from database
  createdAt: string
  updatedAt: string         // ← Added: from database
  
  // Computed fields (we'll calculate these from database data)
  category?: string          // ← Will be derived from categoryId
  supplier?: string          // ← Will be fetched via JOIN
  inStock?: boolean          // ← Will be derived from stock > 0
  rating?: number            // ← Optional for now
  reviews?: number           // ← Optional for now
  deliveryTime?: string      // ← Optional for now
}

interface QuoteRequest {
  quantity: number
  urgency: string
  notes: string
  deliveryAddress: string
  contactPerson: string
  phone: string
}

// Product Card Component
const ProductCard = ({ 
  product, 
  onAddToCart, 
  onRequestQuote,
  isAddingToCart,
  isAuthenticated
}: { 
  product: Product
  onAddToCart: (productId: string) => void
  onRequestQuote: (product: Product) => void
  isAddingToCart: string | null
  isAuthenticated: boolean
}) => {
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert("Please log in to add items to cart")
      return
    }
    onAddToCart(product.id)
  }

  const handleRequestQuote = () => {
    if (!isAuthenticated) {
      alert("Please log in to request quotes")
      return
    }
    onRequestQuote(product)
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-0">
        <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
          ) : (
            <Package className="h-16 w-16 text-gray-400" />
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-gray-500">({product.reviews})</span>
            </div>
          </div>

          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3">by {product.supplier}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-blue-600">₦{product.price.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{product.deliveryTime}</div>
          </div>

          <div className="flex items-center justify-between mb-4">
            {product.inStock ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                Out of Stock
              </Badge>
            )}
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleAddToCart}
              disabled={isAddingToCart === product.id || !product.inStock || (product.stock < 1)}
            >
              {isAddingToCart === product.id ? "Adding..." : "Add to Cart"}
            </Button>

            <Button 
              className="flex-1" 
              onClick={handleRequestQuote}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Quote
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function BuyerPortal() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false)
  const [quoteSuccess, setQuoteSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null)
  
  // State for dynamic data
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(["all"])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true)
        setError(null)
        
        // Fetch products from Supabase using your Product table
       const { data, error: fetchError } = await supabase
       .from('Product')
       .select('*')
        .eq('isActive', true)
        .order('createdAt', { ascending: false }) 
        if (data) {
  // Fetch supplier names separately
  const supplierIds = [...new Set(data.map(p => p.supplierId))]
  const { data: suppliers } = await supabase
    .from('users')
    .select('id, name, company')
    .in('id', supplierIds)
  
  const supplierMap = new Map(suppliers?.map(s => [s.id, s]) || [])
  
  const transformedProducts = data.map(product => ({
    ...product,
    supplier: supplierMap.get(product.supplierId)?.name || 
              supplierMap.get(product.supplierId)?.company || 
              'Unknown Supplier'
  }))
        }
        if (fetchError) {
          console.error("Error fetching products:", fetchError)
          throw fetchError
        }

        if (data) {
            // Transform the data to match our interface
      
            const transformedProducts = data.map((product: any) => ({
              ...product,
              // Derive supplier name from the joined users table
              supplier: product.supplier?.name || product.supplier?.company || 'Unknown Supplier',
              // Derive inStock from stock quantity
              inStock: (product.stock || 0) > 0,
              // Set default values for optional fields
              category: product.categoryId || 'Uncategorized',
              rating: product.rating || 4.5,
              reviews: product.reviews || 0,
              deliveryTime: product.deliveryTime || '3-5 days'
            }))
            
            setProducts(transformedProducts)
            
            // Extract unique categories
            const uniqueCategories = ['all', ...new Set(transformedProducts.map(p => p.category).filter(Boolean))]
            setCategories(uniqueCategories)
          }
      } catch (err: any) {
        console.error("Failed to load products:", err)
        setError("Failed to load products. Please try again later.")
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [])

  // Load cart count
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadCartCount()
    }
  }, [isAuthenticated, user?.id])

  const loadCartCount = async () => {
    if (!user?.id) return

    try {
      console.log("Loading cart for user:", user.id)

      // Query using your CartItem table schema
      const { data, error } = await supabase
        .from("CartItem")
        .select("quantity")
        .eq("userId", user.id)

      if (error) {
        console.error("Error loading cart:", error)
        throw error
      }

      console.log("Cart data:", data)

      if (data) {
        const totalCount = data.reduce((sum, item) => sum + (item.quantity || 0), 0)
        console.log("Total cart count:", totalCount)
        setCartItemCount(totalCount)
      }
    } catch (err) {
      console.error("Error loading cart count:", err)
      setCartItemCount(0)
    }
  }

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.supplier.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, debouncedSearchQuery, selectedCategory])

  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest>({
    quantity: 1,
    urgency: "standard",
    notes: "",
    deliveryAddress: "",
    contactPerson: "",
    phone: "",
  })

  const validateQuoteRequest = (): string[] => {
    const errors: string[] = []
    if (!quoteRequest.contactPerson.trim()) errors.push('Contact person is required')
    if (!quoteRequest.phone.trim()) errors.push('Phone number is required')
    if (!quoteRequest.deliveryAddress.trim()) errors.push('Delivery address is required')
    if (quoteRequest.quantity < 1) errors.push('Quantity must be at least 1')
    return errors
  }

  const addToCart = async (productId: string, quantity = 1) => {
    if (!isAuthenticated || !user?.id) {
      alert("Please log in to add items to cart")
      return
    }

    if (isAddingToCart === productId) return

    setIsAddingToCart(productId)
    try {
      const product = products.find(p => p.id === productId)
      if (!product) {
        throw new Error("Product not found")
      }

      console.log("Adding to cart:", { 
        productId, 
        userId: user.id, 
        productName: product.name 
      })

      // Check if item already exists using your CartItem schema
     const { data: existing, error: fetchError } = await supabase
     .from("CartItem")
     .select("*")
     .eq("userId", user.id)
     .eq("productId", productId)
     .single() // Use single() instead of maybeSingle()
    // Handle "no rows" error gracefully

    if (fetchError) {
  
      if (fetchError.code === 'PGRST116') {
        // No existing item found - this is normal, proceed with insert
          console.log("No existing cart item found, will create new one")
          } else {
              console.error("Error checking existing cart item:", fetchError)
                throw fetchError
              }
            }

      console.log("Existing cart item:", existing)

      if (existing) {
        // Update quantity using your schema
        const { error: updateError } = await supabase
          .from("CartItem")
          .update({ 
            quantity: existing.quantity + quantity,
            updatedAt: new Date().toISOString()
          })
          .eq("id", existing.id)

        if (updateError) {
          console.error("Error updating cart:", updateError)
          throw updateError
        }
        console.log("Updated cart item quantity")
      } else {
        // Generate a unique ID for the cart item
        const cartItemId = `cart_${user.id}_${productId}_${Date.now()}`
        
        // Insert new item using your schema
        const { error: insertError } = await supabase
          .from("CartItem")
          .insert({
            id: cartItemId,
            userId: user.id,
            productId: productId,
            quantity: quantity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })

        if (insertError) {
          console.error("Error inserting cart item:", insertError)
          throw insertError
        }
        console.log("Created new cart item")
      }

      // Reload cart count
      await loadCartCount()
      alert("✓ Added to cart successfully!")
      
    } catch (err: any) {
      console.error("Error adding to cart:", err)
      
      // More specific error messages
      if (err.message.includes("violates row-level security")) {
        alert("Permission denied. Please check your account settings or contact support.")
      } else if (err.message.includes("duplicate key")) {
        alert("This item is already in your cart.")
      } else if (err.code === '23503') {
        alert("Product or user not found. Please refresh the page and try again.")
      } else {
        alert(`Failed to add to cart: ${err.message}`)
      }
    } finally {
      setIsAddingToCart(null)
    }
  }

  const handleQuoteRequest = async () => {
    if (!selectedProduct || !isAuthenticated || !user?.id) return

    const validationErrors = validateQuoteRequest()
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'))
      return
    }

    setIsSubmitting(true)
    try {
      // Assuming you have a QuoteRequest table with similar naming convention
      const quoteId = `quote_${user.id}_${selectedProduct.id}_${Date.now()}`
      
      const { error } = await supabase
        .from("QuoteRequest")
        .insert({
          id: quoteId,
          buyerId: user.id,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          supplier: selectedProduct.supplier,
          supplierId: selectedProduct.supplierId,
          quantity: quoteRequest.quantity,
          urgency: quoteRequest.urgency,
          notes: quoteRequest.notes,
          deliveryAddress: quoteRequest.deliveryAddress,
          contactPerson: quoteRequest.contactPerson,
          phone: quoteRequest.phone,
          status: "pending",
          unitPrice: selectedProduct.price,
          totalPrice: selectedProduct.price * quoteRequest.quantity,
          createdAt: new Date().toISOString()
        })

      if (error) throw error

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
    } catch (err: any) {
      console.error("Quote request failed:", err)
      alert("Failed to submit quote request: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestQuote = (product: Product) => {
    setSelectedProduct(product)
    setIsQuoteDialogOpen(true)
  }

  if (isLoading || isLoadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold">Viquoe</span>
              </Link>
              <Badge variant="secondary">Buyer Portal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push("/cart")}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cartItemCount})
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/buyer-dashboard">Dashboard</Link>
              </Button>
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Procurement Made Simple</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse thousands of verified products from trusted suppliers. Get competitive prices with guaranteed quality and compliance.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold">Verified Suppliers</h3>
              <p className="text-sm text-gray-600">All suppliers are pre-vetted and compliant</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <Truck className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Quick and reliable delivery nationwide</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold">Quality Assured</h3>
              <p className="text-sm text-gray-600">100% authentic products with warranty</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onRequestQuote={handleRequestQuote}
                isAddingToCart={isAddingToCart}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-gray-600">
              {products.length === 0 
                ? "No products available yet. Suppliers can add products from their dashboard."
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        )}

        {/* Quote Request Dialog */}
        <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Quote</DialogTitle>
              <DialogDescription>Get a custom quote for {selectedProduct?.name}</DialogDescription>
            </DialogHeader>

            {quoteSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quote Request Sent!</h3>
                <p className="text-gray-600">
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
                        setQuoteRequest({ ...quoteRequest, quantity: Number.parseInt(e.target.value) || 1 })
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
                  <Label htmlFor="contact">Contact Person *</Label>
                  <Input
                    id="contact"
                    value={quoteRequest.contactPerson}
                    onChange={(e) => setQuoteRequest({ ...quoteRequest, contactPerson: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={quoteRequest.phone}
                    onChange={(e) => setQuoteRequest({ ...quoteRequest, phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    value={quoteRequest.deliveryAddress}
                    onChange={(e) => setQuoteRequest({ ...quoteRequest, deliveryAddress: e.target.value })}
                    placeholder="Complete delivery address"
                    required
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

                <Button onClick={handleQuoteRequest} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}