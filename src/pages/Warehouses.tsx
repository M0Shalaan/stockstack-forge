import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Warehouse, MapPin, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data
const warehouses = [
  {
    id: 1,
    name: "Main Warehouse",
    code: "MW-001",
    address: "123 Industrial Blvd, Metro City, MC 12345",
    manager: "John Smith",
    phone: "+1 (555) 123-4567",
    email: "john.smith@company.com",
    capacity: 10000,
    currentStock: 7543,
    productsCount: 245,
    status: "Active",
  },
  {
    id: 2,
    name: "Electronics Store",
    code: "ES-002",
    address: "456 Tech Avenue, Digital District, DD 23456",
    manager: "Sarah Johnson",
    phone: "+1 (555) 234-5678",
    email: "sarah.johnson@company.com",
    capacity: 5000,
    currentStock: 3892,
    productsCount: 158,
    status: "Active",
  },
  {
    id: 3,
    name: "Branch A",
    code: "BA-003",
    address: "789 Commerce Street, Business Bay, BB 34567",
    manager: "Mike Davis",
    phone: "+1 (555) 345-6789",
    email: "mike.davis@company.com",
    capacity: 3000,
    currentStock: 1456,
    productsCount: 89,
    status: "Active",
  },
  {
    id: 4,
    name: "Overflow Storage",
    code: "OS-004",
    address: "321 Storage Lane, Warehouse District, WD 45678",
    manager: "Lisa Wilson",
    phone: "+1 (555) 456-7890",
    email: "lisa.wilson@company.com",
    capacity: 8000,
    currentStock: 234,
    productsCount: 12,
    status: "Low Activity",
  },
]

export default function Warehouses() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    code: "",
    address: "",
    manager: "",
    phone: "",
    email: "",
    capacity: "",
  })
  const { toast } = useToast()

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddWarehouse = () => {
    toast({
      title: "Warehouse Added",
      description: `${newWarehouse.name} has been added successfully.`,
    })
    setIsDialogOpen(false)
    setNewWarehouse({
      name: "",
      code: "",
      address: "",
      manager: "",
      phone: "",
      email: "",
      capacity: "",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>
      case "Low Activity":
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Low Activity</Badge>
      case "Inactive":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCapacityPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Warehouses</h1>
          <p className="text-muted-foreground">
            Manage your warehouse locations and storage capacity
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Warehouse</DialogTitle>
              <DialogDescription>
                Enter the details for the new warehouse location.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Warehouse Name</Label>
                  <Input
                    id="name"
                    value={newWarehouse.name}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                    placeholder="Main Warehouse"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Warehouse Code</Label>
                  <Input
                    id="code"
                    value={newWarehouse.code}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, code: e.target.value })}
                    placeholder="MW-001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newWarehouse.address}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                  placeholder="123 Industrial Blvd, Metro City, MC 12345"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager Name</Label>
                  <Input
                    id="manager"
                    value={newWarehouse.manager}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, manager: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newWarehouse.capacity}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: e.target.value })}
                    placeholder="10000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newWarehouse.phone}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newWarehouse.email}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, email: e.target.value })}
                    placeholder="manager@company.com"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWarehouse}>Add Warehouse</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">{warehouses.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Warehouses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-success" />
              <div className="text-2xl font-bold">
                {warehouses.filter(w => w.status === "Active").length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-warning" />
              <div className="text-2xl font-bold">
                {warehouses.reduce((sum, w) => sum + w.capacity, 0).toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Total Capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">
                {warehouses.reduce((sum, w) => sum + w.currentStock, 0).toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Current Stock</p>
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
                placeholder="Search warehouses by name, code, or manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Locations</CardTitle>
          <CardDescription>
            Complete list of all warehouse locations and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{warehouse.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {warehouse.code} • {warehouse.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{warehouse.manager}</div>
                      <div className="text-sm text-muted-foreground">{warehouse.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{warehouse.phone}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {warehouse.currentStock.toLocaleString()} / {warehouse.capacity.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getCapacityPercentage(warehouse.currentStock, warehouse.capacity)}% used
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{warehouse.productsCount} items</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(warehouse.status)}
                  </TableCell>
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