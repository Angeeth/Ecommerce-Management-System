import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Signup from "./pages/Signup";
import ProductListingPage from "./pages/ProductListingPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import SellerOrdersPage from "./pages/SellerOrdersPage";
import SellerReturnsPage from "./pages/SellerReturnsPage";


function App() {

  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  const role = user?.role?.trim()?.toLowerCase();

  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={
            user ? (
              role === "seller" ? (
                <Navigate to="/seller-dashboard" replace />
              ) : (
                <Navigate to="/products" replace />
              )
            ) : (
              <HomePage />
            )
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            user ? (
              role === "seller" ? (
                <Navigate to="/seller-dashboard" replace />
              ) : (
                <Navigate to="/products" replace />
              )
            ) : (
              <LoginPage setUser={setUser} />
            )
          }
        />

        {/* SIGNUP */}
        <Route path="/signup" element={<Signup />} />

        {/* CUSTOMER ROUTES */}
        <Route
          path="/products"
          element={
            role !== "seller" ? (
              <ProductListingPage />
            ) : (
              <Navigate to="/seller-dashboard" replace />
            )
          }
        />

        <Route
          path="/product/:id"
          element={
            role !== "seller" ? (
              <ProductDetailsPage />
            ) : (
              <Navigate to="/seller-dashboard" replace />
            )
          }
        />

        <Route
          path="/cart"
          element={
            role !== "seller" ? (
              <CartPage />
            ) : (
              <Navigate to="/seller-dashboard" replace />
            )
          }
        />

        <Route
          path="/checkout"
          element={
            role !== "seller" ? (
              <CheckoutPage />
            ) : (
              <Navigate to="/seller-dashboard" replace />
            )
          }
        />

        <Route
          path="/orders"
          element={
            role !== "seller" ? (
              <OrdersPage />
            ) : (
              <Navigate to="/seller-dashboard" replace />
            )
          }
        />

        <Route
          path="/wishlist"
          element={
            role !== "seller" ? (
              <WishlistPage />
            ) : (
              <Navigate to="/seller-dashboard" replace />
            )
          }
        />

        {/* SELLER ROUTES */}
        <Route
          path="/seller-dashboard"
          element={
            role === "seller" ? (
              <SellerDashboard />
            ) : (
              <Navigate to="/products" replace />
            )
          }
        />

        <Route
          path="/seller-products"
          element={
            role === "seller" ? (
              <SellerProducts />
            ) : (
              <Navigate to="/products" replace />
            )
          }
        />

        <Route
          path="/seller-orders"
          element={
            role === "seller" ? (
              <SellerOrdersPage />
            ) : (
              <Navigate to="/products" replace />
            )
          }
        />

        <Route
          path="/seller-Returns"
          element={
            role === "seller" ? (
              <SellerReturnsPage />
            ) : (
              <Navigate to="/products" replace />
            )
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;