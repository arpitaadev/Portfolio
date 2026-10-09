"""Pydantic models: the API contract. Keep these stable when you move to a database."""
import re
from pydantic import BaseModel, Field, field_validator

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(max_length=120)
    message: str = Field(min_length=10, max_length=2000)
    website: str = ""  # honeypot: real users leave this empty

    @field_validator("email")
    @classmethod
    def valid_email(cls, v: str) -> str:
        if not EMAIL_RE.match(v):
            raise ValueError("Invalid email address")
        return v


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=500)


class ChatOut(BaseModel):
    answer: str
    sources: list[str] = []
