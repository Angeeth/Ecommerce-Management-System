from fastapi import APIRouter, HTTPException
from database.db import get_db_connection

router = APIRouter()

@router.get("/seller-dashboard/{seller_id}")
def seller_dashboard(seller_id: int):

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # ---------------- SELLER INFO ----------------
        cursor.execute("""
            SELECT
                s.seller_id,
                s.shop_name,
                s.shop_description,
                u.username,
                u.email
            FROM seller s
            JOIN user u ON s.user_id = u.user_id
            WHERE s.seller_id = %s
        """, (seller_id,))

        seller = cursor.fetchone()

        if not seller:
            raise HTTPException(status_code=404, detail="Seller not found")


        SUCCESS_CONDITION = """
            AND o.payment_status = 'PAID'
            AND o.order_status = 'DELIVERED'
        """

        # ---------------- TOTAL SALES ----------------
        cursor.execute(f"""
            SELECT IFNULL(SUM(oi.subtotal), 0) AS total_sales
            FROM order_item oi
            JOIN product p ON oi.product_id = p.product_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE p.seller_id = %s
            {SUCCESS_CONDITION}
        """, (seller_id,))
        sales = cursor.fetchone()

        # ---------------- TOTAL ORDERS ----------------
        cursor.execute(f"""
            SELECT COUNT(DISTINCT o.order_id) AS total_orders
            FROM orders o
            JOIN order_item oi ON o.order_id = oi.order_id
            JOIN product p ON oi.product_id = p.product_id
            WHERE p.seller_id = %s
            {SUCCESS_CONDITION}
        """, (seller_id,))
        orders = cursor.fetchone()

        # ---------------- TOTAL PRODUCTS ----------------
        cursor.execute("""
            SELECT COUNT(*) AS total_products
            FROM product
            WHERE seller_id = %s
        """, (seller_id,))
        products = cursor.fetchone()

        # ---------------- TOTAL REVIEWS ----------------
        cursor.execute("""
            SELECT COUNT(r.review_id) AS total_reviews
            FROM review r
            JOIN product p ON r.product_id = p.product_id
            WHERE p.seller_id = %s
              AND r.review_status = 'VISIBLE'
        """, (seller_id,))
        reviews = cursor.fetchone()

        # ---------------- TOTAL RETURNS ----------------
        cursor.execute("""
            SELECT COUNT(rr.return_id) AS total_returns
            FROM return_request rr
            JOIN order_item oi ON rr.order_item_id = oi.order_item_id
            JOIN product p ON oi.product_id = p.product_id
            WHERE p.seller_id = %s
        """, (seller_id,))
        returns = cursor.fetchone()

        # ---------------- DAILY ORDERS ----------------
        cursor.execute(f"""
            SELECT
                DATE(o.ordered_at) AS day,
                COUNT(DISTINCT o.order_id) AS orders
            FROM orders o
            JOIN order_item oi ON o.order_id = oi.order_id
            JOIN product p ON oi.product_id = p.product_id
            WHERE p.seller_id = %s
              {SUCCESS_CONDITION}
            GROUP BY DATE(o.ordered_at)
            ORDER BY day ASC
        """, (seller_id,))

        daily_orders_raw = cursor.fetchall()

        daily_orders = [
            {
                "day": str(row["day"]),
                "orders": int(row["orders"] or 0)
            }
            for row in daily_orders_raw
        ]

        # ---------------- RECENT ORDERS ----------------
        cursor.execute("""
            SELECT
                o.order_id,
                o.ordered_at,
                o.order_status,
                o.payment_status,
                p.name AS product_name,
                oi.quantity,
                oi.subtotal
            FROM orders o
            JOIN order_item oi ON o.order_id = oi.order_id
            JOIN product p ON oi.product_id = p.product_id
            WHERE p.seller_id = %s
            ORDER BY o.ordered_at DESC
            LIMIT 5
        """, (seller_id,))
        recent_orders = cursor.fetchall()

        # ---------------- TOP PRODUCTS ----------------
        cursor.execute("""
            SELECT
                p.product_id,
                p.name,
                SUM(oi.quantity) AS total_sold
            FROM order_item oi
            JOIN product p ON oi.product_id = p.product_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE p.seller_id = %s
              AND o.order_status != 'CANCELLED'
            GROUP BY p.product_id, p.name
            ORDER BY total_sold DESC
            LIMIT 5
        """, (seller_id,))
        top_products = cursor.fetchall()

        # ---------------- LOW STOCK ----------------
        cursor.execute("""
            SELECT product_id, name, stock_quantity
            FROM product
            WHERE seller_id = %s AND stock_quantity <= 5
            ORDER BY stock_quantity ASC
            LIMIT 5
        """, (seller_id,))
        low_stock_products = cursor.fetchall()

        return {
            "success": True,
            "seller": seller,
            "stats": {
                "total_sales": float(sales["total_sales"] or 0),
                "total_orders": orders["total_orders"] or 0,
                "total_products": products["total_products"] or 0,
                "total_reviews": reviews["total_reviews"] or 0,
                "total_returns": returns["total_returns"] or 0
            },
            "daily_orders": daily_orders,
            "recent_orders": recent_orders,
            "top_products": top_products,
            "low_stock_products": low_stock_products
        }

    except Exception as e:
        print("SELLER DASHBOARD ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()