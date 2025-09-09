import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const mainMenuItems = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/app/products", icon: Package },
  { title: "Warehouses", url: "/app/warehouses", icon: Warehouse },
  { title: "Transactions", url: "/app/transactions", icon: ShoppingCart },
  { title: "Stock Alerts", url: "/app/alerts", icon: AlertTriangle },
]

const businessItems = [
  { title: "Suppliers", url: "/app/suppliers", icon: Users },
  { title: "Customers", url: "/app/customers", icon: Users },
  { title: "Reports", url: "/app/reports", icon: FileText },
]

const systemItems = [
  { title: "Settings", url: "/app/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path || (path !== "/app" && currentPath.startsWith(path))
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-enterprise-sm" 
      : "hover:bg-accent hover:text-accent-foreground transition-colors"

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sidebar-foreground">IMS Pro</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
              <Package className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business Section */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Business</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Section */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>System</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}