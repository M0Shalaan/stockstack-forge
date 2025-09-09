import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data
const products = [
  {
    id: 1,
    name: "MacBook Pro 16\"",
    sku: "APL-MBP16-1TB",
    barcode: "123456789012",
    category: "Electronics",
    price: 2499.99,
    stock: 15,
    minQuantity: 5,
    warehouse: "Main Warehouse",
    status: "In Stock",
    expirationDate: null,
  },
  {
    id: 2,
    name: "iPhone 15 Pro Max",
    sku: "APL-IP15PM-256",
    barcode: "123456789013",
    category: "Electronics",
    price: 1199.99,
    stock: 3,
    minQuantity: 20,
    warehouse: "Main Warehouse",
    status: "Low Stock",
    expirationDate: null,
  },
  {
    id: 3,
    name: "Samsung Galaxy S24 Ultra",
    sku: "SAM-GS24U-512",
    barcode: "123456789014",
    category: "Electronics",
    price: 1299.99,
    stock: 28,
    minQuantity: 10,
    warehouse: "Electronics Store",
    status: "In Stock",
    expirationDate: null,
  },
  {
    id: 4,
    name: "Dell XPS 13",
    sku: "DELL-XPS13-512",
    barcode: "123456789015",
    category: "Electronics",
    price: 1099.99,
    stock: 0,
    minQuantity: 5,
    warehouse: "Branch A",
    status: "Out of Stock",
    expirationDate: null,
  },
]

const categories = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Other"]

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    price: "",
    minQuantity: "",
    description: "",
  })
  const { toast } = useToast()

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = () => {
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added successfully.`,
    })
    setIsDialogOpen(false)
    setNewProduct({
      name: "",
      sku: "",
      barcode: "",
      category: "",
      price: "",
      minQuantity: "",
      description: "",
    })
  }

  const getStatusBadge = (status: string, stock: number, minQuantity: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (stock <= minQuantity) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Low Stock</Badge>
    } else {
      return <Badge variant="default" className="bg-success text-success-foreground">In Stock</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and stock levels
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details for the new product in your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="MacBook Pro 16 inch"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="APL-MBP16-1TB"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    placeholder="123456789012"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="299.99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Minimum Quantity</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    value={newProduct.minQuantity}
                    onChange={(e) => setNewProduct({ ...newProduct, minQuantity: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>Add Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">{products.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div className="text-2xl font-bold">
                {products.filter(p => p.stock <= p.minQuantity).length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Low Stock Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-destructive" />
              <div className="text-2xl font-bold">
                {products.filter(p => p.stock === 0).length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-success" />
              <div className="text-2xl font-bold">
                ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Total Inventory Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Complete list of all products in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{product.stock}</span>
                      {product.stock <= product.minQuantity && (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(product.status, product.stock, product.minQuantity)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.warehouse}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}