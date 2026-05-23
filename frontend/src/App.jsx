import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Signup from "./pages/Signup";
import ProductListingPage from "./pages/ProductListingPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<ProductListingPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;