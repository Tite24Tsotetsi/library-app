import { useEffect, useRef, useState } from "react";
import { K_BOOKS, K_SESSION, K_TXNS, K_USERS, load, save } from "./storage.js";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import BooksAdmin from "./components/BooksAdmin.jsx";
import Transactions from "./components/Transactions.jsx";
import Users from "./components/Users.jsx";

const ADMIN_VIEWS = ["books", "users"];

export default function App() {
  const [books, setBooks] = useState(() => load(K_BOOKS, []));
  const [users, setUsers] = useState(() => load(K_USERS, []));
  const [txns, setTxns] = useState(() => load(K_TXNS, []));
  const [session, setSession] = useState(() => load(K_SESSION, null));
  const [view, setView] = useState("dashboard");
  const [toast, setToast] = useState({ msg: "", err: false, show: false });
  const toastTimer = useRef(null);

  useEffect(() => { save(K_BOOKS, books); }, [books]);
  useEffect(() => { save(K_USERS, users); }, [users]);
  useEffect(() => { save(K_TXNS, txns); }, [txns]);
  useEffect(() => {
    if (session) save(K_SESSION, session);
    else localStorage.removeItem(K_SESSION);
  }, [session]);

  const admin = !!session && session.role === "admin";

  const notify = (msg, err) => {
    setToast({ msg, err: !!err, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
  };

  const login = (membershipId, password) => {
    const user = users.find((u) => u.membershipId.toLowerCase() === membershipId.trim().toLowerCase());
    if (!user || user.password !== password) return false;
    setSession({ userId: user.id, name: user.name, role: user.role, membershipId: user.membershipId });
    setView("dashboard");
    notify("Welcome, " + user.name + ".");
    return true;
  };

  const logout = () => {
    setSession(null);
    setView("dashboard");
    notify("Signed out.");
  };

  // Members can't reach admin-only views.
  const current = !session ? "login" : ADMIN_VIEWS.includes(view) && !admin ? "dashboard" : view;

  const Tab = ({ name, children }) => (
    <button className={current === name ? "active" : ""} onClick={() => setView(name)}>
      {children}
    </button>
  );

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <h1>TITUS MANAGEMENT LIBRARY</h1>
        </div>
        {session && (
          <div className="session-info">
            <span>Signed in as <strong>{session.name}</strong></span>
            <span className="role-pill">{session.role}</span>
            <button className="ghost" onClick={logout}>Log out</button>
          </div>
        )}
      </header>

      {session && (
        <nav className="tabs">
          <Tab name="dashboard">Dashboard</Tab>
          {admin && <Tab name="books">Catalog</Tab>}
          <Tab name="transactions">Transactions</Tab>
          {admin && <Tab name="users">Members</Tab>}
        </nav>
      )}

      <main>
        {current === "login" && <Login onLogin={login} />}
        {current === "dashboard" && <Dashboard books={books} />}
        {current === "books" && <BooksAdmin books={books} setBooks={setBooks} notify={notify} />}
        {current === "transactions" && (
          <Transactions
            books={books} setBooks={setBooks} txns={txns} setTxns={setTxns}
            session={session} admin={admin} notify={notify}
          />
        )}
        {current === "users" && (
          <Users users={users} setUsers={setUsers} session={session} setSession={setSession} notify={notify} />
        )}
      </main>

      <div className={"toast" + (toast.show ? " show" : "") + (toast.err ? " err" : "")}>{toast.msg}</div>
    </>
  );
}
