import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Warehouse, MapPin, Package, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api, apiConfig } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useCallback } from "react"

interface WarehouseType {
  _id: string;
  name: string;
  code: string;
  address: string;
  manager?: string;
  phone?: string;
  email?: string;
  capacity?: number;
}

export default function Warehouses() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
  const { hasPermission } = useAuth()


  const loadWarehouses = useCallback(async () => {
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
      const data = await api.list<WarehouseType>('warehouses')
      setWarehouses(data)
    } catch (error) {
      toast({
        title: "Error Loading Warehouses",
        description: error instanceof Error ? error.message : "Failed to load warehouses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadWarehouses()
  }, [loadWarehouses])

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (warehouse.manager && warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAddWarehouse = async () => {
    if (!hasPermission(['admin', 'manager'])) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add warehouses",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const warehouseData = {
        ...newWarehouse,
        capacity: parseInt(newWarehouse.capacity) || undefined,
      }
      
      await api.create<WarehouseType>('warehouses', warehouseData)
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
      loadWarehouses() // Reload warehouses
    } catch (error) {
      toast({
        title: "Error Adding Warehouse",
        description: error instanceof Error ? error.message : "Failed to add warehouse",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteWarehouse = async (id: string) => {
    if (!hasPermission(['admin', 'manager'])) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete warehouses",
        variant: "destructive",
      })
      return
    }

    try {
      await api.remove('warehouses', id)
      toast({
        title: "Warehouse Deleted",
        description: "Warehouse has been deleted successfully",
      })
      loadWarehouses()
    } catch (error) {
      toast({
        title: "Error Deleting Warehouse",
        description: error instanceof Error ? error.message : "Failed to delete warehouse",
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Warehouses</h1>
          <p className="text-muted-foreground">
            Manage your warehouse locations and storage capacity
          </p>
        </div>
        {hasPermission(['admin', 'manager']) && (
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleAddWarehouse} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Warehouse"
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
              <div className="text-2xl font-bold">{warehouses.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-warning" />
              <div className="text-2xl font-bold">
                {warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0).toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Total Capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">N/A</div>
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
                <TableRow key={warehouse._id}>
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
                      <div className="font-medium">{warehouse.manager || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{warehouse.email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{warehouse.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        N/A / {warehouse.capacity?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Capacity available
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">N/A items</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>
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
                            onClick={() => handleDeleteWarehouse(warehouse._id)}
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