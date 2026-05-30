import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Star,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  Package,
  LogOut,
  MessageSquare,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

function SellerReviewsPage() {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {

    try {

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      const sellerId =
        user?.seller_id || user?.user_id;

      const res = await axios.get(
        `http://127.0.0.1:8000/seller-product-sentiment/${sellerId}`
      );

      if (res.data.success) {

        setProducts(
          res.data.products || []
        );

      }

    } catch (err) {

      console.log(err);
      alert("Failed to load review analytics");

    }

  };

  const handleLogout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.href = "/login";

  };

  return (

    <div style={styles.page}>

      {/* SIDEBAR */}

      <div style={styles.sidebar}>

        <h1 style={styles.logo}>
          EasyCart
        </h1>

        <div style={styles.menuContainer}>

          <button style={styles.menuButton}
            onClick={() => window.location.href = "/seller-dashboard" }>
            <TrendingUp size={20} />
            Dashboard
          </button>

          <button style={styles.menuButton}
            onClick={() => window.location.href = "/seller-orders"}>
            <ShoppingBag size={20} />
            Orders
          </button>

          <button 
            style={styles.menuButton}
            onClick={() => window.location.href = "/seller-Products"}>
            <Package size={20} />
            Products
          </button>

          <button style={styles.menuButton}
            onClick={() => window.location.href = "/seller-returns"}>
            <RotateCcw size={20} />
            Returns
          </button>

          <button style={styles.activeMenu}>
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

      {/* MAIN */}

      <div style={styles.main}>

        <h1 style={styles.heading}>
          Review Analytics
        </h1>

        <p style={styles.subHeading}>
          Product-wise customer sentiment analysis
        </p>

        <div style={styles.grid}>

          {products.map((item, index) => (

            <div
              key={index}
              style={styles.card}
            >

              {/* IMAGE */}

              <img
                src={item.image_url}
                alt={item.product_name}
                style={styles.image}
              />

              {/* PRODUCT */}

              <h2 style={styles.productName}>
                {item.product_name}
              </h2>

              {/* RATING */}

              <div style={styles.ratingRow}>

                <Star
                  size={18}
                  fill="#FFD700"
                  color="#FFD700"
                />

                <span style={styles.ratingText}>
                  {item.avg_rating}
                </span>

              </div>

              {/* TOTAL REVIEWS */}

              <p style={styles.totalReviews}>
                {item.total_reviews}
                {" "}
                Reviews
              </p>

              {/* POSITIVE */}

              <div style={styles.sentimentRow}>

                <div style={styles.sentimentLabel}>
                  <Smile
                    size={16}
                    color="#16a34a"
                  />

                  Positive
                </div>

                <div style={styles.percent}>
                  {item.positive_percent}%
                </div>

              </div>

              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.positiveFill,
                    width:
                      `${item.positive_percent}%`
                  }}
                />
              </div>

              {/* NEUTRAL */}

              <div style={styles.sentimentRow}>

                <div style={styles.sentimentLabel}>
                  <Meh
                    size={16}
                    color="#f59e0b"
                  />

                  Neutral
                </div>

                <div style={styles.percent}>
                  {item.neutral_percent}%
                </div>

              </div>

              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.neutralFill,
                    width:
                      `${item.neutral_percent}%`
                  }}
                />
              </div>

              {/* NEGATIVE */}

              <div style={styles.sentimentRow}>

                <div style={styles.sentimentLabel}>
                  <Frown
                    size={16}
                    color="#dc2626"
                  />

                  Negative
                </div>

                <div style={styles.percent}>
                  {item.negative_percent}%
                </div>

              </div>

              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.negativeFill,
                    width:
                      `${item.negative_percent}%`
                  }}
                />
              </div>

              {/* POSITIVE REVIEWS */}

              <div style={styles.reviewSection}>

                <h3 style={styles.reviewHeading}>
                  Positive Reviews
                </h3>

                {item.positive_reviews_list?.length > 0 ? (

                  item.positive_reviews_list.map((review, idx) => (

                    <div
                      key={idx}
                      style={styles.positiveReviewCard}
                    >

                      <p style={styles.reviewText}>
                        "{review.review_text}"
                      </p>

                      <div style={styles.reviewFooter}>

                        <span>
                          ⭐ {review.rating}
                        </span>

                        <span>
                          Score: {review.sentiment_score}
                        </span>

                      </div>

                    </div>

                  ))

                ) : (

                  <p style={styles.noReviewText}>
                    No positive reviews
                  </p>

                )}

              </div>

              {/* NEGATIVE REVIEWS */}

              <div style={styles.reviewSection}>

                <h3 style={styles.reviewHeading}>
                  Negative Reviews
                </h3>

                {item.negative_reviews_list?.length > 0 ? (

                  item.negative_reviews_list.map((review, idx) => (

                    <div
                      key={idx}
                      style={styles.negativeReviewCard}
                    >

                      <p style={styles.reviewText}>
                        "{review.review_text}"
                      </p>

                      <div style={styles.reviewFooter}>

                        <span>
                          ⭐ {review.rating}
                        </span>

                        <span>
                          Score: {review.sentiment_score}
                        </span>

                      </div>

                    </div>

                  ))

                ) : (

                  <p style={styles.noReviewText}>
                    No negative reviews
                  </p>

                )}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

const styles = {

  page: {
    display: "flex",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#120008,#3d0012,#6d001f)",
    color: "white",
    fontFamily: "Poppins, sans-serif",
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

  logo: {
    fontSize: "34px",
    fontWeight: "700",
    marginBottom: "40px",
  },

  menuContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
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
    gap: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  menuButton: {
    padding: "16px",
    borderRadius: "16px",
    border:
      "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "10px",
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
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },

  main: {
    flex: 1,
    padding: "35px",
  },

  heading: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  subHeading: {
    color: "#f3c7d2",
    marginBottom: "35px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(350px,1fr))",
    gap: "25px",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "22px",
    borderRadius: "24px",
    backdropFilter: "blur(10px)",
  },

  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "18px",
    marginBottom: "20px",
  },

  productName: {
    fontSize: "24px",
    marginBottom: "14px",
  },

  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },

  ratingText: {
    fontSize: "18px",
    fontWeight: "600",
  },

  totalReviews: {
    color: "#f3c7d2",
    marginBottom: "25px",
  },

  sentimentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  sentimentLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "500",
  },

  percent: {
    fontWeight: "700",
  },

  progressBar: {
    width: "100%",
    height: "10px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginBottom: "20px",
  },

  positiveFill: {
    height: "100%",
    background: "#16a34a",
    borderRadius: "30px",
  },

  neutralFill: {
    height: "100%",
    background: "#f59e0b",
    borderRadius: "30px",
  },

  negativeFill: {
    height: "100%",
    background: "#dc2626",
    borderRadius: "30px",
  },

  reviewSection: {
    marginTop: "25px",
  },

  reviewHeading: {
    fontSize: "18px",
    marginBottom: "14px",
    color: "#ffffff",
  },

  positiveReviewCard: {
    background: "rgba(22,163,74,0.15)",
    border: "1px solid rgba(22,163,74,0.3)",
    padding: "14px",
    borderRadius: "16px",
    marginBottom: "12px",
  },

  negativeReviewCard: {
    background: "rgba(220,38,38,0.15)",
    border: "1px solid rgba(220,38,38,0.3)",
    padding: "14px",
    borderRadius: "16px",
    marginBottom: "12px",
  },

  reviewText: {
    fontSize: "14px",
    lineHeight: "24px",
    marginBottom: "10px",
    color: "#fff",
  },

  reviewFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#f3c7d2",
  },

  noReviewText: {
    color: "#f3c7d2",
    fontSize: "14px",
  },

};

export default SellerReviewsPage;