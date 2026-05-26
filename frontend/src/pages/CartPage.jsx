import React, { useEffect, useState } from "react";
import axios from "axios";

function CartPage() {

  const [cartItems, setCartItems] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  // GET CART ITEMS
  const fetchCart = async () => {

    try {

      const response = await axios.get(
        `http://127.0.0.1:8000/cart/${user.user_id}`
      );

      setCartItems(response.data || []);

    } catch (error) {

      console.log(error);

    }
  };

  // LOAD CART
  useEffect(() => {

    if (!user) {

      window.location.href = "/login";

      return;
    }

    fetchCart();

  }, []);

  // REMOVE ITEM
  const removeItem = async (cartItemId) => {

    try {

      await axios.delete(
        `http://127.0.0.1:8000/cart/remove/${cartItemId}`
      );

      // DYNAMIC UPDATE
      setCartItems((prevItems) =>
        prevItems.filter(
          (item) =>
            item.cart_item_id !== cartItemId
        )
      );

    } catch (error) {

      console.log(error);

      alert("Failed To Remove Item");

    }
  };

  // TOTAL
  const total = cartItems.reduce(
    (sum, item) =>
      sum + (item.price * item.quantity),
    0
  );

  return (

    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>

        {/* BACK BUTTON */}
        <button
          style={styles.backBtn}
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        <div style={styles.titleContainer}>
          <p style={styles.tagline}>
            Your Shopping Cart
          </p>
        </div>

      </div>

      {/* MAIN CONTAINER */}
      <div style={styles.container}>

        {/* LEFT SECTION */}
        <div style={styles.leftSection}>

          {cartItems.length === 0 ? (

            <div style={styles.emptyCart}>

              <h2>
                Your Cart Is Empty
              </h2>

              <p>
                Add Products To Continue Shopping
              </p>

            </div>

          ) : (

            cartItems.map((item) => (

              <div
                key={item.cart_item_id}
                style={styles.card}
              >

                {/* IMAGE */}
                <img
                  src={`http://127.0.0.1:8000/product_img/${item.image_url}`}
                  alt={item.name}
                  style={styles.image}
                />

                {/* INFO */}
                <div style={styles.info}>

                  <p style={styles.category}>
                    PREMIUM PRODUCT
                  </p>

                  <h2 style={styles.name}>
                    {item.name}
                  </h2>

                  <h3 style={styles.price}>
                    ₹ {item.price}
                  </h3>

                  <p style={styles.quantity}>
                    Quantity: {item.quantity}
                  </p>

                </div>

                {/* REMOVE */}
                <button
                  style={styles.removeButton}
                  onClick={() =>
                    removeItem(item.cart_item_id)
                  }
                >
                  Remove
                </button>

              </div>

            ))

          )}

        </div>

        {/* RIGHT SUMMARY */}
        <div style={styles.summary}>

          <h2 style={styles.summaryTitle}>
            Order Summary
          </h2>

          <div style={styles.summaryRow}>

            <span>Total Items</span>

            <span>
              {cartItems.length}
            </span>

          </div>

          <div style={styles.summaryRow}>

            <span>Total Price</span>

            <span>
              ₹ {total}
            </span>

          </div>

          <button 
            style={styles.checkoutButton}
            onClick={() => {
              if (cartItems.length === 0) return;
              window.location.href = `/checkout?from=cart`;
            }}
          >
            Proceed To Checkout
          </button>

        </div>

      </div>

    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    padding: "30px",
    background:
      "linear-gradient(135deg, #1f0008, #4d0014, #7a001f)",
    fontFamily: "Poppins, sans-serif",
  },

  // HEADER
 header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "25px",
    marginBottom: "40px",
    flexWrap: "wrap",
 },

  backBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "white",
    fontWeight: "bold",
    fontSize: "16px",
  },

  titleContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "8px",
  },

  tagline: {
    color: "#f3c7d3",
    fontSize: "22px",
    margin: 0,
  },

  // MAIN CONTAINER
  container: {
    display: "flex",
    gap: "30px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  leftSection: {
    flex: 3,
    minWidth: "320px",
  },

  // PRODUCT CARD
  card: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    borderRadius: "22px",
    padding: "20px",
    marginBottom: "22px",
    border: "1px solid rgba(255,255,255,0.08)",
    flexWrap: "wrap",
  },

  image: {
    width: "180px",
    height: "180px",
    objectFit: "cover",
    borderRadius: "18px",
  },

  info: {
    flex: 1,
    minWidth: "220px",
  },

  category: {
    color: "#f3c7d3",
    fontSize: "13px",
    letterSpacing: "1px",
    marginBottom: "10px",
  },

  name: {
    color: "white",
    fontSize: "34px",
    marginBottom: "12px",
  },

  price: {
    color: "#ffd166",
    fontSize: "32px",
    marginBottom: "10px",
  },

  quantity: {
    color: "#eee",
    fontSize: "16px",
  },

  removeButton: {
    padding: "14px 22px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #8b0026, #b3003c)",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
    minWidth: "120px",
  },

  // SUMMARY
  summary: {
    flex: 1,
    minWidth: "320px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    borderRadius: "22px",
    padding: "30px",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "white",
    position: "sticky",
    top: "30px",
  },

  summaryTitle: {
    fontSize: "32px",
    marginBottom: "30px",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "22px",
    fontSize: "18px",
  },

  checkoutButton: {
    width: "100%",
    marginTop: "30px",
    padding: "18px",
    border: "none",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #8b0026, #b3003c)",
    color: "white",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  // EMPTY CART
  emptyCart: {
    background: "rgba(255,255,255,0.08)",
    padding: "60px",
    borderRadius: "25px",
    textAlign: "center",
    color: "white",
  },
};

export default CartPage;