import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Signup() {

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
  }, []);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "Customer",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/signup",
        formData
      );

      alert(response.data.message);

      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        role: "Customer",
      });

    } catch (error) {
      console.log(error);
      alert("Signup Failed");
    }
  };

  return (
    <div style={styles.page}>

      <div style={styles.backgroundCircle1}></div>
      <div style={styles.backgroundCircle2}></div>
      <div style={styles.backgroundCircle3}></div>

      <div style={styles.card}>

        <div style={styles.left}>

          <div style={styles.circleTop}></div>
          <div style={styles.circleBottom}></div>

          <h1 style={styles.logo}>EasyCart</h1>

          <p style={styles.tagline}>
            Buy Better<br />
            Sell Smarter
          </p>

          <p style={styles.description}>
            Experience modern online shopping.
          </p>

        </div>

        <div style={styles.right}>

          <h2 style={styles.title}>Create Account</h2>

          <p style={styles.subtitle}>
            Sign up to continue shopping
          </p>

          <form onSubmit={handleSignup}>

            <input
              type="text"
              name="username"
              placeholder="Username"
              style={styles.input}
              value={formData.username}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              style={styles.input}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              style={styles.input}
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              style={styles.input}
              value={formData.password}
              onChange={handleChange}
              required
            />

            <select
              name="role"
              style={styles.input}
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Customer">Customer</option>
              <option value="Seller">Seller</option>
            </select>

            <button type="submit" style={styles.button}>
              Create Account
            </button>

          </form>

          <p style={styles.bottomText}>
            Already have an account?{" "}
            <Link to="/login" 
              style={{ textDecoration: "none" }}>
              <span style={styles.loginText}>Login</span>
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

const styles = {

  page: {
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    position: "fixed",
    top: 0,
    left: 0,
    background:
      "linear-gradient(135deg, #2b000a, #5e0017, #8b0026)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Poppins, sans-serif",
  },

  backgroundCircle1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    top: "-150px",
    left: "-100px",
    filter: "blur(10px)",
  },

  backgroundCircle2: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    bottom: "-100px",
    right: "-50px",
    filter: "blur(10px)",
  },

  backgroundCircle3: {
    position: "absolute",
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.04)",
    top: "50%",
    left: "15%",
    filter: "blur(10px)",
  },

  card: {
    width: "1000px",
    height: "620px",
    display: "flex",
    borderRadius: "30px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 25px 70px rgba(0,0,0,0.4)",
    zIndex: 10,
  },

  left: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "70px",
    color: "white",
  },

  circleTop: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    top: "-60px",
    right: "-60px",
    zIndex: 1,
  },

  circleBottom: {
    position: "absolute",
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    bottom: "30px",
    left: "20px",
    zIndex: 1,
  },

  logo: {
    fontSize: "58px",
    fontWeight: "700",
    marginBottom: "20px",
    zIndex: 2,
  },

  tagline: {
    fontSize: "30px",
    lineHeight: "48px",
    color: "#ffe5ec",
    zIndex: 2,
  },

  description: {
    marginTop: "25px",
    fontSize: "18px",
    lineHeight: "32px",
    color: "#f5c7d1",
    zIndex: 2,
  },

  right: {
    flex: 1,
    background: "rgba(255,255,255,0.97)",
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  title: {
    fontSize: "44px",
    fontWeight: "700",
    color: "#5e0017",
    marginBottom: "10px",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: "35px",
    fontSize: "16px",
  },

  input: {
    width: "100%",
    padding: "17px",
    marginBottom: "18px",
    borderRadius: "15px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "15px",
    background: "#f7f7f7",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "17px",
    border: "none",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #5e0017, #8b0026)",
    color: "white",
    fontSize: "17px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    transition: "0.3s",
    boxShadow: "0 10px 25px rgba(94,0,23,0.3)",
  },

  bottomText: {
    marginTop: "25px",
    textAlign: "center",
    color: "#666",
    fontSize: "15px",
  },

  loginText: {
    color: "#5e0017",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Signup;