from fastapi import APIRouter
from pydantic import BaseModel
from database.db import conn

router = APIRouter()


# GET ORDERS
@router.get("/orders/{user_id}")
def get_user_orders(user_id: int):

    connection = conn
    cursor = connection.cursor(dictionary=True)

    try:

        query = """
            SELECT
                o.order_id,
                o.total_amount,
                o.payment_status,
                o.order_status,
                o.ordered_at,
                o.delivery_date,

                oi.order_item_id,
                oi.quantity,
                oi.price AS item_price,
                oi.subtotal,

                p.product_id,
                p.name AS product_name,
                MIN(pi.image_url) AS image_url,

                rr.return_status

            FROM orders o

            LEFT JOIN order_item oi
                ON o.order_id = oi.order_id

            LEFT JOIN product p
                ON oi.product_id = p.product_id

            LEFT JOIN product_image pi
                ON p.product_id = pi.product_id

            LEFT JOIN return_request rr
                ON oi.order_item_id = rr.order_item_id

            WHERE o.user_id = %s

            GROUP BY
                o.order_id,
                o.total_amount,
                o.payment_status,
                o.order_status,
                o.ordered_at,
                o.delivery_date,
                oi.order_item_id,
                oi.quantity,
                oi.price,
                oi.subtotal,
                p.product_id,
                p.name,
                rr.return_status

            ORDER BY o.ordered_at DESC
        """

        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()

        orders_dict = {}

        for row in rows:

            order_id = row["order_id"]

            if order_id not in orders_dict:
                orders_dict[order_id] = {
                    "order_id": order_id,
                    "total_amount": float(row["total_amount"]) if row["total_amount"] else 0,
                    "payment_status": row["payment_status"],
                    "order_status": row["order_status"],
                    "ordered_at": str(row["ordered_at"]),
                    "delivery_date": str(row["delivery_date"]),
                    "items": []
                }

            if row["product_id"]:

                orders_dict[order_id]["items"].append({
                    "order_item_id": row["order_item_id"],
                    "product_id": row["product_id"],
                    "product_name": row["product_name"],
                    "quantity": row["quantity"],
                    "price": float(row["item_price"]),
                    "subtotal": float(row["subtotal"]),
                    "image_url": row["image_url"],
                    "return_status": row["return_status"]
                })

        return list(orders_dict.values())

    except Exception as e:
        return {"error": str(e)}

    finally:
        cursor.close()


# RETURN REQUEST
class ReturnRequestModel(BaseModel):
    order_item_id: int
    user_id: int
    return_reason: str


@router.post("/return-request")
def create_return_request(data: ReturnRequestModel):

    connection = conn
    cursor = connection.cursor(dictionary=True)

    try:

        if not data.return_reason or not data.return_reason.strip():
            return {"error": "Return reason is required"}

        # prevent duplicate return
        cursor.execute("""
            SELECT return_id
            FROM return_request
            WHERE order_item_id = %s
        """, (data.order_item_id,))

        if cursor.fetchone():
            return {"error": "Return already requested for this item"}

        cursor.execute("""
            SELECT oi.order_id
            FROM order_item oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE oi.order_item_id = %s
            AND o.user_id = %s
        """, (data.order_item_id, data.user_id))

        row = cursor.fetchone()

        if not row:
            return {"error": "Invalid order item"}

        order_id = row["order_id"]

        # insert return request
        cursor.execute("""
            INSERT INTO return_request
            (order_item_id, user_id, return_reason, return_status)
            VALUES (%s, %s, %s, %s)
        """, (
            data.order_item_id,
            data.user_id,
            data.return_reason,
            "REQUESTED"
        ))

        # update order status
        cursor.execute("""
            UPDATE orders
            SET order_status = 'RETURN_REQUESTED'
            WHERE order_id = %s
        """, (order_id,))

        connection.commit()

        return {
            "message": "Return request created successfully",
            "status": "REQUESTED"
        }

    except Exception as e:
        connection.rollback()
        return {"error": str(e)}

    finally:
        cursor.close()


# CANCEL ORDER
class CancelOrderModel(BaseModel):
    order_id: int
    user_id: int


@router.post("/cancel-order")
def cancel_order(data: CancelOrderModel):

    connection = conn
    cursor = connection.cursor()

    try:

        cursor.execute("""
            SELECT order_status
            FROM orders
            WHERE order_id = %s AND user_id = %s
        """, (data.order_id, data.user_id))

        order = cursor.fetchone()

        if not order:
            return {"error": "Order not found"}

        if order[0] == "DELIVERED":
            return {"error": "Delivered orders cannot be cancelled"}

        if order[0] == "CANCELLED":
            return {"error": "Order already cancelled"}

        cursor.execute("""
            UPDATE orders
            SET order_status = 'CANCELLED'
            WHERE order_id = %s AND user_id = %s
        """, (data.order_id, data.user_id))

        connection.commit()

        return {
            "message": "Order cancelled successfully",
            "status": "CANCELLED"
        }

    except Exception as e:
        connection.rollback()
        return {"error": str(e)}

    finally:
        cursor.close()