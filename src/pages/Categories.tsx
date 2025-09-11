import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Package, Loader2, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api, apiConfig } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  })
  const { toast } = useToast()
  const { hasPermission } = useAuth()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
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
      const data = await api.list<Category>('categories')
      setCategories(data)
    } catch (error) {
      toast({
        title: "Error Loading Categories",
        description: error instanceof Error ? error.message : "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAddCategory = async () => {
    if (!hasPermission(['admin', 'manager'])) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add categories",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await api.create<Category>('categories', newCategory)
      toast({
        title: "Category Added",
        description: `${newCategory.name} has been added successfully.`,
      })
      setIsDialogOpen(false)
      setNewCategory({
        name: "",
        description: "",
      })
      loadCategories()
    } catch (error) {
      toast({
        title: "Error Adding Category",
        description: error instanceof Error ? error.message : "Failed to add category",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!hasPermission(['admin', 'manager'])) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete categories",
        variant: "destructive",
      })
      return
    }

    try {
      await api.remove('categories', id)
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully",
      })
      loadCategories()
    } catch (error) {
      toast({
        title: "Error Deleting Category",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* SEO Meta Tags */}
      <title>Categories - Inventory Management System</title>
      <meta 
        name="description" 
        content="Manage product categories in your inventory system. Organize and categorize products efficiently with our category management tools." 
      />
      <link rel="canonical" href="/app/categories" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">
            Organize your products with categories for better inventory management
          </p>
        </div>
        {hasPermission(['admin', 'manager']) && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category to organize your products.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Electronics, Clothing, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Category description..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
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
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">{categories.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-success" />
              <div className="text-2xl font-bold">N/A</div>
            </div>
            <p className="text-xs text-muted-foreground">Products Categorized</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-warning" />
              <div className="text-2xl font-bold">100%</div>
            </div>
            <p className="text-xs text-muted-foreground">Organization Rate</p>
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
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Categories</CardTitle>
          <CardDescription>
            Manage categories to organize your product inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-md">
                    {category.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">N/A products</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {hasPermission(['admin', 'manager']) && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCategory(category._id)}
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
  )
}