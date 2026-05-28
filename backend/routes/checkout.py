from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import uuid
from typing import List, Optional

from database.db import get_db_connection

router = APIRouter()


# ---------------- TRANSACTION ID ----------------

def generate_transaction_id():
    return "TXN" + uuid.uuid4().hex[:12].upper()


# ---------------- MODELS ----------------

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


# ---------------- GET USER + ADDRESS ----------------

@router.get("/checkout-user/{user_id}")
def get_checkout_user(user_id: int):

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

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

        return {
            "user": user,
            "address": address
        }

    except Exception as e:

        print("CHECKOUT USER ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ---------------- SAVE / UPDATE ADDRESS ----------------

@router.post("/save-address")
def save_address(data: AddressModel):

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT address_id
            FROM address
            WHERE user_id=%s
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

    except Exception as e:

        print("SAVE ADDRESS ERROR:", e)

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


# ---------------- UPDATE USER ----------------

@router.put("/update-user/{user_id}")
def update_user(user_id: int, data: UserUpdateModel):

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE user
            SET username=%s,
                phone=%s
            WHERE user_id=%s
        """, (
            data.username,
            data.phone,
            user_id
        ))

        conn.commit()

        return {
            "message": "User updated"
        }

    except Exception as e:

        print("UPDATE USER ERROR:", e)

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


# ---------------- CREATE ORDER + PAYMENT ----------------

@router.post("/create-order")
def create_order(data: OrderModel):

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        calculated_items = []
        subtotal = 0.0

        # SINGLE PRODUCT ORDER
        if data.product_id and data.quantity:

            cursor.execute("""
                SELECT price
                FROM product
                WHERE product_id = %s
            """, (data.product_id,))

            product = cursor.fetchone()

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail="Product not found"
                )

            price = float(product["price"])

            item_subtotal = price * data.quantity

            subtotal += item_subtotal

            calculated_items.append({
                "product_id": data.product_id,
                "quantity": data.quantity,
                "price": price,
                "subtotal": item_subtotal
            })

        # MULTIPLE CART ITEMS
        elif data.items:

            for item in data.items:

                cursor.execute("""
                    SELECT price
                    FROM product
                    WHERE product_id = %s
                """, (item.product_id,))

                product = cursor.fetchone()

                if not product:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Product ID {item.product_id} not found"
                    )

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
            raise HTTPException(
                status_code=400,
                detail="Missing order items or product details"
            )

        # PRICE CALCULATION
        shipping = 99
        tax = round(subtotal * 0.05)
        total = subtotal + shipping + tax

        # PAYMENT METHOD NORMALIZATION
        raw_method = (
            data.payment_method or ""
        ).strip().lower().replace("_", " ")

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

        normalized_method = method_map.get(
            raw_method,
            "UPI"
        )

        is_cod = normalized_method == "COD"

        order_table_payment_status = (
            "PENDING" if is_cod else "PAID"
        )

        payment_table_status = (
            "PENDING" if is_cod else "SUCCESS"
        )

        created_orders = []

        # CREATE ORDERS
        for calc_item in calculated_items:

            item_total = calc_item["subtotal"]

            cursor.execute("""
                INSERT INTO orders
                (
                    user_id,
                    address_id,
                    total_amount,
                    payment_status,
                    order_status
                )
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
                (
                    order_id,
                    product_id,
                    quantity,
                    price,
                    subtotal
                )
                VALUES (%s,%s,%s,%s,%s)
            """, (
                order_id,
                calc_item["product_id"],
                calc_item["quantity"],
                calc_item["price"],
                calc_item["subtotal"]
            ))

        # TRANSACTION ID
        txn_id = generate_transaction_id()

        if is_cod:
            txn_id = "COD-" + txn_id

        # PAYMENT ENTRY
        cursor.execute("""
            INSERT INTO payment
            (
                order_id,
                payment_method,
                payment_status,
                transaction_id,
                amount
            )
            VALUES (%s,%s,%s,%s,%s)
        """, (
            order_id,
            normalized_method,
            payment_table_status,
            txn_id,
            total
        ))

        # CLEAR CART AFTER ORDER
        if data.items:

            cursor.execute("""
                SELECT cart_id
                FROM cart
                WHERE user_id = %s
            """, (data.user_id,))

            user_cart = cursor.fetchone()

            if user_cart:

                cursor.execute("""
                    DELETE FROM cart_item
                    WHERE cart_id = %s
                """, (user_cart["cart_id"],))

        conn.commit()

        return {
            "message": "Order placed successfully",
            "order_id": order_id,
            "payment_status": payment_table_status,
            "payment_method": normalized_method,
            "transaction_id": txn_id,
            "total": total
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        print("CREATE ORDER ERROR:", e)

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