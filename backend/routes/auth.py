from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext

from database.db import conn, cursor

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

    try:

        # CHECK IF EMAIL EXISTS
        cursor.execute(
            "SELECT * FROM user WHERE email=%s",
            (user.email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        # HASH PASSWORD
        hashed_password = pwd_context.hash(
            str(user.password)[:72]
        )

        # INSERT USER
        query = """
        INSERT INTO user
        (username, email, password_hash, phone, role)
        VALUES (%s, %s, %s, %s, %s)
        """

        values = (
            user.username,
            user.email,
            hashed_password,
            user.phone,
            user.role
        )

        cursor.execute(query, values)

        conn.commit()

        return {
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


# ---------------- LOGIN API ----------------

@router.post("/login")
def login(user: LoginModel):

    try:

        # FIND USER
        cursor.execute(
            "SELECT * FROM user WHERE email=%s",
            (user.email,)
        )

        db_user = cursor.fetchone()

        # USER NOT FOUND
        if not db_user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        # VERIFY PASSWORD
        password_match = pwd_context.verify(
            str(user.password)[:72],
            db_user["password_hash"]
        )

        if not password_match:
            raise HTTPException(
                status_code=401,
                detail="Invalid password"
            )

        # LOGIN SUCCESS
        return {
            "message": "Login Successful",
            "user": {
                "user_id": db_user["user_id"],
                "username": db_user["username"],
                "email": db_user["email"],
                "role": db_user["role"]
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