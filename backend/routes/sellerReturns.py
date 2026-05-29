from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from threading import Thread
import time

from database.db import get_db_connection

router = APIRouter()


class ReturnStatusUpdate(BaseModel):
    return_status: str


def auto_update_return_flow(return_id):

    try:

        # AFTER 10 SEC -> PICKED_UP
        time.sleep(10)

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""

            UPDATE return_request

            SET return_status = %s

            WHERE return_id = %s

        """, (
            "PICKED_UP",
            return_id
        ))

        conn.commit()

        cursor.close()
        conn.close()

        # AFTER ANOTHER 10 SEC -> REFUNDED
        time.sleep(10)

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # GET ORDER ID
        cursor.execute("""

            SELECT
                o.order_id

            FROM return_request rr

            JOIN order_item oi
                ON rr.order_item_id = oi.order_item_id

            JOIN orders o
                ON oi.order_id = o.order_id

            WHERE rr.return_id = %s

        """, (return_id,))

        order_data = cursor.fetchone()

        # UPDATE RETURN STATUS
        cursor.execute("""

            UPDATE return_request

            SET return_status = %s

            WHERE return_id = %s

        """, (
            "REFUNDED",
            return_id
        ))

        # UPDATE PAYMENT STATUS
        if order_data:

            cursor.execute("""

                UPDATE payment

                SET payment_status = %s

                WHERE order_id = %s

            """, (
                "REFUNDED",
                order_data["order_id"]
            ))

        conn.commit()

        cursor.close()
        conn.close()

    except Exception as e:

        print("AUTO RETURN FLOW ERROR:", e)


@router.get("/seller-return-requests/{seller_id}")
def seller_return_requests(seller_id: int):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""

        SELECT

            rr.return_id,
            rr.return_reason,
            rr.return_status,
            rr.requested_at,

            o.order_id,
            o.user_id,

            p.product_id,
            p.name AS product_name,

            oi.order_item_id,
            oi.quantity,
            oi.subtotal AS refund_amount,

            u.username AS customer_name

        FROM return_request rr

        JOIN order_item oi
            ON rr.order_item_id = oi.order_item_id

        JOIN orders o
            ON oi.order_id = o.order_id

        JOIN product p
            ON oi.product_id = p.product_id

        JOIN user u
            ON o.user_id = u.user_id

        WHERE p.seller_id = %s

        ORDER BY rr.requested_at DESC

    """, (seller_id,))

    returns = cursor.fetchall()

    requested = []
    approved = []
    rejected = []

    for item in returns:

        customer_id = item["user_id"]

        # GET FRAUD SCORE 
        cursor.execute("""
            SELECT COALESCE(AVG(fraud_score), 0) AS fraud_score
            FROM fraud_flag
            WHERE user_id = %s
        """, (customer_id,))

        fraud_data = cursor.fetchone()
        fraud_score = float(fraud_data["fraud_score"])
        product_id = item["product_id"]

        # CUSTOMER RETURN COUNT
        cursor.execute("""

            SELECT COUNT(*) AS total

            FROM return_request rr

            JOIN order_item oi
                ON rr.order_item_id = oi.order_item_id

            JOIN orders o
                ON oi.order_id = o.order_id

            WHERE o.user_id = %s

        """, (customer_id,))

        customer_returns = cursor.fetchone()["total"]

        # PRODUCT RETURN COUNT
        cursor.execute("""

            SELECT COUNT(*) AS total

            FROM return_request rr

            JOIN order_item oi
                ON rr.order_item_id = oi.order_item_id

            WHERE oi.product_id = %s

        """, (product_id,))

        product_returns = cursor.fetchone()["total"]

        # RISK LEVEL
        if fraud_score >= 70:
            fraud_risk = "HIGH"

        elif fraud_score >= 40:
            fraud_risk = "MEDIUM"

        else:
            fraud_risk = "LOW"

        item["fraud_score"] = fraud_score
        item["fraud_risk_level"] = fraud_risk

        item["customer_return_count"] = customer_returns
        item["product_return_count"] = product_returns

        status = (
            item["return_status"]
            .strip()
            .upper()
        )

        if status == "REQUESTED":

            requested.append(item)

        elif status in [
            "APPROVED",
            "PICKED_UP",
            "REFUNDED"
        ]:

            approved.append(item)

        elif status == "REJECTED":

            rejected.append(item)

    cursor.close()
    conn.close()

    return {
        "success": True,
        "requested": requested,
        "approved": approved,
        "rejected": rejected
    }


@router.put("/update-return-status/{return_id}")
def update_return_status(
    return_id: int,
    data: ReturnStatusUpdate
):

    status = (
        data.return_status
        .strip()
        .upper()
    )

    allowed_status = [
        "REQUESTED",
        "APPROVED",
        "REJECTED",
        "PICKED_UP",
        "REFUNDED"
    ]

    if status not in allowed_status:

        raise HTTPException(
            status_code=400,
            detail="Invalid Return Status"
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    # CHECK EXISTS
    cursor.execute("""

        SELECT return_id

        FROM return_request

        WHERE return_id = %s

    """, (return_id,))

    existing = cursor.fetchone()

    if not existing:

        cursor.close()
        conn.close()

        raise HTTPException(
            status_code=404,
            detail="Return Not Found"
        )

    # UPDATE STATUS
    cursor.execute("""

        UPDATE return_request

        SET return_status = %s

        WHERE return_id = %s

    """, (
        status,
        return_id
    ))

    conn.commit()

    cursor.close()
    conn.close()

    # START AUTO FLOW
    if status == "APPROVED":

        thread = Thread(
            target=auto_update_return_flow,
            args=(return_id,)
        )

        thread.daemon = True
        thread.start()

    return {
        "success": True,
        "message": "Return Status Updated Successfully"
    }