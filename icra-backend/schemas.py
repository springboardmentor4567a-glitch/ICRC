from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

# 1. Base User Schema
class UserBase(BaseModel):
    email: EmailStr

# 2. Input: Registration (Updated to include OTP)
class UserCreate(UserBase):
    name: str
    password: str
    dob: date
    otp: str  # <--- Added this field

# 3. Input: Login
class UserLogin(UserBase):
    password: str

# 4. Input: Just Email (For requesting OTP)
class EmailRequest(BaseModel):
    email: EmailStr

# 5. Output: User Details
class UserResponse(UserBase):
    id: int
    name: str
    message: str = "Success"

    class Config:
        from_attributes = True

# 6. Output: Token Response
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse