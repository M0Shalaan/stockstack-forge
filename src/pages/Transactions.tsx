import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Eye, ShoppingCart, TrendingUp, ArrowUpDown, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api, apiConfig } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface Transaction {
  _id: string;
  type: 'sale' | 'purchase' | 'transfer';
  productId: string;
  warehouseId: string;
  quantity: number;
  price?: number;
  notes?: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
}

interface Warehouse {
  _id: string;
  name: string;
  code: string;
}

const transactionTypes = ["sale", "purchase", "transfer"]

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    type: "",
    productId: "",
    warehouseId: "",
    quantity: "",
    price: "",
    notes: "",
  })
  const { toast } = useToast()
  const { hasPermission } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
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
      const [transactionsData, productsData, warehousesData] = await Promise.all([
        api.list<Transaction>('transactions'),
        api.list<Product>('products'),
        api.list<Warehouse>('warehouses')
      ])
      setTransactions(transactionsData)
      setProducts(productsData)
      setWarehouses(warehousesData)
    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: error instanceof Error ? error.message : "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const product = products.find(p => p._id === transaction.productId)
    const warehouse = warehouses.find(w => w._id === transaction.warehouseId)
    
    return (
      transaction._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleAddTransaction = async () => {
    if (!hasPermission(['admin', 'manager'])) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create transactions",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const transactionData = {
        type: newTransaction.type,
        productId: newTransaction.productId,
        warehouseId: newTransaction.warehouseId,
        quantity: parseInt(newTransaction.quantity) || 0,
        price: parseFloat(newTransaction.price) || undefined,
        notes: newTransaction.notes,
      }
      
      await api.create<Transaction>('transactions', transactionData)
      toast({
        title: "Transaction Created",
        description: `New ${newTransaction.type} transaction has been created.`,
      })
      setIsDialogOpen(false)
      setNewTransaction({
        type: "",
        productId: "",
        warehouseId: "",
        quantity: "",
        price: "",
        notes: "",
      })
      loadData() // Reload data
    } catch (error) {
      toast({
        title: "Error Creating Transaction",
        description: error instanceof Error ? error.message : "Failed to create transaction",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "sale":
        return <Badge variant="default" className="bg-success text-success-foreground">Sale</Badge>
      case "purchase":
        return <Badge variant="secondary" className="bg-primary text-primary-foreground">Purchase</Badge>
      case "transfer":
        return <Badge variant="outline">Transfer</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const totalSales = transactions.filter(t => t.type === "sale").reduce((sum, t) => sum + (t.price || 0) * t.quantity, 0)
  const totalPurchases = transactions.filter(t => t.type === "purchase").reduce((sum, t) => sum + (t.price || 0) * t.quantity, 0)
  const totalTransfers = transactions.filter(t => t.type === "transfer").length

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            Track all inventory movements, sales, purchases, and transfers
          </p>
        </div>
        {hasPermission(['admin', 'manager']) && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Transaction
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>
                Start a new inventory transaction (Sale, Purchase, or Transfer).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Select
                    value={newTransaction.warehouseId}
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, warehouseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse._id} value={warehouse._id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={newTransaction.productId}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newTransaction.quantity}
                    onChange={(e) => setNewTransaction({ ...newTransaction, quantity: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Unit ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newTransaction.price}
                    onChange={(e) => setNewTransaction({ ...newTransaction, price: e.target.value })}
                    placeholder="99.99"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                  placeholder="Transaction notes or comments..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Transaction"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">${totalPurchases.toLocaleString()}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-warning" />
              <div className="text-2xl font-bold">{totalTransfers}</div>
            </div>
            <p className="text-xs text-muted-foreground">Transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{transactions.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
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
                placeholder="Search transactions by ID, reference, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Complete record of all inventory transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => {
                const product = products.find(p => p._id === transaction.productId)
                const warehouse = warehouses.find(w => w._id === transaction.warehouseId)
                const total = transaction.price ? transaction.price * transaction.quantity : 0
                
                return (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction._id}</div>
                        <div className="text-sm text-muted-foreground">ID: {transaction._id.slice(-8)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getTransactionBadge(transaction.type)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{warehouse?.name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{product?.name || 'Unknown Product'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Qty: {transaction.quantity}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {total > 0 ? `$${total.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}