from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext

from database.db import get_db_connection

router = APIRouter()

# ---------------- PASSWORD HASH ----------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# ---------------- Pydantic Models ----------------

class SignupModel(BaseModel):
    username: str
    email: str
    phone: str
    password: str
    role: str


class LoginModel(BaseModel):
    email: str
    password: str


# ---------------- SIGNUP API ----------------

@router.post("/signup")
def signup(user: SignupModel):

    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT *
            FROM user
            WHERE email = %s
            """,
            (user.email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:

            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )


        hashed_password = pwd_context.hash(
            str(user.password)[:72]
        )

        insert_user_query = """
        INSERT INTO user
        (
            username,
            email,
            password_hash,
            phone,
            role
        )
        VALUES (%s,%s,%s,%s,%s)
        """

        user_values = (
            user.username,
            user.email,
            hashed_password,
            user.phone,
            user.role
        )

        cursor.execute(
            insert_user_query,
            user_values
        )

        conn.commit()

        user_id = cursor.lastrowid

        if user.role.strip().lower() == "seller":

            seller_query = """
            INSERT INTO seller
            (
                user_id,
                shop_name,
                shop_description
            )
            VALUES (%s,%s,%s)
            """

            seller_values = (
                user_id,
                f"{user.username} Store",
                "New Seller Store"
            )

            cursor.execute(
                seller_query,
                seller_values
            )

            conn.commit()

        return {
            "success": True,
            "message": "Signup Successful"
        }

    except HTTPException as http_error:

        raise http_error

    except Exception as e:

        print("SIGNUP ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ---------------- LOGIN API ----------------

@router.post("/login")
def login(user: LoginModel):

    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor(
            dictionary=True
        )

        login_query = """
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.phone,
            u.role,
            u.password_hash,

            s.seller_id,
            s.shop_name,
            s.shop_description

        FROM user u

        LEFT JOIN seller s
        ON u.user_id = s.user_id

        WHERE u.email = %s
        """

        cursor.execute(
            login_query,
            (user.email,)
        )

        db_user = cursor.fetchone()



        if not db_user:

            raise HTTPException(
                status_code=401,
                detail="User not found"
            )


        password_match = pwd_context.verify(
            str(user.password)[:72],
            db_user["password_hash"]
        )

        if not password_match:

            raise HTTPException(
                status_code=401,
                detail="Invalid password"
            )


        return {

            "success": True,

            "message": "Login Successful",

            "user": {

                "user_id":
                    db_user["user_id"],

                "username":
                    db_user["username"],

                "email":
                    db_user["email"],

                "phone":
                    db_user["phone"],

                "role":
                    db_user["role"],

                "seller_id":
                    db_user["seller_id"],

                "shop_name":
                    db_user["shop_name"],

                "shop_description":
                    db_user["shop_description"]

            }
        }

    except HTTPException as http_error:

        raise http_error

    except Exception as e:

        print("LOGIN ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()