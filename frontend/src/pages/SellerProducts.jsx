import { useEffect, useState } from "react";
import axios from "axios";

import {
  Package,
  ShoppingBag,
  RotateCcw,
  TrendingUp,
  LogOut,
  MessageSquare,
} from "lucide-react";

function SellerProducts() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const user_id = user?.user_id;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const seller = user || {};

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    brand: ""
  });

  const [images, setImages] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/seller-products/${user_id}`
      );
      setProducts(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchProducts();
      fetchCategories();
    }
  }, [user_id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    setImages(Array.from(e.target.files));
  };

const addProduct = async (e) => {
  e.preventDefault();

  if (images.length < 1) {
    alert("Please upload at least 1 image");
    return;
  }

  if (images.length > 3) {
    alert("Maximum 3 images allowed");
    return;
  }

  setLoading(true);

  try {
    const data = new FormData();
    data.append("user_id", user_id);

    Object.keys(form).forEach((k) => {
      data.append(k, form[k]);
    });

    images.slice(0, 3).forEach((img) => data.append("images", img));

    await axios.post("http://127.0.0.1:8000/add-product", data);

    setForm({
      category_id: "",
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      brand: ""
    });

    setImages([]);
    fetchProducts();

  } catch (err) {
    console.log(err);
  }

  setLoading(false);
};

  const toggleStatus = async (id) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/toggle-product-status/${id}`
      );
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  const updateStock = async (id, action) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/update-stock/${id}?action=${action}`
      );
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>

        <h1 style={styles.logo}>
          EasyCart
        </h1>

        <div style={styles.menuContainer}>

          <button
            style={styles.menuButton}
            onClick={() => window.location.href = "/seller-dashboard" }>
            <TrendingUp size={20} />
            Dashboard
          </button>

          <button
            style={styles.menuButton}
            onClick={() => window.location.href = "/seller-orders" }>
            <ShoppingBag size={20} />
            Orders
          </button>

          <button style={styles.activeMenu}>
            <Package size={20} />
            Products
          </button>

          <button
            style={styles.menuButton}
            onClick={() => window.location.href = "/seller-returns" }>
            <RotateCcw size={20} />
            Returns
          </button>

          <button style={styles.menuButton}
            onClick={() => window.location.href = "/seller-reviews"}>
            <MessageSquare size={20} />
            Reviews
          </button>

        </div>

        <button
          style={styles.logoutButton}
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>
      
      {/* MAIN CONTENT */}
      <div style={styles.main}>
        <h1 style={styles.title}>🛒 Seller Products</h1>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>➕ Add Product</h2>

          <form onSubmit={addProduct}>
            <div style={styles.grid}>
              
              {/* CATEGORY DROPDOWN */}
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product Name"
                style={styles.input}
              />

              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                style={styles.input}
              />

              <input
                name="stock_quantity"
                value={form.stock_quantity}
                onChange={handleChange}
                placeholder="Stock"
                style={styles.input}
              />

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Brand"
                style={styles.input}
              />
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              style={styles.textarea}
            />

            <input type="file" multiple onChange={handleImages} />

            <button style={styles.button} disabled={loading}>
              {loading ? "Adding..." : "Add Product"}
            </button>
          </form>
        </div>

        <div style={styles.productGrid}>
          {products.map((p) => {
            const isDisabled = p.product_status === "DISCONTINUED";

            return (
              <div
                key={p.product_id}
                style={{
                  ...styles.productCard,
                  opacity: isDisabled ? 0.4 : 1,
                  filter: isDisabled ? "grayscale(100%)" : "none"
                }}
              >
                <h3 style={{ color: "white" }}>{p.name}</h3>

                <p style={{ color: "#ddd" }}>{p.description}</p>

                <h4 style={{ color: "#ffcc70" }}>₹ {p.price}</h4>

                <p style={{ color: "#aaa" }}>Brand: {p.brand}</p>

                {/* IMAGES */}
                <div style={styles.imageRow}>
                  {p.images?.map((img, i) => (
                    <img key={i} src={img} style={styles.img} />
                  ))}
                </div>

                {/* STOCK CONTROLS */}
                <div style={styles.stockRow}>
                  <button
                    style={styles.smallBtn}
                    onClick={() => updateStock(p.product_id, "decrease")}
                    type="button"
                    disabled={isDisabled}
                  >
                    -
                  </button>

                  <span style={styles.stockCount}>
                    {p.stock_quantity}
                  </span>

                  <button
                    style={styles.smallBtn}
                    onClick={() => updateStock(p.product_id, "increase")}
                    type="button"
                    disabled={isDisabled}
                  >
                    +
                  </button>
                </div>

                {/* STATUS BUTTON */}
                <button
                  style={{
                    ...styles.toggleBtn,
                    background: isDisabled ? "green" : "orange"
                  }}
                  onClick={() => toggleStatus(p.product_id)}
                  type="button"
                >
                  {isDisabled ? "Activate" : "Discontinue"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {

  page: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1f0008, #4d0014, #7a001f)",
    fontFamily: "Poppins, sans-serif",
  },

  title: { color: "white", fontSize: "40px" },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "20px"
  },

  sectionTitle: { color: "white" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "10px"
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none"
  },

  textarea: {
    width: "100%",
    height: "80px",
    marginTop: "10px",
    borderRadius: "8px",
    padding: "10px"
  },

  button: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    background: "#8b0026",
    color: "white",
    border: "none",
    borderRadius: "8px"
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "15px"
  },

  productCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "15px",
    borderRadius: "15px"
  },

  imageRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px"
  },

  img: {
    width: "120px",
    height: "120px",
    borderRadius: "10px",
    objectFit: "cover"
  },

  stockRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px"
  },

  stockCount: {
    color: "white",
    fontWeight: "bold",
    minWidth: "40px",
    textAlign: "center"
  },

  smallBtn: {
    padding: "5px 12px",
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },

  sidebar: {
    width: "260px",
    background: "rgba(255,255,255,0.06)",
    padding: "30px 20px",
    display: "flex",
    flexDirection: "column",
    borderRight:
      "1px solid rgba(255,255,255,0.08)",
  },

  main: {
    flex: 1,
    padding: "30px",
  },

  logo: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "35px",
    color: "white",
  },

  profileCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "28px",
    textAlign: "center",
    marginBottom: "35px",
  },

  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    margin: "0 auto 18px",
    background: "linear-gradient(135deg,#8b0026,#ff2e63)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "700",
    color: "white",
  },

  shopName: {
    margin: 0,
    fontSize: "24px",
    color: "white",
  },

  email: {
    color: "#f3c7d2",
    marginTop: "8px",
    fontSize: "14px",
  },

  menuContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  activeMenu: {
    padding: "16px",
    borderRadius: "16px",
    border: "none",
    background:
      "linear-gradient(135deg,#8b0026,#d10048)",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  menuButton: {
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "16px",
    cursor: "pointer",
  },

  logoutButton: {
    marginTop: "auto",
    padding: "16px",
    borderRadius: "16px",
    border: "none",
    background:
      "linear-gradient(135deg,#ff2e63,#8b0026)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  toggleBtn: {
    marginTop: "10px",
    padding: "8px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default SellerProducts;