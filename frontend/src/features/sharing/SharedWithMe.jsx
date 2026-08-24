import { useEffect, useState } from "react";
import { Download, Eye, Inbox, Share2 } from "lucide-react";
import { api, API } from "../../api/client";
import ShareDialog from "./ShareDialog";

export default function SharedWithMe() {
  const [tab, setTab] = useState("inbox");
  const [shares, setShares] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [sharing, setSharing] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([api("/shares/shared-with-me"), api("/documents")])
      .then(([received, owned]) => { setShares(received); setDocuments(owned); })
      .catch((error) => setMessage(error.message));
  }, []);

  async function file(id, disposition) {
    try {
      const response = await fetch(`${API}/documents/${disposition}/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("doms_token")}` } });
      if (!response.ok) throw new Error("Access denied");
      const url = URL.createObjectURL(await response.blob());
      if (disposition === "view") window.open(url, "_blank", "noopener,noreferrer");
      else { const link = document.createElement("a"); link.href = url; link.download = "document"; link.click(); }
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) { setMessage(error.message); }
  }

  return <>
    <div className="tabs">
      <button className={tab === "share" ? "active" : ""} onClick={() => setTab("share")}><Share2 /> Share document</button>
      <button className={tab === "inbox" ? "active" : ""} onClick={() => setTab("inbox")}><Inbox /> Inbox <span className="tab-count">{shares.length}</span></button>
    </div>
    <section className="panel">
      <h3>{tab === "share" ? "Share a document" : "Documents shared with me"}</h3>
      <p className="form-intro">{tab === "share" ? "Choose one of your documents and share it with another user." : "Open documents that other users have shared with you."}</p>
      {message && <p className="notice">{message}</p>}
      {tab === "share" ? <div className="share-document-list">{documents.map((doc) => <article key={doc.id}><div><b>{doc.fileName}</b><small>{doc.documentCode} · {doc.category}</small></div><button className="primary" onClick={() => setSharing(doc)}><Share2 /> Share</button></article>)}{!documents.length && <p className="empty">Upload a document before sharing.</p>}</div> :
      <div className="shared-cards">{shares.map((share) => <article key={share.id}><div className="shared-file-icon"><Share2/></div><div><b>{share.documentName}</b><span>Shared by {share.sharedBy}</span><small>{new Date(share.sharedAt).toLocaleString()}</small></div><div className="shared-actions"><button className="primary" onClick={() => file(share.documentId, "view")}><Eye/> View</button><button onClick={() => file(share.documentId, "download")}><Download/> Download</button></div></article>)}{!shares.length && <p className="empty">No documents have been shared with you.</p>}</div>}
    </section>
    {sharing && <ShareDialog document={sharing} close={() => setSharing(null)} />}
  </>;
}
