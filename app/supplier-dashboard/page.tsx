"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Package, Edit, Trash2, Eye, BarChart3, DollarSign, ShoppingCart, Upload, AlertCircle } from "lucide-react"
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

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

interface NewProductForm {
  name: string
  categoryId: string
  price: string
  stock: string
  minOrder: string
  description: string
  image: File | null
  imageUrl: string
}

export default function SupplierDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [rlsError, setRlsError] = useState<string | null>(null)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const router = useRouter()
  
  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name: "",
    categoryId: "",
    price: "",
    stock: "",
    minOrder: "1",
    description: "",
    image: null,
    imageUrl: ""
  })

  // Generate unique SKU
  const generateSKU = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 7)
    return `PROD-${timestamp}-${random}`.toUpperCase()
  }

  // Simplified image upload function with better error handling
  const uploadProductImage = async (file: File): Promise<string | null> => {
    if (!file) return null

    setIsUploading(true)

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPEG, PNG, GIF, WebP)')
        return null
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image must be less than 5MB')
        return null
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 10)
      const fileName = `product_${timestamp}_${randomId}.${fileExt}`
      const filePath = `product-images/${fileName}`

      // Upload file
      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (error) {
        console.error('Image upload error:', error)
        
        // User-friendly error messages
        if (error.message.includes('permission denied') || error.message.includes('not authenticated')) {
          alert('You do not have permission to upload images')
        } else if (error.message.includes('not found') || error.message.includes('bucket')) {
          alert('Storage service not available. Please contact support.')
        } else if (error.message.includes('size') || error.message.includes('too large')) {
          alert('File is too large. Please use an image under 5MB.')
        } else {
          alert(`Upload failed: ${error.message}`)
        }
        
        return null
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      console.log('Image uploaded successfully:', publicUrl)
      return publicUrl

    } catch (error: any) {
      console.error('Unexpected upload error:', error)
      alert('Failed to upload image. Please try again.')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Fetch user session and initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth error:', error)
          router.push('/login')
          return
        }
        
        if (!session) {
          router.push('/login')
          return
        }

        setUser(session.user)
        await Promise.all([
          fetchCategories(),
          fetchProducts(session.user.id)
        ])
        
      } catch (error) {
        console.error('Error initializing data:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [router])

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('Category')
        .select('*')
        .eq('isActive', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        
        if (error.message.includes('policy') || error.message.includes('permission denied')) {
          setRlsError('Database permissions issue. Please contact administrator.')
        } else {
          setCategoriesError(`Error loading categories: ${error.message}`)
        }
        
        // Fallback categories
        const fallbackCategories: Category[] = [
          { id: 'office-supplies', name: 'Office Supplies', description: 'Office supplies', isActive: true, image: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'it-equipment', name: 'IT Equipment', description: 'Computers and tech', isActive: true, image: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'furniture', name: 'Furniture', description: 'Office furniture', isActive: true, image: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]
        setCategories(fallbackCategories)
        return
      }

      setCategories(data || [])
      setCategoriesError(null)
      setRlsError(null)
    } catch (error) {
      console.error('Error in fetchCategories:', error)
      setCategoriesError('Failed to load categories')
    }
  }

  // Fetch products for the supplier
  const fetchProducts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .eq('supplierId', userId)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        
        if (error.message.includes('policy') || error.message.includes('permission denied')) {
          setRlsError('Database permissions issue. Please contact administrator.')
        }
        
        setProducts([])
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  // Add new product
  const handleAddProduct = async () => {
    // Validate required fields
    if (!newProduct.name || !newProduct.categoryId || !newProduct.price || !newProduct.stock) {
      alert('Please fill in all required fields (Name, Category, Price, Stock)')
      return
    }

    if (!user) {
      alert('You must be logged in to add products')
      return
    }

    setIsSubmitting(true)

    try {
      // Get fresh session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Not authenticated')
      }

      let imageUrl = null

      // Upload image if provided
      if (newProduct.image) {
        imageUrl = await uploadProductImage(newProduct.image)
        // Continue even if image upload fails
      }

      // Prepare product data
      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || null,
        price: parseFloat(newProduct.price),
        sku: generateSKU(),
        image: imageUrl,
        stock: parseInt(newProduct.stock),
        minOrder: parseInt(newProduct.minOrder) || 1,
        isActive: true,
        categoryId: newProduct.categoryId,
        supplierId: session.user.id,
        updatedAt: new Date().toISOString() // Required field
      }

      // Validate price and stock
      if (productData.price <= 0 || productData.stock < 0) {
        alert('Price must be greater than 0 and stock cannot be negative')
        return
      }

      // Insert product
      const { data, error } = await supabase
        .from('Product')
        .insert([productData])
        .select()

      if (error) {
        console.error('Insert error:', error)
        
        if (error.code === '23502') { // not-null violation
          alert('Missing required fields. Please fill all required fields.')
        } else if (error.code === '23503') { // foreign key violation
          alert('Invalid category selected.')
        } else if (error.code === '23505') { // unique violation
          alert('Product with similar details already exists.')
        } else if (error.message.includes('permission denied')) {
          setRlsError('Database permissions issue. Please contact administrator.')
          alert('Permission denied. Please contact administrator.')
        } else {
          alert(`Error adding product: ${error.message}`)
        }
        return
      }

      // Add new product to state
      if (data?.[0]) {
        setProducts([data[0], ...products])
      }

      // Reset form and close dialog
      setNewProduct({
        name: "",
        categoryId: "",
        price: "",
        stock: "",
        minOrder: "1",
        description: "",
        image: null,
        imageUrl: ""
      })
      setIsAddProductOpen(false)
      
      alert('Product added successfully!')
      
    } catch (error: any) {
      console.error('Error adding product:', error)
      alert('Error adding product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('Product')
        .delete()
        .eq('id', id)

      if (error) {
        if (error.message.includes('permission denied')) {
          setRlsError('Database permissions issue. Please contact administrator.')
          alert('Permission denied. Please contact administrator.')
        } else {
          throw error
        }
        return
      }

      setProducts(products.filter((p) => p.id !== id))
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product. Please try again.')
    }
  }

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        e.target.value = '' // Clear file input
        return
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB')
        e.target.value = ''
        return
      }

      setNewProduct({
        ...newProduct,
        image: file,
        imageUrl: URL.createObjectURL(file)
      })
    }
  }

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Statistics
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  const lowStockProducts = products.filter((p) => p.stock < 10).length

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to access the dashboard</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Supplier Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
              <Button onClick={() => window.location.href = "/"}>Back to Home</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banners */}
        {rlsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Database Permissions Required</h3>
                <p className="text-sm text-red-700 mt-1">{rlsError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('https://supabase.com/docs/guides/auth/row-level-security', '_blank')}
                  className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
                >
                  Learn about RLS Policies
                </Button>
              </div>
            </div>
          </div>
        )}

        {categoriesError && !rlsError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Categories Loading Issue</h3>
                <p className="text-sm text-yellow-700 mt-1">{categoriesError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchCategories}
                  className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  Retry Loading Categories
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders This Month</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Catalog</h2>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Add a new product to your catalog</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="HP LaserJet Pro M404n"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select 
                          value={newProduct.categoryId} 
                          onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.length > 0 ? (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₦) *</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="85000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity *</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                          placeholder="25"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minOrder">Minimum Order</Label>
                        <Input
                          id="minOrder"
                          type="number"
                          min="1"
                          value={newProduct.minOrder}
                          onChange={(e) => setNewProduct({ ...newProduct, minOrder: e.target.value })}
                          placeholder="1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Professional laser printer for office use"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Product Image (Optional)</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {isUploading && <span className="text-sm text-gray-500">Uploading...</span>}
                      </div>
                      {newProduct.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={newProduct.imageUrl} 
                            alt="Preview" 
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <p className="text-xs text-gray-500 mt-1">Preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddProduct} 
                      disabled={isSubmitting || isUploading}
                    >
                      {isSubmitting ? "Adding..." : "Add Product"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                {products.length === 0 ? (
                  <div className="text-center text-gray-600 py-12">
                    {rlsError ? (
                      <div className="flex flex-col items-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                        <p>Cannot load products due to database permissions</p>
                        <p className="text-sm">Please set up RLS policies to continue</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <Package className="h-12 w-12 text-gray-400" />
                        <p className="text-lg">No products yet</p>
                        <p className="text-sm">Click "Add Product" to get started</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Product</th>
                          <th className="text-left py-3 px-4 font-medium">Category</th>
                          <th className="text-left py-3 px-4 font-medium">Price</th>
                          <th className="text-left py-3 px-4 font-medium">Stock</th>
                          <th className="text-left py-3 px-4 font-medium">Min Order</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => {
                          const category = categories.find(c => c.id === product.categoryId)
                          return (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 flex-shrink-0">
                                    <img
                                      src={product.image || "/placeholder.svg"}
                                      alt={product.name}
                                      className="w-full h-full rounded-lg object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-sm text-gray-600">
                                      SKU: {product.sku}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge variant="secondary">
                                  {category?.name || product.categoryId}
                                </Badge>
                              </td>
                              <td className="py-4 px-4 font-medium">
                                ₦{product.price.toLocaleString()}
                              </td>
                              <td className="py-4 px-4">
                                <span className={product.stock < 10 ? "text-yellow-600 font-medium" : ""}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="py-4 px-4">{product.minOrder}</td>
                              <td className="py-4 px-4">
                                <Badge variant={product.isActive ? "default" : "secondary"}>
                                  {product.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="ghost" title="View">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" title="Edit">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    title="Delete"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Orders placed for your products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-600">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p>No orders yet</p>
                  <p className="text-sm mt-1">Your products will appear here once buyers place orders</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>Performance metrics for your products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-600">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p>Analytics dashboard coming soon</p>
                  <p className="text-sm mt-1">Check back later for detailed sales insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}