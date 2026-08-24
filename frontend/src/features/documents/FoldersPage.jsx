import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Folder, FolderPlus, MoveRight, RefreshCw, Trash2 } from "lucide-react";
import { api } from "../../api/client";

const asArray = (value) => (Array.isArray(value) ? value : []);
const sameId = (left, right) => String(left ?? "") === String(right ?? "");

export default function FoldersPage() {
  const [folders, setFolders] = useState([]);
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", parentId: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [folderPayload, documentPayload] = await Promise.all([
        api("/folders"),
        api("/documents"),
      ]);
      setFolders(asArray(folderPayload));
      setDocs(asArray(documentPayload));
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Folders could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => docs.filter((doc) => {
    if (selected === null) return doc?.folderId == null;
    return sameId(doc?.folderId, selected);
  }), [docs, selected]);

  const selectedFolder = folders.find((folder) => sameId(folder?.id, selected));

  async function create(event) {
    event.preventDefault();
    try {
      await api("/folders", {
        method: "POST",
        body: JSON.stringify({ name: form.name.trim(), parentId: form.parentId || null }),
      });
      setForm({ name: "", parentId: "" });
      await load();
    } catch (error) { setMessage(error.message); }
  }

  async function move(doc, folderId) {
    try {
      const query = folderId ? `?folderId=${encodeURIComponent(folderId)}` : "";
      await api(`/documents/${doc.id}/folder${query}`, { method: "PUT" });
      await load();
    } catch (error) { setMessage(error.message); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this empty folder?")) return;
    try {
      await api(`/folders/${id}`, { method: "DELETE" });
      if (sameId(selected, id)) setSelected(null);
      await load();
    } catch (error) { setMessage(error.message); }
  }

  return <div className="folder-layout">
    <aside className="folder-panel">
      <h3><Folder /> Folders</h3>
      <button type="button" className={selected === null ? "active" : ""} onClick={() => setSelected(null)}>
        My Documents <span>{docs.filter((doc) => doc?.folderId == null).length}</span>
      </button>
      {folders.map((folder) => <div className="folder-row" key={folder.id} style={{ paddingLeft: folder.parentId ? 18 : 0 }}>
        <button type="button" className={sameId(selected, folder.id) ? "active" : ""} onClick={() => setSelected(folder.id)}>
          <Folder /> {folder.name || "Untitled folder"}<span>{folder.documentCount ?? 0}</span>
        </button>
        <button type="button" title="Delete folder" onClick={() => remove(folder.id)}><Trash2 /></button>
      </div>)}
      <form onSubmit={create}>
        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="New folder name" />
        <select value={form.parentId} onChange={(event) => setForm({ ...form, parentId: event.target.value })}>
          <option value="">Top level</option>
          {folders.map((folder) => <option value={folder.id} key={folder.id}>Inside {folder.name}</option>)}
        </select>
        <button className="primary"><FolderPlus /> Create folder</button>
      </form>
    </aside>
    <section>
      <div className="folder-title"><div><h3>{selectedFolder?.name || (selected === null ? "My Documents" : "Folder")}</h3><p>{visible.length} document{visible.length === 1 ? "" : "s"}</p></div></div>
      {message && <div className="error page-message"><span>{message}</span><button type="button" onClick={load}><RefreshCw /> Retry</button></div>}
      <div className="folder-docs">
        {visible.map((doc) => <article key={doc.id}>
          <div className="file-icon">{doc.fileType || "FILE"}</div>
          <div><b>{doc.fileName || "Untitled document"}</b>{doc.documentCode && <code>{doc.documentCode}</code>}</div>
          <label><MoveRight /> Move to<select value={doc.folderId ?? ""} onChange={(event) => move(doc, event.target.value)}><option value="">My Documents</option>{folders.map((folder) => <option value={folder.id} key={folder.id}>{folder.name}</option>)}</select></label>
        </article>)}
        {!loading && !visible.length && <div className="empty"><Folder /><p>This folder is ready for its first document.</p></div>}
        {loading && <div className="page-loading"><RefreshCw /> Loading folders…</div>}
      </div>
    </section>
  </div>;
}
