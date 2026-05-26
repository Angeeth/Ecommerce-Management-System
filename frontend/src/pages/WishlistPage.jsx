import React, { useEffect, useState } from "react";
import axios from "axios";

function WishlistPage() {

  const [wishlistItems, setWishlistItems] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  // FETCH WISHLIST
  const fetchWishlist = async () => {

    try {

      const response = await axios.get(
        `http://127.0.0.1:8000/wishlist/${user.user_id}`
      );

      console.log(response.data);

      setWishlistItems(response.data || []);

    } catch (error) {

      console.log(error);

    }
  };

  useEffect(() => {

    if (!user) {

      window.location.href = "/login";
      return;

    }

    fetchWishlist();

  }, []);

  // REMOVE ITEM
  const removeItem = async (wishlistItemId) => {

    try {

      await axios.delete(
        `http://127.0.0.1:8000/wishlist/remove/${wishlistItemId}`
      );

      setWishlistItems((prev) =>
        prev.filter(
          (item) =>
            item.wishlist_item_id !== wishlistItemId
        )
      );

    } catch (error) {

      console.log(error);

      alert("Failed To Remove Item");

    }
  };

  return (

    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>

        <button
          style={styles.backBtn}
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        <div style={styles.titleContainer}>
          <p style={styles.tagline}>
            Your Wishlist
          </p>
        </div>

      </div>

      {/* ITEMS */}
      <div style={styles.container}>

        {
          wishlistItems.length === 0 ? (

            <div style={styles.emptyWishlist}>

              <h2>
                Your Wishlist Is Empty
              </h2>

              <p>
                Save Products You Love Here
              </p>

            </div>

          ) : (

            wishlistItems.map((item) => (

              <div
                key={item.wishlist_item_id}
                style={styles.card}
              >

                {/* IMAGE */}
                <img
                  src={`http://127.0.0.1:8000/product_img/${item.image_url}`}
                  alt={item.product_name}
                  style={styles.image}
                />

                {/* INFO */}
                <div style={styles.info}>

                  <p style={styles.category}>
                    WISHLIST PRODUCT
                  </p>

                  <h2 style={styles.name}>
                    {item.product_name}
                  </h2>

                  <h3 style={styles.price}>
                    ₹ {item.price}
                  </h3>

                </div>

                {/* REMOVE */}
                <button
                  style={styles.removeButton}
                  onClick={() =>
                    removeItem(item.wishlist_item_id)
                  }
                >
                  Remove
                </button>

              </div>

            ))

          )
        }

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

  container: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  card: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    borderRadius: "22px",
    padding: "20px",
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

  emptyWishlist: {
    background: "rgba(255,255,255,0.08)",
    padding: "60px",
    borderRadius: "25px",
    textAlign: "center",
    color: "white",
  },
};

export default WishlistPage;