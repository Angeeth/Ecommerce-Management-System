import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Package,
  ShoppingBag,
  RotateCcw,
  Truck,
  CheckCircle,
  Clock3,
  TrendingUp,
  LogOut,
} from "lucide-react";

function SellerOrdersPage() {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchOrders();

  }, []);

  const fetchOrders = async () => {

    try {

      setLoading(true);

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      const res = await axios.get(
        `http://127.0.0.1:8000/seller-orders/${user.user_id}`
      );

      setOrders(
        res.data.orders || []
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  const updateStatus = async (
    orderId,
    status
  ) => {

    try {

      // UPDATE TO SHIPPED
      await axios.put(
        "http://127.0.0.1:8000/seller-update-order",
        {
          order_id: orderId,
          order_status: status,
        }
      );

      // REFRESH UI
      fetchOrders();

      // AFTER 10 SEC
      if (status === "SHIPPED") {

        setTimeout(async () => {

          try {

            await axios.put(
              "http://127.0.0.1:8000/seller-update-order",
              {
                order_id: orderId,
                order_status:
                  "OUT_FOR_DELIVERY",
              }
            );

            fetchOrders();

          } catch (err) {

            console.log(
              "OUT_FOR_DELIVERY ERROR",
              err
            );
          }

        }, 10000);

        // AFTER 20 SEC
        setTimeout(async () => {

          try {

            await axios.put(
              "http://127.0.0.1:8000/seller-update-order",
              {
                order_id: orderId,
                order_status:
                  "DELIVERED",
              }
            );

            fetchOrders();

          } catch (err) {

            console.log(
              "DELIVERED ERROR",
              err
            );
          }

        }, 20000);
      }

    } catch (err) {

      console.log(err);

    }
  };

  const handleLogout = () => {

    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  const getStatusColor = (status) => {

    if (status === "PLACED") {
      return "#ff006e";
    }

    if (status === "SHIPPED") {
      return "#3b82f6";
    }

    if (status === "OUT_FOR_DELIVERY") {
      return "#f59e0b";
    }

    return "#16a34a";
  };

  const renderTimeline = (status) => {

    const steps = [
      "PLACED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    const currentIndex =
      steps.indexOf(status);

    return (

      <div style={styles.timelineWrapper}>

        {steps.map((step, index) => (

          <React.Fragment key={index}>

            <div style={styles.timelineItem}>

              <div
                style={{
                  ...styles.timelineDot,

                  background:
                    index <= currentIndex
                      ? "#16a34a"
                      : "rgba(255,255,255,0.2)",
                }}
              />

              <p style={styles.timelineText}>
                {step.replaceAll("_", " ")}
              </p>

            </div>

            {index !== steps.length - 1 && (

              <div
                style={{
                  ...styles.timelineLine,

                  background:
                    index < currentIndex
                      ? "#16a34a"
                      : "rgba(255,255,255,0.2)",
                }}
              />

            )}

          </React.Fragment>

        ))}

      </div>
    );
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
            onClick={() => window.location.href = "/seller-dashboard"
            }
          >
            <TrendingUp size={20} />
            Dashboard
          </button>

          <button style={styles.activeMenu}>
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
          Seller Orders
        </h1>

        <p style={styles.subHeading}>
          Manage shipped and delivered orders
        </p>

        {/* STATS */}
        <div style={styles.statsGrid}>

          <div style={styles.statsCard}>

            <Clock3 size={28} />

            <h2>
              {
                orders.filter(
                  (o) =>
                    o.order_status ===
                    "PLACED"
                ).length
              }
            </h2>

            <p>Placed</p>

          </div>

          <div style={styles.statsCard}>

            <Truck size={28} />

            <h2>
              {
                orders.filter(
                  (o) =>
                    o.order_status ===
                    "SHIPPED"
                ).length
              }
            </h2>

            <p>Shipped</p>

          </div>

          <div style={styles.statsCard}>

            <Package size={28} />

            <h2>
              {
                orders.filter(
                  (o) =>
                    o.order_status ===
                    "OUT_FOR_DELIVERY"
                ).length
              }
            </h2>

            <p>Out For Delivery</p>

          </div>

          <div style={styles.statsCard}>

            <CheckCircle size={28} />

            <h2>
              {
                orders.filter(
                  (o) =>
                    o.order_status ===
                    "DELIVERED"
                ).length
              }
            </h2>

            <p>Delivered</p>

          </div>

        </div>

        {/* ORDERS */}
        <div style={styles.ordersContainer}>

          {loading ? (

            <div style={styles.emptyBox}>
              Loading Orders...
            </div>

          ) : orders.length > 0 ? (

            orders.map((order, index) => (

              <div
                key={index}
                style={styles.orderCard}
              >

                {/* IMAGE */}
                <img
                  src={`http://127.0.0.1:8000/product_img/${order.image_url}`}
                  alt=""
                  style={styles.image}
                />

                {/* DETAILS */}
                <div style={styles.details}>

                  <div style={styles.topRow}>

                    <div>

                      <h2 style={styles.productName}>
                        {order.product_name}
                      </h2>

                      <p style={styles.orderId}>
                        Order ID:
                        {" "}
                        #{order.order_id}
                      </p>

                    </div>

                    <div
                      style={{
                        ...styles.statusBadge,
                        background:
                          getStatusColor(
                            order.order_status
                          ),
                      }}
                    >
                      {order.order_status}
                    </div>

                  </div>

                  <div style={styles.infoGrid}>

                    <div style={styles.infoCard}>

                      <p style={styles.label}>
                        Customer
                      </p>

                      <h3 style={styles.value}>
                        {order.username}
                      </h3>

                    </div>

                    <div style={styles.infoCard}>

                      <p style={styles.label}>
                        Quantity
                      </p>

                      <h3 style={styles.value}>
                        {order.quantity}
                      </h3>

                    </div>

                    <div style={styles.infoCard}>

                      <p style={styles.label}>
                        Amount
                      </p>

                      <h3 style={styles.value}>
                        ₹{order.subtotal}
                      </h3>

                    </div>

                  </div>

                  {renderTimeline(
                    order.order_status
                  )}

                  {/* BUTTON */}
                  {order.order_status ===
                    "PLACED" && (

                    <button
                      style={styles.shipButton}
                      onClick={() =>
                        updateStatus(
                          order.order_id,
                          "SHIPPED"
                        )
                      }
                    >
                      Mark As Shipped
                    </button>

                  )}

                </div>

              </div>

            ))

          ) : (

            <div style={styles.emptyBox}>
              No Orders Found
            </div>

          )}

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
  },

  subHeading: {
    color: "#f3c7d2",
    marginBottom: "30px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px",
    marginBottom: "30px",
  },

  statsCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "22px",
  },

  ordersContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  orderCard: {
    display: "flex",
    gap: "25px",
    background: "rgba(255,255,255,0.08)",
    padding: "22px",
    borderRadius: "24px",
  },

  image: {
    width: "220px",
    height: "220px",
    objectFit: "cover",
    borderRadius: "18px",
  },

  details: {
    flex: 1,
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  productName: {
    fontSize: "28px",
    marginBottom: "10px",
  },

  orderId: {
    color: "#f3c7d2",
  },

  statusBadge: {
    padding: "10px 18px",
    borderRadius: "30px",
    fontWeight: "700",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "18px",
    marginBottom: "20px",
  },

  infoCard: {
    background: "rgba(255,255,255,0.05)",
    padding: "16px",
    borderRadius: "16px",
  },

  label: {
    color: "#f3c7d2",
    marginBottom: "8px",
    fontSize: "13px",
  },

  value: {
    fontSize: "20px",
    fontWeight: "700",
  },

  shipButton: {
    marginTop: "25px",
    padding: "14px 24px",
    borderRadius: "14px",
    border: "none",
    background:
      "linear-gradient(135deg,#ff006e,#ff4d7a)",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "15px",
  },

  timelineWrapper: {
    display: "flex",
    alignItems: "center",
    marginTop: "25px",
  },

  timelineItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },

  timelineDot: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
  },

  timelineText: {
    fontSize: "11px",
    marginTop: "6px",
  },

  timelineLine: {
    height: "3px",
    flex: 1,
  },

  emptyBox: {
    background: "rgba(255,255,255,0.08)",
    padding: "40px",
    borderRadius: "22px",
    textAlign: "center",
    color: "#f3c7d2",
    fontSize: "18px",
  },

};

export default SellerOrdersPage;