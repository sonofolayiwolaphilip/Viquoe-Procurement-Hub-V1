"use client"

import React, { useState, useEffect, useRef, useCallback } from "react";  // Added React import
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
// import debounce from "lodash/debounce"

// Custom debounce implementation
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  createdAt: string
  updatedAt: string
  Product?: {  // This comes from the join
    name: string
    price: number
    image?: string
    supplierId: string
    categoryId: string
  }
}

interface OrderItem {
  product_id: string
  product_name: string
  price: number
  quantity: number
  image?: string
}

interface OrderDetails {
  urgency: "standard" | "urgent" | "emergency"
  deliveryAddress: string
  contactPerson: string
  phone: string
  notes: string
  paymentTerms: "net30" | "net15" | "pod" | "advance"
}

// Validation functions
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/
  return phoneRegex.test(phone.trim())
}

const validateOrderDetails = (details: OrderDetails): string[] => {
  const errors: string[] = []
  
  if (!details.contactPerson?.trim()) {
    errors.push("Contact person is required")
  } else if (details.contactPerson.trim().length < 2) {
    errors.push("Contact person must be at least 2 characters")
  }
  
  if (!details.phone?.trim()) {
    errors.push("Phone number is required")
  } else if (!validatePhone(details.phone)) {
    errors.push("Please enter a valid phone number")
  }
  
  if (!details.deliveryAddress?.trim()) {
    errors.push("Delivery address is required")
  } else if (details.deliveryAddress.trim().length < 10) {
    errors.push("Please provide a complete delivery address")
  }
  
  return errors
}

// Error handling utility
const handleSupabaseError = (error: any, context: string): string => {
  console.error(`Error in ${context}:`, error)
  
  // Map common Supabase error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    '23505': 'This item already exists in your cart.',
    '42501': 'You do not have permission to perform this action.',
    '42P01': 'Database error. Please try again later.',
  }
  
  return errorMessages[error.code] || `Failed to ${context}. Please try again.`
}

// Price calculation helper
const calculateOrderTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.Product?.price || 0) * item.quantity, 0)
  const deliveryFee = subtotal > 100000 ? 0 : 5000
  const total = subtotal + deliveryFee
  
  return { subtotal, deliveryFee, total }
}

// Loading skeleton component
const CartSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex animate-pulse space-x-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Memoized Cart Item Component
// Memoized Cart Item Component
const CartItemComponent = React.memo(({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: { 
  item: CartItem
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}) => (
  <Card key={item.id}>
    <CardContent className="p-6">
      <div className="flex items-center space-x-4">
        <img
          src={item.Product?.image || "/placeholder.svg"}
          alt={item.Product?.name || 'Product image'}
          className="w-20 h-20 object-cover rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg"
          }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{item.Product?.name || 'Unknown Product'}</h3>
          {item.Product?.supplierId && (
            <p className="text-sm text-muted-foreground">Supplier: {item.Product.supplierId}</p>
          )}
          {item.Product?.categoryId && (
            <Badge variant="secondary" className="mt-1">
              {item.Product.categoryId}
            </Badge>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">₦{item.Product?.price?.toLocaleString() || '0'}</div>
          <div className="text-sm text-muted-foreground">per unit</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            aria-label={`Decrease quantity of ${item.Product?.name || 'product'}`}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{item.quantity}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label={`Increase quantity of ${item.Product?.name || 'product'}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-lg font-bold">
            ₦{((item.Product?.price || 0) * item.quantity).toLocaleString()}
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.Product?.name || 'product'} from cart`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
))

CartItemComponent.displayName = 'CartItemComponent'

export default function CartPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    urgency: "standard",
    deliveryAddress: "",
    contactPerson: "",
    phone: "",
    notes: "",
    paymentTerms: "net30",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const hasLoadedCart = useRef(false)

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== "buyer")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, authLoading, router])

  // Load cart from Supabase
    // Load cart from Supabase
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
        .from("CartItem")
        .select(`
          *,
          Product (
            name,
            price,
            image,
            supplierId,
            categoryId
          )
        `)
        .eq("userId", user.id)
        .order('createdAt', { ascending: false })

      if (error) {
        throw error
      }

      setCartItems(data || [])
    } catch (err) {
      const errorMessage = handleSupabaseError(err, "load cart")
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced quantity update
  const debouncedUpdateQuantity = useCallback(
    debounce(async (itemId: string, newQuantity: number) => {
      if (newQuantity < 1) return

      try {
        const { error } = await supabase
          .from("CartItem")
          .update({ 
            quantity: newQuantity,
            updatedAt: new Date().toISOString()
          })
          .eq("id", itemId)

        if (error) throw error

        setCartItems((items) =>
          items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
        )
      } catch (err) {
        const errorMessage = handleSupabaseError(err, "update quantity")
        alert(errorMessage)
        // Revert optimistic update
        await loadCart()
      }
    }, 500),
    []
  )

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    // Optimistic update
    setCartItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    )

    debouncedUpdateQuantity(itemId, newQuantity)
  }

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
         .from("CartItem")  // Correct table name
        .delete()
        .eq("id", itemId)

      if (error) throw error

      setCartItems((items) => items.filter((item) => item.id !== itemId))
    } catch (err) {
      const errorMessage = handleSupabaseError(err, "remove item")
      alert(errorMessage)
    }
  }

  const { subtotal, deliveryFee, total } = calculateOrderTotals(cartItems)

  const validateField = (field: keyof OrderDetails, value: string) => {
    const errors: Record<string, string> = {}
    
    switch (field) {
      case 'contactPerson':
        if (!value.trim()) {
          errors.contactPerson = 'Contact person is required'
        } else if (value.trim().length < 2) {
          errors.contactPerson = 'Contact person must be at least 2 characters'
        }
        break
      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone number is required'
        } else if (!validatePhone(value)) {
          errors.phone = 'Please enter a valid phone number'
        }
        break
      case 'deliveryAddress':
        if (!value.trim()) {
          errors.deliveryAddress = 'Delivery address is required'
        } else if (value.trim().length < 10) {
          errors.deliveryAddress = 'Please provide a complete delivery address'
        }
        break
    }
    
    setFieldErrors(prev => ({ ...prev, ...errors }))
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof OrderDetails, value: string) => {
    setOrderDetails(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

 const handleSubmitOrder = async () => {
  if (!user?.id) return

  // Validate all fields
  const validationErrors = validateOrderDetails(orderDetails)
  if (validationErrors.length > 0) {
    alert(validationErrors.join("\n"))
    return
  }

  setIsSubmitting(true)

  try {
    // Group items by supplier
    const itemsBySupplier = cartItems.reduce((acc, item) => {
      const supplierId = item.Product?.supplierId || "unknown"
      const supplierName = item.Product?.supplierId || "Unknown Supplier"
      
      if (!acc[supplierId]) {
        acc[supplierId] = {
          supplierName: supplierName,
          items: []
        }
      }
      acc[supplierId].items.push(item)
      return acc
    }, {} as Record<string, { supplierName: string; items: CartItem[] }>)

    // Create orders for each supplier
    const orderPromises = Object.entries(itemsBySupplier).map(([supplierId, { supplierName, items }]) => {
      const orderItems: OrderItem[] = items.map(item => ({
        product_id: item.productId,
        product_name: item.Product?.name || 'Unknown Product',
        price: item.Product?.price || 0,
        quantity: item.quantity,
        image: item.Product?.image
      }))

      const orderTotal = items.reduce((sum, item) => sum + (item.Product?.price || 0) * item.quantity, 0)
      const orderDeliveryFee = orderTotal > 100000 ? 0 : 5000
      
      return supabase
        .from("Order")
        .insert({
          id: `order_${user.id}_${Date.now()}_${supplierId}`,
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          supplierId: supplierId,
          supplierName: supplierName,
          items: orderItems,
          totalAmount: orderTotal + orderDeliveryFee,
          shippingCost: orderDeliveryFee,
          status: "PENDING",
          urgency: orderDetails.urgency,
          shippingAddress: orderDetails.deliveryAddress.trim(),
          contactPerson: orderDetails.contactPerson.trim(),
          phone: orderDetails.phone.trim(),
          notes: orderDetails.notes.trim(),
          paymentTerms: orderDetails.paymentTerms,
          expectedDelivery: new Date(Date.now() + (orderDetails.urgency === 'emergency' ? 24 * 60 * 60 * 1000 : orderDetails.urgency === 'urgent' ? 3 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
    })

    const results = await Promise.all(orderPromises)
    
    // Check for any errors in order creation
    const hasOrderError = results.some(result => result.error)
    if (hasOrderError) {
      throw new Error("Failed to create one or more orders")
    }

    // Clear cart from Supabase
    const { error: deleteError } = await supabase
      .from("CartItem")
      .delete()
      .eq("userId", user.id)

    if (deleteError) throw deleteError

    setOrderSuccess(true)
    setCartItems([])
  } catch (error) {
    console.error("Order submission failed:", error)
    const errorMessage = handleSupabaseError(error, "submit order")
    alert(errorMessage)
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
          <div className="space-y-4">
            {[1, 2, 3].map(i => <CartSkeleton key={i} />)}
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
                <CartItemComponent
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
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
                      onValueChange={(value: "standard" | "urgent" | "emergency") => 
                        setOrderDetails({ ...orderDetails, urgency: value })
                      }
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
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      onBlur={() => validateField('contactPerson', orderDetails.contactPerson)}
                      placeholder="John Doe"
                      required
                      aria-required="true"
                      aria-invalid={!!fieldErrors.contactPerson}
                      className={fieldErrors.contactPerson ? "border-destructive" : ""}
                    />
                    {fieldErrors.contactPerson && (
                      <p className="text-sm text-destructive">{fieldErrors.contactPerson}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={orderDetails.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={() => validateField('phone', orderDetails.phone)}
                      placeholder="+234 800 000 0000"
                      required
                      aria-required="true"
                      aria-invalid={!!fieldErrors.phone}
                      className={fieldErrors.phone ? "border-destructive" : ""}
                    />
                    {fieldErrors.phone && (
                      <p className="text-sm text-destructive">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={orderDetails.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      onBlur={() => validateField('deliveryAddress', orderDetails.deliveryAddress)}
                      placeholder="Complete delivery address"
                      required
                      aria-required="true"
                      aria-invalid={!!fieldErrors.deliveryAddress}
                      className={fieldErrors.deliveryAddress ? "border-destructive" : ""}
                    />
                    {fieldErrors.deliveryAddress && (
                      <p className="text-sm text-destructive">{fieldErrors.deliveryAddress}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment Terms</Label>
                    <Select
                      value={orderDetails.paymentTerms}
                      onValueChange={(value: "net30" | "net15" | "pod" | "advance") => 
                        setOrderDetails({ ...orderDetails, paymentTerms: value })
                      }
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
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any special requirements"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitOrder} 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
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