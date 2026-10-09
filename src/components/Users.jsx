import { useRef, useState } from "react";
import { genId } from "../storage.js";

const EMPTY = { name: "", mid: "", role: "member", pass: "" };

export default function Users({ users, setUsers, session, setSession, notify }) {
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const topRef = useRef(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const submit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const mid = form.mid.trim();
    const { role, pass } = form;

    if (users.find((u) => u.membershipId.toLowerCase() === mid.toLowerCase() && u.id !== editingId))
      return notify("That membership ID is already in use.", true);

    if (editingId) {
      setUsers(users.map((u) => (u.id === editingId ? { ...u, name, membershipId: mid, role, password: pass } : u)));
      if (session && session.userId === editingId) setSession({ ...session, name, role, membershipId: mid });
      notify("Member updated.");
    } else {
      setUsers([...users, { id: genId("usr"), name, membershipId: mid, role, password: pass }]);
      notify("Member added.");
    }
    cancelEdit();
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({ name: u.name, mid: u.membershipId, role: u.role, pass: u.password });
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const remove = (u) => {
    if (session && session.userId === u.id)
      return notify("You can't delete the account you're signed in with.", true);
    if (!window.confirm('Remove "' + u.name + '" from members?')) return;
    setUsers(users.filter((x) => x.id !== u.id));
    if (editingId === u.id) cancelEdit();
    notify("Member removed.");
  };

  const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section id="view-users" className="view active">
      <div className="panel" ref={topRef}>
        <h2>{editingId ? "Edit member" : "Add a new member"}</h2>
        <form onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="user-name">Full name</label>
              <input type="text" id="user-name" required value={form.name} onChange={set("name")} />
            </div>
            <div className="field">
              <label htmlFor="user-mid">Membership ID</label>
              <input type="text" id="user-mid" required value={form.mid} onChange={set("mid")} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="user-role">Role</label>
              <select id="user-role" value={form.role} onChange={set("role")}>
                <option value="member">Member</option>
                <option value="admin">Admin (librarian)</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="user-pass">Password</label>
              <input type="text" id="user-pass" required value={form.pass} onChange={set("pass")} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit">{editingId ? "Save changes" : "Add member"}</button>
            {editingId && (
              <button type="button" className="ghost" onClick={cancelEdit}>Cancel edit</button>
            )}
          </div>
        </form>
      </div>

      <div className="panel">
        <h2>Members</h2>
        <table>
          <thead>
            <tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.membershipId}</td>
                <td>{u.role === "admin" ? "Admin" : "Member"}</td>
                <td className="actions">
                  <button className="secondary" onClick={() => startEdit(u)}>Edit</button>
                  <button className="danger" onClick={() => remove(u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <p className="empty-note">No members yet.</p>}
      </div>
    </section>
  );
}
