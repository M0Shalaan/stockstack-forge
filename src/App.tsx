import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Warehouses from "./pages/Warehouses";
import Transactions from "./pages/Transactions";
import StockAlerts from "./pages/StockAlerts";
import { AppLayout } from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'staff']}>
                <Products />
              </ProtectedRoute>
            } />
            <Route path="categories" element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <Categories />
              </ProtectedRoute>
            } />
            <Route path="warehouses" element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <Warehouses />
              </ProtectedRoute>
            } />
            <Route path="transactions" element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <Transactions />
              </ProtectedRoute>
            } />
            <Route path="alerts" element={<StockAlerts />} />
            <Route path="settings" element={<Settings />} />
            <Route index element={<Dashboard />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
