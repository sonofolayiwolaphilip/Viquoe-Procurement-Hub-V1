"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Package, Clock, CheckCircle, Search, Plus, LogOut, Home, Trash2, FileText, RefreshCw, Eye } from "lucide-react"
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
  const [loading, setLoading] = useState({ orders: true, quotes: true })
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

  // Enhanced fetch function with supplier data
 const fetchOrders = useCallback(async () => {
  if (!user?.id) return

  try {
    setLoading(prev => ({ ...prev, orders: true }))
    setError(null)
    logger.debug('BuyerDashboard', 'Fetching orders', { userId: user.id })

    const { data, error: fetchError } = await supabase
      .from("Order")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false })

    if (fetchError) throw fetchError

    // Use existing supplierName if available, otherwise use fallback
    const ordersWithFallbackNames = (data || []).map(order => ({
      ...order,
      supplierName: order.supplierName || 'Supplier'
    }))

    setOrders(ordersWithFallbackNames)
    logger.info('BuyerDashboard', 'Orders fetched successfully', { count: data?.length })
  } catch (err: any) {
    logger.error('BuyerDashboard', 'Error fetching orders', err)
    setError(err.message || "Failed to load orders")
  } finally {
    setLoading(prev => ({ ...prev, orders: false }))
  }
}, [user?.id])

  const fetchQuotes = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(prev => ({ ...prev, quotes: true }))
      logger.debug('BuyerDashboard', 'Fetching quotes', { userId: user.id })

      const { data, error: fetchError } = await supabase
        .from("QuoteRequest")
        .select("*")
        .eq("userId", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setQuotes(data || [])
      logger.info('BuyerDashboard', 'Quotes fetched successfully', { count: data?.length })
    } catch (err: any) {
      logger.error('BuyerDashboard', 'Error fetching quotes', err)
    } finally {
      setLoading(prev => ({ ...prev, quotes: false }))
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
    pendingQuotes: quotes.filter((q) => q.status === "pending").length
  }), [orders, quotes])

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

  // Reusable Refresh Button Component
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

  // Reusable Empty State Component
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

  // Reusable Loading State Component
  const LoadingState = ({ message }: { message: string }) => (
    <div className="p-8 text-center text-muted-foreground">
      <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2" />
      {message}
    </div>
  )

  // Table Row Actions Component
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
        {/* Stats Grid */}
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
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="quotes">
              Quote Requests
              {dashboardStats.pendingQuotes > 0 && (
                <Badge className="ml-2 bg-yellow-500">{dashboardStats.pendingQuotes}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suppliers">My Suppliers</TabsTrigger>
          </TabsList>

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
                              {new Date(quote.created_at).toLocaleDateString()}
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
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/25">
                    <div>
                      <h4 className="font-medium">TechSupply Nigeria</h4>
                      <p className="text-sm text-muted-foreground">IT Equipment & Office Supplies</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">⭐ 4.8/5</Badge>
                        <Badge variant="secondary" className="text-xs">📞 Quick Response</Badge>
                      </div>
                    </div>
                    <Badge>Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/25">
                    <div>
                      <h4 className="font-medium">Furniture Plus</h4>
                      <p className="text-sm text-muted-foreground">Office Furniture & Equipment</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">⭐ 4.6/5</Badge>
                        <Badge variant="secondary" className="text-xs">🚚 Fast Delivery</Badge>
                      </div>
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