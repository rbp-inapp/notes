from sqlalchemy import Column, Integer, String, Text
from .database import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # Storing username or user identifier
    title = Column(String, index=True)
    content = Column(Text, nullable=True) # Storing note content directly in DB
    s3_key = Column(String, nullable=True) # Key to the file in S3 (Optional now)
