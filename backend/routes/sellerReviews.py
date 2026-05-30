from fastapi import APIRouter
from database.db import get_db_connection

router = APIRouter()

BASE_IMAGE_URL = "http://127.0.0.1:8000/product_img"

@router.get("/seller-product-sentiment/{seller_id}")
def seller_product_sentiment(seller_id: int):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # MAIN PRODUCT ANALYTICS

    cursor.execute("""

        SELECT

            p.product_id,
            p.name AS product_name,
            p.avg_rating,

            MIN(pi.image_url) AS image_url,

            COUNT(r.review_id) AS total_reviews,

            SUM(
                CASE
                    WHEN r.sentiment_score >= 0.75
                    THEN 1
                    ELSE 0
                END
            ) AS positive_reviews,

            SUM(
                CASE
                    WHEN r.sentiment_score >= 0.40
                    AND r.sentiment_score < 0.75
                    THEN 1
                    ELSE 0
                END
            ) AS neutral_reviews,

            SUM(
                CASE
                    WHEN r.sentiment_score < 0.40
                    THEN 1
                    ELSE 0
                END
            ) AS negative_reviews

        FROM product p

        LEFT JOIN review r
            ON p.product_id = r.product_id

        LEFT JOIN product_image pi
            ON p.product_id = pi.product_id

        WHERE p.seller_id = %s

        GROUP BY
            p.product_id,
            p.name,
            p.avg_rating

        ORDER BY total_reviews DESC

    """, (seller_id,))

    products = cursor.fetchall()

    final_products = []

    for item in products:

        product_id = item["product_id"]

        total = item["total_reviews"] or 0
        positive = item["positive_reviews"] or 0
        neutral = item["neutral_reviews"] or 0
        negative = item["negative_reviews"] or 0

        if total > 0:

            positive_percent = round(
                (positive / total) * 100,
                1
            )

            neutral_percent = round(
                (neutral / total) * 100,
                1
            )

            negative_percent = round(
                (negative / total) * 100,
                1
            )

        else:

            positive_percent = 0
            neutral_percent = 0
            negative_percent = 0

        # FETCH POSITIVE REVIEWS

        cursor.execute("""

            SELECT
                review_text,
                rating,
                sentiment_score

            FROM review

            WHERE product_id = %s
            AND sentiment_score >= 0.75

            ORDER BY sentiment_score DESC

            LIMIT 3

        """, (product_id,))

        positive_reviews_list = cursor.fetchall()

        # FETCH NEGATIVE REVIEWS

        cursor.execute("""

            SELECT
                review_text,
                rating,
                sentiment_score

            FROM review

            WHERE product_id = %s
            AND sentiment_score < 0.40

            ORDER BY sentiment_score ASC

            LIMIT 3

        """, (product_id,))

        negative_reviews_list = cursor.fetchall()

        image_name = item["image_url"]

        final_products.append({

            "product_id": product_id,

            "product_name": item["product_name"],

            "avg_rating": float(
                item["avg_rating"] or 0
            ),

            "image_url":
                f"{BASE_IMAGE_URL}/{image_name}"
                if image_name
                else None,

            "total_reviews": total,

            "positive_percent": positive_percent,

            "neutral_percent": neutral_percent,

            "negative_percent": negative_percent,

            # IMPORTANT

            "positive_reviews_list":
                positive_reviews_list,

            "negative_reviews_list":
                negative_reviews_list,

        })

    cursor.close()
    conn.close()

    return {
        "success": True,
        "products": final_products
    }