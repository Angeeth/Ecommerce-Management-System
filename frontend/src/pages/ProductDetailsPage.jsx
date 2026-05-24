import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function ProductDetailsPage() {

  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);

  // GET PRODUCT
  useEffect(() => {

    axios
      .get(`http://127.0.0.1:8000/products/${id}`)

      .then((res) => {

        setProduct(res.data);

        if (res.data.images?.length > 0) {
          setMainImage(res.data.images[0]);
        }
      })

      .catch((err) => console.log(err));

  }, [id]);

  // STARS
  const renderStars = (rating) => {

    const fullStars = Math.floor(rating || 0);

    let stars = "";

    for (let i = 0; i < 5; i++) {
      stars += i < fullStars ? "⭐" : "☆";
    }

    return stars;
  };

  // CHECK LOGIN
  const checkLogin = () => {

    const user = localStorage.getItem("user");

    // NOT LOGGED IN
    if (!user) {

      // SAVE CURRENT PAGE
      localStorage.setItem(
        "redirectAfterLogin",
        window.location.pathname
      );

      alert("Please Login First");

      // REDIRECT TO LOGIN
      window.location.href = "/login";

      return null;
    }

    return JSON.parse(user);
  };

  // WISHLIST
  const handleWishlist = async () => {

    const user = checkLogin();

    if (!user) return;

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/wishlist",
        {
          user_id: user.user_id,
          product_id: product.product_id,
        }
      );

      setLiked(true);

      alert(response.data.message);

    } catch (error) {

      console.log(error);

      alert("Wishlist Error");
    }
  };

  // ADD TO CART
  const handleAddToCart = async () => {

    const user = checkLogin();

    if (!user) return;

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/add-to-cart",
        {
          user_id: user.user_id,
          product_id: product.product_id,
          quantity: qty,
        }
      );

      alert(response.data.message);

    } catch (error) {

      console.log(error);

      alert("Cart Error");
    }
  };

  // BUY NOW
  const handleBuyNow = () => {

  const user = checkLogin();

  if (!user) return;

  // go to checkout page with product id + quantity
  window.location.href =
    `/checkout?product_id=${product.product_id}&qty=${qty}`;
};

  // NEXT IMAGE
  const nextImage = () => {

    if (!product?.images?.length) return;

    const currentIndex =
      product.images.indexOf(mainImage);

    const nextIndex =
      currentIndex === product.images.length - 1
        ? 0
        : currentIndex + 1;

    setMainImage(product.images[nextIndex]);
  };

  // PREVIOUS IMAGE
  const prevImage = () => {

    if (!product?.images?.length) return;

    const currentIndex =
      product.images.indexOf(mainImage);

    const prevIndex =
      currentIndex === 0
        ? product.images.length - 1
        : currentIndex - 1;

    setMainImage(product.images[prevIndex]);
  };

  // LOADING
  if (!product) {

    return (
      <div style={styles.page}>
        <h1 style={{ color: "white" }}>
          Loading Product...
        </h1>
      </div>
    );
  }

  return (

    <div style={styles.page}>

      {/* BACK BUTTON */}
      <button
        style={styles.backBtn}
        onClick={() => window.history.back()}
      >
        ← Back
      </button>

      {/* TOP SECTION */}
      <div style={styles.topSection}>

        {/* LEFT SIDE */}
        <div style={styles.left}>

          {/* IMAGE SLIDER */}
          <div style={styles.sliderContainer}>

            <button
              style={styles.arrowBtnLeft}
              onClick={prevImage}
            >
              ❮
            </button>

            <div style={styles.mainImageBox}>

              <img
                src={`http://127.0.0.1:8000/product_img/${mainImage}`}
                alt="product"
                style={styles.mainImage}
              />

            </div>

            <button
              style={styles.arrowBtnRight}
              onClick={nextImage}
            >
              ❯
            </button>

          </div>

          {/* THUMBNAILS */}
          <div style={styles.thumbnailRow}>

            {product.images?.map((img, index) => (

              <img
                key={index}
                src={`http://127.0.0.1:8000/product_img/${img}`}
                alt="thumb"
                style={{
                  ...styles.thumbnail,
                  border:
                    mainImage === img
                      ? "3px solid #ffcc70"
                      : "2px solid transparent",
                }}
                onClick={() => setMainImage(img)}
              />

            ))}

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div style={styles.middle}>

          <div style={styles.titleRow}>

            <h1 style={styles.title}>
              {product.name}
            </h1>

            {/* HEART */}
            <span
              style={{
                ...styles.heart,
                color: liked ? "red" : "white",
              }}
              onClick={handleWishlist}
            >
              ♥
            </span>

          </div>

          <p style={styles.category}>
            Category ID: {product.category_id}
          </p>

          <h2 style={styles.price}>
            ₹ {product.price}
          </h2>

          {/* RATING */}
          <div style={styles.rating}>

            {renderStars(product.average_rating)}

            <span style={{ marginLeft: "10px" }}>
              ({product.average_rating || 0})
            </span>

          </div>

          <p style={styles.reviewCount}>
            {product.total_reviews || 0} Reviews
          </p>

          {/* DESCRIPTION */}
          <p style={styles.description}>
            {product.description}
          </p>

          {/* DELIVERY */}
          <div style={styles.deliveryBox}>

            🚚 Free Delivery in 3-5 Days
            <br />

            💰 Cash on Delivery Available
            <br />

            🔄 7 Days Easy Return

          </div>

          {/* QUANTITY */}
          <div style={styles.qtyContainer}>

            <button
              style={styles.qtyBtn}
              onClick={() =>
                setQty(qty > 1 ? qty - 1 : 1)
              }
            >
              -
            </button>

            <span style={styles.qtyText}>
              {qty}
            </span>

            <button
              style={styles.qtyBtn}
              onClick={() => setQty(qty + 1)}
            >
              +
            </button>

          </div>

        </div>

      </div>

      {/* CHECKOUT */}
      <div style={styles.bottomCheckout}>

        <div style={styles.checkoutCard}>

          <h2 style={styles.checkoutPrice}>
            ₹ {product.price}
          </h2>

          <p style={styles.taxText}>
            Inclusive of all taxes
          </p>

          <button
            style={styles.cartBtn}
            onClick={handleAddToCart}
          >
            Add To Cart
          </button>

          <button
            style={styles.buyBtn}
            onClick={handleBuyNow}
          >
            Buy Now
          </button>

          <p style={styles.secureText}>
            🔒 Secure Transaction
          </p>

        </div>

      </div>

      {/* REVIEWS */}
      <div style={styles.reviewSection}>

        <h2
          style={{
            marginBottom: "20px",
            color: "white",
          }}
        >
          Customer Reviews
        </h2>

        {product.reviews &&
        product.reviews.length > 0 ? (

          product.reviews.map((review, index) => (

            <div
              key={index}
              style={styles.reviewCard}
            >

              <p style={styles.reviewStars}>
                {renderStars(review.rating)}
              </p>

              <p style={styles.reviewComment}>
                {review.comment}
              </p>

              <small style={styles.reviewUser}>
                - {review.user_name}
              </small>

            </div>
          ))

        ) : (

          <p style={{ color: "#ccc" }}>
            No Reviews Yet
          </p>

        )}

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

  backBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "white",
    marginBottom: "25px",
    fontWeight: "bold",
  },

  topSection: {
    display: "flex",
    gap: "35px",
    flexWrap: "wrap",
  },

  left: {
    flex: 1,
    minWidth: "320px",
  },

  sliderContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  mainImageBox: {
    width: "100%",
    overflow: "hidden",
    borderRadius: "20px",
  },

  mainImage: {
    width: "100%",
    height: "500px",
    objectFit: "cover",
    borderRadius: "20px",
  },

  arrowBtnLeft: {
    position: "absolute",
    left: "15px",
    zIndex: 10,
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.8)",
    cursor: "pointer",
    fontSize: "22px",
    fontWeight: "bold",
  },

  arrowBtnRight: {
    position: "absolute",
    right: "15px",
    zIndex: 10,
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.8)",
    cursor: "pointer",
    fontSize: "22px",
    fontWeight: "bold",
  },

  thumbnailRow: {
    display: "flex",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap",
  },

  thumbnail: {
    width: "85px",
    height: "85px",
    objectFit: "cover",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "0.3s",
  },

  middle: {
    flex: 1,
    minWidth: "320px",
    color: "white",
  },

  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: "38px",
    marginBottom: "10px",
  },

  heart: {
    fontSize: "32px",
    cursor: "pointer",
    transition: "0.3s",
  },

  category: {
    color: "#f3c7d3",
    marginBottom: "10px",
  },

  price: {
    fontSize: "30px",
    marginBottom: "10px",
  },

  rating: {
    color: "#ffd166",
    fontSize: "20px",
  },

  reviewCount: {
    color: "#ddd",
    marginTop: "5px",
  },

  description: {
    marginTop: "20px",
    lineHeight: "1.8",
    color: "#f1f1f1",
  },

  deliveryBox: {
    marginTop: "25px",
    background: "rgba(255,255,255,0.08)",
    padding: "18px",
    borderRadius: "15px",
    lineHeight: "2",
  },

  qtyContainer: {
    marginTop: "25px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  qtyBtn: {
    width: "40px",
    height: "40px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "bold",
  },

  qtyText: {
    fontSize: "20px",
    fontWeight: "bold",
  },

  bottomCheckout: {
    marginTop: "40px",
  },

  checkoutCard: {
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "20px",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
  },

  checkoutPrice: {
    fontSize: "34px",
    marginBottom: "10px",
  },

  taxText: {
    color: "#ddd",
    marginBottom: "20px",
  },

  cartBtn: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "14px",
    background: "#ffcc70",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "15px",
    fontSize: "17px",
  },

  buyBtn: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #8b0026, #b3003c)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "17px",
  },

  secureText: {
    marginTop: "15px",
    color: "#ccc",
    textAlign: "center",
  },

  reviewSection: {
    marginTop: "50px",
  },

  reviewCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "18px",
    borderRadius: "15px",
    marginBottom: "15px",
  },

  reviewStars: {
    color: "#ffd166",
    marginBottom: "8px",
  },

  reviewComment: {
    color: "white",
    lineHeight: "1.6",
  },

  reviewUser: {
    color: "#ccc",
  },
};

export default ProductDetailsPage;