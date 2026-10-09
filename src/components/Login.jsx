import { useState } from "react";

export default function Login({ onLogin }) {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (onLogin(id, pass)) {
      setError("");
      setId("");
      setPass("");
    } else {
      setError("Membership ID or password is incorrect.");
    }
  };

  return (
    <section id="view-login" className="view active">
      <div className="panel">
        <h2>Welcome back</h2>
        <p className="muted">Enter your membership ID and password to continue.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="login-id">Membership ID</label>
            <input type="text" id="login-id" autoComplete="username" required value={id} onChange={(e) => setId(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="login-pass">Password</label>
            <input type="password" id="login-pass" autoComplete="current-password" required value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>
          <div className="login-error">{error}</div>
          <button type="submit" style={{ width: "100%" }}>Sign in</button>
        </form>
        <div className="login-hint">
          Passwords are stored in your browser's local storage for demonstration only.
        </div>
      </div>
    </section>
  );
}
