import { useCallback, useEffect, useState } from "react";
import { ArchiveRestore, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { api } from "../../api/client";

export default function RecycleBin() {
  const [docs, setDocs] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await api("/documents/trash");
      setDocs(Array.isArray(payload) ? payload : []);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "The recycle bin could not be loaded.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(doc, permanent) {
    if (permanent && !window.confirm(`Permanently delete ${doc.fileName || "this document"} and every version? This cannot be undone.`)) return;
    try {
      await api(`/documents/${doc.id}/${permanent ? "permanent" : "restore"}`, { method: permanent ? "DELETE" : "PUT" });
      setDocs((current) => current.filter((item) => item.id !== doc.id));
      setMessage(permanent ? "Document permanently deleted." : "Document restored to your workspace.");
    } catch (error) { setMessage(error.message); }
  }

  return <section className="panel">
    <h3><ArchiveRestore /> Recycle bin</h3>
    <p className="form-intro">Deleted documents remain recoverable until you permanently remove them.</p>
    {message && <div className="notice page-message"><span>{message}</span><button type="button" onClick={load}><RefreshCw /> Refresh</button></div>}
    <div className="results">
      {docs.map((doc) => <article className="doc" key={doc.id}>
        <div className="file-icon">{doc.fileType || "FILE"}</div>
        <div><b>{doc.fileName || "Untitled document"}</b><span>{doc.deletedAt ? `Deleted ${new Date(doc.deletedAt).toLocaleString()}` : "Recently deleted"} · {doc.currentVersion ?? 1} version{(doc.currentVersion ?? 1) === 1 ? "" : "s"}</span>{doc.documentCode && <code>{doc.documentCode}</code>}</div>
        <div className="doc-actions"><button type="button" title="Restore" onClick={() => act(doc, false)}><RotateCcw /></button><button type="button" className="delete-doc" title="Delete permanently" onClick={() => act(doc, true)}><Trash2 /></button></div>
      </article>)}
      {loading && <div className="page-loading"><RefreshCw /> Loading recycle bin…</div>}
      {!loading && !docs.length && <div className="empty"><ArchiveRestore /><p>Nothing to recover—your recycle bin is clear.</p></div>}
    </div>
  </section>;
}
