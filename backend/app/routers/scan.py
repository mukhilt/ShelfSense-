from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Book, Scan
from app.routers.books import get_current_user
import anthropic
import base64

router = APIRouter()

@router.post("/scan")
async def scan_shelf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get user's books
    books = db.query(Book).filter(Book.user_id == current_user.id).all()
    book_list = ", ".join([f"{b.title} by {b.author}" for b in books if b.title])

    # Read and encode the image
    image_data = await file.read()
    image_b64 = base64.standard_b64encode(image_data).decode("utf-8")

    # Call Claude API
    import os
    from dotenv import load_dotenv
    from pathlib import Path
    load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    message = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": file.content_type,
                            "data": image_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": f"This is a photo of a bookshelf. The user has already read and enjoyed these books: {book_list}. Look at the book spines in the image and identify the titles you can see. Then recommend which of those specific books ON THE SHELF the user should read next, based on their reading history. Only recommend books that are visibly on the shelf in the image."
                    }
                ],
            }
        ],
    )

    result = message.content[0].text

    # Save scan to database
    scan = Scan(user_id=current_user.id, result_json=result)
    db.add(scan)
    db.commit()

    return {"recommendations": result}