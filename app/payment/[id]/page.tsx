"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CreditCard, Building2, Smartphone, CheckCircle, Shield, Lock } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [paymentMethod, setPaymentMethod] = useState("bank-transfer")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState({
    accountNumber: "",
    bankName: "",
    accountName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    phoneNumber: "",
  })

  // Mock invoice data
  const invoice = {
    id: invoiceId,
    orderNumber: "ORD-002",
    supplier: "Office Essentials Ltd",
    amount: 42500,
    dueDate: "2024-02-20",
    items: [{ name: "Canon Ink Cartridge PG-245XL", quantity: 5, unitPrice: 8500, total: 42500 }],
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setPaymentSuccess(true)

      // Redirect after success
      setTimeout(() => {
        router.push("/invoices")
      }, 3000)
    } catch (error) {
      console.error("Payment failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-professional-lg">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your payment of ₦{invoice.amount.toLocaleString()} has been processed successfully.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/invoices">View Invoices</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/buyer-dashboard">Back to Dashboard</Link>
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
            <div className="flex items-center space-x-4">
              <Link
                href="/invoices"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Invoices
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment</h1>
          <p className="text-muted-foreground">Complete your payment for Invoice {invoice.id}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card
                    className={`cursor-pointer transition-colors ${paymentMethod === "bank-transfer" ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setPaymentMethod("bank-transfer")}
                  >
                    <CardContent className="p-4 text-center">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-xs text-muted-foreground">Direct bank transfer</p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-colors ${paymentMethod === "card" ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CardContent className="p-4 text-center">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">Debit/Credit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-colors ${paymentMethod === "mobile" ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setPaymentMethod("mobile")}
                  >
                    <CardContent className="p-4 text-center">
                      <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">Mobile Money</p>
                      <p className="text-xs text-muted-foreground">USSD, Mobile wallet</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Details Form */}
                {paymentMethod === "bank-transfer" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Bank Transfer Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Select onValueChange={(value) => setPaymentDetails({ ...paymentDetails, bankName: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first-bank">First Bank of Nigeria</SelectItem>
                            <SelectItem value="gtb">Guaranty Trust Bank</SelectItem>
                            <SelectItem value="access">Access Bank</SelectItem>
                            <SelectItem value="zenith">Zenith Bank</SelectItem>
                            <SelectItem value="uba">United Bank for Africa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={paymentDetails.accountNumber}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                          placeholder="1234567890"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input
                        id="accountName"
                        value={paymentDetails.accountName}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, accountName: e.target.value })}
                        placeholder="Account holder name"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Card Details</h3>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          value={paymentDetails.expiryDate}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        value={paymentDetails.cardName}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "mobile" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Mobile Money Details</h3>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={paymentDetails.phoneNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, phoneNumber: e.target.value })}
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                    <Alert>
                      <Smartphone className="h-4 w-4" />
                      <AlertDescription>
                        You will receive a USSD prompt on your phone to complete the payment.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Security Notice */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Your payment information is encrypted and secure</span>
                    </div>
                  </AlertDescription>
                </Alert>

                <Button onClick={handlePayment} className="w-full" disabled={isProcessing} size="lg">
                  {isProcessing ? "Processing Payment..." : `Pay ₦${invoice.amount.toLocaleString()}`}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice ID</p>
                  <p className="font-medium">{invoice.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-medium">{invoice.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{invoice.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{invoice.dueDate}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Items</h4>
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm mb-2">
                      <span>
                        {item.name} (×{item.quantity})
                      </span>
                      <span>₦{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₦{invoice.amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
