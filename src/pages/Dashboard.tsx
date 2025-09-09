import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Package,
  Warehouse,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Activity,
  FileText,
} from "lucide-react"

const stats = [
  {
    title: "Total Products",
    value: "1,247",
    change: "+12%",
    icon: Package,
    color: "text-primary",
  },
  {
    title: "Active Warehouses",
    value: "8",
    change: "+2",
    icon: Warehouse,
    color: "text-success",
  },
  {
    title: "Monthly Sales",
    value: "$45,231",
    change: "+23%",
    icon: DollarSign,
    color: "text-warning",
  },
  {
    title: "Low Stock Items",
    value: "23",
    change: "-5",
    icon: AlertTriangle,
    color: "text-destructive",
  },
]

const recentTransactions = [
  {
    id: "TXN-001",
    type: "Sale",
    product: "MacBook Pro 16\"",
    quantity: 2,
    amount: "$3,998",
    warehouse: "Main Warehouse",
    time: "2 min ago",
  },
  {
    id: "TXN-002",
    type: "Purchase",
    product: "iPhone 15 Pro",
    quantity: 50,
    amount: "$49,950",
    warehouse: "Electronics Store",
    time: "15 min ago",
  },
  {
    id: "TXN-003",
    type: "Transfer",
    product: "Samsung Galaxy S24",
    quantity: 10,
    amount: "-",
    warehouse: "Main → Branch A",
    time: "1 hour ago",
  },
  {
    id: "TXN-004",
    type: "Sale",
    product: "iPad Air",
    quantity: 1,
    amount: "$599",
    warehouse: "Branch B",
    time: "2 hours ago",
  },
]

const lowStockItems = [
  {
    name: "iPhone 15 Pro Max",
    sku: "APL-IP15PM-256",
    current: 5,
    minimum: 20,
    warehouse: "Main Warehouse",
  },
  {
    name: "MacBook Air M3",
    sku: "APL-MBA-M3-512",
    current: 2,
    minimum: 10,
    warehouse: "Electronics Store",
  },
  {
    name: "Samsung Galaxy Watch",
    sku: "SAM-GW6-44MM",
    current: 8,
    minimum: 25,
    warehouse: "Branch A",
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening in your inventory today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-enterprise-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith('+') ? 'text-success' : 'text-destructive'}>
                  {stat.change}
                </span>{' '}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="shadow-enterprise-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest inventory movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          transaction.type === 'Sale' ? 'default' :
                          transaction.type === 'Purchase' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {transaction.type}
                      </Badge>
                      <span className="text-sm font-medium">{transaction.product}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Qty: {transaction.quantity} • {transaction.warehouse}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{transaction.amount}</div>
                    <div className="text-xs text-muted-foreground">{transaction.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="shadow-enterprise-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        SKU: {item.sku} • {item.warehouse}
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {item.current}/{item.minimum}
                    </Badge>
                  </div>
                  <Progress
                    value={(item.current / item.minimum) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-enterprise-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              Add Product
            </Button>
            <Button variant="secondary" className="h-20 flex-col gap-2">
              <ShoppingCart className="h-6 w-6" />
              New Transaction
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Warehouse className="h-6 w-6" />
              Stock Transfer
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}