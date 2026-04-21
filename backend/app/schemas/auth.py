import re
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


class RegisterIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("A senha deve conter pelo menos 1 letra")
        if not re.search(r"\d", v):
            raise ValueError("A senha deve conter pelo menos 1 número")
        return v


class LoginIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    refresh_token: str
