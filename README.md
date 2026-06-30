How it works

1. Log in
2. Log books you've already read to build a reading profile.
3. Take a photo of any bookshelf (a store display, a friend's shelf, a library aisle).
4. ShelfSense identifies the books from the spines using Claude's vision API.
5. It cross-references what's on the shelf against your reading history and returns personalized recommendations from the books actually in front of you.

Tech stack
Backend: FastAPI, PostgreSQL, SQLAlchemy, JWT authentication (bcrypt password hashing)
Frontend: React, Tailwind CSS
AI: Anthropic Claude API (vision for spine recognition, text generation for recommendations)
