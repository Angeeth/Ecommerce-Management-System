import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HomePage() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // FETCH PRODUCTS
  useEffect(() => {

    axios
      .get("http://127.0.0.1:8000/products")
      .then((response) => {

        // RANDOM 4 PRODUCTS
        const shuffled = response.data.sort(
          () => 0.5 - Math.random()
        );

        setProducts(shuffled.slice(0, 4));

      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  // AUTO SLIDER
  useEffect(() => {

    if (products.length === 0) return;

    const interval = setInterval(() => {

      setCurrentSlide((prev) =>
        prev === products.length - 1 ? 0 : prev + 1
      );

    }, 2500);

    return () => clearInterval(interval);

  }, [products]);

  return (

    <div style={styles.page}>

      {/* NAVBAR */}
      <nav style={styles.navbar}>

        <h1 style={styles.logo}>
          EasyCart
        </h1>

        <div style={styles.navLinks}>

          <a href="#" style={styles.link}>
            Home
          </a>

          <a href="#categories" style={styles.link}>
            Categories
          </a>

          <a href="#brands" style={styles.link}>
            Brands
          </a>

          <a href="#offers" style={styles.link}>
            Offers
          </a>

          <button
            style={styles.loginBtn}
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        </div>

      </nav>

      {/* HERO SECTION */}
      {products.length > 0 && (

        <div
          style={{
            ...styles.hero,
            backgroundImage: `
              linear-gradient(
                rgba(0,0,0,0.55),
                rgba(0,0,0,0.55)
              ),
              url(http://127.0.0.1:8000/product_img/${products[currentSlide].image_url})
            `,
          }}
        >

          <div style={styles.heroContent}>

            <p style={styles.smallText}>
              PREMIUM SHOPPING EXPERIENCE
            </p>

            <h1 style={styles.heroTitle}>
              Buy Better. <br />
              Sell Smarter.
            </h1>

            <p style={styles.heroSubtitle}>

              Discover premium fashion,
              electronics, accessories and more
              at unbeatable prices.

            </p>

            <button
              style={styles.exploreBtn}
              onClick={() => navigate("/products")}
            >
              Explore Products
            </button>

          </div>

        </div>

      )}

      {/* CATEGORIES */}
      <section id="categories" style={styles.section}>

        <h2 style={styles.sectionTitle}>
          Shop By Category
        </h2>

        <div style={styles.categoryGrid}>

          <div
            style={styles.categoryCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-12px) scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 20px 40px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 5px 20px rgba(0,0,0,0.08)";
            }}
          >
            <h3>Fashion</h3>
          </div>

          <div
            style={styles.categoryCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-12px) scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 20px 40px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 5px 20px rgba(0,0,0,0.08)";
            }}
          >
            <h3>Electronics</h3>
          </div>

          <div
            style={styles.categoryCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-12px) scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 20px 40px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 5px 20px rgba(0,0,0,0.08)";
            }}
          >
            <h3>Accessories</h3>
          </div>

          <div
            style={styles.categoryCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-12px) scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 20px 40px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 5px 20px rgba(0,0,0,0.08)";
            }}
          >
            <h3>Home</h3>
          </div>

        </div>

      </section>

      {/* BRANDS */}
      <section id="brands" style={styles.section}>

        <h2 style={styles.sectionTitle}>
          Featured Brands
        </h2>

        <div style={styles.brandContainer}>

          <div style={styles.brandCard}>Nike</div>
          <div style={styles.brandCard}>Samsung</div>
          <div style={styles.brandCard}>Sony</div>
          <div style={styles.brandCard}>Dell</div>
          <div style={styles.brandCard}>Adidas</div>

        </div>

      </section>

      {/* OFFERS */}
      <section id="offers" style={styles.discountBanner}>

        <p style={styles.discountText}>
          UP TO 50% OFF
        </p>

        <h1 style={styles.discountTitle}>
          Summer Sale Collection
        </h1>

      </section>

      {/* FEATURES */}
      <section style={styles.section}>

        <h2 style={styles.sectionTitle}>
          Why Choose EasyCart
        </h2>

        <div style={styles.featureGrid}>

          <div style={styles.featureCard}>
            <h3>Fast Delivery</h3>
            <p>
              Quick and reliable shipping across India.
            </p>
          </div>

          <div style={styles.featureCard}>
            <h3>Secure Payment</h3>
            <p>
              100% safe and trusted payment methods.
            </p>
          </div>

          <div style={styles.featureCard}>
            <h3>Premium Quality</h3>
            <p>
              Best quality products from trusted brands.
            </p>
          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>

        <h2 style={styles.footerLogo}>
          EasyCart
        </h2>

        <p>
          Shop smart. Live better.
        </p>

      </footer>

    </div>
  );
}

const styles = {

  page: {
    width: "100%",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    overflowX: "hidden",
    fontFamily: "Poppins, sans-serif",
    background: "#f7f7f7",
  },

  navbar: {
    width: "100%",
    height: "90px",
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 70px",
    boxSizing: "border-box",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
  },

 logo: {
    fontSize: "46px",
    fontWeight: "700",
    color: "#8b0026",
    margin: 0,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "1px",
 },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "40px",
  },

  link: {
    textDecoration: "none",
    color: "#222",
    fontSize: "18px",
    fontWeight: "500",
    transition: "0.3s",
  },

  loginBtn: {
    padding: "14px 34px",
    border: "none",
    borderRadius: "12px",
    background: "#8b0026",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  hero: {
    width: "100%",
    height: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    transition: "background-image 1s ease-in-out",
  },

  heroContent: {
    color: "white",
    marginLeft: "140px",
    maxWidth: "700px",
  },

  smallText: {
    letterSpacing: "4px",
    fontSize: "15px",
    marginBottom: "25px",
    color: "#f5d0d8",
  },

  heroTitle: {
    fontSize: "95px",
    lineHeight: "95px",
    fontWeight: "800",
    marginBottom: "30px",
  },

  heroSubtitle: {
    fontSize: "24px",
    lineHeight: "42px",
    color: "#f2f2f2",
    marginBottom: "40px",
  },

  exploreBtn: {
    padding: "20px 45px",
    border: "none",
    borderRadius: "14px",
    background: "#8b0026",
    color: "white",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
  },

  section: {
    padding: "100px 80px",
  },

  sectionTitle: {
    fontSize: "42px",
    marginBottom: "50px",
    textAlign: "center",
    color: "#111",
    fontWeight: "700",
  },

  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "30px",
  },

  categoryCard: {
    background: "white",
    padding: "70px 20px",
    borderRadius: "22px",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "600",
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
    transition: "all 0.35s ease",
    cursor: "pointer",
  },

  brandContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "25px",
    flexWrap: "wrap",
  },

  brandCard: {
    background: "white",
    padding: "25px 45px",
    borderRadius: "14px",
    fontSize: "22px",
    fontWeight: "600",
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
  },

  discountBanner: {
    width: "100%",
    padding: "120px 20px",
    background: "#111",
    color: "white",
    textAlign: "center",
  },

  discountText: {
    fontSize: "20px",
    letterSpacing: "4px",
    color: "#d4d4d4",
  },

  discountTitle: {
    fontSize: "70px",
    marginTop: "20px",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "30px",
  },

  featureCard: {
    background: "white",
    padding: "50px 30px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
  },

  footer: {
    background: "#111",
    color: "white",
    padding: "60px 20px",
    textAlign: "center",
  },

 footerLogo: {
    fontSize: "42px",
    fontFamily: "'Montserrat', sans-serif",
    marginBottom: "10px",
 },

};

export default HomePage;