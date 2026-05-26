from fastapi import APIRouter
from database.db import conn

router = APIRouter()


# GET USER WISHLIST
@router.get("/wishlist/{user_id}")
def get_wishlist(user_id: int):

    cursor = conn.cursor(dictionary=True)

    try:

        query = """
            SELECT
                wi.wishlist_item_id,
                p.product_id,
                p.name AS product_name,
                p.price,
                MIN(pi.image_url) AS image_url

            FROM wishlist w

            JOIN wishlist_item wi
            ON w.wishlist_id = wi.wishlist_id

            JOIN product p
            ON wi.product_id = p.product_id

            LEFT JOIN product_image pi
            ON p.product_id = pi.product_id

            WHERE w.user_id = %s

            GROUP BY
                wi.wishlist_item_id,
                p.product_id,
                p.name,
                p.price
        """

        cursor.execute(query, (user_id,))

        wishlist_items = cursor.fetchall()

        return wishlist_items

    except Exception as e:

        return {"error": str(e)}

    finally:

        cursor.close()


# REMOVE FROM WISHLIST
@router.delete("/wishlist/remove/{wishlist_item_id}")
def remove_wishlist_item(wishlist_item_id: int):

    cursor = conn.cursor(dictionary=True)

    try:

        delete_query = """
            DELETE FROM wishlist_item
            WHERE wishlist_item_id = %s
        """

        cursor.execute(delete_query, (wishlist_item_id,))

        conn.commit()

        return {
            "message": "Item removed successfully"
        }

    except Exception as e:

        conn.rollback()

        return {"error": str(e)}

    finally:

        cursor.close()