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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Loader2,
  FolderPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, apiConfig } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import warehouse from "./Warehouses";

interface Product {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  category?: string;
  price: number;
  minQuantity?: number;
  description?: string;
  imageUrl?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Warehouse {
  _id: string;
  name: string;
  location?: string;
}

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    price: "",
    minQuantity: "",
    description: "",
    warehouse: "",
  });
  const [newCategory, setNewCategory] = useState("");

  const { toast } = useToast();
  const { hasPermission } = useAuth();

  const canAddProducts = hasPermission(["admin", "manager"]);
  const canAddCategories = hasPermission(["admin", "manager"]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!apiConfig.isConfigured()) {
      toast({
        title: "API Not Configured",
        description: "Please configure your API settings first",
        variant: "destructive",
      });
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
      toast({
        title: "Error Loading Data",
        description:
          error instanceof Error ? error.message : "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = async () => {
    if (!canAddProducts) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add products",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price) || 0,
        minQuantity: parseInt(newProduct.minQuantity) || 0,
      };

      await api.create<Product>("products", productData);
      toast({
        title: "Product Added",
        description: `${newProduct.name} has been added successfully.`,
      });
      setIsProductDialogOpen(false);
      setNewProduct({
        name: "",
        sku: "",
        barcode: "",
        category: "",
        warehouse: "",
        price: "",
        minQuantity: "",
        description: "",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error Adding Product",
        description:
          error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!canAddCategories) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add categories",
        variant: "destructive",
      });
      return;
    }

    if (!newCategory.trim()) return;

    setSubmitting(true);
    try {
      const categoryData = { name: newCategory.trim() };
      await api.create<Category>("categories", categoryData);

      toast({
        title: "Category Added",
        description: `${newCategory} has been added successfully.`,
      });
      setIsCategoryDialogOpen(false);
      setNewCategory("");
      loadData();
    } catch (error) {
      toast({
        title: "Error Adding Category",
        description:
          error instanceof Error ? error.message : "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!hasPermission(["admin", "manager"])) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete products",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.remove("products", id);
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error Deleting Product",
        description:
          error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (product: Product) => {
    return (
      <Badge variant="default" className="bg-success text-success-foreground">
        Available
      </Badge>
    );
  };

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
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and categories
          </p>
        </div>
        <div className="flex gap-2">
          {canAddCategories && (
            <Dialog
              open={isCategoryDialogOpen}
              onOpenChange={setIsCategoryDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Enter the name of the new category
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Electronics"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCategoryDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Category"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {canAddProducts && (
            <Dialog
              open={isProductDialogOpen}
              onOpenChange={setIsProductDialogOpen}
            >
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
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        placeholder="MacBook Pro 16 inch"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={newProduct.sku}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, sku: e.target.value })
                        }
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
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            barcode: e.target.value,
                          })
                        }
                        placeholder="123456789012"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) =>
                          setNewProduct({ ...newProduct, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
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
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: e.target.value,
                          })
                        }
                        placeholder="299.99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minQuantity">Minimum Quantity</Label>
                      <Input
                        id="minQuantity"
                        type="number"
                        value={newProduct.minQuantity}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            minQuantity: e.target.value,
                          })
                        }
                        placeholder="10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      placeholder="Product description..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsProductDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddProduct} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
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
              <div className="text-2xl font-bold">0</div>
            </div>
            <p className="text-xs text-muted-foreground">Low Stock Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-destructive" />
              <div className="text-2xl font-bold">0</div>
            </div>
            <p className="text-xs text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-success" />
              <div className="text-2xl font-bold">
                $
                {products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Total Inventory Value
            </p>
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
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    {categories.find(
                      (c) =>
                        String(c._id) ===
                        (typeof product.category === "object" &&
                        product.category !== null
                          ? String((product.category as { _id: string })._id)
                          : String(product.category))
                    )?.name || "N/A"}
                  </TableCell>

                  <TableCell>${product.price.toLocaleString()}</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>{getStatusBadge(product)}</TableCell>
                  <TableCell className="text-muted-foreground">N/A</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {hasPermission(["admin", "manager"]) && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
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
  );
}
