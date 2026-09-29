import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Inventory from './pages/Inventory.jsx';
import InventoryHistory from './pages/InventoryHistory.jsx';
import Alerts from './pages/Alerts.jsx';
import AlertDetails from './pages/AlertDetails.jsx';
import IotMonitor from './pages/IotMonitor.jsx';
import Notifications from './pages/Notifications.jsx';
import Analytics from './pages/Analytics.jsx';
import Forecast from './pages/Forecast.jsx';
import Restocking from './pages/Restocking.jsx';
import Suppliers from './pages/Suppliers.jsx';
import SupplierDetails from './pages/SupplierDetails.jsx';
import ManagerTest from './pages/ManagerTest.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import Settings from './pages/Settings.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import {
  Package,
  Boxes,
  RadioTower,
  TriangleAlert,
  BarChart3,
  TrendingDown,
  ShoppingCart,
  Truck,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';

/**
 * Public route wrapper: redirects already authenticated users to /dashboard.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing page at root */}
      <Route path="/" element={<Landing />} />

      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes inside AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* General Protected Routes (Staff & Manager) */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/history" element={<InventoryHistory />} />
        <Route path="/iot" element={<IotMonitor />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/alerts/:id" element={<AlertDetails />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/restocking" element={<Restocking />} />
        <Route path="/restocking/:id" element={<Restocking />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/suppliers/:id" element={<SupplierDetails />} />

        {/* Protected Settings Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-test"
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <ManagerTest />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
