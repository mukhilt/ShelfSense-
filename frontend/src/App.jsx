import { useState, useEffect, useRef } from "react"

function App() {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState("login")

  if (!token) return <Auth setToken={setToken} page={page} setPage={setPage} />
  return <Dashboard token={token} setToken={setToken} />
}

function Auth({ setToken, page, setPage }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")
    if (page === "register") {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.detail)
      setPage("login")
    } else {
      const form = new FormData()
      form.append("username", username)
      form.append("password", password)
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        body: form
      })
      const data = await res.json()
      if (!res.ok) return setError(data.detail)
      setToken(data.access_token)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background: "#fdf8f4"}}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{background: "linear-gradient(135deg, #f97316, #ea580c)"}}>
            <span className="text-white text-2xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{color: "#1c1917"}}>ShelfSense</h1>
          <p className="mt-1 text-sm" style={{color: "#a8a29e"}}>Your personal book companion</p>
        </div>

        <div className="rounded-3xl p-6 shadow-sm" style={{background: "#ffffff", border: "1px solid #fde8d8"}}>
          <h2 className="text-lg font-semibold mb-5" style={{color: "#1c1917"}}>
            {page === "login" ? "Welcome back" : "Create account"}
          </h2>
          <input
            className="w-full p-3.5 rounded-2xl mb-3 text-sm outline-none"
            style={{background: "#fdf8f4", border: "1px solid #fde8d8", color: "#1c1917"}}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            className="w-full p-3.5 rounded-2xl mb-4 text-sm outline-none"
            style={{background: "#fdf8f4", border: "1px solid #fde8d8", color: "#1c1917"}}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            className="w-full text-white p-3.5 rounded-2xl font-semibold text-sm shadow-md"
            style={{background: "linear-gradient(135deg, #f97316, #ea580c)"}}
            onClick={handleSubmit}
          >
            {page === "login" ? "Sign in" : "Create account"}
          </button>
        </div>

        <p className="text-center mt-5 text-sm" style={{color: "#a8a29e"}}>
          {page === "login" ? "New here?" : "Already have an account?"}
          <button className="font-semibold ml-1" style={{color: "#f97316"}} onClick={() => setPage(page === "login" ? "register" : "login")}>
            {page === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  )
}

function Dashboard({ token, setToken }) {
  const [books, setBooks] = useState([])
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [activeTab, setActiveTab] = useState("books")
  const [scanResult, setScanResult] = useState("")
  const [file, setFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [adding, setAdding] = useState(false)

  const fetchBooks = async () => {
    const res = await fetch("http://127.0.0.1:8000/books", {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setBooks(data)
  }

  const addBook = async () => {
    if (!title) return
    await fetch("http://127.0.0.1:8000/books", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, author, liked: true })
    })
    setTitle("")
    setAuthor("")
    setAdding(false)
    fetchBooks()
  }

  const deleteBook = async (id) => {
    await fetch(`http://127.0.0.1:8000/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchBooks()
  }

  const handleScan = async () => {
    if (!file) return
    setScanning(true)
    setScanResult("")
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("http://127.0.0.1:8000/scan", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    })
    const data = await res.json()
    setScanning(false)
    setScanResult(data.recommendations)
  }

  useEffect(() => { fetchBooks() }, [])

  return (
    <div className="min-h-screen" style={{background: "#fdf8f4"}}>

      {/* Header */}
      <div className="px-6 pt-12 pb-4" style={{background: "#ffffff", borderBottom: "1px solid #fde8d8"}}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{color: "#1c1917"}}>ShelfSense</h1>
            <p className="text-sm" style={{color: "#a8a29e"}}>{books.length} books in your library</p>
          </div>
          <button
            onClick={() => setToken(null)}
            className="text-xs px-3 py-1.5 rounded-xl font-medium"
            style={{background: "#fdf8f4", border: "1px solid #fde8d8", color: "#a8a29e"}}
          >
            Sign out
          </button>
        </div>

        {/* Sliding Glass Tab */}
        <div className="relative flex rounded-2xl p-1" style={{background: "#fdf8f4", border: "1px solid #fde8d8"}}>
          {/* Sliding pill */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-in-out"
            style={{
              left: activeTab === "books" ? "4px" : "calc(50%)",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(249,115,22,0.2)",
              boxShadow: "0 2px 12px rgba(249,115,22,0.1)"
            }}
          />
          <button
            onClick={() => setActiveTab("books")}
            className="relative flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300 z-10"
            style={{color: activeTab === "books" ? "#f97316" : "#a8a29e"}}
          >
            My Books
          </button>
          <button
            onClick={() => setActiveTab("scan")}
            className="relative flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300 z-10"
            style={{color: activeTab === "scan" ? "#f97316" : "#a8a29e"}}
          >
            Scan Shelf
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-32">
        {activeTab === "books" && (
          <div className="space-y-3">
            {books.length === 0 && (
              <div className="text-center py-16" style={{color: "#c4b5a5"}}>
                <p className="text-4xl mb-3">📖</p>
                <p className="text-sm">No books yet. Add your first one!</p>
              </div>
            )}
            {books.map(book => (
              <div
                key={book.id}
                className="rounded-2xl p-4 flex items-center justify-between shadow-sm"
                style={{background: "#ffffff", border: "1px solid #fde8d8"}}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-S.jpg`}
                    alt={book.title}
                    className="w-10 h-12 rounded-xl object-cover"
                    style={{background: "#fff7f0"}}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
                  />
                  <div className="w-10 h-12 rounded-xl items-center justify-center text-lg hidden" style={{background: "#fff7f0", display: "none"}}>
                    📗
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{color: "#1c1917"}}>{book.title}</p>
                    <p className="text-xs" style={{color: "#a8a29e"}}>{book.author}</p>
                  </div>
                </div>
                <button onClick={() => deleteBook(book.id)} className="text-xl font-light transition hover:text-red-400" style={{color: "#d4c4b8"}}>×</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "scan" && (
          <div>
            <div className="rounded-2xl p-5 mb-4 shadow-sm" style={{background: "#ffffff", border: "1px solid #fde8d8"}}>
              <h2 className="font-semibold mb-1" style={{color: "#1c1917"}}>Scan a Bookshelf</h2>
              <p className="text-xs mb-4" style={{color: "#a8a29e"}}>Upload a photo and get personalized picks</p>
              <label className="block w-full rounded-2xl p-6 text-center cursor-pointer mb-4" style={{border: "2px dashed #fbbf8c", background: "#fff7f0"}}>
                <p className="text-3xl mb-2">📷</p>
                <p className="text-sm" style={{color: "#a8a29e"}}>{file ? file.name : "Tap to upload a photo"}</p>
                <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
              </label>
              <button
                onClick={handleScan}
                className="w-full text-white p-3.5 rounded-2xl font-semibold text-sm shadow-md"
                style={{background: "linear-gradient(135deg, #f97316, #ea580c)"}}
              >
                {scanning ? "Scanning..." : "Get Recommendations"}
              </button>
            </div>

            {scanResult && (
              <div className="rounded-2xl p-5 shadow-sm" style={{background: "#ffffff", border: "1px solid #fde8d8"}}>
                <h3 className="font-semibold mb-3" style={{color: "#1c1917"}}>Recommendations</h3>
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{color: "#44403c"}}>{scanResult}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {activeTab === "books" && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center">
          <button
            onClick={() => setAdding(true)}
            className="text-white px-8 py-3.5 rounded-full font-semibold text-sm flex items-center gap-2"
            style={{background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 8px 32px rgba(249,115,22,0.35)"}}
          >
            <span className="text-lg">+</span> Add Book
          </button>
        </div>
      )}

      {/* Add Book Modal */}
      {adding && (
        <div className="fixed inset-0 flex items-end justify-center z-50 p-4" style={{background: "rgba(28,25,23,0.3)", backdropFilter: "blur(8px)"}}>
          <div className="rounded-3xl p-6 w-full max-w-sm shadow-xl" style={{background: "#ffffff", border: "1px solid #fde8d8"}}>
            <h3 className="font-semibold mb-4" style={{color: "#1c1917"}}>Add a Book</h3>
            <input
              className="w-full p-3.5 rounded-2xl mb-3 text-sm outline-none"
              style={{background: "#fdf8f4", border: "1px solid #fde8d8", color: "#1c1917"}}
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <input
              className="w-full p-3.5 rounded-2xl mb-4 text-sm outline-none"
              style={{background: "#fdf8f4", border: "1px solid #fde8d8", color: "#1c1917"}}
              placeholder="Author"
              value={author}
              onChange={e => setAuthor(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setAdding(false)} className="flex-1 p-3.5 rounded-2xl font-semibold text-sm" style={{background: "#fdf8f4", border: "1px solid #fde8d8", color: "#a8a29e"}}>Cancel</button>
              <button onClick={addBook} className="flex-1 text-white p-3.5 rounded-2xl font-semibold text-sm" style={{background: "linear-gradient(135deg, #f97316, #ea580c)"}}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App