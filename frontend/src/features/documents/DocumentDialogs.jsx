import { useEffect, useState } from "react";
import { Eye, History, LoaderCircle, UploadCloud } from "lucide-react";
import { api, apiBlob } from "../../api/client";

export function PreviewDialog({ document, close }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl;
    setLoading(true);
    setError("");
    setUrl("");
    apiBlob(`/documents/view/${document.id}`)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        setError("Unable to preview this document. Please try downloading the document or contact your administrator.");
      })
      .finally(() => setLoading(false));
    return () => objectUrl && URL.revokeObjectURL(objectUrl);
  }, [document.id]);

  const image = /^(PNG|JPG|JPEG|GIF|WEBP|BMP)$/i.test(document.fileType);
  const pdfOrText = /^(PDF|TXT)$/i.test(document.fileType);

  async function downloadDocument() {
    const blob = await apiBlob(`/documents/download/${document.id}`);
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = document.fileName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }

  return (
    <div className="modal preview-modal" onMouseDown={close}>
      <div onMouseDown={(event) => event.stopPropagation()}>
        <button className="close" onClick={close}>x</button>
        <h3><Eye/> Preview - {document.fileName}</h3>
        {loading && <div className="preview-loading"><LoaderCircle className="spin"/> Loading preview...</div>}
        {error && (
          <div className="preview-fallback">
            <p>{error}</p>
            <button className="primary" onClick={downloadDocument}>Download file</button>
          </div>
        )}
        {url && (
          image
            ? <div className="image-preview"><img src={url} alt={document.fileName}/></div>
            : pdfOrText
              ? <iframe title={document.fileName} src={url}/>
              : <div className="preview-fallback"><p>This file type is not rendered directly by your browser.</p><a className="primary" href={url} target="_blank" rel="noreferrer">Open file</a></div>
        )}
      </div>
    </div>
  );
}

export function VersionsDialog({ document, close, changed }) {
  const [versions, setVersions] = useState([]);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const load = () => api(`/documents/${document.id}/versions`).then(setVersions).catch((error) => setMessage(error.message));
  useEffect(load, [document.id]);

  async function upload(event) {
    event.preventDefault();
    const form = new FormData();
    form.append("file", file);
    form.append("note", note);
    try {
      await api(`/documents/${document.id}/versions`, { method: "POST", body: form });
      setFile(null);
      setNote("");
      setMessage("New version uploaded");
      load();
      changed?.();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function rollback(version) {
    if (!confirm(`Restore version ${version} as the newest version?`)) return;
    try {
      await api(`/documents/${document.id}/versions/${version}/rollback`, { method: "POST" });
      setMessage(`Version ${version} restored`);
      load();
      changed?.();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="modal versions-modal" onMouseDown={close}>
      <div onMouseDown={(event) => event.stopPropagation()}>
        <button className="close" onClick={close}>x</button>
        <h3><History/> Version history</h3>
        <p className="form-intro">Every replacement remains available. Rollback creates a new version without erasing history.</p>
        <form className="version-upload" onSubmit={upload}>
          <input type="file" required onChange={(event) => setFile(event.target.files[0])}/>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="What changed?"/>
          <button className="primary"><UploadCloud/> Upload version</button>
        </form>
        {message && <p className="notice">{message}</p>}
        <div className="version-list">
          {versions.map((version) => (
            <div key={version.id}>
              <span className="version-number">v{version.versionNumber}</span>
              <div>
                <b>{version.fileName}</b>
                <small>{version.changeNote} - {version.createdBy} - {new Date(version.createdAt).toLocaleString()}</small>
              </div>
              {version.versionNumber === document.currentVersion ? <em>Current</em> : <button onClick={() => rollback(version.versionNumber)}>Restore</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
