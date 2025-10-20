"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, CheckCircle, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

interface CartItem {
  id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
  supplier?: string
  category?: string
  image?: string
}

export default function CartPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState({
    urgency: "standard",
    deliveryAddress: "",
    contactPerson: "",
    phone: "",
    notes: "",
    paymentTerms: "net30",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  
  // Use ref to track if cart has been loaded
  const hasLoadedCart = useRef(false)

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== "buyer")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, authLoading, router])

  // Load cart from Supabase - only once when user is ready
  useEffect(() => {
    if (isAuthenticated && user?.id && !hasLoadedCart.current) {
      hasLoadedCart.current = true
      loadCart()
    }
  }, [isAuthenticated, user?.id])

  const loadCart = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("buyer_id", user.id)

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Loaded cart items:", data)
      setCartItems(data || [])
    } catch (err) {
      console.error("Error loading cart:", err)
      alert("Failed to load cart")
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId)

      if (error) throw error

      setCartItems((items) =>
        items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
      )
    } catch (err) {
      console.error("Error updating quantity:", err)
      alert("Failed to update quantity")
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId)

      if (error) throw error

      setCartItems((items) => items.filter((item) => item.id !== itemId))
    } catch (err) {
      console.error("Error removing item:", err)
      alert("Failed to remove item")
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal > 100000 ? 0 : 5000
  const total = subtotal + deliveryFee

  const handleSubmitOrder = async () => {
    if (!user?.id) return

    // Validation
    if (!orderDetails.contactPerson || !orderDetails.phone || !orderDetails.deliveryAddress) {
      alert("Please fill in all required fields (Contact Person, Phone, Delivery Address)")
      return
    }

    setIsSubmitting(true)

    try {
      // Group items by supplier
      const itemsBySupplier = cartItems.reduce((acc, item) => {
        const supplier = item.supplier || "Unknown Supplier"
        if (!acc[supplier]) {
          acc[supplier] = []
        }
        acc[supplier].push(item)
        return acc
      }, {} as Record<string, CartItem[]>)

      // Create orders for each supplier
      for (const [supplier, items] of Object.entries(itemsBySupplier)) {
        const orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        
        const { error } = await supabase
          .from("orders")
          .insert({
            buyer_id: user.id,
            supplier: supplier,
            items: items.map(i => `${i.product_name} (x${i.quantity})`),
            total: orderTotal + (orderTotal > 100000 ? 0 : 5000),
            status: "pending",
            date: new Date().toISOString(),
            urgency: orderDetails.urgency,
            delivery_address: orderDetails.deliveryAddress,
            contact_person: orderDetails.contactPerson,
            phone: orderDetails.phone,
            notes: orderDetails.notes,
            payment_terms: orderDetails.paymentTerms
          })

        if (error) throw error
      }

      // Clear cart from Supabase
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("buyer_id", user.id)

      if (deleteError) throw deleteError

      setOrderSuccess(true)
      setCartItems([])
    } catch (error) {
      console.error("Order submission failed:", error)
      alert("Failed to submit order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || (isLoading && !hasLoadedCart.current)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated || user?.userType !== "buyer") {
    return null
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been sent to our suppliers. You'll receive quotes within 24-48 hours.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/buyer-dashboard">View Order Status</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/buyer-portal">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/buyer-portal"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Products</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold">Viquoe</span>
            </div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">Review your items and submit for quotes</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : cartItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">Add some products to get started with your procurement</p>
              <Button asChild>
                <Link href="/buyer-portal">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.product_name}</h3>
                        {item.supplier && (
                          <p className="text-sm text-muted-foreground">by {item.supplier}</p>
                        )}
                        {item.category && (
                          <Badge variant="secondary" className="mt-1">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">₦{item.price.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">per unit</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-bold">₦{(item.price * item.quantity).toLocaleString()}</div>
                        <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary & Details */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? "Free" : `₦${deliveryFee.toLocaleString()}`}</span>
                  </div>
                  {deliveryFee === 0 && (
                    <Alert>
                      <AlertDescription className="text-sm">Free delivery on orders over ₦100,000</AlertDescription>
                    </Alert>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Details Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                  <CardDescription>Provide details for your quote request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select
                      value={orderDetails.urgency}
                      onValueChange={(value) => setOrderDetails({ ...orderDetails, urgency: value })}
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

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Person *</Label>
                    <Input
                      id="contact"
                      value={orderDetails.contactPerson}
                      onChange={(e) => setOrderDetails({ ...orderDetails, contactPerson: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={orderDetails.phone}
                      onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={orderDetails.deliveryAddress}
                      onChange={(e) => setOrderDetails({ ...orderDetails, deliveryAddress: e.target.value })}
                      placeholder="Complete delivery address"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment Terms</Label>
                    <Select
                      value={orderDetails.paymentTerms}
                      onValueChange={(value) => setOrderDetails({ ...orderDetails, paymentTerms: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net30">Net 30 Days</SelectItem>
                        <SelectItem value="net15">Net 15 Days</SelectItem>
                        <SelectItem value="pod">Payment on Delivery</SelectItem>
                        <SelectItem value="advance">50% Advance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={orderDetails.notes}
                      onChange={(e) => setOrderDetails({ ...orderDetails, notes: e.target.value })}
                      placeholder="Any special requirements"
                    />
                  </div>

                  <Button onClick={handleSubmitOrder} className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting Order...
                      </>
                    ) : (
                      "Submit for Quotes"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}