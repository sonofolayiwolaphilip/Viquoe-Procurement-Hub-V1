"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Package, Clock, CheckCircle, Search, Plus, LogOut, Home, Trash2, FileText, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates"
import { logger } from "@/lib/logger"

interface Order {
  id: string
  items: string[]
  supplier: string
  total: number
  status: "pending" | "approved" | "delivered" | "cancelled"
  date: string
  deliveryDate?: string
  buyer_id: string
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
  created_at: string
  contact_person: string
  phone: string
  delivery_address: string
  notes: string
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
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingQuotes, setLoadingQuotes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    type: null,
    id: null,
    title: '',
    description: '',
    isLoading: false
  })

  // Real-time updates handler
  const handleOrderUpdate = useCallback((payload: any) => {
    logger.info('BuyerDashboard', 'Processing order update', { 
      event: payload.eventType, 
      orderId: payload.new?.id 
    })

    if (payload.eventType === 'INSERT') {
      setOrders(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setOrders(prev => prev.map(order => 
        order.id === payload.new.id ? payload.new : order
      ))
    } else if (payload.eventType === 'DELETE') {
      setOrders(prev => prev.filter(order => order.id !== payload.old.id))
    }
  }, [])

  const handleQuoteUpdate = useCallback((payload: any) => {
    logger.info('BuyerDashboard', 'Processing quote update', { 
      event: payload.eventType, 
      quoteId: payload.new?.id 
    })

    if (payload.eventType === 'INSERT') {
      setQuotes(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setQuotes(prev => prev.map(quote => 
        quote.id === payload.new.id ? payload.new : quote
      ))
    } else if (payload.eventType === 'DELETE') {
      setQuotes(prev => prev.filter(quote => quote.id !== payload.old.id))
    }
  }, [])

  // Set up real-time subscriptions
  useRealTimeUpdates({
    userId: user?.id || '',
    onOrderUpdate: handleOrderUpdate,
    onQuoteUpdate: handleQuoteUpdate
  })

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoadingOrders(true)
      setError(null)
      logger.debug('BuyerDashboard', 'Fetching orders', { userId: user.id })

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", user.id)
        .order("date", { ascending: false })

      if (fetchError) throw fetchError

      setOrders(data || [])
      logger.info('BuyerDashboard', 'Orders fetched successfully', { count: data?.length })
    } catch (err: any) {
      logger.error('BuyerDashboard', 'Error fetching orders', err)
      setError(err.message || "Failed to load orders")
    } finally {
      setLoadingOrders(false)
    }
  }, [user?.id])

  const fetchQuotes = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoadingQuotes(true)
      logger.debug('BuyerDashboard', 'Fetching quotes', { userId: user.id })

      const { data, error: fetchError } = await supabase
        .from("quote_requests")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setQuotes(data || [])
      logger.info('BuyerDashboard', 'Quotes fetched successfully', { count: data?.length })
    } catch (err: any) {
      logger.error('BuyerDashboard', 'Error fetching quotes', err)
    } finally {
      setLoadingQuotes(false)
    }
  }, [user?.id])

  const refreshAllData = useCallback(async () => {
    setRefreshing(true)
    logger.info('BuyerDashboard', 'Manual refresh triggered')
    
    try {
      await Promise.all([fetchOrders(), fetchQuotes()])
      logger.info('BuyerDashboard', 'Manual refresh completed')
    } catch (err) {
      logger.error('BuyerDashboard', 'Error during manual refresh', err)
    } finally {
      setRefreshing(false)
    }
  }, [fetchOrders, fetchQuotes])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchOrders()
      fetchQuotes()
    }
  }, [isAuthenticated, user, fetchOrders, fetchQuotes])

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== "buyer")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, authLoading, router])

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

      const tableName = type === 'order' ? 'orders' : 'quote_requests'
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id)
        .eq("buyer_id", user?.id)

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
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    deliveredOrders: orders.filter((o) => o.status === "delivered").length,
    totalSpent: orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0),
    pendingQuotes: quotes.filter((q) => q.status === "pending").length
  }), [orders, quotes])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated || user?.userType !== "buyer") {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/50">
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
              <Button 
                variant="outline" 
                onClick={refreshAllData}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button asChild>
                <Link href="/buyer-portal">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Products
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardStats.deliveredOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{dashboardStats.totalSpent.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="quotes">
              Quote Requests
              {dashboardStats.pendingQuotes > 0 && (
                <Badge className="ml-2 bg-yellow-500">{dashboardStats.pendingQuotes}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order History</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={fetchOrders}
                  disabled={loadingOrders}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button asChild>
                  <Link href="/buyer-portal">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Link>
                </Button>
              </div>
            </div>

            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-red-800">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => setError(null)}>
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-0">
                {loadingOrders ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Loading orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start browsing products to place your first order
                    </p>
                    <Button asChild>
                      <Link href="/buyer-portal">
                        Browse Products
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Order ID</th>
                          <th className="text-left p-4 font-medium">Items</th>
                          <th className="text-left p-4 font-medium">Supplier</th>
                          <th className="text-left p-4 font-medium">Total</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="p-4 font-medium">ORD-{order.id.slice(-6)}</td>
                            <td className="p-4">
                              <div className="max-w-xs">{order.items.join(", ")}</div>
                            </td>
                            <td className="p-4">{order.supplier}</td>
                            <td className="p-4">₦{order.total.toLocaleString()}</td>
                            <td className="p-4">
                              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                            </td>
                            <td className="p-4">{new Date(order.date).toLocaleDateString()}</td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => showDeleteConfirmation('order', order.id, `order ORD-${order.id.slice(-6)}`)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label={`Delete order ORD-${order.id.slice(-6)}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
              <h2 className="text-2xl font-bold">Quote Requests</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={fetchQuotes}
                  disabled={loadingQuotes}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingQuotes ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
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
                {loadingQuotes ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Loading quote requests...
                  </div>
                ) : quotes.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No quote requests yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Browse products and request quotes from suppliers
                    </p>
                    <Button asChild>
                      <Link href="/buyer-portal">
                        Browse Products
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Product</th>
                          <th className="text-left p-4 font-medium">Supplier</th>
                          <th className="text-left p-4 font-medium">Quantity</th>
                          <th className="text-left p-4 font-medium">Unit Price</th>
                          <th className="text-left p-4 font-medium">Total</th>
                          <th className="text-left p-4 font-medium">Urgency</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotes.map((quote) => (
                          <tr key={quote.id} className="border-b">
                            <td className="p-4">
                              <div className="font-medium">{quote.product_name}</div>
                              {quote.notes && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  Note: {quote.notes}
                                </div>
                              )}
                            </td>
                            <td className="p-4">{quote.supplier}</td>
                            <td className="p-4">{quote.quantity}</td>
                            <td className="p-4">₦{quote.unit_price.toLocaleString()}</td>
                            <td className="p-4 font-medium">₦{quote.total_price.toLocaleString()}</td>
                            <td className="p-4">
                              <Badge variant="outline">
                                {quote.urgency}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(quote.status)}>
                                {quote.status}
                              </Badge>
                            </td>
                            <td className="p-4">{new Date(quote.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => showDeleteConfirmation('quote', quote.id, `quote for ${quote.product_name}`)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label={`Delete quote for ${quote.product_name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                <CardTitle>Preferred Suppliers</CardTitle>
                <CardDescription>Suppliers you've worked with before</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">TechSupply Nigeria</h4>
                      <p className="text-sm text-muted-foreground">IT Equipment & Office Supplies</p>
                    </div>
                    <Badge>Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Furniture Plus</h4>
                      <p className="text-sm text-muted-foreground">Office Furniture & Equipment</p>
                    </div>
                    <Badge>Verified</Badge>
                  </div>
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