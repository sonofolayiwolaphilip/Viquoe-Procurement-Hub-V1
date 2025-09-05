"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, Download, Eye, CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Invoice {
  id: string
  orderNumber: string
  supplier: string
  amount: number
  dueDate: string
  issueDate: string
  status: "paid" | "pending" | "overdue" | "processing"
  paymentMethod?: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const invoices: Invoice[] = [
    {
      id: "INV-001",
      orderNumber: "ORD-001",
      supplier: "TechSupply Nigeria",
      amount: 170000,
      dueDate: "2024-02-15",
      issueDate: "2024-01-18",
      status: "paid",
      paymentMethod: "Bank Transfer",
      items: [{ name: "HP LaserJet Pro M404n Printer", quantity: 2, unitPrice: 85000, total: 170000 }],
    },
    {
      id: "INV-002",
      orderNumber: "ORD-002",
      supplier: "Office Essentials Ltd",
      amount: 42500,
      dueDate: "2024-02-20",
      issueDate: "2024-01-25",
      status: "pending",
      items: [{ name: "Canon Ink Cartridge PG-245XL", quantity: 5, unitPrice: 8500, total: 42500 }],
    },
    {
      id: "INV-003",
      orderNumber: "ORD-003",
      supplier: "Furniture Plus",
      amount: 45000,
      dueDate: "2024-01-30",
      issueDate: "2024-01-15",
      status: "overdue",
      items: [{ name: "Executive Office Chair", quantity: 1, unitPrice: 45000, total: 45000 }],
    },
    {
      id: "INV-004",
      orderNumber: "ORD-004",
      supplier: "Computer Solutions",
      amount: 320000,
      dueDate: "2024-02-25",
      issueDate: "2024-01-28",
      status: "processing",
      items: [{ name: "Dell OptiPlex 3090 Desktop", quantity: 1, unitPrice: 320000, total: 320000 }],
    },
  ]

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      case "processing":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidAmount = filteredInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = filteredInvoices
    .filter((inv) => inv.status === "pending" || inv.status === "processing")
    .reduce((sum, inv) => sum + inv.amount, 0)
  const overdueAmount = filteredInvoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0)

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
                <h1 className="text-xl font-bold">Invoice Management</h1>
                <p className="text-sm text-muted-foreground">Track and manage your invoices</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/buyer-dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{filteredInvoices.length} invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₦{paidAmount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">₦{pendingAmount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₦{overdueAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search invoices, suppliers, or order numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.orderNumber}</TableCell>
                    <TableCell>{invoice.supplier}</TableCell>
                    <TableCell>₦{invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>{invoice.issueDate}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(invoice.status)}
                          <span>{invoice.status}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedInvoice(invoice)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            {selectedInvoice && (
                              <>
                                <DialogHeader>
                                  <DialogTitle>Invoice {selectedInvoice.id}</DialogTitle>
                                  <DialogDescription>
                                    Order {selectedInvoice.orderNumber} from {selectedInvoice.supplier}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Issue Date</p>
                                      <p className="font-medium">{selectedInvoice.issueDate}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Due Date</p>
                                      <p className="font-medium">{selectedInvoice.dueDate}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Status</p>
                                      <Badge className={getStatusColor(selectedInvoice.status)}>
                                        {selectedInvoice.status}
                                      </Badge>
                                    </div>
                                    {selectedInvoice.paymentMethod && (
                                      <div>
                                        <p className="text-sm text-muted-foreground">Payment Method</p>
                                        <p className="font-medium">{selectedInvoice.paymentMethod}</p>
                                      </div>
                                    )}
                                  </div>

                                  <Separator />

                                  <div>
                                    <h4 className="font-semibold mb-4">Items</h4>
                                    <div className="space-y-2">
                                      {selectedInvoice.items.map((item, index) => (
                                        <div
                                          key={index}
                                          className="flex justify-between items-center p-3 bg-muted rounded-lg"
                                        >
                                          <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {item.quantity} × ₦{item.unitPrice.toLocaleString()}
                                            </p>
                                          </div>
                                          <p className="font-bold">₦{item.total.toLocaleString()}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <Separator />

                                  <div className="flex justify-between text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span>₦{selectedInvoice.amount.toLocaleString()}</span>
                                  </div>

                                  <div className="flex space-x-2">
                                    <Button className="flex-1">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </Button>
                                    {selectedInvoice.status === "pending" && (
                                      <Button className="flex-1" asChild>
                                        <Link href={`/payment/${selectedInvoice.id}`}>
                                          <CreditCard className="h-4 w-4 mr-2" />
                                          Pay Now
                                        </Link>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === "pending" && (
                          <Button size="sm" asChild>
                            <Link href={`/payment/${invoice.id}`}>Pay</Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
