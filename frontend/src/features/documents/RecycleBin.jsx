import { useCallback, useEffect, useState } from "react";
import { ArchiveRestore, Clock3, Folder, RefreshCw, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { api } from "../../api/client";

export default function RecycleBin() {
  const [documents, setDocuments] = useState([]);
  const [lookups, setLookups] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [documentResult, categoryResult, departmentResult] = await Promise.allSettled([
      api("/documents/trash"), api("/categories/trash"), api("/departments/trash"),
    ]);
    if (documentResult.status === "fulfilled") setDocuments(Array.isArray(documentResult.value) ? documentResult.value : []);
    const categories = categoryResult.status === "fulfilled" && Array.isArray(categoryResult.value) ? categoryResult.value : [];
    const departments = departmentResult.status === "fulfilled" && Array.isArray(departmentResult.value) ? departmentResult.value : [];
    setLookups([...categories, ...departments]);
    const failure = [documentResult, categoryResult, departmentResult].find((result) => result.status === "rejected");
    setMessage(failure?.reason?.message || "");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(item, permanent) {
    const isDocument = !item.kind || item.kind === "DOCUMENT";
    const label = isDocument ? (item.fileName || "this document") : `${item.kind.toLowerCase()} “${item.name}”`;
    if (permanent && !window.confirm(`Permanently delete ${label}? This cannot be undone.`)) return;
    const lookupPath = item.kind === "CATEGORY" ? "categories" : "departments";
    const endpoint = isDocument
      ? `/documents/${item.id}/${permanent ? "permanent" : "restore"}`
      : `/${lookupPath}/${item.id}/${permanent ? "permanent" : "restore"}`;
    try {
      await api(endpoint, { method: permanent ? "DELETE" : "PUT" });
      if (isDocument) setDocuments((current) => current.filter((row) => row.id !== item.id));
      else setLookups((current) => current.filter((row) => !(row.id === item.id && row.kind === item.kind)));
      setMessage(permanent ? `${label} permanently deleted.` : `${label} restored.`);
    } catch (error) { setMessage(error.message); }
  }

  const count = documents.length + lookups.length;
  return <div className="recycle-workspace">
    <section className="panel recycle-hero">
      <div className="recycle-hero-icon"><ArchiveRestore /></div>
      <div><span className="folder-kicker">ITEM RECOVERY</span><h3>Recycle bin</h3><p className="form-intro">Restore or permanently remove deleted documents, categories, and departments.</p></div>
      <span className="recycle-count">{count} {count === 1 ? "item" : "items"}</span>
    </section>
    {message && <div className="notice page-message"><span>{message}</span><button type="button" onClick={load}><RefreshCw /> Refresh</button></div>}
    <section className="recycle-list">
      <div className="recycle-list-heading"><div><h3>Deleted items</h3><p>Restore items to bring them back to your workspace.</p></div><ShieldCheck /></div>
      <div className="results">
        {documents.map((doc) => <article className="doc recycle-doc" key={`document-${doc.id}`}>
          <div className="file-icon">{doc.fileType || "FILE"}</div>
          <div className="recycle-doc-info"><b>{doc.fileName || "Untitled document"}</b><span><Clock3 />{doc.deletedAt ? `Deleted ${new Date(doc.deletedAt).toLocaleString()}` : "Recently deleted"}</span><small>{doc.currentVersion ?? 1} version{(doc.currentVersion ?? 1) === 1 ? "" : "s"}{doc.documentCode ? ` · ${doc.documentCode}` : ""}</small></div>
          <Actions item={doc} act={act} />
        </article>)}
        {lookups.map((item) => <article className="doc recycle-doc recycle-lookup-doc" key={`${item.kind}-${item.id}`}>
          <div className="file-icon"><Folder /></div>
          <div className="recycle-doc-info"><b>{item.name}</b><span><Clock3 />Deleted {item.deletedAt ? new Date(item.deletedAt).toLocaleString() : "recently"}</span><small>{item.kind === "CATEGORY" ? "Category" : "Department"}{item.description ? ` · ${item.description}` : ""}</small></div>
          <Actions item={item} act={act} />
        </article>)}
        {loading && <div className="page-loading"><RefreshCw /> Loading recycle bin…</div>}
        {!loading && !count && !message && <div className="recycle-empty"><span><ArchiveRestore /></span><div><b>Your recycle bin is clear</b><p>Deleted documents, categories, and departments will appear here.</p></div></div>}
      </div>
    </section>
  </div>;
}

function Actions({ item, act }) {
  return <div className="doc-actions recycle-actions"><button type="button" className="restore-button" title="Restore" onClick={() => act(item, false)}><RotateCcw /><span>Restore</span></button><button type="button" className="delete-doc" title="Delete permanently" onClick={() => act(item, true)}><Trash2 /><span>Delete</span></button></div>;
}
