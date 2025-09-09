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
import { Plus, Search, Eye, ShoppingCart, TrendingUp, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data
const transactions = [
  {
    id: "TXN-001",
    date: "2024-01-15",
    type: "Sale",
    reference: "SO-2024-001",
    warehouse: "Main Warehouse",
    contact: "ABC Electronics Store",
    items: [
      { name: "MacBook Pro 16\"", quantity: 2, price: 1999.99 },
      { name: "iPhone 15 Pro", quantity: 1, price: 999.99 },
    ],
    total: 4999.97,
    status: "Completed",
    notes: "Rush order for corporate client",
  },
  {
    id: "TXN-002",
    date: "2024-01-14",
    type: "Purchase",
    reference: "PO-2024-002",
    warehouse: "Main Warehouse",
    contact: "Apple Supplier Inc",
    items: [
      { name: "iPhone 15 Pro", quantity: 50, price: 750.00 },
      { name: "iPad Air", quantity: 25, price: 450.00 },
    ],
    total: 48750.00,
    status: "Completed",
    notes: "Monthly inventory restock",
  },
  {
    id: "TXN-003",
    date: "2024-01-13",
    type: "Transfer",
    reference: "TR-2024-003",
    warehouse: "Main Warehouse → Branch A",
    contact: "-",
    items: [
      { name: "Samsung Galaxy S24", quantity: 10, price: 0 },
      { name: "Galaxy Watch", quantity: 5, price: 0 },
    ],
    total: 0,
    status: "In Transit",
    notes: "Stock redistribution",
  },
  {
    id: "TXN-004",
    date: "2024-01-12",
    type: "Sale",
    reference: "SO-2024-004",
    warehouse: "Electronics Store",
    contact: "Tech Solutions Ltd",
    items: [
      { name: "Dell XPS 13", quantity: 3, price: 1099.99 },
    ],
    total: 3299.97,
    status: "Completed",
    notes: "Bulk order discount applied",
  },
]

const transactionTypes = ["Sale", "Purchase", "Transfer"]
const warehouses = ["Main Warehouse", "Electronics Store", "Branch A", "Branch B"]

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    type: "",
    warehouse: "",
    contact: "",
    notes: "",
  })
  const { toast } = useToast()

  const filteredTransactions = transactions.filter(transaction =>
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.contact.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddTransaction = () => {
    toast({
      title: "Transaction Created",
      description: `New ${newTransaction.type.toLowerCase()} transaction has been created.`,
    })
    setIsDialogOpen(false)
    setNewTransaction({
      type: "",
      warehouse: "",
      contact: "",
      notes: "",
    })
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "Sale":
        return <Badge variant="default" className="bg-success text-success-foreground">Sale</Badge>
      case "Purchase":
        return <Badge variant="secondary" className="bg-primary text-primary-foreground">Purchase</Badge>
      case "Transfer":
        return <Badge variant="outline">Transfer</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>
      case "In Transit":
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">In Transit</Badge>
      case "Pending":
        return <Badge variant="outline">Pending</Badge>
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalSales = transactions.filter(t => t.type === "Sale").reduce((sum, t) => sum + t.total, 0)
  const totalPurchases = transactions.filter(t => t.type === "Purchase").reduce((sum, t) => sum + t.total, 0)
  const totalTransfers = transactions.filter(t => t.type === "Transfer").length

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
                    value={newTransaction.warehouse}
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, warehouse: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse} value={warehouse}>
                          {warehouse}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">
                  {newTransaction.type === "Sale" ? "Customer" : 
                   newTransaction.type === "Purchase" ? "Supplier" : "Destination"}
                </Label>
                <Input
                  id="contact"
                  value={newTransaction.contact}
                  onChange={(e) => setNewTransaction({ ...newTransaction, contact: e.target.value })}
                  placeholder={
                    newTransaction.type === "Sale" ? "Customer name" :
                    newTransaction.type === "Purchase" ? "Supplier name" : "Destination warehouse"
                  }
                />
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction}>Create Transaction</Button>
            </div>
          </DialogContent>
        </Dialog>
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
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.id}</div>
                      <div className="text-sm text-muted-foreground">{transaction.reference}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getTransactionBadge(transaction.type)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{transaction.warehouse}</TableCell>
                  <TableCell className="text-muted-foreground">{transaction.contact}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.items.length} items</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.total > 0 ? `$${transaction.total.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
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