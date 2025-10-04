import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, Loader2, Route, Router } from "lucide-react";
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
} from "lucide-react";
import { api, apiConfig } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Products from "./Products";
import { BrowserRouter, Routes, useNavigate } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  minQuantity?: number;
}

interface WarehouseData {
  _id: string;
  name: string;
  code: string;
}

interface Transaction {
  _id: string;
  type: "sale" | "purchase" | "transfer";
  productId: string;
  quantity: number;
  price?: number;
  warehouseId: string;
  createdAt: string;
  notes?: string;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!apiConfig.isConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const [productsData, warehousesData, transactionsData] =
        await Promise.all([
          api.list<Product>("products"),
          api.list<WarehouseData>("warehouses"),
          api.list<Transaction>("transactions"),
        ]);
      setProducts(productsData);
      setWarehouses(warehousesData);
      setTransactions(transactionsData.slice(0, 5)); // Latest 5 transactions
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!apiConfig.isConfigured()) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome! Please configure your API settings in Settings to get
            started.
          </p>
        </div>
      </div>
    );
  }

  const totalProducts = products.length;
  const activeWarehouses = warehouses.length;
  const monthlySales = transactions
    .filter((t) => t.type === "sale")
    .reduce((sum, t) => sum + (t.price || 0) * t.quantity, 0);
  const lowStockItems = products.filter(
    (p) => p.minQuantity && products.length < p.minQuantity
  ).length;

  const recentTransactions = transactions.map((transaction) => {
    const product = products.find((p) => p._id === transaction.productId);
    const warehouse = warehouses.find((w) => w._id === transaction.warehouseId);
    return {
      id: transaction._id,
      type:
        transaction.type === "sale"
          ? "Sale"
          : transaction.type === "purchase"
          ? "Purchase"
          : "Transfer",
      product: product?.name || "Unknown Product",
      quantity: transaction.quantity,
      amount: transaction.price
        ? `$${(transaction.price * transaction.quantity).toLocaleString()}`
        : "-",
      warehouse: warehouse?.name || "Unknown Warehouse",
      time: new Date(transaction.createdAt).toLocaleString(),
    };
  });

  const lowStockProducts = products
    .filter((p) => p.minQuantity && products.length < p.minQuantity)
    .slice(0, 3)
    .map((product) => ({
      name: product.name,
      sku: product.sku,
      current: 0, // Would need actual stock data
      minimum: product.minQuantity || 0,
      warehouse: "Various",
    }));

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
        <Card className="shadow-enterprise-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
        <Card className="shadow-enterprise-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Warehouses
            </CardTitle>
            <Warehouse className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWarehouses}</div>
            <p className="text-xs text-muted-foreground">Warehouse locations</p>
          </CardContent>
        </Card>
        <Card className="shadow-enterprise-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${monthlySales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="shadow-enterprise-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
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
                          transaction.type === "Sale"
                            ? "default"
                            : transaction.type === "Purchase"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {transaction.type}
                      </Badge>
                      <span className="text-sm font-medium">
                        {transaction.product}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Qty: {transaction.quantity} • {transaction.warehouse}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {transaction.amount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.time}
                    </div>
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
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((item, index) => (
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
                      value={Math.min((item.current / item.minimum) * 100, 100)}
                      className="h-2"
                    />
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No low stock items</p>
                </div>
              )}
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
            {/* i have to add the admin roles here */}
            <Button
              className="h-20 flex-col gap-2"
              onClick={() => navigate("/app/products")}
            >
              <Package className="h-6 w-6" />
              Add Product
            </Button>
            <Button variant="secondary" className="h-20 flex-col gap-2" onClick={() => navigate("/app/transactions")}>
              <ShoppingCart className="h-6 w-6" />
              New Transaction
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/app/warehouses")}>
              <Warehouse className="h-6 w-6" />
              Warehouses
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
