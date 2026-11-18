import { useEffect, useState } from "react";
import { Download, Eye, FileText, Pencil, Search, Trash2, X } from "lucide-react";
import { api, apiBlob } from "../../api/client";
import { PreviewDialog } from "./DocumentDialogs";
import { SkeletonList } from "../ui/Feedback";

const EMPTY = { code: "", type: "", category: "", department: "", name: "", owner: "", uploadDate: "" };
const PAGE_SIZE = 10;

export default function SearchPage() {
  const [filters, setFilters] = useState(EMPTY);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [preview, setPreview] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const update = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  async function run(values = filters) {
    setLoading(true);
    setPage(1);
    try {
      const found = values.code.trim()
        ? [await api(`/documents/code/${encodeURIComponent(values.code.trim())}`)]
        : await api(`/documents/advanced-search?${new URLSearchParams(Object.entries(values).filter(([key, value]) => key !== "code" && value))}`);
      setResults(Array.isArray(found) ? found : []);
      setError("");
    } catch (requestError) {
      setResults([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([api("/categories"), api("/departments")])
      .then(([categoryRows, departmentRows]) => { setCategories(categoryRows); setDepartments(departmentRows); })
      .catch((requestError) => setError(requestError.message));
    run(EMPTY);
  }, []);

  async function remove(doc) {
    if (!window.confirm(`Move “${doc.fileName}” to the recycle bin?`)) return;
    try {
      await api(`/documents/${doc.id}`, { method: "DELETE" });
      setResults((rows) => rows.filter((row) => row.id !== doc.id));
    } catch (requestError) { setError(requestError.message); }
  }

  async function download(doc) {
    try {
      const blob = await apiBlob(`/documents/download/${doc.id}`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = doc.fileName;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) { setError(requestError.message); }
  }

  async function rename(event) {
    event.preventDefault();
    const name = renameValue.trim();
    if (!renaming || !name) return;
    setRenameBusy(true);
    setError("");
    try {
      const updated = await api(`/documents/${renaming.id}`, { method: "PUT", body: JSON.stringify({ fileName: name }) });
      setResults((rows) => rows.map((row) => row.id === updated.id ? { ...row, ...updated } : row));
      setRenaming(null);
    } catch (requestError) { setError(requestError.message); }
    finally { setRenameBusy(false); }
  }

  const sorted = [...results].sort((left, right) => {
    const leftName = left.fileName || "";
    const rightName = right.fileName || "";
    if (sortBy === "name-asc") return leftName.localeCompare(rightName);
    if (sortBy === "name-desc") return rightName.localeCompare(leftName);
    const leftDate = new Date(left.uploadedAt || 0);
    const rightDate = new Date(right.uploadedAt || 0);
    return sortBy === "oldest" ? leftDate - rightDate : rightDate - leftDate;
  });
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return <>
    <section className="panel search-workspace">
      <div className="search-heading">
        <div><h3>Search documents</h3><p className="form-intro">Find documents by number or combine any filters below.</p></div>
        <div className="search-tools">
          <span>{loading ? "Searching…" : `${results.length} files found`}</span>
          <label>Sort by<select aria-label="Sort documents" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }}>
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option>
          </select></label>
        </div>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); run(); }}>
        <div className="document-number-search">
          <label>Search by document number<input value={filters.code} onChange={(event) => update("code", event.target.value)} placeholder="e.g. DOM-2026-0001" /></label>
          <button type="submit" className="primary search-submit"><Search aria-hidden="true" /><span>Search</span></button>
        </div>
        <div className="filter-grid">
          <Filter label="Document name" value={filters.name} onChange={(value) => update("name", value)} />
          <Choice label="Category" value={filters.category} items={categories} onChange={(value) => update("category", value)} />
          <Choice label="All departments" value={filters.department} items={departments} onChange={(value) => update("department", value)} />
          <Filter label="Owner" value={filters.owner} onChange={(value) => update("owner", value)} />
          <label>Upload date<input type="date" value={filters.uploadDate} onChange={(event) => update("uploadDate", event.target.value)} /></label>
          <label>File type<select value={filters.type} onChange={(event) => update("type", event.target.value)}>
            <option value="">All file types</option>{["PDF", "DOCX", "DOC", "JPG", "JPEG", "PNG", "XLSX", "CSV", "TXT", "PPTX", "ZIP", "OTHER"].map((type) => <option key={type}>{type}</option>)}
          </select></label>
        </div>
        <div className="filter-footer"><button type="button" onClick={() => { setFilters(EMPTY); run(EMPTY); }}><X /> Clear form</button></div>
      </form>
      {error && <div className="error">{error}</div>}
    </section>

    {loading && <SkeletonList rows={3} />}
    {!loading && results.length > 0 && <>
      <div className="results">{visible.map((doc, index) => <article className="doc" key={doc.id} style={{ "--stagger": `${index * 50}ms` }}>
        <div className="file-icon">{doc.fileType || "FILE"}</div>
        <div><b>{doc.fileName || "Untitled document"}</b><span>{doc.category || "Uncategorized"} · {doc.department || "No department"}</span>
          <div className="doc-meta"><em>{doc.documentOwner || "No owner"}</em>{doc.uploadedAt && <em>{new Date(doc.uploadedAt).toLocaleDateString()}</em>}</div>
          {doc.documentCode && <code className="document-code" onClick={() => navigator.clipboard.writeText(doc.documentCode)}>{doc.documentCode}</code>}
        </div>
        <div className="doc-actions"><button type="button" title="View" onClick={() => setPreview(doc)}><Eye /></button><button type="button" title="Download" onClick={() => download(doc)}><Download /></button><button type="button" title="Rename document" onClick={() => { setRenaming(doc); setRenameValue(doc.fileName || ""); }}><Pencil /></button><button type="button" className="delete-doc action-labeled" title="Move to recycle bin" aria-label={`Move ${doc.fileName || "document"} to recycle bin`} onClick={() => remove(doc)}><Trash2 /><span>Delete</span></button></div>
      </article>)}</div>
      {results.length > PAGE_SIZE && <div className="pagination"><span>Page {page} of {pages}</span><div><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><button type="button" disabled={page === pages} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>}
    </>}

    {preview && <PreviewDialog document={preview} close={() => setPreview(null)} />}
    {renaming && <div className="modal" onMouseDown={() => !renameBusy && setRenaming(null)}><div onMouseDown={(event) => event.stopPropagation()}>
      <button className="close" type="button" aria-label="Close rename dialog" onClick={() => setRenaming(null)}><X /></button><h3>Rename document</h3>
      <form className="form" onSubmit={rename}><label>Document name<input autoFocus required maxLength="255" value={renameValue} onChange={(event) => setRenameValue(event.target.value)} /></label>{error && <div className="error">{error}</div>}<button className="primary" disabled={renameBusy}>{renameBusy ? "Saving…" : "Save name"}</button></form>
    </div></div>}
  </>;
}

function Filter({ label, value, onChange }) {
  return <label>{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={`Search by ${label.toLowerCase()}`} /></label>;
}

function Choice({ label, value, items, onChange }) {
  return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}><option value="">{label}</option>{items.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>;
}
