// Products.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, apiConfig } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  category?: string | { _id: string; name: string };
  price: number;
  quantity: number; // << الكمية في المخزون
  minQuantity?: number;
  description?: string;
  warehouse?: string | { _id: string; name: string };
}

interface Category { _id: string; name: string; }
interface Warehouse { _id: string; name: string; }

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // ---------------- Helpers ----------------
  const getCategoryName = (category: Product["category"]) => {
    const id = typeof category === "object" && category !== null ? category._id : category;
    return categories.find((c) => String(c._id) === String(id))?.name || "N/A";
  };
  const getWarehouseName = (warehouse: Product["warehouse"]) => {
    if (!warehouse) return "N/A";
    const id = typeof warehouse === "object" && warehouse !== null ? warehouse._id : warehouse;
    return warehouses.find((w) => String(w._id) === String(id))?.name || "N/A";
  };
  const getStatusBadge = (product: Product) => {
    if (product.quantity <= 0) {
      return <Badge className="bg-red-500 text-white">Out of Stock</Badge>;
    }
    if (product.minQuantity && product.quantity <= product.minQuantity) {
      return <Badge className="bg-yellow-500 text-black">Low Stock</Badge>;
    }
    return <Badge className="bg-green-500 text-white">Available</Badge>;
  };

  // ---------------- API ----------------
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!apiConfig.isConfigured()) {
      toast({ title: "API Not Configured", description: "Please configure your API settings first", variant: "destructive" });
      setLoading(false);
      return;
    }
    try {
      const [productsData, categoriesData, warehousesData] = await Promise.all([
        api.list<Product>("products", searchTerm),
        api.list<Category>("categories"),
        api.list<Warehouse>("warehouses"),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setWarehouses(warehousesData);
    } catch (error) {
      toast({ title: "Error Loading Data", description: error instanceof Error ? error.message : "Failed to load products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Calculations ----------------
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.minQuantity && p.quantity > 0 && p.quantity <= p.minQuantity).length;
  const outOfStock = products.filter((p) => p.quantity <= 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory and categories</p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{lowStock}</div>
            <p className="text-xs text-muted-foreground">Low Stock Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{outOfStock}</div>
            <p className="text-xs text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Inventory Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Complete list of all products in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead> {/* الكمية */}
                <TableHead>Status</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{getCategoryName(product.category)}</TableCell>
                  <TableCell>${product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.minQuantity ?? "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(product)}</TableCell>
                  <TableCell>{getWarehouseName(product.warehouse ?? "N/A")}</TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    {hasPermission(["admin", "manager"]) && (
                      <>
                        <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4" /></Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
