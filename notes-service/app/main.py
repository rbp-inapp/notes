from fastapi import FastAPI, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List
import uuid
from jose import jwt, JWTError

from . import models, schemas, database, s3_utils
import os

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Auth configuration (Must match Auth Service)
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except (JWTError, IndexError):
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/notes/", response_model=schemas.Note)
def create_note(note: schemas.NoteCreate, db: Session = Depends(database.get_db), current_user: str = Depends(get_current_user)):
    # Local DB Storage (S3 Bypassed)
    # key = f"{current_user}/{uuid.uuid4()}.txt"
    # if not s3_utils.upload_file(note.content, key):
    #     raise HTTPException(status_code=500, detail="Failed to upload note content")

    db_note = models.Note(title=note.title, content=note.content, user_id=current_user, s3_key=None)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@app.get("/notes/", response_model=List[schemas.Note])
def read_notes(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: str = Depends(get_current_user)):
    notes = db.query(models.Note).filter(models.Note.user_id == current_user).offset(skip).limit(limit).all()
    # No S3 URL generation needed
    # for note in notes:
    #     note.content_url = s3_utils.get_presigned_url(note.s3_key)
    return notes

@app.get("/notes/{note_id}", response_model=schemas.Note)
def read_note(note_id: int, db: Session = Depends(database.get_db), current_user: str = Depends(get_current_user)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    # note.content_url = s3_utils.get_presigned_url(note.s3_key)
    return note

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(database.get_db), current_user: str = Depends(get_current_user)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # s3_utils.delete_file(note.s3_key)
    db.delete(note)
    db.commit()
    return {"ok": True}
