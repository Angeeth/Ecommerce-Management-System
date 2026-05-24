import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

function CheckoutPage() {
  const [searchParams] = useSearchParams();

  const productId = searchParams.get("product_id");
  const quantity = Number(searchParams.get("qty")) || 1;

  const user = JSON.parse(localStorage.getItem("user"));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // CUSTOMER DETAILS
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // ADDRESS DETAILS
  const [addressId, setAddressId] = useState(null); 
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState("Home");

  // PAYMENT
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const [dataLoaded, setDataLoaded] = useState(false);

  // FETCH PRODUCT
  useEffect(() => {
    if (!productId) return;

    axios
      .get(`http://127.0.0.1:8000/products/${productId}`)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        console.log("PRODUCT ERROR:", err);
      });
  }, [productId]);

  // FETCH USER + ADDRESS
  useEffect(() => {
    if (!user?.user_id || dataLoaded) return;

    axios
      .get(`http://127.0.0.1:8000/checkout-user/${user.user_id}`)
      .then((res) => {
        console.log("CHECKOUT USER:", res.data);

        const data = res.data;

        if (data.user) {
          setFullName(data.user.username || "");
          setMobile(data.user.phone || "");
          setEmail(data.user.email || "");
        }

        if (data.address) {
          setAddressId(data.address.address_id); 
          setAddress(data.address.address_line || "");
          setCity(data.address.city || "");
          setState(data.address.state || "");
          setPincode(data.address.postal_code || "");
        }

        setDataLoaded(true);
      })
      .catch((err) => {
        console.log("CHECKOUT USER ERROR:", err);
      });
  }, [user, dataLoaded]);

  if (!product) {
    return (
      <div style={styles.page}>
        <h1 style={{ color: "white" }}>Loading Product...</h1>
      </div>
    );
  }

  const subtotal = Number(product.price || 0) * quantity;
  const shipping = 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  let productImage = "";

  if (product.images && product.images.length > 0) {
    productImage = `http://127.0.0.1:8000/product_img/${product.images[0]}`;
  } else if (product.image_url) {
    productImage = `http://127.0.0.1:8000/product_img/${product.image_url}`;
  } else {
    productImage = "https://via.placeholder.com/110";
  }

const normalizePaymentMethod = (method) => {
  if (!method) return "UPI";
  const cleanMethod = method.trim().toLowerCase();
  
  if (cleanMethod === "upi") return "UPI";
  if (cleanMethod === "credit card" || cleanMethod === "debit card" || cleanMethod === "card") return "CARD";
  if (cleanMethod === "net banking") return "NET_BANKING";
  if (cleanMethod === "cash on delivery" || cleanMethod === "cod") return "COD";
  
  return "UPI"; 
};

const handlePlaceOrder = async () => {
  if (!fullName || !mobile || !email || !address || !city || !state || !pincode) {
    alert("Please fill all fields");
    return;
  }

  try {
    setLoading(true);

    const addrRes = await axios.post("http://127.0.0.1:8000/save-address", {
      user_id: user.user_id,
      address_line: address,
      city,
      state,
      postal_code: pincode,
      country: "India",
      address_type: addressType
    });

    const activeAddressId = addrRes.data.address_id;
    
    if (!activeAddressId) {
      alert("Failed to process shipping address. Please try again.");
      setLoading(false);
      return;
    }

    setAddressId(activeAddressId);

    await axios.put(`http://127.0.0.1:8000/update-user/${user.user_id}`, {
      username: fullName,
      phone: mobile,
    });

    const orderResponse = await axios.post("http://127.0.0.1:8000/create-order", {
      user_id: user.user_id,
      address_id: activeAddressId, 
      product_id: product.product_id,
      quantity: quantity,
      payment_method: normalizePaymentMethod(paymentMethod), 
    });

    console.log("ORDER RESPONSE:", orderResponse.data);
    alert("Order Placed Successfully 🎉");
    setLoading(false);
    window.location.href = "/products";

  } catch (error) {
    console.error("CHECKOUT ERROR:", error.response?.data || error.message);
    setLoading(false);
    const errorDetails = error.response?.data?.detail || "Checkout Failed";
    alert(`Checkout Failed: ${errorDetails}`);
  }
};

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.logo}>EasyCart Checkout</h1>
      </div>

      <div style={styles.container}>
        {/* LEFT */}
        <div style={styles.leftSection}>
          {/* CUSTOMER */}
          <div style={styles.card}>
            <div style={styles.titleRow}>
              <h2 style={styles.sectionTitle}>👤 Customer Details</h2>
              <span style={styles.editText}>Editable</span>
            </div>

            <input
              type="text"
              placeholder="Full Name"
              style={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Mobile Number"
              style={styles.input}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email Address"
              style={{ ...styles.input, opacity: 0.7 }}
              value={email}
              disabled
            />
          </div>

          {/* ADDRESS */}
          <div style={styles.card}>
            <div style={styles.titleRow}>
              <h2 style={styles.sectionTitle}>📍 Shipping Address</h2>
              <span style={styles.editText}>Editable</span>
            </div>

            <textarea
              placeholder="House No, Street, Area..."
              style={styles.textarea}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div style={styles.row}>
              <input
                type="text"
                placeholder="City"
                style={styles.input}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <input
                type="text"
                placeholder="State"
                style={styles.input}
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>

            <input
              type="text"
              placeholder="Pincode"
              style={styles.input}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />

            <select
                value={addressType}
                onChange={(e) => setAddressType(e.target.value)}
                style={styles.addressTypeSelect}
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
            </select>

          </div>

          {/* PAYMENT */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>💳 Payment Method</h2>

            <div style={styles.paymentOptions}>
              {["upi", "credit card", "debit card", "net banking", "cash on delivery"].map(
                (method) => (
                  <div
                    key={method}
                    style={{
                      ...styles.paymentCard,
                      border:
                        paymentMethod === method
                          ? "2px solid #ffcc70"
                          : "1px solid rgba(255,255,255,0.1)",
                    }}
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method}
                  </div>
                )
              )}
            </div>

            <p style={styles.secureText}>🔒 100% Secure Payment</p>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.rightSection}>
          <div style={styles.summaryCard}>
            <h2 style={styles.sectionTitle}>🧾 Order Summary</h2>

            <div style={styles.productBox}>
              <img src={productImage} alt={product.name} style={styles.productImage} />

              <div>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productPrice}>₹ {product.price}</p>
                <p style={styles.qty}>Quantity: {quantity}</p>
              </div>
            </div>

            <div style={styles.billSection}>
              <div style={styles.billRow}>
                <span>Subtotal</span>
                <span>₹ {subtotal}</span>
              </div>

              <div style={styles.billRow}>
                <span>Shipping</span>
                <span>₹ {shipping}</span>
              </div>

              <div style={styles.billRow}>
                <span>Tax</span>
                <span>₹ {tax}</span>
              </div>

              <div style={styles.totalRow}>
                <span>Total</span>
                <span>₹ {total}</span>
              </div>
            </div>

            <button
              style={{
                ...styles.placeOrderBtn,
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
              onClick={handlePlaceOrder}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "35px",
    background:
      "linear-gradient(135deg, #1f0008, #4d0014, #7a001f)",
    fontFamily: "Poppins, sans-serif",
  },

  header: {
    marginBottom: "35px",
  },

  logo: {
    color: "white",
    fontSize: "42px",
  },

  container: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
  },

  leftSection: {
    flex: 2,
    minWidth: "320px",
  },

  rightSection: {
    flex: 1,
    minWidth: "320px",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "22px",
    marginBottom: "25px",
    backdropFilter: "blur(14px)",
    border:
      "1px solid rgba(255,255,255,0.08)",
  },

  summaryCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "22px",
  },

  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  editText: {
    color: "#ffcc70",
    fontSize: "14px",
    fontWeight: "600",
  },

  sectionTitle: {
    color: "white",
    fontSize: "26px",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.08)",
    color: "white",
    marginBottom: "15px",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    height: "120px",
    padding: "16px",
    borderRadius: "14px",
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.08)",
    color: "white",
    marginBottom: "15px",
    outline: "none",
    fontSize: "15px",
    resize: "none",
    boxSizing: "border-box",
  },

  row: {
    display: "flex",
    gap: "15px",
  },

  paymentOptions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
  },

  paymentCard: {
    padding: "15px 20px",
    borderRadius: "14px",
    background:
      "rgba(255,255,255,0.08)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },

  secureText: {
    color: "#ffcc70",
    marginTop: "20px",
    fontWeight: "600",
  },

  productBox: {
    display: "flex",
    gap: "18px",
    marginBottom: "25px",
    alignItems: "center",
  },

  productImage: {
    width: "110px",
    height: "110px",
    objectFit: "cover",
    borderRadius: "15px",
  },

  productName: {
    color: "white",
    marginBottom: "10px",
  },

  productPrice: {
    color: "#ffcc70",
    fontSize: "20px",
    fontWeight: "700",
  },

  qty: {
    color: "#ddd",
  },

  billSection: {
    marginTop: "25px",
  },

  billRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "14px",
    color: "#ddd",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    fontSize: "22px",
    fontWeight: "700",
    color: "white",
  },

  addressTypeSelect: {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    marginBottom: "15px",
    outline: "none",
    fontSize: "15px",
  },

  placeOrderBtn: {
    width: "100%",
    marginTop: "30px",
    padding: "18px",
    border: "none",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #8b0026, #b3003c)",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default CheckoutPage;