"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  type: "buyer" | "supplier"
  status: "active" | "pending" | "suspended"
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
  status: "pending" | "approved" | "delivered" | "cancelled"
  date: string
  items: number
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [orderFilter, setOrderFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.userType !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, isLoading, router])

  // Mock data
  const dashboardStats = {
    totalUsers: 1247,
    activeSuppliers: 89,
    activeBuyers: 156,
    pendingApprovals: 12,
    totalOrders: 3456,
    monthlyRevenue: 45600000,
    averageOrderValue: 125000,
    platformCommission: 2280000,
  }

  const users: User[] = [
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

  const recentOrders: Order[] = [
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated || user?.userType !== "admin") {
    return null
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = userFilter === "all" || user.type === userFilter || user.status === userFilter
    return matchesSearch && matchesFilter
  })

  const filteredOrders = recentOrders.filter((order) => {
    const matchesFilter = orderFilter === "all" || order.status === orderFilter
    return matchesFilter
  })

  const getStatusColor = (status: string) => {
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
  }

  const handleUserAction = (userId: string, action: "approve" | "suspend" | "activate") => {
    console.log(`${action} user ${userId}`)
    // Implement user action logic
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
        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
              <div className="text-2xl font-bold">₦{dashboardStats.monthlyRevenue.toLocaleString()}</div>
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
              <p className="text-xs text-muted-foreground">Avg: ₦{dashboardStats.averageOrderValue.toLocaleString()}</p>
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
                  <div className="space-y-4">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.buyer} → {order.supplier}
                          </p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₦{order.amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    <span className="font-bold">₦{dashboardStats.platformCommission.toLocaleString()}</span>
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
                    {filteredUsers.map((user) => (
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
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell>{user.totalOrders || 0}</TableCell>
                        <TableCell>₦{(user.totalRevenue || 0).toLocaleString()}</TableCell>
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
                                          <Badge className={getStatusColor(selectedUser.status)}>
                                            {selectedUser.status}
                                          </Badge>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Join Date</p>
                                          <p className="font-medium">{selectedUser.joinDate}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Last Active</p>
                                          <p className="font-medium">{selectedUser.lastActive}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Total Orders</p>
                                          <p className="font-medium">{selectedUser.totalOrders || 0}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                                          <p className="font-medium">
                                            ₦{(selectedUser.totalRevenue || 0).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex space-x-2">
                                        {selectedUser.status === "pending" && (
                                          <Button
                                            onClick={() => handleUserAction(selectedUser.id, "approve")}
                                            className="flex-1"
                                          >
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Approve
                                          </Button>
                                        )}
                                        {selectedUser.status === "active" && (
                                          <Button
                                            onClick={() => handleUserAction(selectedUser.id, "suspend")}
                                            variant="destructive"
                                            className="flex-1"
                                          >
                                            <UserX className="h-4 w-4 mr-2" />
                                            Suspend
                                          </Button>
                                        )}
                                        {selectedUser.status === "suspended" && (
                                          <Button
                                            onClick={() => handleUserAction(selectedUser.id, "activate")}
                                            className="flex-1"
                                          >
                                            <UserCheck className="h-4 w-4 mr-2" />
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
                    ))}
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
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.buyer}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>₦{order.amount.toLocaleString()}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
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
                    ))}
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
