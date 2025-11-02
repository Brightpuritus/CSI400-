"use client";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataStoreProvider } from "./context/DataStore";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerOrders from "./pages/CustomerOrders";
import NewOrder from "./pages/NewOrder";
import Production from "./pages/Production";
import Delivery from "./pages/Delivery";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Stock from "./pages/Stock";
import "./App.css";

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function Home() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "customer") {
    return <Navigate to="/customer/orders" replace />;
  } else if (user.role === "employee") {
    return <Navigate to="/employee/production" replace />;
  } else if (user.role === "manager" || user.role === "admin") {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="app">
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute allowedRoles={["customer", "admin"]}>
              <CustomerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders/new"
          element={
            <ProtectedRoute allowedRoles={["customer", "admin"]}>
              <NewOrder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/production"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin"]}>
              <Production />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/delivery"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin"]}>
              <Delivery />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/users"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/stock"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <Stock />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataStoreProvider>
          <AppContent />
        </DataStoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
