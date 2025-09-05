"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MessageSquare, Download } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface OrderItem {
  id: string
  name: string
  supplier: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image: string
}

interface OrderStatus {
  step: string
  status: "completed" | "current" | "pending"
  date?: string
  description: string
}

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order] = useState({
    id: orderId,
    status: "in-progress",
    totalAmount: 212500,
    orderDate: "2024-01-22",
    expectedDelivery: "2024-01-29",
    contactPerson: "John Doe",
    deliveryAddress: "123 Business District, Lagos, Nigeria",
    paymentTerms: "Net 30 Days",
    items: [
      {
        id: "1",
        name: "HP LaserJet Pro M404n Printer",
        supplier: "TechSupply Nigeria",
        quantity: 2,
        unitPrice: 85000,
        totalPrice: 170000,
        image: "/hp-laser-printer.jpg",
      },
      {
        id: "2",
        name: "Canon Ink Cartridge PG-245XL",
        supplier: "Office Essentials Ltd",
        quantity: 5,
        unitPrice: 8500,
        totalPrice: 42500,
        image: "/canon-ink-cartridge.jpg",
      },
    ] as OrderItem[],
  })

  const orderStatuses: OrderStatus[] = [
    {
      step: "Order Placed",
      status: "completed",
      date: "2024-01-22",
      description: "Your order has been received and is being processed",
    },
    {
      step: "Quote Approved",
      status: "completed",
      date: "2024-01-23",
      description: "Supplier quotes have been approved and order confirmed",
    },
    {
      step: "In Production",
      status: "current",
      description: "Items are being prepared and packaged for delivery",
    },
    {
      step: "Shipped",
      status: "pending",
      description: "Order has been dispatched and is on the way",
    },
    {
      step: "Delivered",
      status: "pending",
      description: "Order has been successfully delivered",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "current":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-500"
      default:
        return "bg-gray-100 text-gray-500"
    }
  }

  const completedSteps = orderStatuses.filter((s) => s.status === "completed").length
  const progressPercentage = (completedSteps / orderStatuses.length) * 100

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/buyer-dashboard"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold">Viquoe</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Order #{order.id}</h1>
              <p className="text-muted-foreground">Placed on {order.orderDate}</p>
            </div>
            <Badge className={getStatusColor("current")}>In Progress</Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-bold">₦{order.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Truck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Delivery</p>
                    <p className="text-lg font-bold">{order.expectedDelivery}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Terms</p>
                    <p className="text-lg font-bold">{order.paymentTerms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Progress</CardTitle>
                <CardDescription>Track your order status in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}% Complete</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="space-y-4">
                  {orderStatuses.map((status, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          status.status === "completed"
                            ? "bg-green-500 text-white"
                            : status.status === "current"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {status.status === "completed" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{status.step}</h4>
                        <p className="text-sm text-muted-foreground">{status.description}</p>
                        {status.date && <p className="text-xs text-muted-foreground mt-1">{status.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">by {item.supplier}</p>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₦{item.totalPrice.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">₦{item.unitPrice.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₦{order.totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{order.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{order.deliveryAddress}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Supplier
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Package className="h-4 w-4 mr-2" />
                  Track Shipment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
