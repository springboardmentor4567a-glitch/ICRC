from pydantic import BaseModel, EmailStr


class RegisterIn(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str
    confirm: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None = None

    class Config:
        orm_mode = True
