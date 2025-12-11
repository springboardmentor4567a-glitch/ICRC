from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

# 1. Base User Schema
class UserBase(BaseModel):
    email: EmailStr

# 2. Input: Registration
class UserCreate(UserBase):
    name: str
    password: str
    dob: date

# 3. Input: Login
class UserLogin(UserBase):
    password: str

# 4. Output: User Details (Safe, no password)
class UserResponse(UserBase):
    id: int
    name: str
    message: str = "Success"

    class Config:
        from_attributes = True

# 5. Output: Token Response (NEW)
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse  # We send user details along with the token