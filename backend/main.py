from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.auth import router as auth_router
from routes.product import router as product_router
from routes.cart import router as cart_router
from routes.checkout import router as checkout_router
from routes.orders import router as orders_router
from routes.wishlist import router as wishlist_router
from routes.sellerDashboard import router as sellerDashboard_router
from routes.sellerProduct import router as sellerProduct_router
from routes.sellerOrders import router as sellerOrders_router
from routes.sellerReturns import router as sellerReturns_router
from routes.sellerReviews import router as sellerReviews_router


app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTES
app.include_router(auth_router)
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(checkout_router)
app.include_router(orders_router)
app.include_router(wishlist_router)
app.include_router(sellerDashboard_router)
app.include_router(sellerProduct_router)
app.include_router(sellerOrders_router)
app.include_router(sellerReturns_router)
app.include_router(sellerReviews_router)

# STATIC IMAGE FOLDER
app.mount(
    "/product_img",
    StaticFiles(directory="../data/product_img"),
    name="product_img"
)