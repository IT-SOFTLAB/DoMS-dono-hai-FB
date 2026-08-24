import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { api } from "../../api/client";

export default function LookupManagement({ type, canManage = false }) {
  const singular = type === "categories" ? "Category" : "Department";
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const load = () => api(`/${type}`).then(setItems).catch((error) => setMessage(error.message));
  useEffect(() => { load(); }, [type]);
  async function save(event) {
    event.preventDefault();
    try {
      await api(`/${type}${editing ? `/${editing}` : ""}`, { method: editing ? "PUT" : "POST", body: JSON.stringify(form) });
      setForm({ name: "", description: "" }); setEditing(null); setMessage(`${singular} saved`); await load();
    } catch (error) { setMessage(error.message); }
  }
  async function remove(item) {
    if (!window.confirm(`Delete ${item.name}? Existing document metadata will remain unchanged.`)) return;
    try { await api(`/${type}/${item.id}`, { method: "DELETE" }); await load(); }
    catch (error) { setMessage(error.message); }
  }
  return <div className={canManage ? "split" : ""}>
    {canManage && <section className="panel"><h3>{editing ? `Edit ${singular}` : `Create ${singular}`}</h3><form className="form" onSubmit={save}>
      <label>Name<input required maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></label>
      <label>Description<textarea maxLength="500" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label>
      <button className="primary">{editing ? "Save changes" : `Create ${singular}`}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", description: "" }); }}>Cancel</button>}
    </form></section>}
    <section className="panel"><h3>{type === "categories" ? "Categories" : "Departments"}</h3>{message && <p className="notice">{message}</p>}<div className="table-wrap"><table><thead><tr><th>Name</th><th>Description</th>{canManage && <th>Actions</th>}</tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><b>{item.name}</b></td><td>{item.description || "—"}</td>{canManage && <td><div className="actions"><button title="Edit" onClick={() => { setEditing(item.id); setForm({ name: item.name, description: item.description || "" }); }}><Pencil/></button><button className="danger" title="Delete" onClick={() => remove(item)}><Trash2/></button></div></td>}</tr>)}</tbody></table>{!items.length && <p className="empty">No {type} have been created.</p>}</div></section>
  </div>;
}
