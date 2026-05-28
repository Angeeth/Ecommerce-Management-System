from fastapi import APIRouter, HTTPException

from database.db import get_db_connection

router = APIRouter()


# ---------------- GET USER WISHLIST ----------------

@router.get("/wishlist/{user_id}")
def get_wishlist(user_id: int):

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

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

        print("GET WISHLIST ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ---------------- REMOVE FROM WISHLIST ----------------

@router.delete("/wishlist/remove/{wishlist_item_id}")
def remove_wishlist_item(wishlist_item_id: int):

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # CHECK ITEM EXISTS
        check_query = """
            SELECT wishlist_item_id
            FROM wishlist_item
            WHERE wishlist_item_id = %s
        """

        cursor.execute(check_query, (wishlist_item_id,))

        item = cursor.fetchone()

        if not item:

            raise HTTPException(
                status_code=404,
                detail="Wishlist item not found"
            )

        # DELETE ITEM
        delete_query = """
            DELETE FROM wishlist_item
            WHERE wishlist_item_id = %s
        """

        cursor.execute(delete_query, (wishlist_item_id,))

        conn.commit()

        return {
            "message": "Item removed successfully"
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        print("REMOVE WISHLIST ITEM ERROR:", e)

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