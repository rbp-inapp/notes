from pydantic import BaseModel
from typing import Optional

class NoteBase(BaseModel):
    title: str

class NoteCreate(NoteBase):
    content: str

class Note(NoteBase):
    id: int
    user_id: str
    content: Optional[str] = None
    s3_key: Optional[str] = None
    content_url: Optional[str] = None # Presigned URL (Deprecated for local flow)

    class Config:
        orm_mode = True
