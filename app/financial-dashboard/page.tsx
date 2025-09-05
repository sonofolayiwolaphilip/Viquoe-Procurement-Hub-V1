"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default function FinancialDashboard() {
  const [timeRange, setTimeRange] = useState("30d")

  const financialSummary = {
    totalSpent: 577500,
    totalPaid: 212500,
    totalPending: 365000,
    totalOverdue: 45000,
    monthlySpend: 212500,
    avgOrderValue: 144375,
    paymentTermsCompliance: 85,
  }

  const recentTransactions = [
    {
      id: "TXN-001",
      type: "payment",
      description: "Payment for Invoice INV-001",
      amount: -170000,
      date: "2024-01-25",
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: "TXN-002",
      type: "refund",
      description: "Refund for damaged items",
      amount: 15000,
      date: "2024-01-20",
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: "TXN-003",
      type: "payment",
      description: "Payment for Invoice INV-003",
      amount: -42500,
      date: "2024-01-18",
      status: "pending",
      method: "Card Payment",
    },
  ]

  const upcomingPayments = [
    {
      invoiceId: "INV-002",
      supplier: "Office Essentials Ltd",
      amount: 42500,
      dueDate: "2024-02-20",
      daysUntilDue: 15,
    },
    {
      invoiceId: "INV-004",
      supplier: "Computer Solutions",
      amount: 320000,
      dueDate: "2024-02-25",
      daysUntilDue: 20,
    },
  ]

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "refund":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
                <h1 className="text-xl font-bold">Financial Dashboard</h1>
                <p className="text-sm text-muted-foreground">Track your spending and payments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild>
                <Link href="/buyer-dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{financialSummary.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₦{financialSummary.totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((financialSummary.totalPaid / financialSummary.totalSpent) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ₦{financialSummary.totalPending.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{upcomingPayments.length} invoices due</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₦{financialSummary.totalOverdue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <Button variant="outline" className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="font-medium">{transaction.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <span className={transaction.amount < 0 ? "text-red-600" : "text-green-600"}>
                            {transaction.amount < 0 ? "-" : "+"}₦{Math.abs(transaction.amount).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.method}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Upcoming Payments</h2>
              <Button asChild>
                <Link href="/invoices">View All Invoices</Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {upcomingPayments.map((payment) => (
                <Card key={payment.invoiceId}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{payment.invoiceId}</h4>
                          <p className="text-sm text-muted-foreground">{payment.supplier}</p>
                          <p className="text-xs text-muted-foreground">Due in {payment.daysUntilDue} days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">₦{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Due {payment.dueDate}</p>
                        <Button size="sm" className="mt-2" asChild>
                          <Link href={`/payment/${payment.invoiceId}`}>Pay Now</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Average Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₦{financialSummary.avgOrderValue.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">+8% from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₦{financialSummary.monthlySpend.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Current month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{financialSummary.paymentTermsCompliance}%</div>
                  <p className="text-sm text-muted-foreground">On-time payments</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
