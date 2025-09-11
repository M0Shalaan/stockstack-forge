import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Search, Package, Warehouse, ShoppingCart, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { api, apiConfig } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Product {
  _id: string;
  name: string;
  sku: string;
  category?: string;
  minQuantity?: number;
}

interface StockItem {
  product: Product;
  currentStock: number;
  priority: 'Critical' | 'High' | 'Medium';
}

export default function StockAlerts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    if (!apiConfig.isConfigured()) {
      toast({
        title: "API Not Configured",
        description: "Please configure your API settings first",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const data = await api.list<Product>('products')
      setProducts(data)
    } catch (error) {
      toast({
        title: "Error Loading Products",
        description: error instanceof Error ? error.message : "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Mock low stock items based on products (in real app, this would come from stock data)
  const lowStockItems = products
    .filter(product => product.minQuantity)
    .map(product => ({
      id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category || 'Electronics',
      currentStock: Math.floor(Math.random() * (product.minQuantity! / 2)), // Simulate low stock
      minimumQuantity: product.minQuantity!,
      warehouse: 'Main Warehouse',
      lastRestocked: '2024-01-10',
      supplier: 'Supplier Inc',
      averageDailySales: Math.random() * 5,
      daysUntilStockout: Math.floor(Math.random() * 7) + 1,
      priority: Math.random() > 0.7 ? 'Critical' : Math.random() > 0.4 ? 'High' : 'Medium' as const,
    }))

  const filteredItems = lowStockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <Badge variant="destructive">Critical</Badge>
      case "High":
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">High</Badge>
      case "Medium":
        return <Badge variant="outline">Medium</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getStockPercentage = (current: number, minimum: number) => {
    return Math.min((current / minimum) * 100, 100)
  }

  const criticalItems = lowStockItems.filter(item => item.priority === "Critical").length
  const highPriorityItems = lowStockItems.filter(item => item.priority === "High").length
  const mediumPriorityItems = lowStockItems.filter(item => item.priority === "Medium").length
  const totalValue = lowStockItems.reduce((sum, item) => sum + (item.currentStock * 500), 0) // Estimated value

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Alerts</h1>
        <p className="text-muted-foreground">
          Monitor low stock items and prevent stockouts across all warehouses
        </p>
      </div>

      {/* Alert Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div className="text-2xl font-bold text-destructive">{criticalItems}</div>
            </div>
            <p className="text-xs text-muted-foreground">Critical Alerts</p>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div className="text-2xl font-bold text-warning">{highPriorityItems}</div>
            </div>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{mediumPriorityItems}</div>
            </div>
            <p className="text-xs text-muted-foreground">Medium Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            </div>
            <p className="text-xs text-muted-foreground">At Risk Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search low stock items by name, SKU, or warehouse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export Report</Button>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Low Stock Items
          </CardTitle>
          <CardDescription>
            Items that are below minimum stock levels and need immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Days Until Stockout</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className={
                  item.priority === "Critical" ? "bg-destructive/5" : ""
                }>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.sku} • {item.category}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.currentStock} / {item.minimumQuantity}</span>
                        <span className="text-muted-foreground">
                          {Math.round(getStockPercentage(item.currentStock, item.minimumQuantity))}%
                        </span>
                      </div>
                      <Progress 
                        value={getStockPercentage(item.currentStock, item.minimumQuantity)} 
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.warehouse}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        item.daysUntilStockout <= 1 ? "text-destructive" :
                        item.daysUntilStockout <= 3 ? "text-warning" : ""
                      }`}>
                        {item.daysUntilStockout} {item.daysUntilStockout === 1 ? "day" : "days"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.supplier}</TableCell>
                  <TableCell>
                    {getPriorityBadge(item.priority)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Reorder
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Bulk operations for managing stock alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <ShoppingCart className="h-6 w-6" />
              Generate Purchase Orders
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              Update Alert Thresholds
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              Export Stock Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}