import { useCallback, useEffect, useState } from "react";
import { Activity, CalendarDays, Clock3, RefreshCw, Search } from "lucide-react";
import { api } from "../../api/client";

const ACTIONS = ["", "UPLOAD", "DOWNLOAD", "PREVIEW", "EDIT", "SHARE", "DELETE", "RESTORE", "PERMANENT_DELETE", "MOVE", "NEW_VERSION", "ROLLBACK"];

export default function AuditPage() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState({ from: "", to: "", action: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (values = filter) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(Object.entries(values).filter(([, value]) => value));
      const payload = await api(`/audit${query.size ? `?${query}` : ""}`);
      setRows(Array.isArray(payload) ? payload : []);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Audit trail could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load({ from: "", to: "", action: "" }); }, []);

  return <div className="audit-workspace">
    <section className="panel audit-toolbar">
      <div className="audit-heading"><span className="audit-icon"><Activity /></span><div><span className="folder-kicker">SECURITY &amp; COMPLIANCE</span><h3>Audit trail</h3><p className="form-intro">A clear, chronological record of activity in your document workspace.</p></div><span className="audit-count">{rows.length} {rows.length === 1 ? "event" : "events"}</span></div>
      <form className="date-range audit-filters" onSubmit={(event) => { event.preventDefault(); load(); }}>
        <label>Action<select value={filter.action} onChange={(event) => setFilter({ ...filter, action: event.target.value })}>{ACTIONS.map((action) => <option key={action} value={action}>{action ? action.replaceAll("_", " ") : "All actions"}</option>)}</select></label>
        <label><span><CalendarDays /> From</span><input type="date" value={filter.from} onChange={(event) => setFilter({ ...filter, from: event.target.value })} /></label>
        <label><span><CalendarDays /> To</span><input type="date" value={filter.to} onChange={(event) => setFilter({ ...filter, to: event.target.value })} /></label>
        <button className="primary"><Search /> Apply filters</button>
      </form>
      {message && <div className="error page-message"><span>{message}</span><button type="button" onClick={() => load()}><RefreshCw /> Retry</button></div>}
    </section>
    <div className="audit-list">
      {rows.map((row) => <article key={row.id}>
        <span className={`audit-action action-${(row.action || "activity").toLowerCase()}`}>{(row.action || "ACTIVITY").replaceAll("_", " ")}</span>
        <div className="audit-event"><b>{row.documentName || "Document activity"}</b>{row.documentCode && <code>{row.documentCode}</code>}<p>{row.details || "Activity recorded in the workspace."}</p></div>
        <time><Clock3 />{row.createdAt ? new Date(row.createdAt).toLocaleString() : "Date unavailable"}</time>
      </article>)}
      {loading && <div className="page-loading"><RefreshCw /> Loading audit events…</div>}
    </div>
  </div>;
}
