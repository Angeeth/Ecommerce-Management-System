import React, { useEffect, useState } from "react";
import axios from "axios";

function OrdersPage() {

  const [activeOrders, setActiveOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [returnedOrders, setReturnedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {

    try {

      setLoading(true);

      const res = await axios.get("http://localhost:8000/orders/1");

      const active = [];
      const delivered = [];
      const returned = [];

      res.data.forEach((order) => {

        if (order.items && order.items.length > 0) {

          order.items.forEach((item, itemIndex) => {

            const orderedItem = {
              ...order,
              item,
              originalIndex: itemIndex
            };

            if (item.return_status === "REQUESTED") {
              returned.push(orderedItem);
            }
            else if (order.order_status === "DELIVERED") {
              delivered.push(orderedItem);
            }
            else if (order.order_status === "CANCELLED") {
              returned.push(orderedItem);
            }
            else {
              active.push(orderedItem);
            }

          });

        }

      });

      setActiveOrders(active);
      setDeliveredOrders(delivered);
      setReturnedOrders(returned);

    } catch (err) {
      console.log("Orders Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openReturnForm = (order) => {
    setSelectedOrder(order);
    setShowReturnForm(true);
  };

  const submitReturn = async () => {

    if (!returnReason.trim()) {
      alert("Please enter return reason");
      return;
    }

    try {

      await axios.post("http://localhost:8000/return-request", {
        order_item_id: selectedOrder.item.order_item_id,
        user_id: 1,
        return_reason: returnReason
      });

      alert("Return request submitted successfully");

      setShowReturnForm(false);
      setReturnReason("");
      setSelectedOrder(null);

      fetchOrders();

    } catch (err) {
      console.log("Return Error:", err);
      alert("Failed to submit return request");
    }
  };

  const cancelOrder = async (orderId) => {

    try {

      await axios.post("http://localhost:8000/cancel-order", {
        order_id: orderId,
        user_id: 1
      });

      alert("Order cancelled successfully");

      fetchOrders();

    } catch (err) {
      console.log("Cancel Error:", err);
      alert("Failed to cancel order");
    }
  };

  const renderTimeline = (status) => {

    const steps = ["PLACED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
    const currentIndex = steps.indexOf(status);

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        marginTop: "18px",
        width: "100%"
      }}>

        {steps.map((step, index) => (

          <React.Fragment key={index}>

            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1
            }}>

              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background:
                    index < currentIndex
                      ? "#00d26a"
                      : index === currentIndex
                      ? "#ff2e63"
                      : "rgba(255,255,255,0.25)",
                }}
              />

              <p style={{
                fontSize: "10px",
                marginTop: "6px",
                color: "#fff"
              }}>
                {step.replaceAll("_", " ")}
              </p>

            </div>

            {index !== steps.length - 1 && (
              <div style={{
                height: "3px",
                flex: 1,
                background:
                  index < currentIndex
                    ? "#00d26a"
                    : "rgba(255,255,255,0.15)"
              }} />
            )}

          </React.Fragment>

        ))}

      </div>
    );
  };

  const renderReturnTimeline = () => {

    const steps = ["REQUESTED", "APPROVED", "PICKED_UP", "REFUNDED"];

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        marginTop: "10px",
        width: "100%"
      }}>

        {steps.map((step, index) => (

          <div key={index} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1
          }}>

            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background:
                  index === 0
                    ? "#ffcc00"
                    : "rgba(255,255,255,0.2)"
              }}
            />

            <p style={{
              fontSize: "9px",
              marginTop: "4px",
              color: "#fff"
            }}>
              {step.replaceAll("_", " ")}
            </p>

          </div>

        ))}

      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h1 style={styles.loadingText}>Loading Orders...</h1>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <h1 style={styles.heading}>My Orders</h1>
      </div>

      {/* ACTIVE */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Active Orders</h2>

        {activeOrders.map((order, index) => (
          <div key={index} style={styles.orderCard}>

            <div style={styles.imageContainer}>
              <img
                src={`http://localhost:8000/product_img/${order.item.image_url}`}
                alt=""
                style={styles.image}
              />
            </div>

            <div style={styles.details}>
              <h2 style={styles.productName}>
                {order.item.product_name}
              </h2>

              <p style={styles.price}>
                ₹ {order.item.subtotal}
              </p>

              {renderTimeline(order.order_status)}

              <button
                style={styles.cancelBtn}
                onClick={() => cancelOrder(order.order_id)}
              >
                Cancel Order
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* DELIVERED */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Delivered Orders</h2>

        {deliveredOrders.map((order, index) => (
          <div key={index} style={styles.orderCard}>

            <div style={styles.imageContainer}>
              <img
                src={`http://localhost:8000/product_img/${order.item.image_url}`}
                alt=""
                style={styles.image}
              />
            </div>

            <div style={styles.details}>

              <h2 style={styles.productName}>
                {order.item.product_name}
              </h2>

              <p style={styles.price}>
                ₹ {order.item.subtotal}
              </p>

              {(() => {

                const orderedDate = new Date(order.ordered_at);
                const currentDate = new Date();

                const diffTime = currentDate - orderedDate;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                return diffDays <= 7;

              })() && (

                <button
                  style={styles.returnBtn}
                  onClick={() => openReturnForm(order)}
                >
                  Return / Exchange
                </button>

              )}

            </div>
          </div>
        ))}
      </div>

      {/* RETURNED */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Return / Cancelled Orders
        </h2>

        {returnedOrders.map((order, index) => (
          <div key={index} style={styles.orderCard}>

            <div style={styles.imageContainer}>
              <img
                src={`http://localhost:8000/product_img/${order.item.image_url}`}
                alt=""
                style={styles.image}
              />
            </div>

            <div style={styles.details}>

              <h2 style={styles.productName}>
                {order.item.product_name}
              </h2>

              <p style={styles.price}>
                ₹ {order.item.subtotal}
              </p>

              <p style={{ color: "#ffcc00" }}>
                {order.item.return_status || order.order_status}
              </p>

              {renderReturnTimeline()}

            </div>
          </div>
        ))}
      </div>

      {/* POPUP */}
      {showReturnForm && (
        <div style={styles.popupOverlay}>

          <div style={styles.popup}>

            <h2 style={{ marginBottom: "20px" }}>
              Return Request
            </h2>

            <textarea
              placeholder="Enter reason for return..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              style={styles.textarea}
            />

            <div style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px"
            }}>

              <button
                style={styles.submitBtn}
                onClick={submitReturn}
              >
                Submit
              </button>

              <button
                style={styles.closeBtn}
                onClick={() => {
                  setShowReturnForm(false);
                  setReturnReason("");
                  setSelectedOrder(null);
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#120008,#3d0012,#6d001f)",
    padding: "40px",
    color: "white"
  },

  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  loadingText: {
    fontSize: "40px"
  },

  header: {
    marginBottom: "40px"
  },

  heading: {
    fontSize: "52px"
  },

  section: {
    marginBottom: "50px"
  },

  sectionTitle: {
    fontSize: "30px",
    color: "#ffd6e0"
  },

  orderCard: {
    display: "flex",
    gap: "30px",
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "20px",
    marginBottom: "20px"
  },

  imageContainer: {
    width: "220px"
  },

  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover"
  },

  details: {
    flex: 1
  },

  productName: {
    fontSize: "28px"
  },

  price: {
    fontSize: "22px"
  },

  cancelBtn: {
    marginTop: "10px",
    background: "#ff4d4d",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  returnBtn: {
    marginTop: "10px",
    background: "#ff2e63",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },

  popup: {
    width: "400px",
    background: "#1e1e1e",
    padding: "25px",
    borderRadius: "16px",
    color: "white"
  },

  textarea: {
    width: "100%",
    height: "120px",
    borderRadius: "10px",
    border: "none",
    padding: "12px",
    resize: "none",
    fontSize: "15px"
  },

  submitBtn: {
    background: "#ff2e63",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer"
  },

  closeBtn: {
    background: "#555",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default OrdersPage;