import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import ManagerTest from './pages/ManagerTest.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
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
  Settings
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
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
        <Route
          path="/inventory"
          element={
            <PlaceholderPage
              title="Inventory"
              description="Inventory tracking, stock adjustments, and audit logs will be implemented in a later phase."
              icon={Boxes}
              phase="Phase 4"
            />
          }
        />
        <Route
          path="/iot"
          element={
            <PlaceholderPage
              title="IoT Monitor"
              description="Software-simulated sensor readings, device statuses, and telemetry streams will be implemented in a later phase."
              icon={RadioTower}
              phase="Phase 5"
            />
          }
        />
        <Route
          path="/alerts"
          element={
            <PlaceholderPage
              title="Alerts"
              description="Threshold-based stock alerts and real-time warning rules will be implemented in a later phase."
              icon={TriangleAlert}
              phase="Phase 6"
            />
          }
        />
        <Route
          path="/analytics"
          element={
            <PlaceholderPage
              title="Analytics"
              description="Inventory turnover rates and consumption analytics will be implemented in a later phase."
              icon={BarChart3}
              phase="Phase 7"
            />
          }
        />
        <Route
          path="/forecast"
          element={
            <PlaceholderPage
              title="Forecast"
              description="Stock depletion forecasting and predictive models will be implemented in a later phase."
              icon={TrendingDown}
              phase="Phase 7"
            />
          }
        />
        <Route
          path="/notifications"
          element={
            <PlaceholderPage
              title="Notifications"
              description="System notifications and alert distribution channels will be implemented in a later phase."
              icon={Bell}
              phase="Phase 6"
            />
          }
        />

        {/* Manager-Only Protected Routes */}
        <Route
          path="/restocking"
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <PlaceholderPage
                title="Restocking"
                description="Restock orders, reorder point automation, and replenishment requests will be implemented in a later phase."
                icon={ShoppingCart}
                phase="Phase 8"
                roleRequired="MANAGER"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <PlaceholderPage
                title="Suppliers"
                description="Supplier directory and vendor management will be implemented in a later phase."
                icon={Truck}
                phase="Phase 8"
                roleRequired="MANAGER"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <PlaceholderPage
                title="Settings"
                description="Store configurations and system thresholds will be implemented in a later phase."
                icon={Settings}
                phase="Phase 8"
                roleRequired="MANAGER"
              />
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
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
