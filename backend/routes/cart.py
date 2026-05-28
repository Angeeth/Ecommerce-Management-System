from fastapi import APIRouter, HTTPException
from database.db import get_db_connection

router = APIRouter()

# ---------------- GET USER CART ----------------

@router.get("/cart/{user_id}")
def get_cart(user_id: int):

    conn = None
    cursor = None

    try:
        # DB CONNECTION
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

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

        return cart_items

    except Exception as e:

        print("GET CART ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        # CLOSE CURSOR
        if cursor:
            cursor.close()

        # CLOSE CONNECTION
        if conn:
            conn.close()


# ---------------- REMOVE ITEM FROM CART ----------------

@router.delete("/cart/remove/{cart_item_id}")
def remove_cart_item(cart_item_id: int):

    conn = None
    cursor = None

    try:
        # DB CONNECTION
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # CHECK ITEM EXISTS
        check_query = """
            SELECT * FROM cart_item
            WHERE cart_item_id = %s
        """

        cursor.execute(check_query, (cart_item_id,))

        item = cursor.fetchone()

        if not item:
            raise HTTPException(
                status_code=404,
                detail="Cart item not found"
            )

        # DELETE ITEM
        delete_query = """
            DELETE FROM cart_item
            WHERE cart_item_id = %s
        """

        cursor.execute(delete_query, (cart_item_id,))

        # SAVE CHANGES
        conn.commit()

        return {
            "message": "Item removed successfully"
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        print("REMOVE CART ITEM ERROR:", e)

        # ROLLBACK ON ERROR
        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        # CLOSE CURSOR
        if cursor:
            cursor.close()

        # CLOSE CONNECTION
        if conn:
            conn.close()