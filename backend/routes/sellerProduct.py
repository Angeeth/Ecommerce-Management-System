from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import os
import uuid
import shutil

from dotenv import load_dotenv

from database.db import get_db_connection

load_dotenv()

router = APIRouter()

UPLOAD_DIR = "../data/product_img"

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------- GET SELLER PRODUCTS ----------------

@router.get("/seller-products/{user_id}")
def get_seller_products(user_id: int):

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # GET SELLER ID
        cursor.execute("""
            SELECT seller_id
            FROM seller
            WHERE user_id=%s
        """, (user_id,))

        seller = cursor.fetchone()

        if not seller:
            return []

        seller_id = seller["seller_id"]

        # GET PRODUCTS
        cursor.execute("""
            SELECT *
            FROM product
            WHERE seller_id=%s
            ORDER BY product_id DESC
        """, (seller_id,))

        products = cursor.fetchall()

        # GET PRODUCT IMAGES
        for p in products:

            cursor.execute("""
                SELECT image_url
                FROM product_image
                WHERE product_id=%s
            """, (p["product_id"],))

            images = cursor.fetchall()

            p["images"] = [
                f"http://127.0.0.1:8000/product_img/{img['image_url']}"
                for img in images
            ]

        return products

    except Exception as e:

        print("GET SELLER PRODUCTS ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ---------------- GET CATEGORIES ----------------

@router.get("/categories")
def get_categories():

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT category_id, category_name
            FROM category
            ORDER BY category_name ASC
        """)

        return cursor.fetchall()

    except Exception as e:

        print("GET CATEGORIES ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ---------------- ADD PRODUCT ----------------

@router.post("/add-product")
def add_product(
    user_id: int = Form(...),
    category_id: int = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock_quantity: int = Form(...),
    brand: str = Form(...),
    images: List[UploadFile] = File(...)
):

    conn = None
    cursor = None

    try:

        # VALIDATE IMAGES
        if not images or len(images) < 1:

            raise HTTPException(
                status_code=400,
                detail="At least 1 image required"
            )

        # LIMIT MAX IMAGES
        if len(images) > 3:
            images = images[:3]

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # GET SELLER ID
        cursor.execute("""
            SELECT seller_id
            FROM seller
            WHERE user_id=%s
        """, (user_id,))

        seller = cursor.fetchone()

        if not seller:

            raise HTTPException(
                status_code=404,
                detail="Seller not found"
            )

        seller_id = seller["seller_id"]

        # INSERT PRODUCT
        cursor.execute("""
            INSERT INTO product
            (
                seller_id,
                category_id,
                name,
                description,
                price,
                stock_quantity,
                brand,
                product_status
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,'ACTIVE')
        """, (
            seller_id,
            category_id,
            name,
            description,
            price,
            stock_quantity,
            brand
        ))

        product_id = cursor.lastrowid

        # SAVE IMAGES
        for img in images:

            ext = img.filename.split(".")[-1]

            filename = f"{uuid.uuid4()}.{ext}"

            path = os.path.join(
                UPLOAD_DIR,
                filename
            )

            with open(path, "wb") as buffer:
                shutil.copyfileobj(
                    img.file,
                    buffer
                )

            cursor.execute("""
                INSERT INTO product_image
                (product_id, image_url)
                VALUES (%s,%s)
            """, (
                product_id,
                filename
            ))

        conn.commit()

        return {
            "message": "Product Added Successfully"
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        print("ADD PRODUCT ERROR:", e)

        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ---------------- TOGGLE PRODUCT STATUS ----------------

@router.put("/toggle-product-status/{product_id}")
def toggle_product_status(product_id: int):

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT product_status
            FROM product
            WHERE product_id=%s
        """, (product_id,))

        product = cursor.fetchone()

        if not product:

            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        new_status = (
            "DISCONTINUED"
            if product["product_status"] == "ACTIVE"
            else "ACTIVE"
        )

        cursor.execute("""
            UPDATE product
            SET product_status=%s
            WHERE product_id=%s
        """, (
            new_status,
            product_id
        ))

        conn.commit()

        return {
            "message": "Status updated",
            "status": new_status
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        print("TOGGLE PRODUCT STATUS ERROR:", e)

        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ---------------- UPDATE STOCK ----------------

@router.put("/update-stock/{product_id}")
def update_stock(product_id: int, action: str):

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT stock_quantity
            FROM product
            WHERE product_id=%s
        """, (product_id,))

        product = cursor.fetchone()

        if not product:

            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        stock = product["stock_quantity"]

        if action == "increase":

            stock += 1

        elif action == "decrease":

            if stock <= 0:

                raise HTTPException(
                    status_code=400,
                    detail="Stock already 0"
                )

            stock -= 1

        else:

            raise HTTPException(
                status_code=400,
                detail="Invalid action"
            )

        # UPDATE STOCK
        cursor.execute("""
            UPDATE product
            SET stock_quantity=%s
            WHERE product_id=%s
        """, (
            stock,
            product_id
        ))

        conn.commit()

        return {
            "message": "Stock updated",
            "stock": stock
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        print("UPDATE STOCK ERROR:", e)

        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()