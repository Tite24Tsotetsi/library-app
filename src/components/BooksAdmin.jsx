import { useRef, useState } from "react";
import { LOW_STOCK, byTitle, genId } from "../storage.js";

const EMPTY = { title: "", author: "", genre: "", isbn: "", qty: "" };

export default function BooksAdmin({ books, setBooks, notify }) {
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const topRef = useRef(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const submit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const author = form.author.trim();
    const genre = form.genre.trim();
    const isbn = form.isbn.trim();
    const qty = Number(form.qty);

    if (qty < 0) return notify("Quantity can't be negative.", true);
    if (books.find((b) => b.isbn.toLowerCase() === isbn.toLowerCase() && b.id !== editingId))
      return notify("A book with that ISBN already exists.", true);

    if (editingId) {
      setBooks(books.map((b) => (b.id === editingId ? { ...b, title, author, genre, isbn, quantity: qty } : b)));
      notify("Book updated.");
    } else {
      setBooks([...books, { id: genId("bk"), title, author, genre, isbn, quantity: qty }]);
      notify("Book added.");
    }
    cancelEdit();
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setForm({ title: b.title, author: b.author, genre: b.genre, isbn: b.isbn, qty: String(b.quantity) });
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const remove = (b) => {
    if (!window.confirm('Delete "' + b.title + '" from the catalog?')) return;
    setBooks(books.filter((x) => x.id !== b.id));
    if (editingId === b.id) cancelEdit();
    notify("Book deleted.");
  };

  const q = query.trim().toLowerCase();
  const filtered = books
    .filter((b) => !q || (b.title + " " + b.author + " " + b.genre + " " + b.isbn).toLowerCase().includes(q))
    .sort(byTitle);

  return (
    <section id="view-books" className="view active">
      <div className="panel" ref={topRef}>
        <h2>{editingId ? "Edit book" : "Add a new book"}</h2>
        <form onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="book-title">Title</label>
              <input type="text" id="book-title" required value={form.title} onChange={set("title")} />
            </div>
            <div className="field">
              <label htmlFor="book-author">Author</label>
              <input type="text" id="book-author" required value={form.author} onChange={set("author")} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="book-genre">Genre</label>
              <input type="text" id="book-genre" required value={form.genre} onChange={set("genre")} />
            </div>
            <div className="field">
              <label htmlFor="book-isbn">ISBN</label>
              <input type="text" id="book-isbn" required value={form.isbn} onChange={set("isbn")} />
            </div>
          </div>
          <div className="field" style={{ maxWidth: "180px" }}>
            <label htmlFor="book-qty">Initial quantity</label>
            <input type="number" id="book-qty" min="0" step="1" required value={form.qty} onChange={set("qty")} />
          </div>
          <div className="form-actions">
            <button type="submit">{editingId ? "Save changes" : "Add book"}</button>
            {editingId && (
              <button type="button" className="ghost" onClick={cancelEdit}>Cancel edit</button>
            )}
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Catalog</h2>
          <input
            type="text"
            className="search-box"
            placeholder="Search catalog…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Qty</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className={b.quantity < LOW_STOCK ? "row-low" : ""}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.genre}</td>
                <td>{b.isbn}</td>
                <td>{b.quantity}</td>
                <td className="actions">
                  <button className="secondary" onClick={() => startEdit(b)}>Edit</button>
                  <button className="danger" onClick={() => remove(b)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="empty-note">No books in the catalog yet — add one above.</p>
        )}
      </div>
    </section>
  );
}
