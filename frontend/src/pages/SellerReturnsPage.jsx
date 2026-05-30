import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  RotateCcw,
  CheckCircle,
  ShoppingBag,
  XCircle,
  Package,
  LogOut,
  TrendingUp,
  ShieldAlert,
  AlertTriangle,
  Truck,
  BadgeDollarSign,
  MessageSquare,
} from "lucide-react";

function SellerReturnsPage() {

  const [returnsData, setReturnsData] = useState({
    requested: [],
    approved: [],
    rejected: [],
  });

  const [activeTab, setActiveTab] =
    useState("REQUESTED");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {

    try {

      setLoading(true);

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      const sellerId =
        user?.seller_id || user?.user_id;

      const res = await axios.get(
        `http://127.0.0.1:8000/seller-return-requests/${sellerId}`
      );

      if (res.data.success) {

        setReturnsData({
          requested:
            res.data.requested || [],

          approved:
            res.data.approved || [],

          rejected:
            res.data.rejected || [],
        });

      }

    } catch (err) {

      console.log(err);
      alert("Failed to load returns");

    } finally {

      setLoading(false);

    }
  };

  const monitorReturnStatus = (
    returnId
  ) => {

    setTimeout(() => {
      fetchReturns();
    }, 10000);

    setTimeout(() => {
      fetchReturns();
    }, 20000);

  };

  const updateReturnStatus = async (
    returnId,
    status
  ) => {

    try {

      await axios.put(
        `http://127.0.0.1:8000/update-return-status/${returnId}`,
        {
          return_status: status,
        }
      );

      fetchReturns();

      if (status === "APPROVED") {
        monitorReturnStatus(returnId);
      }

    } catch (err) {

      console.log(err);
      alert("Failed to update return");

    }
  };

  const handleLogout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  const getCurrentData = () => {

    if (activeTab === "REQUESTED") {
      return returnsData.requested;
    }

    if (activeTab === "APPROVED") {
      return returnsData.approved;
    }

    return returnsData.rejected;
  };

  const currentReturns = getCurrentData();

  const getRiskColor = (risk) => {

    if (risk === "HIGH") {
      return "#dc2626";
    }

    if (risk === "MEDIUM") {
      return "#f59e0b";
    }

    return "#16a34a";
  };

  const getStatusColor = (status) => {

    if (status === "REQUESTED") {
      return "#ff006e";
    }

    if (status === "APPROVED") {
      return "#16a34a";
    }

    if (status === "PICKED_UP") {
      return "#f59e0b";
    }

    if (status === "REFUNDED") {
      return "#3b82f6";
    }

    return "#dc2626";
  };

  const renderTimeline = (status) => {

    const steps = [
      "REQUESTED",
      "APPROVED",
      "PICKED_UP",
      "REFUNDED",
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

      <div style={styles.sidebar}>

        <h1 style={styles.logo}>
          EasyCart
        </h1>

        <div style={styles.menuContainer}>

          <button
            style={styles.menuButton}
            onClick={() =>
              window.location.href =
                "/seller-dashboard"
            }
          >
            <TrendingUp size={20} />
            Dashboard
          </button>

          <button
            style={styles.menuButton}
            onClick={() =>
              window.location.href =
                "/seller-orders"
            }
          >
            <ShoppingBag size={20} />
            Orders
          </button>

          <button
            style={styles.menuButton}
            onClick={() =>
              window.location.href =
                "/seller-products"
            }
          >
            <Package size={20} />
            Products
          </button>

          <button style={styles.activeMenu}>
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

      <div style={styles.main}>

        <h1 style={styles.heading}>
          Return Requests
        </h1>

        <p style={styles.subHeading}>
          Manage customer return requests with fraud analytics
        </p>

        <div style={styles.statsGrid}>

          <div style={styles.statsCard}>
            <RotateCcw size={30} />

            <h2>
              {returnsData.requested.length}
            </h2>

            <p>Requested</p>
          </div>

          <div style={styles.statsCard}>
            <Truck size={30} />

            <h2>
              {
                returnsData.approved.filter(
                  (item) =>
                    item.return_status ===
                    "PICKED_UP"
                ).length
              }
            </h2>

            <p>Picked Up</p>
          </div>

          <div style={styles.statsCard}>
            <BadgeDollarSign size={30} />

            <h2>
              {
                returnsData.approved.filter(
                  (item) =>
                    item.return_status ===
                    "REFUNDED"
                ).length
              }
            </h2>

            <p>Refunded</p>
          </div>

        </div>

        <div style={styles.tabsContainer}>

          <button
            style={
              activeTab === "REQUESTED"
                ? styles.activeTab
                : styles.tab
            }
            onClick={() =>
              setActiveTab("REQUESTED")
            }
          >
            Requested
          </button>

          <button
            style={
              activeTab === "APPROVED"
                ? styles.activeTab
                : styles.tab
            }
            onClick={() =>
              setActiveTab("APPROVED")
            }
          >
            Approved Flow
          </button>

          <button
            style={
              activeTab === "REJECTED"
                ? styles.activeTab
                : styles.tab
            }
            onClick={() =>
              setActiveTab("REJECTED")
            }
          >
            Rejected
          </button>

        </div>

        <div style={styles.returnsContainer}>

          {loading ? (

            <div style={styles.emptyBox}>
              Loading return requests...
            </div>

          ) : currentReturns.length > 0 ? (

            currentReturns.map((item, index) => (

              <div
                key={index}
                style={styles.returnCard}
              >

                <div style={styles.topRow}>

                  <div>

                    <h2 style={styles.productName}>
                      {item.product_name}
                    </h2>

                    <p style={styles.orderId}>
                      Order ID:
                      {" "}
                      #{item.order_id}
                    </p>

                  </div>

                  <div
                    style={{
                      ...styles.statusBadge,
                      background:
                        getStatusColor(
                          item.return_status
                        ),
                    }}
                  >
                    {item.return_status}
                  </div>

                </div>

                <div style={styles.detailsGrid}>

                  <div style={styles.detailBox}>

                    <p style={styles.label}>
                      Customer
                    </p>

                    <p style={styles.value}>
                      {item.customer_name}
                    </p>

                  </div>

                  <div style={styles.detailBox}>

                    <p style={styles.label}>
                      Quantity
                    </p>

                    <p style={styles.value}>
                      {item.quantity}
                    </p>

                  </div>

                  <div style={styles.detailBox}>

                    <p style={styles.label}>
                      Refund Amount
                    </p>

                    <p style={styles.value}>
                      ₹{item.refund_amount}
                    </p>

                  </div>

                  <div style={styles.detailBox}>

                    <p style={styles.label}>
                      Requested On
                    </p>

                    <p style={styles.value}>
                      {item.requested_at
                        ? new Date(
                            item.requested_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>

                  </div>

                </div>

                {renderTimeline(
                  item.return_status
                )}

                <div style={styles.fraudSection}>

                  <div style={styles.fraudBox}>

                    <div style={styles.fraudHeader}>

                      <ShieldAlert size={22} />

                      <p style={styles.label}>
                        Fraud Score
                      </p>

                    </div>

                    <h3 style={styles.fraudScore}>
                      {item.fraud_score || 0}%
                    </h3>

                  </div>

                  <div
                    style={{
                      ...styles.riskBadge,
                      background:
                        getRiskColor(
                          item.fraud_risk_level
                        ),
                    }}
                  >

                    <AlertTriangle size={18} />

                    {item.fraud_risk_level ||
                      "LOW"}
                    {" "}
                    RISK

                  </div>

                </div>

                <div style={styles.analyticsGrid}>

                  <div style={styles.analyticsCard}>

                    <p style={styles.analyticsLabel}>
                      Customer Return History
                    </p>

                    <h3 style={styles.analyticsValue}>
                      {item.customer_return_count || 0}
                    </h3>

                  </div>

                  <div style={styles.analyticsCard}>

                    <p style={styles.analyticsLabel}>
                      Product Return Count
                    </p>

                    <h3 style={styles.analyticsValue}>
                      {item.product_return_count || 0}
                    </h3>

                  </div>

                </div>

                <div style={styles.reasonBox}>

                  <p style={styles.label}>
                    Return Reason
                  </p>

                  <p style={styles.reason}>
                    {item.return_reason}
                  </p>

                </div>

                {activeTab ===
                  "REQUESTED" && (

                  <div style={styles.buttonGroup}>

                    <button
                      style={styles.approveButton}
                      onClick={() =>
                        updateReturnStatus(
                          item.return_id,
                          "APPROVED"
                        )
                      }
                    >
                      Approve
                    </button>

                    <button
                      style={styles.rejectButton}
                      onClick={() =>
                        updateReturnStatus(
                          item.return_id,
                          "REJECTED"
                        )
                      }
                    >
                      Reject
                    </button>

                  </div>

                )}

              </div>

            ))

          ) : (

            <div style={styles.emptyBox}>
              No returns found
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
    marginBottom: "30px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "20px",
    marginBottom: "30px",
  },

  statsCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "22px",
  },

  tabsContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
  },

  tab: {
    padding: "14px 24px",
    borderRadius: "14px",
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
  },

  activeTab: {
    padding: "14px 24px",
    borderRadius: "14px",
    border: "none",
    background:
      "linear-gradient(135deg,#ff006e,#ff4d7a)",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },

  returnsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  returnCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "22px",
    border:
      "1px solid rgba(255,255,255,0.08)",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  productName: {
    marginBottom: "10px",
    fontSize: "24px",
  },

  orderId: {
    color: "#f3c7d2",
    fontSize: "14px",
  },

  statusBadge: {
    padding: "10px 18px",
    borderRadius: "30px",
    fontWeight: "600",
    fontSize: "14px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  detailBox: {
    background: "rgba(255,255,255,0.05)",
    padding: "16px",
    borderRadius: "16px",
  },

  label: {
    color: "#f3c7d2",
    fontSize: "13px",
    marginBottom: "8px",
  },

  value: {
    fontSize: "18px",
    fontWeight: "600",
  },

  fraudSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  },

  fraudBox: {
    background: "rgba(255,255,255,0.05)",
    padding: "18px",
    borderRadius: "18px",
    flex: 1,
  },

  fraudHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  fraudScore: {
    fontSize: "32px",
    marginTop: "10px",
    fontWeight: "700",
  },

  riskBadge: {
    padding: "14px 22px",
    borderRadius: "18px",
    fontWeight: "700",
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  analyticsCard: {
    background: "rgba(255,255,255,0.05)",
    padding: "18px",
    borderRadius: "18px",
  },

  analyticsLabel: {
    color: "#f3c7d2",
    marginBottom: "10px",
    fontSize: "14px",
  },

  analyticsValue: {
    fontSize: "28px",
    fontWeight: "700",
  },

  reasonBox: {
    background: "rgba(255,255,255,0.05)",
    padding: "18px",
    borderRadius: "18px",
    marginBottom: "20px",
  },

  reason: {
    lineHeight: "24px",
    fontSize: "15px",
  },

  buttonGroup: {
    display: "flex",
    gap: "15px",
  },

  approveButton: {
    padding: "12px 22px",
    border: "none",
    borderRadius: "12px",
    background: "#16a34a",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
  },

  rejectButton: {
    padding: "12px 22px",
    border: "none",
    borderRadius: "12px",
    background: "#dc2626",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
  },

  emptyBox: {
    background: "rgba(255,255,255,0.08)",
    padding: "40px",
    borderRadius: "22px",
    textAlign: "center",
    color: "#f3c7d2",
    fontSize: "18px",
  },

  timelineWrapper: {
    display: "flex",
    alignItems: "center",
    marginTop: "25px",
    marginBottom: "25px",
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

};

export default SellerReturnsPage;