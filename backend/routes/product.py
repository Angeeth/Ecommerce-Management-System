from fastapi import APIRouter, Query
from database.db import cursor, conn

router = APIRouter()


# GET ALL PRODUCTS
@router.get("/products")
def get_products(category_id: int = Query(None)):

    query = """
        SELECT
            p.product_id,
            p.name,
            p.price,
            p.stock_quantity,
            MIN(pi.image_url) AS image_url,

            ROUND(AVG(DISTINCT r.rating), 1)
            AS average_rating,

            COUNT(DISTINCT r.review_id)
            AS total_reviews

        FROM product p

        LEFT JOIN product_image pi
        ON p.product_id = pi.product_id

        LEFT JOIN review r
        ON p.product_id = r.product_id
        AND r.review_status = 'VISIBLE'
    """

    params = []

    if category_id is not None:

        query += """
            WHERE p.category_id = %s
        """

        params.append(category_id)

    query += """
        GROUP BY
            p.product_id,
            p.name,
            p.price,
            p.stock_quantity
    """

    cursor.execute(query, params)

    products = cursor.fetchall()

    return products

# PRODUCT DETAILS
@router.get("/products/{product_id}")
def get_product(product_id: int):

    try:

        # PRODUCT + IMAGES
        product_query = """
            SELECT
                p.product_id,
                p.name,
                p.price,
                p.description,
                p.category_id,
                pi.image_url
            FROM product p
            LEFT JOIN product_image pi
            ON p.product_id = pi.product_id
            WHERE p.product_id = %s
        """

        cursor.execute(product_query, (product_id,))
        rows = cursor.fetchall()

        if not rows:
            return {"message": "Product not found"}

        # CLEAN IMAGES
        images = []
        seen = set()

        for row in rows:

            img = row.get("image_url")

            if img and img not in seen:
                images.append(img)
                seen.add(img)

        # REVIEWS + RATINGS
        reviews = []
        avg_rating = 0

        try:

            review_query = """
                SELECT
                    u.username AS user_name,
                    r.rating,
                    r.review_text AS comment,
                    r.created_at
                FROM review r
                LEFT JOIN user u
                ON r.user_id = u.user_id
                WHERE r.product_id = %s
                AND r.review_status = 'VISIBLE'
                ORDER BY r.created_at DESC
            """

            cursor.execute(review_query, (product_id,))
            review_rows = cursor.fetchall()

            reviews = []

            for r in review_rows:

                reviews.append({
                    "user_name": r["user_name"],
                    "rating": r["rating"],
                    "comment": r["comment"],
                    "created_at": str(r["created_at"])
                })

            ratings = []

            for r in reviews:

                if r.get("rating") is not None:
                    ratings.append(r["rating"])

            if len(ratings) > 0:
                avg_rating = sum(ratings) / len(ratings)

        except Exception as review_error:

            print("REVIEW ERROR:", review_error)

            reviews = []
            avg_rating = 0

        # FINAL RESPONSE
        product = {
            "product_id": rows[0]["product_id"],
            "name": rows[0]["name"],
            "price": rows[0]["price"],
            "description": rows[0]["description"],
            "category_id": rows[0]["category_id"],
            "images": images,
            "average_rating": round(avg_rating, 1),
            "total_reviews": len(reviews),
            "reviews": reviews
        }

        return product

    except Exception as e:

        print("PRODUCT DETAILS ERROR:", e)

        return {
            "error": "Internal Server Error",
            "details": str(e)
        }


# ADD TO CART
@router.post("/add-to-cart")
def add_to_cart(data: dict):

    try:

        user_id = data.get("user_id")
        product_id = data.get("product_id")
        quantity = data.get("quantity", 1)

        if not user_id:
            return {
                "success": False,
                "message": "Login Required"
            }

        # CHECK USER CART
        cart_query = """
            SELECT cart_id
            FROM cart
            WHERE user_id = %s
        """

        cursor.execute(cart_query, (user_id,))
        cart = cursor.fetchone()

        # CREATE CART IF NOT EXISTS
        if not cart:

            create_cart_query = """
                INSERT INTO cart (user_id)
                VALUES (%s)
            """

            cursor.execute(create_cart_query, (user_id,))
            conn.commit()

            cart_id = cursor.lastrowid

        else:

            cart_id = cart["cart_id"]

        # CHECK PRODUCT EXISTS
        check_item_query = """
            SELECT cart_item_id, quantity
            FROM cart_item
            WHERE cart_id = %s
            AND product_id = %s
        """

        cursor.execute(
            check_item_query,
            (cart_id, product_id)
        )

        existing_item = cursor.fetchone()

        # UPDATE QUANTITY
        if existing_item:

            new_quantity = (
                existing_item["quantity"] + quantity
            )

            update_query = """
                UPDATE cart_item
                SET quantity = %s
                WHERE cart_item_id = %s
            """

            cursor.execute(
                update_query,
                (
                    new_quantity,
                    existing_item["cart_item_id"]
                )
            )

        # INSERT NEW PRODUCT
        else:

            insert_query = """
                INSERT INTO cart_item
                (cart_id, product_id, quantity)
                VALUES (%s, %s, %s)
            """

            cursor.execute(
                insert_query,
                (
                    cart_id,
                    product_id,
                    quantity
                )
            )

        conn.commit()

        return {
            "success": True,
            "message": "Added To Cart"
        }

    except Exception as e:

        print("ADD TO CART ERROR:", e)

        return {
            "success": False,
            "message": str(e)
        }


# ADD TO WISHLIST
@router.post("/wishlist")
def add_to_wishlist(data: dict):

    try:

        user_id = data.get("user_id")
        product_id = data.get("product_id")

        if not user_id:
            return {
                "success": False,
                "message": "Login Required"
            }

        # CHECK USER WISHLIST
        wishlist_query = """
            SELECT wishlist_id
            FROM wishlist
            WHERE user_id = %s
        """

        cursor.execute(wishlist_query, (user_id,))
        wishlist = cursor.fetchone()

        # CREATE WISHLIST IF NOT EXISTS
        if not wishlist:

            create_wishlist_query = """
                INSERT INTO wishlist (user_id)
                VALUES (%s)
            """

            cursor.execute(
                create_wishlist_query,
                (user_id,)
            )

            conn.commit()

            wishlist_id = cursor.lastrowid

        else:

            wishlist_id = wishlist["wishlist_id"]

        # CHECK PRODUCT EXISTS
        check_item_query = """
            SELECT wishlist_item_id
            FROM wishlist_item
            WHERE wishlist_id = %s
            AND product_id = %s
        """

        cursor.execute(
            check_item_query,
            (wishlist_id, product_id)
        )

        existing_item = cursor.fetchone()

        if existing_item:

            return {
                "success": True,
                "message": "Already In Wishlist"
            }

        # INSERT PRODUCT
        insert_query = """
            INSERT INTO wishlist_item
            (wishlist_id, product_id)
            VALUES (%s, %s)
        """

        cursor.execute(
            insert_query,
            (
                wishlist_id,
                product_id
            )
        )

        conn.commit()

        return {
            "success": True,
            "message": "Added To Wishlist"
        }

    except Exception as e:

        print("WISHLIST ERROR:", e)

        return {
            "success": False,
            "message": str(e)
        }