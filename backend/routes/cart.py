from fastapi import APIRouter
from database.db import cursor, conn

router = APIRouter()

# GET USER CART
@router.get("/cart/{user_id}")
def get_cart(user_id: int):

    cursor = conn.cursor(dictionary=True)

    try:
        query = """
            SELECT
                ci.cart_item_id,
                p.product_id,
                p.name,
                p.price,
                ci.quantity,
                MIN(pi.image_url) AS image_url

            FROM cart c

            JOIN cart_item ci
            ON c.cart_id = ci.cart_id

            JOIN product p
            ON ci.product_id = p.product_id

            LEFT JOIN product_image pi
            ON p.product_id = pi.product_id

            WHERE c.user_id = %s

            GROUP BY
                ci.cart_item_id,
                p.product_id,
                p.name,
                p.price,
                ci.quantity
        """

        cursor.execute(query, (user_id,))

        cart_items = cursor.fetchall()
        conn.commit()

        return cart_items
    except Exception as e:
            conn.rollback()
            return {"error": str(e)}
    finally:
            # ADD THIS: Always close it
            cursor.close()


# REMOVE ITEM FROM CART
@router.delete("/cart/remove/{cart_item_id}")
def remove_cart_item(cart_item_id: int):
    cursor = conn.cursor(dictionary=True)

    try:

        # CHECK ITEM EXISTS
        check_query = """
            SELECT * FROM cart_item
            WHERE cart_item_id = %s
        """

        cursor.execute(check_query, (cart_item_id,))

        item = cursor.fetchone()

        if not item:
            return {
                "message": "Cart item not found"
            }

        # DELETE ITEM
        delete_query = """
            DELETE FROM cart_item
            WHERE cart_item_id = %s
        """

        cursor.execute(delete_query, (cart_item_id,))

        conn.commit()

        return {
            "message": "Item removed successfully"
        }
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}
    finally:
        # ADD THIS: Always close it
        cursor.close()