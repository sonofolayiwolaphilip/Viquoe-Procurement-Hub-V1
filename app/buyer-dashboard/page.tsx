"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Package, Clock, CheckCircle, Search, Plus, LogOut, Home, Trash2, FileText, RefreshCw, Eye, Filter, Star, ShoppingBag, Users, ChevronRight, MapPin, Phone, AlertTriangle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates"
import { logger } from "@/lib/logger"

interface Order {
  id: string
  orderNumber: string
  userId: string
  status: "PENDING" | "APPROVED" | "DELIVERED" | "CANCELLED" | "pending" | "approved" | "delivered" | "cancelled"
  totalAmount: number
  shippingCost?: number
  taxAmount?: number
  notes?: string
  shippingAddress?: string
  expectedDelivery?: string
  createdAt: string
  updatedAt: string
  supplierName?: string
  productName?: string
  productImage?: string
  quantity?: number
  supplierId?: string
}

interface QuoteRequest {
  id: string
  product_name: string
  supplier: string
  quantity: number
  urgency: string
  status: string
  unit_price: number
  total_price: number
  createdAt: string
  contact_person: string
  phone: string
  delivery_address: string
  notes: string
  userId?: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  sku: string
  image: string | null
  stock: number
  minOrder: number
  isActive: boolean
  categoryId: string
  supplierId: string
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    description?: string | null
  }
  supplier?: {
    id: string
    email: string
    user_metadata?: {
      company_name?: string
      phone?: string
      location?: string
    }
  }
}

interface Category {
  id: string
  name: string
  description: string | null
  isActive: boolean
  image: string | null
  createdAt: string
  updatedAt: string
}

interface ConfirmationState {
  isOpen: boolean
  type: 'order' | 'quote' | null
  id: string | null
  title: string
  description: string
  isLoading: boolean
}

export default function BuyerDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState({ 
    orders: true, 
    quotes: true, 
    products: true,
    categories: true 
  })
  const [error, setError] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest")
  const [isOnline, setIsOnline] = useState(true)
  
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    type: null,
    id: null,
    title: '',
    description: '',
    isLoading: false
  })

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setConnectionError(null)
      logger.info('BuyerDashboard', 'Browser back online')
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setConnectionError('You are offline. Please check your internet connection.')
      logger.warn('BuyerDashboard', 'Browser offline')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initial check
    setIsOnline(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRealTimeUpdate = useCallback((payload: any, type: 'order' | 'quote') => {
    logger.info('BuyerDashboard', `Processing ${type} update`, { 
      event: payload.eventType, 
      itemId: payload.new?.id 
    })

    if (payload.eventType === 'INSERT') {
      if (type === 'order') {
        setOrders((prev: Order[]) => [payload.new, ...prev])
      } else {
        setQuotes((prev: QuoteRequest[]) => [payload.new, ...prev])
      }
    } else if (payload.eventType === 'UPDATE') {
      if (type === 'order') {
        setOrders((prev: Order[]) => prev.map(item => 
          item.id === payload.new.id ? payload.new : item
        ))
      } else {
        setQuotes((prev: QuoteRequest[]) => prev.map(item => 
          item.id === payload.new.id ? payload.new : item
        ))
      }
    } else if (payload.eventType === 'DELETE') {
      if (type === 'order') {
        setOrders((prev: Order[]) => prev.filter(item => 
          item.id !== payload.old.id
        ))
      } else {
        setQuotes((prev: QuoteRequest[]) => prev.filter(item => 
          item.id !== payload.old.id
        ))
      }
    }
  }, [])

  const handleOrderUpdate = useCallback((payload: any) => 
    handleRealTimeUpdate(payload, 'order'), [handleRealTimeUpdate])
  
  const handleQuoteUpdate = useCallback((payload: any) => 
    handleRealTimeUpdate(payload, 'quote'), [handleRealTimeUpdate])

  // Set up real-time subscriptions
  useRealTimeUpdates({
    userId: user?.id || '',
    onOrderUpdate: handleOrderUpdate,
    onQuoteUpdate: handleQuoteUpdate
  })

  // Helper function with timeout
  const queryWithTimeout = async (queryPromise, timeout = 15000) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 15s')), timeout)
    })
    
    return Promise.race([queryPromise, timeoutPromise])
  }

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(prev => ({ ...prev, orders: true }))
      setError(null)
      logger.debug('BuyerDashboard', 'Fetching orders', { userId: user.id })

      const { data, error: fetchError } = await queryWithTimeout(
        supabase
          .from("Order")
          .select("*")
          .eq("userId", user.id)
          .order("createdAt", { ascending: false })
          .limit(50)
      )

      if (fetchError) throw fetchError

      const ordersWithFallbackNames = (data || []).map(order => ({
        ...order,
        supplierName: order.supplierName || 'Supplier'
      }))

      setOrders(ordersWithFallbackNames)
      logger.info('BuyerDashboard', 'Orders fetched successfully', { count: data?.length })
    } catch (err: any) {
      logger.error('BuyerDashboard', 'Error fetching orders', err)
      
      if (err.message.includes('timeout')) {
        setConnectionError('Orders load timeout. Please try again.')
      } else {
        setError(err.message || "Failed to load orders")
      }
    } finally {
      setLoading(prev => ({ ...prev, orders: false }))
    }
  }, [user?.id])

  // Fetch quotes with correct column name (createdAt)
  const fetchQuotes = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(prev => ({ ...prev, quotes: true }))
      logger.debug('BuyerDashboard', 'Fetching quotes', { userId: user.id })

      // CORRECT: Use createdAt (camelCase) from your schema
      const { data, error: fetchError } = await queryWithTimeout(
        supabase
          .from("QuoteRequest")
          .select("*")
          .eq("userId", user.id)
          .order("createdAt", { ascending: false })
          .limit(50)
      )

      if (fetchError) throw fetchError

      setQuotes(data || [])
      logger.info('BuyerDashboard', 'Quotes fetched successfully', { 
        count: data?.length 
      })
    } catch (err: any) {
      logger.error('BuyerDashboard', 'Error fetching quotes', err)
      
      if (err.message.includes('timeout')) {
        setConnectionError('Quotes load timeout. Please try again.')
      }
    } finally {
      setLoading(prev => ({ ...prev, quotes: false }))
    }
  }, [user?.id])

  // OPTION 2: Fetch all active products with category and supplier details
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, products: true }))
      logger.debug('BuyerDashboard', 'Fetching products')

      // 1. Fetch products first (with limit to prevent timeout)
      const { data: productsData, error: productsError } = await queryWithTimeout(
        supabase
          .from("Product")
          .select("*")
          .eq("isActive", true)
          .order("createdAt", { ascending: false })
          .limit(50)
      )

      if (productsError) throw productsError

      if (!productsData || productsData.length === 0) {
        setProducts([])
        return
      }

      // 2. Fetch categories separately
      const categoryIds = [...new Set(productsData.map(p => p.categoryId).filter(Boolean))]
      let categoriesData = []
      
      if (categoryIds.length > 0) {
        const { data: cats, error: catsError } = await supabase
          .from("Category")
          .select("id, name, description")
          .in("id", categoryIds)
          .eq("isActive", true)
        
        if (!catsError) {
          categoriesData = cats || []
        }
      }

      // 3. Fetch suppliers (users) separately
      const supplierIds = [...new Set(productsData.map(p => p.supplierId).filter(Boolean))]
      let suppliersData = []
      
      if (supplierIds.length > 0) {
        try {
          // Try to fetch from auth.users using RPC or multiple queries
          const fetchPromises = supplierIds.map(async (id) => {
            try {
              const { data: userData, error: userError } = await supabase
                .from('auth.users')
                .select('id, email, raw_user_meta_data')
                .eq('id', id)
                .single()
              
              if (!userError && userData) {
                return userData
              }
              return null
            } catch (err) {
              console.warn(`Could not fetch supplier ${id}:`, err)
              return null
            }
          })
          
          const results = await Promise.all(fetchPromises)
          suppliersData = results.filter(Boolean)
        } catch (supplierErr) {
          console.warn('Could not fetch supplier details:', supplierErr)
        }
      }

      // 4. Create lookup maps
      const categoryMap = new Map()
      categoriesData.forEach(cat => categoryMap.set(cat.id, cat))

      const supplierMap = new Map()
      suppliersData.forEach(sup => supplierMap.set(sup.id, sup))

      // 5. Combine data
      const productsWithDetails = productsData.map(product => ({
        ...product,
        category: categoryMap.get(product.categoryId) || { 
          id: product.categoryId, 
          name: 'Uncategorized',
          description: null
        },
        supplier: supplierMap.get(product.supplierId) || { 
          id: product.supplierId, 
          email: 'supplier@example.com',
          user_metadata: {
            company_name: 'Supplier',
            phone: 'Contact for details',
            location: 'Nigeria'
          }
        }
      }))

      setProducts(productsWithDetails)
      logger.info('BuyerDashboard', 'Products fetched successfully', { 
        count: productsWithDetails.length 
      })
      
    } catch (err: any) {
      logger.error('BuyerDashboard', 'Error fetching products', err)
      
      if (err.message.includes('timeout')) {
        setConnectionError('Products load timeout. Please try again.')
      } else {
        setError("Failed to load products")
      }
      
      // Fallback to simple product data if detailed fetch fails
      try {
        const { data: simpleData } = await supabase
          .from("Product")
          .select("id, name, price, image, stock, minOrder, description, categoryId, supplierId")
          .eq("isActive", true)
          .limit(20)
        
        if (simpleData) {
          const fallbackProducts = simpleData.map(p => ({
            ...p,
            category: { id: p.categoryId, name: 'Uncategorized' },
            supplier: {
              id: p.supplierId,
              email: 'supplier@example.com',
              user_metadata: { company_name: 'Supplier' }
            }
          }))
          setProducts(fallbackProducts)
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr)
      }
      
    } finally {
      setLoading(prev => ({ ...prev, products: false }))
    }
  }, [])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }))

      const { data, error } = await queryWithTimeout(
        supabase
          .from("Category")
          .select("*")
          .eq("isActive", true)
          .order("name", { ascending: true })
          .limit(20)
      )

      if (error) {
        console.warn('Categories fetch warning:', error.message)
        // Continue without categories
        return
      }

      setCategories(data || [])
    } catch (err: any) {
      console.warn('Categories fetch failed:', err.message)
      // This is not critical, continue without categories
    } finally {
      setLoading(prev => ({ ...prev, categories: false }))
    }
  }, [])

  const refreshAllData = useCallback(async () => {
    setRefreshing(true)
    logger.info('BuyerDashboard', 'Manual refresh triggered')
    
    try {
      await Promise.all([
        fetchOrders(), 
        fetchQuotes(), 
        fetchProducts(), 
        fetchCategories()
      ])
      logger.info('BuyerDashboard', 'Manual refresh completed')
      setError(null)
      setConnectionError(null)
    } catch (err) {
      logger.error('BuyerDashboard', 'Error during manual refresh', err)
    } finally {
      setRefreshing(false)
    }
  }, [fetchOrders, fetchQuotes, fetchProducts, fetchCategories])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchOrders()
      fetchQuotes()
      fetchProducts()
      fetchCategories()
    }
  }, [isAuthenticated, user, fetchOrders, fetchQuotes, fetchProducts, fetchCategories])

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== "buyer")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, authLoading, router])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.name.toLowerCase().includes(query) ||
        product.supplier?.user_metadata?.company_name?.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [products, searchQuery, selectedCategory, sortBy])

  // Handle product order
  const handleOrderProduct = async (product: Product) => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      
      // Create order
      const { data, error } = await supabase
        .from("Order")
        .insert([{
          orderNumber,
          userId: user.id,
          status: "PENDING",
          totalAmount: product.price,
          productName: product.name,
          productImage: product.image,
          quantity: product.minOrder,
          supplierId: product.supplierId,
          supplierName: product.supplier?.user_metadata?.company_name || product.supplier?.email || "Supplier",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      if (data?.[0]) {
        setOrders(prev => [data[0], ...prev])
        alert(`Order placed successfully! Order #${orderNumber}`)
      }
    } catch (err: any) {
      console.error('Error placing order:', err)
      alert(`Failed to place order: ${err.message}`)
    }
  }

  // Handle quote request
  const handleRequestQuote = async (product: Product) => {
    if (!user) {
      router.push("/login")
      return
    }

    const quantity = prompt(`Enter quantity for ${product.name} (min: ${product.minOrder}):`, product.minOrder.toString())
    
    if (!quantity || parseInt(quantity) < product.minOrder) {
      alert(`Minimum order quantity is ${product.minOrder}`)
      return
    }

    const notes = prompt("Add any special requirements or notes:")

    try {
      const { data, error } = await supabase
        .from("QuoteRequest")
        .insert([{
          product_name: product.name,
          supplier: product.supplier?.user_metadata?.company_name || product.supplier?.email || "Supplier",
          quantity: parseInt(quantity),
          urgency: "normal",
          status: "pending",
          unit_price: product.price,
          total_price: product.price * parseInt(quantity),
          contact_person: user.email || "",
          phone: "",
          delivery_address: "",
          notes: notes || "",
          userId: user.id,
          createdAt: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      if (data?.[0]) {
        setQuotes(prev => [data[0], ...prev])
        alert("Quote request sent successfully!")
      }
    } catch (err: any) {
      console.error('Error requesting quote:', err)
      alert(`Failed to request quote: ${err.message}`)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      logger.info('BuyerDashboard', 'User logout initiated')
      const { error } = await supabase.auth.signOut()
      if (error) {
        logger.error('BuyerDashboard', 'Logout error', error)
        setError("Failed to log out. Please try again.")
      } else {
        logger.info('BuyerDashboard', 'User logged out successfully')
        router.push("/")
      }
    } catch (err) {
      logger.error('BuyerDashboard', 'Unexpected logout error', err)
      setError("An error occurred during logout.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const showDeleteConfirmation = (type: 'order' | 'quote', id: string, itemName: string) => {
    setConfirmation({
      isOpen: true,
      type,
      id,
      title: `Delete ${type === 'order' ? 'Order' : 'Quote Request'}`,
      description: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      isLoading: false
    })
  }

  const handleConfirmDelete = async () => {
    if (!confirmation.id || !confirmation.type) return

    setConfirmation(prev => ({ ...prev, isLoading: true }))
    const { id, type } = confirmation

    try {
      logger.info('BuyerDashboard', `Deleting ${type}`, { id })

      const tableName = type === 'order' ? 'Order' : 'QuoteRequest'
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id)
        .eq("userId", user?.id)

      if (error) throw error

      if (type === 'order') {
        setOrders(orders.filter(order => order.id !== id))
      } else {
        setQuotes(quotes.filter(quote => quote.id !== id))
      }

      logger.info('BuyerDashboard', `${type} deleted successfully`, { id })
    } catch (err: any) {
      logger.error('BuyerDashboard', `Error deleting ${type}`, err)
      setError(`Failed to delete ${type}: ${err.message}`)
    } finally {
      setConfirmation({
        isOpen: false,
        type: null,
        id: null,
        title: '',
        description: '',
        isLoading: false
      })
    }
  }

  const closeConfirmation = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }))
  }

  // Memoized calculations for performance
  const dashboardStats = useMemo(() => ({
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => 
      o.status === "PENDING" || o.status === "pending").length,
    deliveredOrders: orders.filter((o) => 
      o.status === "DELIVERED" || o.status === "delivered").length,
    totalSpent: orders.filter((o) => 
      o.status === "DELIVERED" || o.status === "delivered")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    pendingQuotes: quotes.filter((q) => q.status === "pending").length,
    totalProducts: products.length,
    activeSuppliers: new Set(products.map(p => p.supplierId)).size
  }), [orders, quotes, products])

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      "pending": "bg-yellow-100 text-yellow-800",
      "approved": "bg-blue-100 text-blue-800", 
      "delivered": "bg-green-100 text-green-800",
      "cancelled": "bg-red-100 text-red-800",
      "rejected": "bg-red-100 text-red-800"
    }
    return statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      "pending": "Processing",
      "approved": "Confirmed",
      "delivered": "Delivered",
      "cancelled": "Cancelled",
      "rejected": "Rejected"
    }
    return statusMap[status.toLowerCase()] || status
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Out of Stock", color: "bg-red-100 text-red-800" }
    if (stock < 10) return { text: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
    return { text: "In Stock", color: "bg-green-100 text-green-800" }
  }

  const RefreshButton = ({ 
    onClick, 
    loading, 
    className = "" 
  }: { 
    onClick: () => void; 
    loading: boolean; 
    className?: string 
  }) => (
    <Button 
      variant="outline" 
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 ${className}`}
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Refreshing...' : 'Refresh'}
    </Button>
  )

  const EmptyState = ({ 
    icon: Icon, 
    title, 
    description, 
    buttonText = "Browse Products",
    buttonHref = "/buyer-portal"
  }: {
    icon: any;
    title: string;
    description: string;
    buttonText?: string;
    buttonHref?: string;
  }) => (
    <div className="p-8 text-center">
      <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Button asChild>
        <Link href={buttonHref}>{buttonText}</Link>
      </Button>
    </div>
  )

  const LoadingState = ({ message }: { message: string }) => (
    <div className="p-8 text-center text-muted-foreground">
      <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2" />
      {message}
    </div>
  )

  const TableRowActions = ({ 
    type, 
    id, 
    itemName 
  }: { 
    type: 'order' | 'quote'; 
    id: string; 
    itemName: string; 
  }) => (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        aria-label={`View ${type} ${itemName}`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => showDeleteConfirmation(type, id, itemName)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        aria-label={`Delete ${type} ${itemName}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated || user?.userType !== "buyer") {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Buyer Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RefreshButton 
                onClick={refreshAllData}
                loading={refreshing}
              />
              <Button asChild>
                <Link href="/buyer-portal">
                  <Search className="h-4 w-4 mr-2" />
                  Browse More
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status Banners */}
        {!isOnline && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Offline Mode</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You are currently offline. Some data may be outdated.
                </p>
              </div>
            </div>
          </div>
        )}

        {connectionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Connection Issue</h3>
                <p className="text-sm text-red-700 mt-1">{connectionError}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshAllData}
                className="ml-4 text-red-700 border-red-300 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {error && !connectionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Updated Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">Available from suppliers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.activeSuppliers}</div>
              <p className="text-xs text-muted-foreground mt-1">Verified vendors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{dashboardStats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats.deliveredOrders} delivered
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Browse Products</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="quotes">
              Quote Requests
              {dashboardStats.pendingQuotes > 0 && (
                <Badge className="ml-2 bg-yellow-500">{dashboardStats.pendingQuotes}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suppliers">My Suppliers</TabsTrigger>
          </TabsList>

          {/* Products Tab Content */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold">Browse Products</h2>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm bg-white"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border rounded-md text-sm bg-white"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <RefreshButton 
                    onClick={fetchProducts}
                    loading={loading.products}
                  />
                </div>
              </div>
            </div>

            {loading.products ? (
              <Card>
                <CardContent className="p-8">
                  <LoadingState message="Loading products..." />
                </CardContent>
              </Card>
            ) : filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <EmptyState
                    icon={Package}
                    title="No products found"
                    description="Try adjusting your search or filters"
                    buttonText="Clear Filters"
                    buttonHref="#"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 left-2">
                          {product.category?.name || "Uncategorized"}
                        </Badge>
                        <Badge className={`absolute top-2 right-2 ${stockStatus.color}`}>
                          {stockStatus.text}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product.description || "No description available"}
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-2xl font-bold text-primary">
                                  ₦{product.price.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Min order: {product.minOrder} units
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                Stock: {product.stock} units
                              </div>
                            </div>

                            {/* Supplier Info - NOW POPULATED WITH REAL DATA */}
                            <div className="pt-3 border-t">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-sm">
                                  {product.supplier?.user_metadata?.company_name || product.supplier?.email || "Supplier"}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {product.supplier?.user_metadata?.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {product.supplier.user_metadata.location}
                                  </div>
                                )}
                                {product.supplier?.user_metadata?.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {product.supplier.user_metadata.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              className="flex-1"
                              onClick={() => handleOrderProduct(product)}
                              disabled={product.stock === 0}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Order Now
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleRequestQuote(product)}
                              disabled={product.stock === 0}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="text-center text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Orders</h2>
              <div className="flex gap-2">
                <RefreshButton 
                  onClick={fetchOrders}
                  loading={loading.orders}
                />
                <Button asChild>
                  <Link href="/buyer-portal">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Link>
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading.orders ? (
                  <LoadingState message="Loading your orders..." />
                ) : orders.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No orders yet"
                    description="Start browsing products to place your first order"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-medium">Order #</th>
                          <th className="text-left p-4 font-medium">Product</th>
                          <th className="text-left p-4 font-medium">Supplier</th>
                          <th className="text-left p-4 font-medium">Quantity</th>
                          <th className="text-left p-4 font-medium">Total</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Order Date</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-muted/25">
                            <td className="p-4 font-medium">#{order.orderNumber}</td>
                            <td className="p-4">
                              <div className="max-w-xs">
                                <div className="font-medium">
                                  {order.productName || 'Product'}
                                </div>
                                {order.notes && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {order.notes}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              {order.supplierName || 'Supplier'}
                            </td>
                            <td className="p-4">
                              {order.quantity || 1}
                            </td>
                            <td className="p-4 font-medium">
                              ₦{order.totalAmount?.toLocaleString() || '0'}
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <TableRowActions
                                type="order"
                                id={order.id}
                                itemName={`order ${order.orderNumber}`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Quote Requests</h2>
              <div className="flex gap-2">
                <RefreshButton 
                  onClick={fetchQuotes}
                  loading={loading.quotes}
                />
                <Button asChild>
                  <Link href="/buyer-portal">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Quote
                  </Link>
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading.quotes ? (
                  <LoadingState message="Loading your quote requests..." />
                ) : quotes.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No quote requests yet"
                    description="Browse products and request quotes from suppliers"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-medium">Product</th>
                          <th className="text-left p-4 font-medium">Supplier</th>
                          <th className="text-left p-4 font-medium">Quantity</th>
                          <th className="text-left p-4 font-medium">Unit Price</th>
                          <th className="text-left p-4 font-medium">Total</th>
                          <th className="text-left p-4 font-medium">Urgency</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Request Date</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotes.map((quote) => (
                          <tr key={quote.id} className="border-b hover:bg-muted/25">
                            <td className="p-4">
                              <div className="font-medium">{quote.product_name}</div>
                              {quote.notes && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {quote.notes}
                                </div>
                              )}
                            </td>
                            <td className="p-4">{quote.supplier}</td>
                            <td className="p-4">{quote.quantity}</td>
                            <td className="p-4">₦{quote.unit_price.toLocaleString()}</td>
                            <td className="p-4 font-medium">₦{quote.total_price.toLocaleString()}</td>
                            <td className="p-4">
                              <Badge variant="outline" className={
                                quote.urgency === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                                quote.urgency === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }>
                                {quote.urgency}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(quote.status)}>
                                {getStatusText(quote.status)}
                              </Badge>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(quote.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <TableRowActions
                                type="quote"
                                id={quote.id}
                                itemName={`quote for ${quote.product_name}`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle>My Preferred Suppliers</CardTitle>
                <CardDescription>Suppliers you've worked with before</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Dynamic suppliers from products - NOW WITH REAL DATA */}
                  {Array.from(new Set(products.map(p => p.supplierId)))
                    .map(supplierId => {
                      const supplierProducts = products.filter(p => p.supplierId === supplierId)
                      const supplier = supplierProducts[0]?.supplier
                      if (!supplier) return null
                      
                      return (
                        <div key={supplierId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/25">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {supplier.user_metadata?.company_name || supplier.email}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {supplierProducts.length} product{supplierProducts.length !== 1 ? 's' : ''} available
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {supplier.user_metadata?.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  {supplier.user_metadata.location}
                                </div>
                              )}
                              {supplier.user_metadata?.phone && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  {supplier.user_metadata.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge>Verified</Badge>
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/buyer-portal?supplier=${supplierId}`}>
                                View Products
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  
                  {products.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No suppliers found</p>
                      <p className="text-sm mt-1">Start browsing products to discover suppliers</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirmDelete}
        title={confirmation.title}
        description={confirmation.description}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={confirmation.isLoading}
      />
    </div>
  )
}