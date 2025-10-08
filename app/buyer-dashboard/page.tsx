"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Package, Clock, CheckCircle, Search, Plus, LogOut, Home } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

interface Order {
  id: string
  items: string[]
  supplier: string
  total: number
  status: "pending" | "approved" | "delivered" | "cancelled"
  date: string
  deliveryDate?: string
}

export default function BuyerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [orders] = useState<Order[]>([
    {
      id: "ORD-001",
      items: ["HP LaserJet Pro M404n", "Canon Ink Cartridge PG-245XL"],
      supplier: "TechSupply Nigeria",
      total: 93500,
      status: "delivered",
      date: "2024-01-15",
      deliveryDate: "2024-01-18",
    },
    {
      id: "ORD-002",
      items: ["Executive Office Chair", "A4 Copy Paper (10 reams)"],
      supplier: "Furniture Plus",
      total: 70000,
      status: "approved",
      date: "2024-01-20",
    },
    {
      id: "ORD-003",
      items: ["Dell OptiPlex 3090 Desktop"],
      supplier: "Computer Solutions",
      total: 320000,
      status: "pending",
      date: "2024-01-22",
    },
  ])

  // ✅ FIXED: Redirect unauthorized users
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.userType !== "buyer")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, isLoading, router])

  // ✅ ADDED: Logout function
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Logout error:", error)
        alert("Failed to log out. Please try again.")
      } else {
        // Redirect to home page after successful logout
        router.push("/")
      }
    } catch (err) {
      console.error("Unexpected logout error:", err)
      alert("An error occurred during logout.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated || user?.userType !== "buyer") {
    return null
  }

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length
  const totalSpent = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* ✅ FIXED: Enhanced Header with Logout */}
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
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order History</h2>
              <Button asChild>
                <Link href="/buyer-portal">
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
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
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="p-4 font-medium">{order.id}</td>
                          <td className="p-4">
                            <div className="max-w-xs">{order.items.join(", ")}</div>
                          </td>
                          <td className="p-4">{order.supplier}</td>
                          <td className="p-4">₦{order.total.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </td>
                          <td className="p-4">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes">
            <Card>
              <CardHeader>
                <CardTitle>Quote Requests</CardTitle>
                <CardDescription>Manage your quote requests and responses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No quote requests yet. Browse products to request quotes.</p>
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
    </div>
  )
}