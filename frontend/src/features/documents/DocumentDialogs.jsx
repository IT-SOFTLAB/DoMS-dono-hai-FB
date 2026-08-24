import { useEffect, useState } from "react";
import { Eye, History, UploadCloud } from "lucide-react";
import { api, API } from "../../api/client";

export function PreviewDialog({ document, close }) {
  const [url,setUrl]=useState(""),[error,setError]=useState("");
  useEffect(()=>{let objectUrl;fetch(`${API}/documents/view/${document.id}`,{headers:{Authorization:`Bearer ${localStorage.getItem("doms_token")}`}}).then(async response=>{if(!response.ok)throw new Error("Preview could not be loaded");objectUrl=URL.createObjectURL(await response.blob());setUrl(objectUrl);}).catch(e=>setError(e.message));return()=>objectUrl&&URL.revokeObjectURL(objectUrl);},[document.id]);
  return <div className="modal preview-modal" onMouseDown={close}><div onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={close}>×</button><h3><Eye/> Preview — {document.fileName}</h3>{error&&<div className="error">{error}</div>}{url&&(/^(PDF|PNG|JPG|JPEG|GIF|TXT)$/i.test(document.fileType)?<iframe title={document.fileName} src={url}/>:<div className="preview-fallback"><p>This file type is not rendered directly by your browser.</p><a className="primary" href={url} target="_blank" rel="noreferrer">Open file</a></div>)}</div></div>;
}

export function VersionsDialog({ document, close, changed }) {
 const [versions,setVersions]=useState([]),[file,setFile]=useState(null),[note,setNote]=useState(""),[message,setMessage]=useState("");
 const load=()=>api(`/documents/${document.id}/versions`).then(setVersions).catch(e=>setMessage(e.message));useEffect(load,[document.id]);
 async function upload(e){e.preventDefault();const form=new FormData();form.append("file",file);form.append("note",note);try{await api(`/documents/${document.id}/versions`,{method:"POST",body:form});setFile(null);setNote("");setMessage("New version uploaded");load();changed?.();}catch(x){setMessage(x.message);}}
 async function rollback(version){if(!confirm(`Restore version ${version} as the newest version?`))return;try{await api(`/documents/${document.id}/versions/${version}/rollback`,{method:"POST"});setMessage(`Version ${version} restored`);load();changed?.();}catch(x){setMessage(x.message);}}
 return <div className="modal versions-modal" onMouseDown={close}><div onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={close}>×</button><h3><History/> Version history</h3><p className="form-intro">Every replacement remains available. Rollback creates a new version without erasing history.</p><form className="version-upload" onSubmit={upload}><input type="file" required onChange={e=>setFile(e.target.files[0])}/><input value={note} onChange={e=>setNote(e.target.value)} placeholder="What changed?"/><button className="primary"><UploadCloud/> Upload version</button></form>{message&&<p className="notice">{message}</p>}<div className="version-list">{versions.map(v=><div key={v.id}><span className="version-number">v{v.versionNumber}</span><div><b>{v.fileName}</b><small>{v.changeNote} · {v.createdBy} · {new Date(v.createdAt).toLocaleString()}</small></div>{v.versionNumber===document.currentVersion?<em>Current</em>:<button onClick={()=>rollback(v.versionNumber)}>Restore</button>}</div>)}</div></div></div>;
}
