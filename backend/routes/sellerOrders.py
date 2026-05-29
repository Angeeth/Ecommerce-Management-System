from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import get_db_connection

router = APIRouter()


# ---------------- UPDATE STATUS MODEL ----------------

class StatusUpdateModel(BaseModel):
    order_id: int
    order_status: str


# ---------------- GET SELLER ORDERS ----------------

@router.get("/seller-orders/{seller_user_id}")
def get_seller_orders(seller_user_id: int):

    conn = None
    cursor = None

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # GET SELLER ID
        cursor.execute("""
            SELECT seller_id
            FROM seller
            WHERE user_id = %s
        """, (seller_user_id,))

        seller = cursor.fetchone()

        if not seller:

            raise HTTPException(
                status_code=404,
                detail="Seller not found"
            )

        seller_id = seller["seller_id"]

        # GET ONLY ACTIVE ORDER TYPES
        cursor.execute("""
            SELECT
                o.order_id,
                o.order_status,
                o.payment_status,
                o.ordered_at,
                o.delivery_date,

                oi.order_item_id,
                oi.quantity,
                oi.subtotal,

                p.product_id,
                p.name AS product_name,
                p.price,

                pi.image_url,

                u.username,
                u.phone

            FROM orders o

            JOIN order_item oi
                ON o.order_id = oi.order_id

            JOIN product p
                ON oi.product_id = p.product_id

            LEFT JOIN (
                SELECT
                    product_id,
                    MIN(image_url) AS image_url
                FROM product_image
                GROUP BY product_id
            ) pi
                ON p.product_id = pi.product_id

            JOIN user u
                ON o.user_id = u.user_id

            WHERE p.seller_id = %s

            AND o.order_status IN (
                'PLACED',
                'SHIPPED',
                'OUT_FOR_DELIVERY',
                'DELIVERED'
            )

            ORDER BY o.ordered_at DESC
        """, (seller_id,))

        orders = cursor.fetchall()

        return {
            "orders": orders
        }

    except Exception as e:

        print("SELLER ORDERS ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ---------------- UPDATE ORDER STATUS ----------------

@router.put("/seller-update-order")
def update_order_status(data: StatusUpdateModel):

    conn = None
    cursor = None

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE orders
            SET
                order_status = %s,

                delivery_date =
                    CASE
                        WHEN %s = 'DELIVERED'
                        THEN NOW()
                        ELSE delivery_date
                    END

            WHERE order_id = %s
        """, (
            data.order_status,
            data.order_status,
            data.order_id
        ))

        conn.commit()

        return {
            "message": "Order status updated"
        }

    except Exception as e:

        print("UPDATE STATUS ERROR:", e)

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