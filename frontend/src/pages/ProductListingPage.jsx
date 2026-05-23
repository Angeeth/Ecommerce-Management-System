import React, { useEffect, useState } from "react";
import axios from "axios";

function ProductListingPage() {

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");

  // FETCH PRODUCTS 
  useEffect(() => {

    let url = "http://127.0.0.1:8000/products";

    if (category !== "All") {
      url += `?category_id=${category}`;
    }

    axios.get(url)
      .then((response) => {
        setProducts(response.data || []);
      })
      .catch((error) => {
        console.log("API Error:", error);
        setProducts([]);
      });

  }, [category]);

  // SEARCH FILTER
  let filteredProducts = products.filter((product) =>
    product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // SORT
  if (sort === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sort === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.logo}>EasyCart</h1>
          <p style={styles.tagline}>Buy Better. Sell Smarter.</p>
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button style={styles.cartButton}>Cart</button>

          <button
            style={{
              ...styles.cartButton,
              background: "linear-gradient(135deg, #5e0017, #8b0026)"
            }}
            onClick={() => window.location.href = "/login"}
          >
            Login
          </button>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div style={styles.filterSection}>

        <input
          type="text"
          placeholder="Search products..."
          style={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CATEGORY DROPDOWN */}
        <select
          style={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="1">Clothing</option>
          <option value="2">Footwear</option>
          <option value="3">Electronics</option>
          <option value="4">Furniture</option>
          <option value="5">Sports</option>
          <option value="6">Accessories</option>
          <option value="7">Home Appliances</option>
          <option value="8">Bags</option>
        </select>

        {/* SORT */}
        <select
          style={styles.select}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>

      </div>

      {/* PRODUCTS GRID */}
      <div style={styles.grid}>

        {filteredProducts.map((product) => (
          <div
            key={product.product_id}
            style={styles.card}
            onClick={() => window.location.href = `/product/${product.product_id}`}
          >

            <img
              src={`http://127.0.0.1:8000/product_img/${product.image_url}`}
              alt={product.name}
              style={styles.image}
            />

            <div style={styles.cardContent}>

              <p style={styles.category}>
                Category ID: {product.category_id}
              </p>

              <h2 style={styles.productName}>
                {product.name}
              </h2>

              <div style={styles.row}>
                <h3 style={styles.price}>₹ {product.price}</h3>
                <span style={styles.rating}>⭐ 4.5</span>
              </div>

              <button style={styles.buyButton}>
                Add To Cart
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg, #1f0008, #4d0014, #7a001f)",
    fontFamily: "Poppins, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },

  logo: {
    color: "white",
    fontSize: "50px",
    margin: 0,
  },

  tagline: {
    color: "#f3c7d3",
    marginTop: "8px",
  },

  cartButton: {
    padding: "14px 30px",
    borderRadius: "15px",
    border: "none",
    background: "linear-gradient(135deg, #8b0026, #b3003c)",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
  },

  filterSection: {
    display: "flex",
    gap: "20px",
    marginBottom: "40px",
    flexWrap: "wrap",
  },

  searchInput: {
    flex: 1,
    minWidth: "250px",
    padding: "16px",
    borderRadius: "15px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    outline: "none",
    fontSize: "15px",
  },

  select: {
    padding: "16px",
    borderRadius: "15px",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.95)",
    color: "#1f0008",
    fontSize: "15px",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  },

  card: {
    borderRadius: "25px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
    cursor: "pointer"
  },

  image: {
    width: "100%",
    height: "260px",
    objectFit: "cover",
  },

  cardContent: {
    padding: "20px",
  },

  category: {
    color: "#f5c7d1",
    fontSize: "14px",
  },

  productName: {
    color: "white",
    fontSize: "25px",
    marginTop: "10px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
    marginBottom: "20px",
  },

  price: {
    color: "white",
    fontSize: "28px",
  },

  rating: {
    color: "#ffd166",
    fontWeight: "600",
  },

  buyButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "15px",
    background: "linear-gradient(135deg, #8b0026, #b3003c)",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default ProductListingPage;