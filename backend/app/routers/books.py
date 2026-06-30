from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Book
from app.security import decode_access_token
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class BookCreate(BaseModel):
    title: str
    author: Optional[str] = None
    liked: Optional[bool] = True

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    liked: Optional[bool] = None

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    username = decode_access_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    from app.models import User
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/books")
def create_book(data: BookCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    book = Book(title=data.title, author=data.author, liked=data.liked, user_id=current_user.id)
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

@router.get("/books")
def get_books(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Book).filter(Book.user_id == current_user.id).all()

@router.put("/books/{book_id}")
def update_book(book_id: int, data: BookUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if data.title is not None:
        book.title = data.title
    if data.author is not None:
        book.author = data.author
    if data.liked is not None:
        book.liked = data.liked
    db.commit()
    db.refresh(book)
    return book

@router.delete("/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}