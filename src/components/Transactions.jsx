import { useMemo, useState } from "react";
import { byTitle, genId } from "../storage.js";

const LABELS = { in: "Stock in", borrow: "Borrowed", return: "Returned" };
const SUBMIT = { in: "Record arrival", borrow: "Record borrow", return: "Record return" };

export default function Transactions({ books, setBooks, txns, setTxns, session, admin, notify }) {
  const [type, setType] = useState("borrow");
  const [bookId, setBookId] = useState("");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");

  const sortedBooks = useMemo(() => [...books].sort(byTitle), [books]);
  const activeType = type === "in" && !admin ? "borrow" : type;
  const selectedId = sortedBooks.some((b) => b.id === bookId) ? bookId : sortedBooks[0]?.id ?? "";

  const submit = (e) => {
    e.preventDefault();
    const book = books.find((b) => b.id === selectedId);
    if (!book) return notify("Select a book first.", true);

    const n = Number(qty);
    if (!n || n < 1) return notify("Enter a quantity of at least 1.", true);
    if (activeType === "borrow" && n > book.quantity)
      return notify(
        "Only " + book.quantity + " cop" + (book.quantity === 1 ? "y" : "ies") + ' of "' + book.title + '" available.',
        true
      );

    const resulting = activeType === "borrow" ? book.quantity - n : book.quantity + n;
    setBooks(books.map((b) => (b.id === book.id ? { ...b, quantity: resulting } : b)));
    setTxns([
      ...txns,
      {
        id: genId("txn"),
        ts: Date.now(),
        bookId: book.id,
        bookTitle: book.title,
        type: activeType,
        typeLabel: LABELS[activeType],
        qty: n,
        resultingQty: resulting,
        byName: session ? session.name : "Unknown",
        note: note.trim(),
      },
    ]);
    setQty("1");
    setNote("");
    notify("Transaction recorded.");
  };

  const history = [...txns].sort((a, b) => b.ts - a.ts);

  const TypeButton = ({ t, children }) => (
    <button type="button" className={activeType === t ? "active" : ""} onClick={() => setType(t)}>
      {children}
    </button>
  );

  return (
    <section id="view-transactions" className="view active">
      <div className="panel">
        <h2>Record a transaction</h2>
        <div className="pill-toggle">
          {admin && <TypeButton t="in">New arrivals (stock in)</TypeButton>}
          <TypeButton t="borrow">Borrow</TypeButton>
          <TypeButton t="return">Return</TypeButton>
        </div>
        <form onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="txn-book">Book</label>
              <select id="txn-book" required value={selectedId} onChange={(e) => setBookId(e.target.value)}>
                {sortedBooks.map((b) => (
                  <option key={b.id} value={b.id}>{b.title + "  (" + b.quantity + " in stock)"}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="txn-qty">Quantity</label>
              <input type="number" id="txn-qty" min="1" step="1" required value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="txn-note">Note (optional)</label>
            <input type="text" id="txn-note" placeholder="e.g. borrower name" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <button type="submit">{SUBMIT[activeType]}</button>
        </form>
      </div>

      <div className="panel">
        <h2>Transaction history</h2>
        <table>
          <thead>
            <tr>
              <th>Date &amp; time</th><th>Book</th><th>Type</th><th>Qty</th>
              <th>Resulting stock</th><th>By</th><th>Note</th>
            </tr>
          </thead>
          <tbody>
            {history.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.ts).toLocaleString()}</td>
                <td>{t.bookTitle}</td>
                <td>{t.typeLabel}</td>
                <td>{(t.type === "in" || t.type === "return" ? "+" : "-") + t.qty}</td>
                <td>{t.resultingQty}</td>
                <td>{t.byName}</td>
                <td>{t.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && <p className="empty-note">No transactions recorded yet.</p>}
      </div>
    </section>
  );
}
