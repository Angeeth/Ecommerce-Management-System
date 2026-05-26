from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.auth import router as auth_router
from routes.product import router as product_router
from routes.cart import router as cart_router
from routes.checkout import router as checkout_router
from routes.orders import router as orders_router
from routes.wishlist import router as wishlist_router

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

# STATIC IMAGE FOLDER
app.mount(
    "/product_img",
    StaticFiles(directory="../data/product_img"),
    name="product_img"
)