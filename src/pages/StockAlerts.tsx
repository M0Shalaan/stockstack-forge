import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Search, Package, Warehouse, ShoppingCart } from "lucide-react"
import { useState } from "react"

// Mock data for low stock items
const lowStockItems = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    sku: "APL-IP15PM-256",
    category: "Electronics",
    currentStock: 3,
    minimumQuantity: 20,
    warehouse: "Main Warehouse",
    lastRestocked: "2024-01-10",
    supplier: "Apple Supplier Inc",
    averageDailySales: 2.5,
    daysUntilStockout: 1,
    priority: "Critical",
  },
  {
    id: 2,
    name: "MacBook Air M3",
    sku: "APL-MBA-M3-512",
    category: "Electronics",
    currentStock: 2,
    minimumQuantity: 10,
    warehouse: "Electronics Store",
    lastRestocked: "2024-01-08",
    supplier: "Apple Supplier Inc",
    averageDailySales: 1.2,
    daysUntilStockout: 2,
    priority: "Critical",
  },
  {
    id: 3,
    name: "Samsung Galaxy Watch 6",
    sku: "SAM-GW6-44MM",
    category: "Electronics",
    currentStock: 8,
    minimumQuantity: 25,
    warehouse: "Branch A",
    lastRestocked: "2024-01-05",
    supplier: "Samsung Electronics",
    averageDailySales: 1.8,
    daysUntilStockout: 4,
    priority: "High",
  },
  {
    id: 4,
    name: "Dell XPS 13",
    sku: "DELL-XPS13-512",
    category: "Electronics",
    currentStock: 1,
    minimumQuantity: 5,
    warehouse: "Branch A",
    lastRestocked: "2024-01-12",
    supplier: "Dell Technologies",
    averageDailySales: 0.8,
    daysUntilStockout: 1,
    priority: "Critical",
  },
  {
    id: 5,
    name: "iPad Air 5th Gen",
    sku: "APL-IPAD-AIR5-256",
    category: "Electronics",
    currentStock: 12,
    minimumQuantity: 30,
    warehouse: "Main Warehouse",
    lastRestocked: "2024-01-07",
    supplier: "Apple Supplier Inc",
    averageDailySales: 2.1,
    daysUntilStockout: 6,
    priority: "Medium",
  },
  {
    id: 6,
    name: "AirPods Pro 2nd Gen",
    sku: "APL-APP-PRO2",
    category: "Electronics",
    currentStock: 5,
    minimumQuantity: 50,
    warehouse: "Electronics Store",
    lastRestocked: "2024-01-09",
    supplier: "Apple Supplier Inc",
    averageDailySales: 5.2,
    daysUntilStockout: 1,
    priority: "Critical",
  },
  {
    id: 7,
    name: "Microsoft Surface Pro 9",
    sku: "MS-SP9-512",
    category: "Electronics",
    currentStock: 6,
    minimumQuantity: 15,
    warehouse: "Branch B",
    lastRestocked: "2024-01-11",
    supplier: "Microsoft Corp",
    averageDailySales: 1.0,
    daysUntilStockout: 6,
    priority: "Medium",
  },
]

export default function StockAlerts() {
  const [searchTerm, setSearchTerm] = useState("")

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