import { useEffect, useState } from "react";
import { CalendarDays, FileText, Search, Trash2 } from "lucide-react";
import { api } from "../../api/client";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [dates, setDates] = useState({ from: "", to: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load(values = dates) {
    setLoading(true);
    try {
      const query = new URLSearchParams(Object.entries(values).filter(([, value]) => value));
      setNotes(await api(`/notes${query.size ? `?${query}` : ""}`));
      setError("");
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load({ from: "", to: "" }); }, []);
  async function remove(id) {
    if (!window.confirm("Delete this note? The document will not be deleted.")) return;
    try { await api(`/notes/${id}`, { method: "DELETE" }); setNotes((current) => current.filter((note) => note.id !== id)); }
    catch (requestError) { setError(requestError.message); }
  }
  return <>
    <section className="panel notes-filter"><div><h3>Document notes</h3><p className="form-intro">Your saved reminders, connected to each unique document number.</p></div>
      <form className="date-range" onSubmit={(event) => { event.preventDefault(); load(); }}><label>From<input type="date" value={dates.from} onChange={(event) => setDates({...dates, from:event.target.value})}/></label><label>To<input type="date" value={dates.to} onChange={(event) => setDates({...dates, to:event.target.value})}/></label><button className="primary"><Search/> Filter</button><button type="button" onClick={() => {const empty={from:"",to:""};setDates(empty);load(empty);}}>Clear</button></form>
      {error && <div className="error">{error}</div>}</section>
    <div className="notes-grid">{notes.map((note) => <article className="note-card" key={note.id}><div className="note-card-head"><FileText/><span>{note.fileName}</span><button title="Delete note" onClick={() => remove(note.id)}><Trash2/></button></div><p>{note.description}</p><code>{note.documentCode}</code><small><CalendarDays/> {new Date(note.createdAt).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})}</small></article>)}</div>
    {!loading && !notes.length && <div className="empty"><FileText/><p>No saved notes found for this date range.</p></div>}
  </>;
}
