"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  Building2,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  BarChart3,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

// Enhanced type definitions
type UserType = "buyer" | "supplier"
type UserStatus = "active" | "pending" | "suspended"
type OrderStatus = "pending" | "approved" | "delivered" | "cancelled"

interface User {
  id: string
  name: string
  email: string
  type: UserType
  status: UserStatus
  joinDate: string
  lastActive: string
  totalOrders?: number
  totalRevenue?: number
}

interface Order {
  id: string
  buyer: string
  supplier: string
  amount: number
  status: OrderStatus
  date: string
  items: number
}

interface DashboardStats {
  totalUsers: number
  activeSuppliers: number
  activeBuyers: number
  pendingApprovals: number
  totalOrders: number
  monthlyRevenue: number
  averageOrderValue: number
  platformCommission: number
}

// Utility functions
const userUtils = {
  getStatusColor: (status: string) => {
    switch (status) {
      case "active":
      case "delivered":
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  },
  formatCurrency: (amount: number) => `₦${amount.toLocaleString()}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Custom hook for debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// API service functions (mock implementations)
const apiService = {
  fetchUsers: async (): Promise<User[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return [
      {
        id: "1",
        name: "First Bank of Nigeria",
        email: "procurement@firstbanknigeria.com",
        type: "buyer",
        status: "active",
        joinDate: "2024-01-15",
        lastActive: "2024-01-28",
        totalOrders: 45,
        totalRevenue: 2500000,
      },
      {
        id: "2",
        name: "TechSupply Nigeria",
        email: "sales@techsupply.ng",
        type: "supplier",
        status: "active",
        joinDate: "2024-01-10",
        lastActive: "2024-01-29",
        totalOrders: 78,
        totalRevenue: 8900000,
      },
      {
        id: "3",
        name: "Lagos State Government",
        email: "procurement@lagosstate.gov.ng",
        type: "buyer",
        status: "pending",
        joinDate: "2024-01-25",
        lastActive: "2024-01-28",
        totalOrders: 0,
        totalRevenue: 0,
      },
      {
        id: "4",
        name: "Office Essentials Ltd",
        email: "info@officeessentials.ng",
        type: "supplier",
        status: "suspended",
        joinDate: "2024-01-05",
        lastActive: "2024-01-20",
        totalOrders: 23,
        totalRevenue: 1200000,
      },
    ]
  },

  fetchRecentOrders: async (): Promise<Order[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    return [
      {
        id: "ORD-1234",
        buyer: "First Bank of Nigeria",
        supplier: "TechSupply Nigeria",
        amount: 170000,
        status: "delivered",
        date: "2024-01-28",
        items: 2,
      },
      {
        id: "ORD-1235",
        buyer: "Access Bank",
        supplier: "Office Essentials Ltd",
        amount: 42500,
        status: "pending",
        date: "2024-01-29",
        items: 5,
      },
      {
        id: "ORD-1236",
        buyer: "CBN",
        supplier: "Computer Solutions",
        amount: 320000,
        status: "approved",
        date: "2024-01-29",
        items: 1,
      },
    ]
  },

  fetchDashboardStats: async (): Promise<DashboardStats> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      totalUsers: 1247,
      activeSuppliers: 89,
      activeBuyers: 156,
      pendingApprovals: 12,
      totalOrders: 3456,
      monthlyRevenue: 45600000,
      averageOrderValue: 125000,
      platformCommission: 2280000,
    }
  },

  handleUserAction: async (userId: string, action: "approve" | "suspend" | "activate"): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`${action} user ${userId}`)
    // In real implementation, this would make an API call
  }
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // State management
  const [searchQuery, setSearchQuery] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [orderFilter, setOrderFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  
  // Loading states
  const [usersLoading, setUsersLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Authentication check
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.userType !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, isLoading, router])

  // Data fetching
  useEffect(() => {
    if (isAuthenticated && user?.userType === "admin") {
      fetchData()
    }
  }, [isAuthenticated, user])

  const fetchData = async () => {
    try {
      setError(null)
      setUsersLoading(true)
      setOrdersLoading(true)
      setStatsLoading(true)

      const [usersData, ordersData, statsData] = await Promise.all([
        apiService.fetchUsers(),
        apiService.fetchRecentOrders(),
        apiService.fetchDashboardStats()
      ])

      setUsers(usersData)
      setRecentOrders(ordersData)
      setDashboardStats(statsData)
    } catch (err) {
      setError("Failed to fetch data. Please try again.")
      console.error("Error fetching data:", err)
    } finally {
      setUsersLoading(false)
      setOrdersLoading(false)
      setStatsLoading(false)
    }
  }

  // Memoized filtered data
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesFilter = userFilter === "all" || user.type === userFilter || user.status === userFilter
      return matchesSearch && matchesFilter
    })
  }, [users, debouncedSearch, userFilter])

  const filteredOrders = useMemo(() => {
    return recentOrders.filter((order) => {
      const matchesFilter = orderFilter === "all" || order.status === orderFilter
      return matchesFilter
    })
  }, [recentOrders, orderFilter])

  // Enhanced user action handler
  const handleUserAction = async (userId: string, action: "approve" | "suspend" | "activate") => {
    try {
      setActionLoading(userId)
      setError(null)
      await apiService.handleUserAction(userId, action)
      
      // Update local state to reflect the action
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                status: action === 'approve' || action === 'activate' ? 'active' : 'suspended' 
              }
            : user
        )
      )
      
      // Show success message (in real app, use toast)
      console.log(`Successfully ${action}d user ${userId}`)
    } catch (err) {
      setError(`Failed to ${action} user. Please try again.`)
      console.error(`Error ${action}ing user:`, err)
    } finally {
      setActionLoading(null)
    }
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.userType !== "admin") {
    return null
  }

  if (error && !users.length && !recentOrders.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchData}>Try Again</Button>
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
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Viquoe Platform Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Administrator</Badge>
              <Button onClick={() => router.push("/")} variant="outline">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : dashboardStats ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.activeBuyers} buyers, {dashboardStats.activeSuppliers} suppliers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userUtils.formatCurrency(dashboardStats.monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalOrders.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Avg: {userUtils.formatCurrency(dashboardStats.averageOrderValue)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingApprovals}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="orders">Order Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-2">
                            <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                            <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
                            <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto"></div>
                            <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.buyer} → {order.supplier}
                            </p>
                            <p className="text-xs text-muted-foreground">{userUtils.formatDate(order.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{userUtils.formatCurrency(order.amount)}</p>
                            <Badge className={userUtils.getStatusColor(order.status)}>{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Platform Health */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users (24h)</span>
                    <span className="font-bold text-green-600">89%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Order Success Rate</span>
                    <span className="font-bold text-green-600">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Success Rate</span>
                    <span className="font-bold text-green-600">97%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Supplier Compliance</span>
                    <span className="font-bold text-yellow-600">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Platform Commission</span>
                    <span className="font-bold">{dashboardStats ? userUtils.formatCurrency(dashboardStats.platformCommission) : '₦0'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="buyer">Buyers</SelectItem>
                    <SelectItem value="supplier">Suppliers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 bg-muted rounded animate-pulse"></div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No users found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {user.type === "buyer" ? (
                                <Building2 className="h-3 w-3 mr-1" />
                              ) : (
                                <Package className="h-3 w-3 mr-1" />
                              )}
                              {user.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={userUtils.getStatusColor(user.status)}>{user.status}</Badge>
                          </TableCell>
                          <TableCell>{userUtils.formatDate(user.joinDate)}</TableCell>
                          <TableCell>{userUtils.formatDate(user.lastActive)}</TableCell>
                          <TableCell>{user.totalOrders || 0}</TableCell>
                          <TableCell>{userUtils.formatCurrency(user.totalRevenue || 0)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  {selectedUser && (
                                    <>
                                      <DialogHeader>
                                        <DialogTitle>{selectedUser.name}</DialogTitle>
                                        <DialogDescription>{selectedUser.email}</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm text-muted-foreground">User Type</p>
                                            <p className="font-medium capitalize">{selectedUser.type}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Status</p>
                                            <Badge className={userUtils.getStatusColor(selectedUser.status)}>
                                              {selectedUser.status}
                                            </Badge>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Join Date</p>
                                            <p className="font-medium">{userUtils.formatDate(selectedUser.joinDate)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Last Active</p>
                                            <p className="font-medium">{userUtils.formatDate(selectedUser.lastActive)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Total Orders</p>
                                            <p className="font-medium">{selectedUser.totalOrders || 0}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                                            <p className="font-medium">
                                              {userUtils.formatCurrency(selectedUser.totalRevenue || 0)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex space-x-2">
                                          {selectedUser.status === "pending" && (
                                            <Button
                                              onClick={() => handleUserAction(selectedUser.id, "approve")}
                                              className="flex-1"
                                              disabled={actionLoading === selectedUser.id}
                                            >
                                              {actionLoading === selectedUser.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              ) : (
                                                <UserCheck className="h-4 w-4 mr-2" />
                                              )}
                                              Approve
                                            </Button>
                                          )}
                                          {selectedUser.status === "active" && (
                                            <Button
                                              onClick={() => handleUserAction(selectedUser.id, "suspend")}
                                              variant="destructive"
                                              className="flex-1"
                                              disabled={actionLoading === selectedUser.id}
                                            >
                                              {actionLoading === selectedUser.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              ) : (
                                                <UserX className="h-4 w-4 mr-2" />
                                              )}
                                              Suspend
                                            </Button>
                                          )}
                                          {selectedUser.status === "suspended" && (
                                            <Button
                                              onClick={() => handleUserAction(selectedUser.id, "activate")}
                                              className="flex-1"
                                              disabled={actionLoading === selectedUser.id}
                                            >
                                              {actionLoading === selectedUser.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              ) : (
                                                <UserCheck className="h-4 w-4 mr-2" />
                                              )}
                                              Activate
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <Select value={orderFilter} onValueChange={setOrderFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 bg-muted rounded animate-pulse"></div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No orders found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.buyer}</TableCell>
                          <TableCell>{order.supplier}</TableCell>
                          <TableCell>{userUtils.formatCurrency(order.amount)}</TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>{userUtils.formatDate(order.date)}</TableCell>
                          <TableCell>
                            <Badge className={userUtils.getStatusColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Analytics</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">+24%</p>
                      <p className="text-sm text-muted-foreground">vs last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Acquisition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">+156</p>
                      <p className="text-sm text-muted-foreground">new users this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">+18%</p>
                      <p className="text-sm text-muted-foreground">order increase</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Settings</h2>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commission Settings</CardTitle>
                  <CardDescription>Configure platform commission rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Supplier Commission (%)</label>
                      <Input defaultValue="5" type="number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Payment Processing Fee (%)</label>
                      <Input defaultValue="2.5" type="number" />
                    </div>
                  </div>
                  <Button>Update Commission Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Approval Settings</CardTitle>
                  <CardDescription>Configure automatic approval thresholds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Auto-approve orders under (₦)</label>
                      <Input defaultValue="50000" type="number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Supplier verification required</label>
                      <Select defaultValue="yes">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button>Update Approval Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}