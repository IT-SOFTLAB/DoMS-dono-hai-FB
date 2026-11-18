import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, CloudUpload, Copy, FileUp, FileText, ShieldCheck, Share2, Sparkles, X } from "lucide-react";
import { api } from "../../api/client";
import ShareDialog from "../sharing/ShareDialog";
import { Toast } from "../ui/Feedback";

const FILE_TYPES = ["PDF", "DOCX", "DOC", "JPG", "JPEG", "PNG", "XLSX", "CSV", "TXT", "PPTX", "ZIP", "OTHER"];
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "doc", "jpg", "jpeg", "png", "xlsx", "csv", "txt", "pptx", "zip"]);
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const CUSTOM_LOOKUP = "__create_custom__";
function detectFileType(file) {
  const extension = file?.name?.split(".").pop()?.toUpperCase();
  return FILE_TYPES.includes(extension) ? extension : "OTHER";
}

export default function UploadPage({ profile, refresh }) {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    fileName: "", fileType: "", category: "", department: "",
    documentOwner: "", documentDate: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [customLookup, setCustomLookup] = useState({ category: false, department: false });
  const [customValue, setCustomValue] = useState({ category: "", department: "" });
  const [customSaving, setCustomSaving] = useState("");
  const [customError, setCustomError] = useState({ category: "", department: "" });
  const [sharing, setSharing] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState("");
  const uploadInProgress = useRef(false);
  const update = (field, value) => setMetadata((current) => ({ ...current, [field]: value }));
  const selectFile = (selected) => {
    if (!selected) return false;
    const extension = selected.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      setError("Unsupported file type. Choose PDF, DOC/DOCX, JPG/PNG, XLSX, CSV, TXT, PPTX, or ZIP.");
      return false;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setError("This file is larger than 20 MB. Choose a smaller file and try again.");
      return false;
    }
    setFile(selected); setResult(null); setError(""); setMetadata((current) => ({ ...current, fileName: selected.name, fileType: detectFileType(selected) }));
    return true;
  };
  async function loadLookups() {
    setLookupsLoading(true);
    const [categoryResult, departmentResult] = await Promise.allSettled([api("/categories"), api("/departments")]);
    if (categoryResult.status === "fulfilled") {
      setCategories(Array.isArray(categoryResult.value) ? categoryResult.value : []);
      setCategoryError("");
    } else setCategoryError(categoryResult.reason?.message || "Categories could not be loaded.");
    if (departmentResult.status === "fulfilled") {
      setDepartments(Array.isArray(departmentResult.value) ? departmentResult.value : []);
      setDepartmentError("");
    } else setDepartmentError(departmentResult.reason?.message || "Departments could not be loaded.");
    setLookupsLoading(false);
    return {
      categories: categoryResult.status === "fulfilled" && Array.isArray(categoryResult.value) ? categoryResult.value : [],
      departments: departmentResult.status === "fulfilled" && Array.isArray(departmentResult.value) ? departmentResult.value : [],
    };
  }
  useEffect(() => { loadLookups(); }, []);
  async function createCustomLookup(type) {
    const name = customValue[type].trim();
    if (!name || customSaving) return;
    setCustomSaving(type);
    setCustomError((current) => ({ ...current, [type]: "" }));
    const collection = type === "category" ? "categories" : "departments";
    try {
      const created = await api(`/${collection}`, { method: "POST", body: JSON.stringify({ name, description: "" }) });
      if (type === "category") setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      else setDepartments((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      update(type, created.name);
      setCustomValue((current) => ({ ...current, [type]: "" }));
      setCustomLookup((current) => ({ ...current, [type]: false }));
    } catch (requestError) {
      const message = requestError.message || `Could not create ${type}.`;
      if (/already exists/i.test(message)) {
        const refreshed = await loadLookups();
        const rows = refreshed[collection];
        const existing = rows.find((row) => row.name.toLocaleLowerCase() === name.toLocaleLowerCase());
        if (existing) {
          update(type, existing.name);
          setCustomValue((current) => ({ ...current, [type]: "" }));
          setCustomLookup((current) => ({ ...current, [type]: false }));
        } else setCustomError((current) => ({ ...current, [type]: message }));
      } else setCustomError((current) => ({ ...current, [type]: message }));
    } finally { setCustomSaving(""); }
  }
  async function submit(event) {
    event.preventDefault();
    if (uploadInProgress.current || !file) return;
    uploadInProgress.current = true;
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
    finally { uploadInProgress.current = false; setSaving(false); }
  }

  return <div className="upload-layout">
    <section className="panel">
      <h3>Catalogue a document</h3>
      <p className="form-intro">Add useful ownership, classification, and filing details for accurate retrieval.</p>
      <form className="form grid" onSubmit={submit}>
        <label className={`drop intake-drop ${dragging ? "dragging" : ""}`} onDragOver={(event)=>{event.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={(event)=>{event.preventDefault();setDragging(false);selectFile(event.dataTransfer.files[0])}}>
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.csv,.txt,.pptx,.zip" required={!file} onChange={(event) => { if (!selectFile(event.target.files[0])) event.currentTarget.value = ""; }} />
          <span className="intake-visual" aria-hidden="true"><span className="intake-ring intake-ring-one"/><span className="intake-ring intake-ring-two"/><span className="intake-cloud"><CloudUpload /></span><span className="intake-mini intake-mini-one"><FileText /></span><span className="intake-mini intake-mini-two"><Sparkles /></span></span>
          <span className="intake-copy"><span className="intake-kicker"><Sparkles /> SMART INTAKE</span><b>{file ? file.name : "Bring your records into focus"}</b><span>{file ? "File selected. Add its category and department below." : "Drop a file here or choose one to start building your searchable archive."}</span><span className="intake-browse">{file ? "Choose a different file" : "Choose a file"} <ArrowUpRight /></span><small>PDF · Office · Images · CSV · ZIP <i /> Up to 20 MB</small></span>
          {file && <span className="file-chip"><b>{file.name}</b><small>{(file.size/1024/1024).toFixed(2)} MB</small><button type="button" aria-label="Remove selected file" onClick={(event)=>{event.preventDefault();setFile(null);update("fileName","")}}><X/></button></span>}
        </label>
        <h4 className="form-section wide">Document identity</h4>
        <Field label="Document name" required value={metadata.fileName} onChange={(v) => update("fileName", v)} />
        <label>File type<input value={metadata.fileType} placeholder="file type" readOnly /></label>
        <div className="upload-lookup-field"><Select label="Category" required={!customLookup.category} disabled={lookupsLoading} value={customLookup.category ? CUSTOM_LOOKUP : metadata.category} options={[...categories.map((item) => item.name), { value: CUSTOM_LOOKUP, label: "＋ Custom / create new" }]} placeholder={lookupsLoading ? "Loading categories…" : categories.length ? "Select category" : "No categories yet"} onChange={(value) => { if (value === CUSTOM_LOOKUP) { setCustomLookup((current) => ({ ...current, category: true })); setCustomError((current) => ({ ...current, category: "" })); } else { setCustomLookup((current) => ({ ...current, category: false })); update("category", value); } }} />{customLookup.category && <div className="custom-lookup-row"><input aria-label="New category name" autoFocus required maxLength="100" value={customValue.category} placeholder="Enter a new category" onChange={(event) => setCustomValue((current) => ({ ...current, category: event.target.value }))} /><button type="button" className="primary" disabled={!customValue.category.trim() || customSaving === "category"} onClick={() => createCustomLookup("category")}>{customSaving === "category" ? "Creating…" : "Create category"}</button></div>}{(categoryError || customError.category) && <small className="lookup-error">{customError.category || categoryError}</small>}</div>
        <div className="upload-lookup-field"><Select label="Department" required={!customLookup.department} disabled={lookupsLoading} value={customLookup.department ? CUSTOM_LOOKUP : metadata.department} options={[...departments.map((item) => item.name), { value: CUSTOM_LOOKUP, label: "＋ Custom / create new" }]} placeholder={lookupsLoading ? "Loading departments…" : departments.length ? "Select department" : "No departments yet"} onChange={(value) => { if (value === CUSTOM_LOOKUP) { setCustomLookup((current) => ({ ...current, department: true })); setCustomError((current) => ({ ...current, department: "" })); } else { setCustomLookup((current) => ({ ...current, department: false })); update("department", value); } }} />{customLookup.department && <div className="custom-lookup-row"><input aria-label="New department name" autoFocus required maxLength="100" value={customValue.department} placeholder="Enter a new department" onChange={(event) => setCustomValue((current) => ({ ...current, department: event.target.value }))} /><button type="button" className="primary" disabled={!customValue.department.trim() || customSaving === "department"} onClick={() => createCustomLookup("department")}>{customSaving === "department" ? "Creating…" : "Create department"}</button></div>}{(departmentError || customError.department) && <small className="lookup-error">{customError.department || departmentError}</small>}</div>
        {(categoryError || departmentError) && <div className="lookup-retry wide"><span>One or more filing lists could not be reached.</span><button type="button" onClick={loadLookups}>Retry lists</button></div>}
        <h4 className="form-section wide">Ownership and access</h4>
        <Field label="Document owner" placeholder="Person or team" value={metadata.documentOwner} onChange={(v) => update("documentOwner", v)} />
        <h4 className="form-section wide">Filing information</h4>
        <label>Upload date<input type="date" value={new Date().toISOString().slice(0, 10)} disabled/><small>Recorded automatically when you upload.</small></label>
        {error && <div className="error wide">{error}</div>}
        <div className="submit-row wide"><button className="primary" disabled={saving}><FileUp/>{saving ? "Uploading, please wait…" : "Save document"}</button><small>{profile.quota ? `${(profile.quota.remainingBytes/1024/1024/1024).toFixed(2)} GB remaining this period` : "A valid subscription is required"} · a unique reference is stamped on save</small></div>
      </form>
    </section>
    <aside className="tip">
      <ShieldCheck/><b>{profile.quota?.plan || "No active plan"}</b><span>{profile.quota ? `${(profile.quota.usedBytes/1024/1024/1024).toFixed(2)} GB used of ${(profile.quota.monthlyLimitBytes/1024/1024/1024).toFixed(0)} GB monthly` : "No upload plan is assigned to this account yet. Ask your workspace owner to assign one."}</span>
      <p>Your filing labels help keep search precise. Upload date is recorded automatically.</p>
      {result && <div className="code-result"><CheckCircle2/><small>DOCUMENT UPLOADED SUCCESSFULLY</small><strong>{result.documentCode}</strong><p>Uploaded {new Date(result.uploadedAt).toLocaleString()}</p><button type="button" onClick={async () => { await navigator.clipboard.writeText(result.documentCode); setCopied(true); setTimeout(() => setCopied(false), 1500); }}><Copy/> {copied ? "Copied" : "Copy unique code"}</button><button className="primary" onClick={() => setSharing(true)}><Share2/> Share</button></div>}
    </aside>
    {sharing && result && <ShareDialog document={result} close={() => setSharing(false)}/>} 
    {noteOpen && result && <div className="modal" onMouseDown={() => setNoteOpen(false)}><div onMouseDown={(event) => event.stopPropagation()}><button className="close" onClick={() => setNoteOpen(false)}>×</button><h3>Remember this document</h3><p className="form-intro">Add a note now so this document is easy to recognize later.</p><form className="form" onSubmit={async (event) => {event.preventDefault();try{await api("/notes",{method:"POST",body:JSON.stringify({documentId:result.id,description:note})});setNoteSaved(true);setTimeout(()=>setNoteOpen(false),700);}catch(requestError){setError(requestError.message);}}}><label>Document number<input value={result.documentCode} readOnly/></label><label>Describe your document in your language<textarea autoFocus required maxLength="2000" placeholder="Describe about your document in your language" value={note} onChange={(event)=>setNote(event.target.value)}/></label><button className="primary" disabled={noteSaved}>{noteSaved?"Note saved":"Save note"}</button><button type="button" onClick={()=>setNoteOpen(false)}>Skip for now</button></form></div></div>}
    <Toast message={toast} onClose={() => setToast("")} />
  </div>;
}

function Field({ label, value, onChange, placeholder = "", type = "text", required = false }) {
  return <label>{label}<input type={type} value={value} placeholder={placeholder} required={required} onChange={(event) => onChange(event.target.value)} /></label>;
}
function Select({ label, value, options, onChange, placeholder, required = false, disabled = false }) {
  return <label>{label}<select required={required} disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)}>{placeholder && <option value="">{placeholder}</option>}{options.map((option) => typeof option === "object" ? <option key={option.value} value={option.value}>{option.label}</option> : <option key={option}>{option}</option>)}</select></label>;
}
