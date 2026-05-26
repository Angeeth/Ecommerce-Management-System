from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import mysql.connector
import os
import uuid
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

router = APIRouter()

# DB CONNECTION
def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

# TRANSACTION ID
def generate_transaction_id():
    return "TXN" + uuid.uuid4().hex[:12].upper()

# MODELS
class AddressModel(BaseModel):
    user_id: int
    address_line: str
    city: str
    state: str
    postal_code: str
    country: str
    address_type: str


class UserUpdateModel(BaseModel):
    username: str
    phone: str

class ItemSchema(BaseModel):
    product_id: int
    quantity: int


class OrderModel(BaseModel):
    user_id: int
    address_id: int
    payment_method: str
    product_id: Optional[int] = None
    quantity: Optional[int] = None
    items: Optional[List[ItemSchema]] = None


# GET USER + ADDRESS
@router.get("/checkout-user/{user_id}")
def get_checkout_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT user_id, username, email, phone
            FROM user
            WHERE user_id = %s
        """, (user_id,))
        user = cursor.fetchone()

        cursor.execute("""
            SELECT *
            FROM address
            WHERE user_id = %s
            ORDER BY address_id DESC
            LIMIT 1
        """, (user_id,))
        address = cursor.fetchone()

        return {"user": user, "address": address}

    finally:
        cursor.close()
        conn.close()


# SAVE / UPDATE ADDRESS
@router.post("/save-address")
def save_address(data: AddressModel):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT address_id FROM address WHERE user_id=%s
        """, (data.user_id,))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("""
                UPDATE address
                SET address_line=%s,
                    city=%s,
                    state=%s,
                    postal_code=%s,
                    country=%s,
                    address_type=%s
                WHERE address_id=%s
            """, (
                data.address_line,
                data.city,
                data.state,
                data.postal_code,
                data.country,
                data.address_type,
                existing["address_id"]
            ))

            address_id = existing["address_id"]

        else:
            cursor.execute("""
                INSERT INTO address
                (user_id, address_line, city, state, postal_code, country, address_type)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (
                data.user_id,
                data.address_line,
                data.city,
                data.state,
                data.postal_code,
                data.country,
                data.address_type
            ))

            address_id = cursor.lastrowid

        conn.commit()

        return {
            "message": "Address saved",
            "address_id": address_id
        }

    finally:
        cursor.close()
        conn.close()


# UPDATE USER
@router.put("/update-user/{user_id}")
def update_user(user_id: int, data: UserUpdateModel):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE user
            SET username=%s, phone=%s
            WHERE user_id=%s
        """, (data.username, data.phone, user_id))

        conn.commit()
        return {"message": "User updated"}

    finally:
        cursor.close()
        conn.close()


# CREATE ORDER + PAYMENT
@router.post("/create-order")
def create_order(data: OrderModel):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        calculated_items = []
        subtotal = 0.0

        if data.product_id and data.quantity:
            cursor.execute("SELECT price FROM product WHERE product_id = %s", (data.product_id,))
            product = cursor.fetchone()
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            
            price = float(product["price"])
            item_subtotal = price * data.quantity
            subtotal += item_subtotal
            
            calculated_items.append({
                "product_id": data.product_id,
                "quantity": data.quantity,
                "price": price,
                "subtotal": item_subtotal
            })

        elif data.items:
            for item in data.items:
                cursor.execute("SELECT price FROM product WHERE product_id = %s", (item.product_id,))
                product = cursor.fetchone()
                if not product:
                    raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
                
                price = float(product["price"])
                item_subtotal = price * item.quantity
                subtotal += item_subtotal
                
                calculated_items.append({
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "price": price,
                    "subtotal": item_subtotal
                })
        else:
            raise HTTPException(status_code=400, detail="Missing order items or product details")


        shipping = 99
        tax = round(subtotal * 0.05)
        total = subtotal + shipping + tax

        raw_method = (data.payment_method or "").strip().lower().replace("_", " ")

        method_map = {
            "upi": "UPI",
            "card": "CARD",
            "credit card": "CARD",
            "debit card": "CARD",
            "net banking": "NET_BANKING",
            "cash on delivery": "COD",
            "cod": "COD",
            "wallet": "WALLET"
        }

        if raw_method not in method_map:
            normalized_method = "UPI" 
        else:
            normalized_method = method_map[raw_method]

            normalized_method = method_map.get(raw_method, "UPI")
            is_cod = normalized_method == "COD"

            order_table_payment_status = "PENDING" if is_cod else "PAID"
            payment_table_status = "PENDING" if is_cod else "SUCCESS"

            created_orders = []

            for calc_item in calculated_items:

                item_total = calc_item["subtotal"]

                cursor.execute("""
                    INSERT INTO orders
                    (user_id, address_id, total_amount, payment_status, order_status)
                    VALUES (%s,%s,%s,%s,%s)
                """, (
                    data.user_id,
                    data.address_id,
                    item_total,
                    order_table_payment_status,
                    "PLACED"
                ))

                order_id = cursor.lastrowid

                created_orders.append(order_id)

                cursor.execute("""
                    INSERT INTO order_item
                    (order_id, product_id, quantity, price, subtotal)
                    VALUES (%s,%s,%s,%s,%s)
                """, (
                    order_id,
                    calc_item["product_id"],
                    calc_item["quantity"],
                    calc_item["price"],
                    calc_item["subtotal"]
                ))

            txn_id = generate_transaction_id()

            if is_cod:
                txn_id = "COD-" + txn_id

            cursor.execute("""
                INSERT INTO payment
                (order_id, payment_method, payment_status, transaction_id, amount)
                VALUES (%s,%s,%s,%s,%s)
            """, (
                order_id,
                normalized_method,
                payment_table_status,
                txn_id,
                total
            ))

            if data.items:
                cursor.execute("SELECT cart_id FROM cart WHERE user_id = %s", (data.user_id,))
                user_cart = cursor.fetchone()
                if user_cart:
                    cursor.execute("DELETE FROM cart_item WHERE cart_id = %s", (user_cart["cart_id"],))

            conn.commit()

            return {
                "message": "Order placed successfully",
                "order_id": order_id,
                "payment_status": payment_table_status,  
                "payment_method": normalized_method,
                "transaction_id": txn_id,
                "total": total
            }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()