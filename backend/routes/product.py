from fastapi import APIRouter, Query
from database.db import cursor

router = APIRouter()


# GET ALL PRODUCTS 
@router.get("/products")
def get_products(category_id: int = Query(None)):

    query = """
        SELECT
            p.product_id,
            p.name,
            p.price,
            p.category_id,
            MIN(pi.image_url) AS image_url
        FROM product p
        LEFT JOIN product_image pi
        ON p.product_id = pi.product_id
    """

    params = []

    if category_id is not None:
        query += " WHERE p.category_id = %s"
        params.append(category_id)

    query += """
        GROUP BY
            p.product_id,
            p.name,
            p.price,
            p.category_id
    """

    cursor.execute(query, params)
    products = cursor.fetchall()

    return products


# PRODUCT DETAILS + REVIEWS + RATING
@router.get("/products/{product_id}")
def get_product(product_id: int):

    # PRODUCT INFO + IMAGES
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

    # IMAGES CLEANING
    images = []
    seen = set()

    for row in rows:
        if row["image_url"] and row["image_url"] not in seen:
            images.append(row["image_url"])
            seen.add(row["image_url"])

    # REVIEWS + AVERAGE RATING
    review_query = """
        SELECT
            user_name,
            rating,
            comment,
            created_at
        FROM product_reviews
        WHERE product_id = %s
        ORDER BY created_at DESC
    """

    cursor.execute(review_query, (product_id,))
    reviews = cursor.fetchall()

    # calculate average rating
    avg_rating = 0
    if reviews:
        avg_rating = sum([r["rating"] for r in reviews]) / len(reviews)

    # FINAL RESPONSE
    product = {
        "product_id": rows[0]["product_id"],
        "name": rows[0]["name"],
        "price": rows[0]["price"],
        "description": rows[0]["description"],
        "category_id": rows[0]["category_id"],
        "images": images,

        # NEW FIELDS (DETAIL PAGE ONLY)
        "average_rating": round(avg_rating, 1),
        "total_reviews": len(reviews),
        "reviews": reviews
    }

    return product