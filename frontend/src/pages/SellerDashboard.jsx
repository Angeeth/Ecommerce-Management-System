import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Package,
  ShoppingBag,
  RotateCcw,
  TrendingUp,
  IndianRupee,
  LogOut,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function SellerDashboard() {

  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      const sellerId =
        user?.seller_id || user?.user_id;

      if (!sellerId) {
        alert("Seller Not Found");
        return;
      }

      const res = await axios.get(
        `http://127.0.0.1:8000/seller-dashboard/${sellerId}`
      );

      console.log(
        "FULL DASHBOARD DATA => ",
        res.data
      );

      if (res.data.success) {
        setDashboard(res.data);
      }

    } catch (err) {
      console.log(err);
      alert("Failed To Load Dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!dashboard) {
    return (
      <div style={styles.loading}>
        Loading Dashboard...
      </div>
    );
  }

  const seller = dashboard.seller || {};
  const stats = dashboard.stats || {};

  const revenueData =
    dashboard.daily_orders?.map((item, index) => ({
      day:
        item.day ||
        `Day ${index + 1}`,

      revenue:
        Number(item.orders || 0),
    })) || [];

  console.log(
    "REVENUE DATA => ",
    revenueData
  );

  const topProducts =
    dashboard.top_products || [];

  const lowStock =
    dashboard.low_stock_products || [];

  const recentOrders =
    dashboard.recent_orders || [];

  const maxSold = Math.max(
    ...topProducts.map(
      (item) => item.total_sold || 0
    ),
    1
  );

  const statsCards = [
    {
      title: "Total Sales",
      value: `₹${stats.total_sales || 0}`,
      icon: <IndianRupee size={26} />,
    },
    {
      title: "Orders",
      value: stats.total_orders || 0,
      icon: <ShoppingBag size={26} />,
    },
    {
      title: "Products",
      value: stats.total_products || 0,
      icon: <Package size={26} />,
    },
    {
      title: "Returns",
      value: stats.total_returns || 0,
      icon: <RotateCcw size={26} />,
    },
  ];

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>

        <h1 style={styles.logo}>
          EasyCart
        </h1>

        <div style={styles.profileCard}>

          <div style={styles.avatar}>
            {seller.shop_name?.charAt(0)}
          </div>

          <h2 style={styles.shopName}>
            {seller.shop_name}
          </h2>

          <p style={styles.email}>
            {seller.email}
          </p>

        </div>

        <div style={styles.menuContainer}>

          <button style={styles.activeMenu}>
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

      {/* MAIN */}
      <div style={styles.main}>

        <div style={{ marginBottom: "35px" }}>

          <h1 style={styles.heading}>
            Seller Dashboard
          </h1>

          <p style={styles.subHeading}>
            Welcome back {seller.username}
          </p>

        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>

          {statsCards.map((item, index) => (

            <div
              key={index}
              style={styles.statsCard}
            >

              <div style={styles.iconBox}>
                {item.icon}
              </div>

              <h2 style={styles.statsValue}>
                {item.value}
              </h2>

              <p style={styles.statsTitle}>
                {item.title}
              </p>

            </div>

          ))}

        </div>

        {/* CHART + SUMMARY */}
        <div style={styles.chartGrid}>

          {/* REVENUE CHART */}
          <div style={styles.chartCard}>

            <div style={styles.chartHeader}>

              <h2 style={styles.chartTitle}>
                Revenue Trend
              </h2>

              <p style={styles.chartSub}>
                Revenue analytics overview
              </p>

            </div>

            <div
              style={{
                width: "100%",
                height: "320px",
              }}
            >

              {revenueData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart data={revenueData}>

                    <defs>

                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="5%"
                          stopColor="#ff4d7a"
                          stopOpacity={0.8}
                        />

                        <stop
                          offset="95%"
                          stopColor="#ff4d7a"
                          stopOpacity={0}
                        />

                      </linearGradient>

                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                    />

                    <XAxis
                      dataKey="day"
                      tick={{
                        fill: "#fff",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      tick={{
                        fill: "#fff",
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${value}`,
                        "Orders",
                      ]}
                      contentStyle={{
                        background: "#2b0010",
                        border: "none",
                        borderRadius: "14px",
                        color: "white",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ff4d7a"
                      fill="url(#revenueGradient)"
                      strokeWidth={4}
                      dot={{ r: 5 }}
                      activeDot={{ r: 8 }}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              ) : (

                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f3c7d2",
                    fontSize: "18px",
                  }}
                >
                  No revenue data available
                </div>

              )}

            </div>

          </div>

          {/* STORE SUMMARY */}
          <div style={styles.performanceCard}>

            <h2 style={styles.chartTitle}>
              Store Summary
            </h2>

            <div style={styles.summaryCard}>

              <p style={styles.summaryTitle}>
                Shop Description
              </p>

              <p style={styles.summaryText}>
                {seller.shop_description ||
                  "No description available"}
              </p>

            </div>

            <div style={styles.summaryCard}>

              <p style={styles.summaryTitle}>
                Total Reviews
              </p>

              <h2 style={styles.summaryValue}>
                {stats.total_reviews || 0}
              </h2>

            </div>

          </div>

        </div>

        {/* ANALYTICS */}
        <div style={styles.analyticsGrid}>

          {/* TOP PRODUCTS */}
          <div style={styles.analyticsCard}>

            <div style={styles.analyticsHeader}>
              <TrendingUp size={22} />

              <h2 style={styles.analyticsTitle}>
                Top Selling Products
              </h2>
            </div>

            {topProducts.map((product, index) => (

              <div
                key={index}
                style={styles.productBarContainer}
              >

                <div style={styles.productBarTop}>

                  <span style={styles.productLabel}>
                    {product.name}
                  </span>

                  <span style={styles.productSold}>
                    {product.total_sold} Sold
                  </span>

                </div>

                <div style={styles.progressBg}>

                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${
                        (product.total_sold / maxSold) * 100
                      }%`,
                    }}
                  ></div>

                </div>

              </div>

            ))}

          </div>

          {/* RECENT ORDERS */}
          <div style={styles.analyticsCard}>

            <div style={styles.analyticsHeader}>
              <ShoppingBag size={22} />

              <h2 style={styles.analyticsTitle}>
                Recent Orders
              </h2>
            </div>

            {recentOrders.length > 0 ? (

              recentOrders.map((order, index) => (

                <div
                  key={index}
                  style={styles.activityItem}
                >

                  <div style={styles.activityDot}></div>

                  <div>

                    <div style={{ fontWeight: "600" }}>
                      {order.product_name}
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "#f3c7d2",
                        marginTop: "4px",
                      }}
                    >
                      Qty: {order.quantity} • ₹{order.subtotal}
                    </div>

                  </div>

                </div>

              ))

            ) : (

              <p style={{ color: "#f3c7d2" }}>
                No recent orders
              </p>

            )}

          </div>

        </div>

        {/* LOW STOCK */}
        <div style={styles.lowStockCard}>

          <div style={styles.analyticsHeader}>

            <AlertTriangle size={22} />

            <h2 style={styles.analyticsTitle}>
              Low Stock Alerts
            </h2>

          </div>

          {lowStock.length > 0 ? (

            lowStock.map((item, index) => (

              <div
                key={index}
                style={styles.lowStockRow}
              >

                <span style={styles.lowStockName}>
                  {item.name}
                </span>

                <span style={styles.lowStockBadge}>
                  {item.stock_quantity} Left
                </span>

              </div>

            ))

          ) : (

            <p style={{ color: "#f3c7d2" }}>
              No low stock products
            </p>

          )}

        </div>

      </div>

    </div>
  );
}

const styles = {

  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg,#120008,#3d0012,#6d001f)",
    color: "white",
    fontSize: "28px",
    fontFamily: "Poppins",
  },

  page: {
    display: "flex",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#120008,#3d0012,#6d001f)",
    color: "white",
    fontFamily: "Poppins, sans-serif",
  },

  sidebar: {
    width: "280px",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)",
    borderRight:
      "1px solid rgba(255,255,255,0.08)",
    padding: "30px 20px",
    display: "flex",
    flexDirection: "column",
  },

  logo: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "35px",
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
    background:
      "linear-gradient(135deg,#8b0026,#ff2e63)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "700",
  },

  shopName: {
    margin: 0,
    fontSize: "24px",
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
    border:
      "1px solid rgba(255,255,255,0.08)",
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

  main: {
    flex: 1,
    padding: "35px",
  },

  heading: {
    fontSize: "48px",
    margin: 0,
  },

  subHeading: {
    marginTop: "10px",
    color: "#f3c7d2",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "22px",
    marginBottom: "35px",
  },

  statsCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "22px",
    padding: "25px",
  },

  iconBox: {
    width: "60px",
    height: "60px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg,#8b0026,#ff2e63)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },

  statsValue: {
    fontSize: "30px",
    margin: 0,
  },

  statsTitle: {
    marginTop: "10px",
    color: "#f3c7d2",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "25px",
    marginBottom: "30px",
  },

  chartCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "30px",
  },

  performanceCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "30px",
  },

  chartHeader: {
    marginBottom: "20px",
  },

  chartTitle: {
    fontSize: "24px",
    margin: 0,
  },

  chartSub: {
    marginTop: "6px",
    color: "#f3c7d2",
  },

  summaryCard: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "18px",
    padding: "18px",
    marginTop: "18px",
  },

  summaryTitle: {
    margin: 0,
    color: "#f3c7d2",
    fontSize: "14px",
  },

  summaryText: {
    marginTop: "10px",
    lineHeight: "24px",
  },

  summaryValue: {
    marginTop: "10px",
    fontSize: "32px",
  },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
    marginBottom: "30px",
  },

  analyticsCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "30px",
  },

  analyticsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "25px",
  },

  analyticsTitle: {
    fontSize: "24px",
    margin: 0,
  },

  productBarContainer: {
    marginBottom: "22px",
  },

  productBarTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  productLabel: {
    fontWeight: "600",
  },

  productSold: {
    color: "#f3c7d2",
  },

  progressBg: {
    width: "100%",
    height: "14px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg,#ff006e,#ff4d7a)",
  },

  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 0",
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
  },

  activityDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#ff4d7a",
  },

  lowStockCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "30px",
  },

  lowStockRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "18px 0",
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
  },

  lowStockName: {
    fontSize: "18px",
    fontWeight: "600",
  },

  lowStockBadge: {
    padding: "8px 16px",
    borderRadius: "30px",
    background:
      "linear-gradient(135deg,#ff006e,#ff4d7a)",
    fontWeight: "600",
  },
};

export default SellerDashboard;