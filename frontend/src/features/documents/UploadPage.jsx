import { useEffect, useState } from "react";
import { CheckCircle2, Copy, FileUp, ShieldCheck, Share2, X } from "lucide-react";
import { api } from "../../api/client";
import ShareDialog from "../sharing/ShareDialog";
import { Toast } from "../ui/Feedback";

const FILE_TYPES = ["PDF", "DOCX", "DOC", "JPG", "JPEG", "PNG", "XLSX", "CSV", "TXT", "PPTX", "ZIP", "OTHER"];
function detectFileType(file) {
  const extension = file?.name?.split(".").pop()?.toUpperCase();
  return FILE_TYPES.includes(extension) ? extension : "OTHER";
}

export default function UploadPage({ profile, refresh }) {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    fileName: "", fileType: "PDF", category: "", department: "",
    documentOwner: "", documentDate: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sharing, setSharing] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [quickCreate, setQuickCreate] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState("");
  const [lookupForm, setLookupForm] = useState({ name: "", description: "" });
  const update = (field, value) => setMetadata((current) => ({ ...current, [field]: value }));
  const selectFile = (selected) => { if (!selected) return; setFile(selected); setResult(null); setError(""); setMetadata((current) => ({ ...current, fileName: selected.name, fileType: detectFileType(selected) })); };
  const loadLookups = () => Promise.all([api("/categories"), api("/departments")]).then(([c, d]) => { setCategories(c); setDepartments(d); });
  useEffect(() => { loadLookups().catch((e) => setError(e.message)); }, []);
  async function createLookup(event) {
    event.preventDefault();
    try {
      const created = await api(`/${quickCreate}`, { method: "POST", body: JSON.stringify(lookupForm) });
      await loadLookups();
      update(quickCreate === "categories" ? "category" : "department", created.name);
      setLookupForm({ name: "", description: "" }); setQuickCreate(null);
    } catch (requestError) { setError(requestError.message); }
  }

  async function submit(event) {
    event.preventDefault();
    setError(""); setSaving(true); setResult(null);
    const form = new FormData();
    form.append("file", file);
    Object.entries(metadata).forEach(([key, value]) => form.append(key, value));
    try {
      const uploaded = await api("/documents/upload", { method: "POST", body: form });
      setResult(uploaded);
      setToast("Document saved successfully"); setTimeout(() => setToast(""), 2500);
      setNote(""); setNoteSaved(false); setNoteOpen(true);
      await refresh();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  return <div className="upload-layout">
    <section className="panel">
      <h3>Catalogue a document</h3>
      <p className="form-intro">Add useful ownership, classification, and filing details for accurate retrieval.</p>
      <form className="form grid" onSubmit={submit}>
        <label className={`drop ${dragging ? "dragging" : ""}`} onDragOver={(event)=>{event.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={(event)=>{event.preventDefault();setDragging(false);selectFile(event.dataTransfer.files[0])}}>
          <input type="file" required={!file} onChange={(event) => selectFile(event.target.files[0])} />
          <span className="living-folder" aria-hidden="true"><i className="folder-back"/><i className="paper paper-one"/><i className="paper paper-two"/><i className="paper paper-three"/><i className="folder-front"/></span>
          <span className="drop-copy"><FileUp/><b>{file ? file.name : "Drop a document here"}</b><span>or browse your device · Maximum 20 MB</span></span>
          {file && <span className="file-chip"><b>{file.name}</b><small>{(file.size/1024/1024).toFixed(2)} MB</small><button type="button" aria-label="Remove selected file" onClick={(event)=>{event.preventDefault();setFile(null);update("fileName","")}}><X/></button></span>}
        </label>
        <h4 className="form-section wide">Document identity</h4>
        <Field label="Document name" required value={metadata.fileName} onChange={(v) => update("fileName", v)} />
        <label>File type<input value={metadata.fileType} readOnly /><small>Detected automatically from the selected file.</small></label>
        <div><Select label="Category" required value={metadata.category} options={categories.map((item) => item.name)} placeholder="Select category" onChange={(v) => update("category", v)} /><button className="link-button" type="button" onClick={() => setQuickCreate("categories")}>+ Create category</button></div>
        <div><Select label="Department" required value={metadata.department} options={departments.map((item) => item.name)} placeholder="Select department" onChange={(v) => update("department", v)} /><button className="link-button" type="button" onClick={() => setQuickCreate("departments")}>+ Create department</button></div>
        <h4 className="form-section wide">Ownership and access</h4>
        <Field label="Document owner" placeholder="Person or team" value={metadata.documentOwner} onChange={(v) => update("documentOwner", v)} />
        <h4 className="form-section wide">Filing information</h4>
        <label>Upload date<input type="date" value={new Date().toISOString().slice(0, 10)} disabled/><small>Recorded automatically when you upload.</small></label>
        {error && <div className="error wide">{error}</div>}
        <div className="submit-row wide"><button className="primary" disabled={saving}><FileUp/>{saving ? "Uploading, please wait…" : "Save document"}</button><small>Unlimited uploads · a unique reference is stamped on save</small></div>
      </form>
    </section>
    <aside className="tip">
      <ShieldCheck/><b>Unlimited document uploads</b><span>Upload and organize files without a plan or quota.</span>
      <p>Categories and departments are available in search. Upload date is recorded automatically.</p>
      {result && <div className="code-result"><CheckCircle2/><small>DOCUMENT UPLOADED SUCCESSFULLY</small><strong>{result.documentCode}</strong><p>Uploaded {new Date(result.uploadedAt).toLocaleString()}</p><button type="button" onClick={async () => { await navigator.clipboard.writeText(result.documentCode); setCopied(true); setTimeout(() => setCopied(false), 1500); }}><Copy/> {copied ? "Copied" : "Copy unique code"}</button><button className="primary" onClick={() => setSharing(true)}><Share2/> Share</button></div>}
    </aside>
    {sharing && result && <ShareDialog document={result} close={() => setSharing(false)}/>} 
    {noteOpen && result && <div className="modal" onMouseDown={() => setNoteOpen(false)}><div onMouseDown={(event) => event.stopPropagation()}><button className="close" onClick={() => setNoteOpen(false)}>×</button><h3>Remember this document</h3><p className="form-intro">Add a note now so this document is easy to recognize later.</p><form className="form" onSubmit={async (event) => {event.preventDefault();try{await api("/notes",{method:"POST",body:JSON.stringify({documentId:result.id,description:note})});setNoteSaved(true);setTimeout(()=>setNoteOpen(false),700);}catch(requestError){setError(requestError.message);}}}><label>Document number<input value={result.documentCode} readOnly/></label><label>Describe your document in your language<textarea autoFocus required maxLength="2000" placeholder="Describe about your document in your language" value={note} onChange={(event)=>setNote(event.target.value)}/></label><button className="primary" disabled={noteSaved}>{noteSaved?"Note saved":"Save note"}</button><button type="button" onClick={()=>setNoteOpen(false)}>Skip for now</button></form></div></div>}
    {quickCreate && <div className="modal" onMouseDown={() => setQuickCreate(null)}><div onMouseDown={(event) => event.stopPropagation()}><button className="close" onClick={() => setQuickCreate(null)}>×</button><h3>Create {quickCreate === "categories" ? "category" : "department"}</h3><form className="form" onSubmit={createLookup}><label>Name<input required maxLength="100" value={lookupForm.name} onChange={(event) => setLookupForm({ ...lookupForm, name: event.target.value })}/></label><label>Description<textarea maxLength="500" value={lookupForm.description} onChange={(event) => setLookupForm({ ...lookupForm, description: event.target.value })}/></label><button className="primary">Create and select</button></form></div></div>}
    <Toast message={toast} onClose={() => setToast("")} />
  </div>;
}

function Field({ label, value, onChange, placeholder = "", type = "text", required = false }) {
  return <label>{label}<input type={type} value={value} placeholder={placeholder} required={required} onChange={(event) => onChange(event.target.value)} /></label>;
}
function Select({ label, value, options, onChange, placeholder, required = false }) {
  return <label>{label}<select required={required} value={value} onChange={(event) => onChange(event.target.value)}>{placeholder && <option value="">{placeholder}</option>}{options.map((option) => typeof option === "object" ? <option key={option.value} value={option.value}>{option.label}</option> : <option key={option}>{option}</option>)}</select></label>;
}
