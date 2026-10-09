import { useState } from "react";
import { LOW_STOCK, byTitle } from "../storage.js";

function StatCard({ num, label, warn }) {
  return (
    <div className={"stat" + (warn ? " warn" : "")}>
      <div className="num">{num}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}

export default function Dashboard({ books }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const totalCopies = books.reduce((s, b) => s + Number(b.quantity), 0);
  const low = books.filter((b) => b.quantity < LOW_STOCK && b.quantity > 0).length;
  const out = books.filter((b) => b.quantity === 0).length;

  const filtered = books
    .filter((b) => !q || (b.title + " " + b.author + " " + b.genre).toLowerCase().includes(q))
    .sort(byTitle);

  return (
    <section id="view-dashboard" className="view active">
      <div className="dash-stats">
        <StatCard num={books.length} label="Titles in catalog" />
        <StatCard num={totalCopies} label="Total copies" />
        <StatCard num={low} label="Low stock titles" warn={low > 0} />
        <StatCard num={out} label="Out of stock" warn={out > 0} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Book availability</h2>
          <input
            type="text"
            className="search-box"
            placeholder="Search title, author, or genre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="book-grid">
          {filtered.map((b) => {
            const qty = Number(b.quantity);
            const isLow = qty < LOW_STOCK;
            return (
              <div key={b.id} className={"book-card" + (isLow ? " low" : "")}>
                <span className="tab">{b.genre}</span>
                <h3>{b.title}</h3>
                <div className="author">by {b.author}</div>
                <div className="isbn">ISBN {b.isbn}</div>
                <div className="qty-row">
                  <div>
                    <div className="qty">{qty}</div>
                    <div className="muted">{qty === 1 ? "copy available" : "copies available"}</div>
                  </div>
                  <span className={"badge" + (qty === 0 || isLow ? "" : " ok")}>
                    {qty === 0 ? "Out of stock" : isLow ? "Low stock" : "In stock"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && <p className="empty-note">No books match your search.</p>}
      </div>
    </section>
  );
}
