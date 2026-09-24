import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Upload,
  Search,
  UserRound,
  LogOut,
  Users,
  ReceiptText,
  FileText,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  Tags,
  Building2,
  Share2,
  StickyNote,
  Activity,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  Eye,
  Files,
  Layers3,
  Crown,
} from "lucide-react";
import "./styles.css";
import { api, API, clearSession, readSession, saveSession } from "./api/client";
import DocumentUploadPage from "./features/documents/UploadPage";
import DocumentSearchPage from "./features/documents/SearchPage";
import LookupManagement from "./features/lookups/LookupManagement";
import SharedWithMe from "./features/sharing/SharedWithMe";
import NotesPage from "./features/documents/NotesPage";
import RecycleBin from "./features/documents/RecycleBin";
import AuditPage from "./features/documents/AuditPage";
import { GlobalLoader, ProgressBar, Toast } from "./features/ui/Feedback";
const routeFor = (admin, page) => `#/${admin ? "admin" : "user"}/${page}`;
const pageFromRoute = (admin, items) => {
  const source = window.location.hash.slice(1) || window.location.pathname;
  const [area, page] = source.split("/").filter(Boolean);
  return area === (admin ? "admin" : "user") && items.some(([id]) => id === page) ? page : "dashboard";
};
function Login({ onLogin }) {
  const [e, setE] = useState(""),
    [p, setP] = useState(""),
    [err, setErr] = useState(""),
    [forgot, setForgot] = useState(false),
    [busy, setBusy] = useState(false);
  async function submit(x) {
    x.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: e, password: p }),
      });
      saveSession(r);
      onLogin(r);
    } catch (z) {
      setErr(z.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login">
      <section className="brand-panel">
        <div className="logo">
          <FileText /> DOMS
        </div>
        <div>
          <span className="eyebrow">DOCUMENT INTELLIGENCE</span>
          <h1>
            Your records.
            <br />
            Perfectly placed.
          </h1>
          <p>
            A secure workspace to catalogue, find, and control every important
            document.
          </p>
        </div>
        <small>ITSOFTLAB360</small>
      </section>
      <section className="login-form">
        <form onSubmit={submit} autoComplete="off">
          <div className="mark">
            <ShieldCheck />
          </div>
          <h2>Welcome back</h2>
          <p>Sign in to your document workspace</p>
          <label>
            Email address
            <input
              type="email"
              value={e}
              onChange={(x) => setE(x.target.value)}
              required
              autoComplete="off"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={p}
              onChange={(x) => setP(x.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          <button type="button" className="forgot-link" onClick={() => setForgot(true)}>Forgot password?</button>
          {err && <div className="error">{err}</div>}
          <button className="primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
      </section>
      {forgot && <Modal close={() => setForgot(false)}><PasswordOtpForm initialEmail={e} onDone={() => setForgot(false)} /></Modal>}
    </div>
  );
}
function Shell({ user, onLogout }) {
  const admin = user.role === "ROLE_ADMIN";
  const items = admin
    ? [
        ["dashboard", LayoutDashboard, "Overview"],
        ["users", Users, "Manage users"],
      ]
    : [
        ["dashboard", LayoutDashboard, "Dashboard"],
        ["upload", Upload, "Upload document"],
        ["search", Search, "Search documents"],
        // ["notes", StickyNote, "Document notes"],
        ["audit", Activity, "Audit trail"],
        ["recycle", ArchiveRestore, "Recycle bin"],
        ["categories", Tags, "Categories"],
        ["departments", Building2, "Departments"],
        // ["shared", Share2, "Shared With Me"],
        ["profile", UserRound, "Manage profile"],
      ];
  const navGroups = admin
    ? [["Admin", items]]
    : [["Workspace", items.slice(0, 4)], ["Insights", items.slice(4, 6)], ["Organize", items.slice(6, 9)], ["Account", items.slice(9)]];
  const [page, setPage] = useState(() => pageFromRoute(admin, items)),
    [open, setOpen] = useState(false);
  const navigate = (nextPage, replace = false) => {
    if (!items.some(([id]) => id === nextPage)) return;
    const path = routeFor(admin, nextPage);
    if (window.location.hash !== path) window.history[replace ? "replaceState" : "pushState"]({ page: nextPage }, "", path);
    setPage(nextPage);
    setOpen(false);
  };
  useEffect(() => {
    const expected = routeFor(admin, page);
    if (window.location.hash !== expected) window.history.replaceState({ page }, "", expected);
    const onRouteChange = () => setPage(pageFromRoute(admin, items));
    window.addEventListener("popstate", onRouteChange);
    window.addEventListener("hashchange", onRouteChange);
    return () => { window.removeEventListener("popstate", onRouteChange); window.removeEventListener("hashchange", onRouteChange); };
  }, [admin]);
  return (
    <div className="app">
      <aside className={open ? "open" : ""}>
        <div className="logo">
          <span className="logo-mark"><FileText /></span> DOMS{" "}
          <button className="close" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        <nav>
          {navGroups.map(([group, groupItems]) => <div className="nav-group" key={group}>
          <span className="nav-label">{group}</span>
          {groupItems.map(([id, I, l]) => (
            <button
              type="button"
              className={page === id ? "active" : ""}
              onClick={() => navigate(id)}
              key={id}
            >
              <I />
              {l}
            </button>
          ))}</div>)}
        </nav>
        <div className="account" role="button" tabIndex="0" onClick={() => !admin && navigate("profile")}>
          <div className="avatar">{user.fullName?.[0]}</div>
          <div>
            <b>{user.fullName}</b>
            <span>{admin ? "Super Admin" : "Member"}</span>
          </div>
          {!admin && <ChevronRight className="account-chevron" />}
        </div>
        <button type="button" className="logout" onClick={onLogout}>
          <LogOut />
          Logout
        </button>
      </aside>
      <main>
        <header>
          <button className="hamb" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <span className="eyebrow">
              {admin ? "ADMIN CONSOLE" : "MY WORKSPACE"}
            </span>
            <h2>{items.find((x) => x[0] === page)?.[2]}</h2>
          </div>
          <div className="header-user"><span className="avatar">{user.fullName?.[0]}</span>{user.fullName}</div>
        </header>
        <div className="content page-enter">
          {admin ? <Admin page={page} /> : <UserPages page={page} />}
        </div>
      </main>
    </div>
  );
}
function Stat({ label, value, sub, tone = "", icon: Icon }) {
  return (
    <div className={"stat " + tone}>
      <span>{Icon && <Icon />}{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}
function Admin({ page }) {
  const [users, setUsers] = useState([]),
    [subs, setSubs] = useState([]),
    [organizations, setOrganizations] = useState([]),
    [availablePlans, setAvailablePlans] = useState([]),
    [form, setForm] = useState({
      fullName: "",
      email: "",
      password: "",
      role: "ROLE_USER",
      contactNumber: "",
      jobTitle: "",
      department: "",
      address: "",
      orgId: "", planId: "", startDate: "", endDate: "",
    }),
    [edit, setEdit] = useState(null),
    [viewUser, setViewUser] = useState(null),
    [msg, setMsg] = useState(""),
    [userSearch, setUserSearch] = useState(""),
    [userPage, setUserPage] = useState(1),
    [subFilter, setSubFilter] = useState("ALL"),
    [subPage, setSubPage] = useState(1);
  const pageSize = 10;
  const filteredUsers = users.filter((u) => `${u.fullName} ${u.email} ${u.contactNumber || ""} ${u.department || ""}`.toLowerCase().includes(userSearch.toLowerCase()));
  const visibleUsers = filteredUsers.slice((userPage - 1) * pageSize, userPage * pageSize);
  const filteredSubs = subs.filter((s) => subFilter === "ALL" || s.status === subFilter);
  const visibleSubs = filteredSubs.slice((subPage - 1) * pageSize, subPage * pageSize);
  const load = () =>
    Promise.all([
      api("/admin/users").then(setUsers),
      api("/admin/organizations").then(setOrganizations),
      api("/admin/plans").then(setAvailablePlans),
      Promise.resolve([]).then(setSubs),
    ]).catch((e) => setMsg(e.message));
  useEffect(() => {
    load();
  }, []);
  async function create(e) {
    e.preventDefault();
    try {
      await api("/admin/create-user", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ fullName: "", email: "", password: "", role: "ROLE_USER", contactNumber: "", jobTitle: "", department: "", address: "", orgId:"", planId:"", startDate:"", endDate:"" });
      setMsg("User and subscription created");
      load();
    } catch (x) {
      setMsg(x.message);
    }
  }
  async function remove(id) {
    if (confirm("Delete this user?")) {
      await api("/admin/users/" + id, { method: "DELETE" });
      load();
    }
  }
  async function save(u) {
    await api("/admin/users/" + u.id, {
      method: "PUT",
      body: JSON.stringify(u),
    });
    setEdit(null);
    load();
  }
  async function decide(id, d) {
    await api(`/admin/subscriptions/${id}/${d}`, { method: "PUT" });
    load();
  }
  if (page === "dashboard")
    return (
      <>
        <div className="stats">
          <Stat
            label="TOTAL USERS"
            value={users.filter((x) => x.role === "ROLE_USER").length}
            sub="Registered accounts"
          />
          <Stat label="ACTIVE USERS" value={users.filter((x) => x.role === "ROLE_USER" && x.enabled).length} sub="Enabled accounts" tone="green" />
          <Stat label="UNLIMITED ACCESS" value="ON" sub="No upload quotas" tone="amber" />
        </div>
        <Panel title="Document access"><p className="form-intro">All active users can upload unlimited documents. Subscription and payment approval are disabled.</p></Panel>
      </>
    );
  if (page === "users")
    return (
      <div className="split">
        <Panel title="Create a new user">
          <form className="form" onSubmit={create}>
            <label>
              Full name
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Temporary password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength="8"
                required
              />
            </label>
            <label>Contact number<input inputMode="numeric" pattern="[0-9]{10}" maxLength="10" title="Enter exactly 10 digits" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })} required /></label>
            <label>Job title<input minLength="2" maxLength="100" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} required /></label>
            <label>Department<input minLength="2" maxLength="100" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required /></label>
            <label>Address<textarea maxLength="250" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
            <label>Organization ID<input type="text" required placeholder="Enter Organization ID" value={form.orgId} onChange={(e)=>setForm({...form,orgId:e.target.value})} /></label>
            <label>Plan<select required value={form.planId} onChange={(e)=>setForm({...form,planId:e.target.value})}><option value="">Select plan</option>{availablePlans.map(p=><option key={p.id} value={p.id}>{p.name} · {(p.monthlyUploadLimitBytes/1024/1024/1024).toFixed(0)} GB/month</option>)}</select></label>
            <label>Start date<input type="date" required value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value,endDate:form.endDate&&form.endDate<=e.target.value?"":form.endDate})}/></label>
            <label>End date<input type="date" required min={form.startDate?new Date(new Date(form.startDate).getTime()+86400000).toISOString().slice(0,10):undefined} value={form.endDate} onChange={(e)=>setForm({...form,endDate:e.target.value})}/></label>
            <button className="primary">Create user</button>
            {msg && <p className="notice">{msg}</p>}
          </form>
        </Panel>
        <Panel title={`All users · ${users.length}`}>
          <div className="table-tools"><input type="search" placeholder="Search by name, email, contact, or department" value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }} /></div>
          <div className="user-list">
            {visibleUsers.map((u) => (
              <div className="user-row" key={u.id}>
                <div className="avatar">{u.fullName[0]}</div>
                <div>
                  <b>{u.fullName}</b>
                  <span>
                    {u.email} · {u.documentsUsed} documents · unlimited uploads
                  </span>
                </div>
                <button title="View complete details" aria-label={`View ${u.fullName}`} onClick={() => setViewUser(u)}><Eye /></button>
                <button onClick={() => setEdit({ ...u })}>Edit</button>
                {u.role !== "ROLE_ADMIN" && (
                  <button className="danger" onClick={() => remove(u.id)}>
                    <Trash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Pagination page={userPage} total={filteredUsers.length} setPage={setUserPage} />
        </Panel>
        {edit && (
          <Modal close={() => setEdit(null)}>
            <h3>Edit user</h3>
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                save(edit);
              }}
            >
              <label>
                Name
                <input
                  value={edit.fullName}
                  onChange={(e) =>
                    setEdit({ ...edit, fullName: e.target.value })
                  }
                />
              </label>
              <label>
                Email
                <input type="email"
                  value={edit.email}
                  onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                />
              </label>
              <label>Contact number<input inputMode="numeric" pattern="[0-9]{10}" maxLength="10" value={edit.contactNumber || ""} onChange={(e) => setEdit({ ...edit, contactNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></label>
              <label>Job title<input value={edit.jobTitle || ""} onChange={(e) => setEdit({ ...edit, jobTitle: e.target.value })} /></label>
              <label>Department<input value={edit.department || ""} onChange={(e) => setEdit({ ...edit, department: e.target.value })} /></label>
              <label>Address<textarea value={edit.address || ""} onChange={(e) => setEdit({ ...edit, address: e.target.value })} /></label>
              <label>Role<select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}><option value="ROLE_USER">User</option><option value="ROLE_ADMIN">Administrator</option></select></label>
              <label>
                Status
                <select
                  value={String(edit.enabled)}
                  onChange={(e) =>
                    setEdit({ ...edit, enabled: e.target.value === "true" })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </label>
              <button className="primary">Save changes</button>
            </form>
          </Modal>
        )}
        {viewUser && <Modal close={() => setViewUser(null)}><h3>User details</h3><div className="user-details"><Detail label="Full name" value={viewUser.fullName}/><Detail label="Email" value={viewUser.email}/><Detail label="Contact number" value={viewUser.contactNumber}/><Detail label="Job title" value={viewUser.jobTitle}/><Detail label="Department" value={viewUser.department}/><Detail label="Address" value={viewUser.address}/><Detail label="Upload access" value="Unlimited"/><Detail label="Documents uploaded" value={viewUser.documentsUsed}/><Detail label="Role" value={viewUser.role === "ROLE_ADMIN" ? "Administrator" : "User"}/><Detail label="Status" value={viewUser.enabled ? "Active" : "Deactivated"}/></div><button className="primary" onClick={() => { setEdit({ ...viewUser }); setViewUser(null); }}>Edit user</button></Modal>}
      </div>
    );
  return (
    <Panel title="Subscription requests & sales history">
      <div className="table-tools"><label>Status<select value={subFilter} onChange={(e) => { setSubFilter(e.target.value); setSubPage(1); }}><option value="ALL">All requests</option><option value="PENDING">Pending</option><option value="APPROVED">Accepted</option><option value="REJECTED">Declined</option></select></label></div>
      <SubTable rows={visibleSubs} decide={decide} />
      <Pagination page={subPage} total={filteredSubs.length} setPage={setSubPage} />
    </Panel>
  );
}
function SubTable({ rows, decide }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Plan</th>
            <th>Credits</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Requested</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <b>{r.userName}</b>
                <small>{r.email}</small>
              </td>
              <td>{r.plan}</td>
              <td>+{r.documentCredits}</td>
              <td>₹{Number(r.amount || ({ GOLD: 499, PLATINUM: 799, DIAMOND: 999 }[r.plan] || 0)).toLocaleString("en-IN")}</td>
              <td>{r.paymentMethod || "UPI"}</td>
              <td>{new Date(r.requestedAt).toLocaleDateString()}</td>
              <td>
                <span className={"badge " + r.status.toLowerCase()}>
                  {r.status}
                </span>
              </td>
              <td>
                {r.status === "PENDING" && (
                  <div className="actions">
                    <button
                      title="Approve"
                      onClick={() => decide(r.id, "approve")}
                    >
                      <CheckCircle2 />
                    </button>
                    <button
                      title="Reject"
                      onClick={() => decide(r.id, "reject")}
                    >
                      <XCircle />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <Empty text="No subscription activity yet" />}
    </div>
  );
}
function Pagination({ page, total, setPage }) {
  const pages = Math.max(1, Math.ceil(total / 10));
  if (total <= 10) return null;
  return <div className="pagination"><span>Page {page} of {pages}</span><div><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft /></button><button type="button" aria-label="Next page" disabled={page === pages} onClick={() => setPage((p) => p + 1)}><ChevronRight /></button></div></div>;
}
function UserPages({ page }) {
  const [profile, setProfile] = useState(null),
    [docs, setDocs] = useState([]),
    [history, setHistory] = useState([]),
    [msg, setMsg] = useState("");
  const load = () =>
    Promise.all([
      api("/user/profile").then(setProfile),
      api("/documents").then(setDocs),
    ]).catch((e) => setMsg(e.message));
  useEffect(() => {
    load();
  }, []);
  if (!profile) return <p>{msg || "Loading workspace…"}</p>;
  if (page === "dashboard")
    return (
      <Dashboard
        profile={profile}
        docs={docs}
        history={history}
        refresh={load}
      />
    );
  if (page === "upload") return <DocumentUploadPage profile={profile} refresh={load} />;
  if (page === "search") return <DocumentSearchPage />;
  if (page === "notes") return <NotesPage />;
  if (page === "audit") return <AuditPage />;
  if (page === "recycle") return <RecycleBin />;
  if (page === "categories") return <LookupManagement type="categories" canManage />;
  if (page === "departments") return <LookupManagement type="departments" canManage />;
  if (page === "shared") return <SharedWithMe />;
  return <Profile profile={profile} refresh={load} />;
}
function Dashboard({ profile, docs }) {
  const recent = [...docs].sort((a,b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0)).slice(0, 5);
  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">GOOD TO SEE YOU</span>
          <h1>{profile.fullName.split(" ")[0]}, your archive is in order.</h1>
          <p>Upload, organize, search, and share documents within your monthly plan.</p>
        </div>
        <div className="usage"><span>{profile.quota?.plan || "No plan"}</span><small>MONTHLY PLAN</small></div>
      </div>
      <div className="stats">
        <Stat icon={Files} label="DOCUMENTS" value={docs.length} sub="In your workspace" />
        <Stat
          icon={Layers3}
          label="CATEGORIES"
          value={new Set(docs.map((x) => x.category)).size}
          sub="Custom collections"
        />
        <Stat
          icon={Upload}
          label="REMAINING STORAGE"
          value={profile.quota ? `${(profile.quota.remainingBytes/1024/1024/1024).toFixed(2)} GB` : "0 GB"}
          sub={profile.quota ? `${(profile.quota.usedBytes/1024/1024/1024).toFixed(2)} GB used of ${(profile.quota.monthlyLimitBytes/1024/1024/1024).toFixed(0)} GB` : "A valid subscription is required"}
          tone="green"
        />
      </div>
      <Panel title="Recent document uploads">
        {recent.length ? <div className="recent-documents">{recent.map(doc => <article key={doc.id}><span className="file-icon">{doc.fileType}</span><div><b>{doc.fileName}</b><small>{doc.category || "Uncategorized"} · {doc.department || "No department"}</small></div><time>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : ""}</time></article>)}</div> : <p className="form-intro">No documents uploaded yet. Use Upload document to catalogue your first file.</p>}
      </Panel>
    </>
  );
}
function Detail({ label, value }) { return <div><span>{label}</span><strong>{value || "Not provided"}</strong></div>; }
function UploadPage({ profile, refresh }) {
  const [f, setF] = useState(null),
    [m, setM] = useState({
      fileName: "",
      fileType: "PDF",
      category: "",
      department: "",
      documentDate: "",
      referenceNumber: "",
      documentOwner: "",
      documentStatus: "ACTIVE",
      fiscalYear: "",
    }),
    [result, setResult] = useState(null),
    [err, setErr] = useState("");
  const input = (key, label, placeholder = "") => (
    <label>
      {label}
      <input
        placeholder={placeholder}
        value={m[key]}
        onChange={(e) => setM({ ...m, [key]: e.target.value })}
      />
    </label>
  );
  async function submit(e) {
    e.preventDefault();
    setErr("");
    const fd = new FormData();
    fd.append("file", f);
    Object.entries(m).forEach(([k, v]) => fd.append(k, v));
    try {
      setResult(await api("/documents/upload", { method: "POST", body: fd }));
      refresh();
    } catch (x) {
      setErr(x.message);
    }
  }
  return (
    <div className="upload-layout">
      <Panel title="Catalogue a document">
        <p className="form-intro">
          Detailed metadata makes every document faster to retrieve.
        </p>
        <form className="form grid" onSubmit={submit}>
          <label className="drop">
            Choose document
            <input
              type="file"
              onChange={(e) => {
                setF(e.target.files[0]);
                setM({ ...m, fileName: e.target.files[0]?.name || "" });
              }}
              required
            />
            <Upload />
            <b>{f ? f.name : "Browse or choose a file"}</b>
            <span>Office files, images, archives and text · Up to 20 MB</span>
          </label>
          <h4 className="form-section wide">Document identity</h4>
          <label>
            Document name
            <input
              value={m.fileName}
              onChange={(e) => setM({ ...m, fileName: e.target.value })}
              required
            />
          </label>
          <label>
            File type
            <select
              value={m.fileType}
              onChange={(e) => setM({ ...m, fileType: e.target.value })}
            >
              {[
                "PDF",
                "DOCX",
                "DOC",
                "JPG",
                "JPEG",
                "PNG",
                "XLSX",
                "CSV",
                "TXT",
                "PPTX",
                "ZIP",
                "OTHER",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Category
            <input
              placeholder="e.g. Invoices"
              value={m.category}
              onChange={(e) => setM({ ...m, category: e.target.value })}
              required
            />
          </label>
          {input("referenceNumber", "Reference number", "e.g. INV-2026-0182")}
          <h4 className="form-section wide">Classification & ownership</h4>
          {input("department", "Department", "e.g. Finance")}
          {input("documentOwner", "Document owner", "Person or team")}
          <label>
            Status
            <select
              value={m.documentStatus}
              onChange={(e) => setM({ ...m, documentStatus: e.target.value })}
            >
              {["DRAFT", "ACTIVE", "APPROVED", "ARCHIVED", "EXPIRED"].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </label>
          <h4 className="form-section wide">Dates & filing</h4>
          <label>
            Document date
            <input
              type="date"
              value={m.documentDate}
              onChange={(e) => setM({ ...m, documentDate: e.target.value })}
            />
          </label>
          {input("fiscalYear", "Fiscal year", "e.g. 2026-27")}
          {err && <div className="error wide">{err}</div>}
          <button className="primary wide">
            Save & generate document number
          </button>
        </form>
      </Panel>
      <aside className="tip">
        <b>Capacity</b>
        <span>
          {profile.documentsUsed} of {profile.documentLimit} used
        </span>
        <p>
          Every field becomes searchable. New categories are created
          automatically.
        </p>
        {result && (
          <div className="code-result">
            <CheckCircle2 />
            <small>DOCUMENT SAVED</small>
            <strong>{result.documentCode}</strong>
            <p>Keep this number for instant retrieval.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
function SearchPage() {
  const [mode, setMode] = useState("code"),
    [q, setQ] = useState(""),
    [filters, setFilters] = useState({
      type: "",
      category: "",
      department: "",
      name: "",
    }),
    [results, setResults] = useState([]),
    [err, setErr] = useState("");
  async function go(e) {
    e.preventDefault();
    try {
      setErr("");
      if (mode === "code")
        setResults([await api("/documents/code/" + encodeURIComponent(q))]);
      else {
        const p = new URLSearchParams(
          Object.entries(filters).filter((x) => x[1]),
        );
        setResults(await api("/documents/advanced-search?" + p));
      }
    } catch (x) {
      setResults([]);
      setErr(x.message);
    }
  }
  return (
    <>
      <div className="tabs">
        <button
          className={mode === "code" ? "active" : ""}
          onClick={() => setMode("code")}
        >
          Unique document number
        </button>
        <button
          className={mode === "manual" ? "active" : ""}
          onClick={() => setMode("manual")}
        >
          Manual filters
        </button>
      </div>
      <Panel
        title={
          mode === "code"
            ? "Find one document instantly"
            : "Filter your document archive"
        }
      >
        <form className="search-form" onSubmit={go}>
          {mode === "code" ? (
            <input
              placeholder="DOC-INVO-PDF-U002-XXXXXXXX"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              required
            />
          ) : (
            <>
              {["name", "category", "department"].map((k) => (
                <input
                  key={k}
                  placeholder={k[0].toUpperCase() + k.slice(1)}
                  value={filters[k]}
                  onChange={(e) =>
                    setFilters({ ...filters, [k]: e.target.value })
                  }
                />
              ))}
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <option value="">All file types</option>
                {["PDF", "DOCX", "JPG", "PNG", "XLSX", "OTHER"].map((x) => (
                  <option>{x}</option>
                ))}
              </select>
            </>
          )}
          <button className="primary">
            <Search /> Search
          </button>
        </form>
        {err && <div className="error">{err}</div>}
      </Panel>
      <div className="results">
        {results.map((d) => (
          <div className="doc" key={d.id}>
            <div className="file-icon">{d.fileType}</div>
            <div>
              <b>{d.fileName}</b>
              <span>
                {d.category} · {d.department || "No department"}
              </span>
              <code>{d.documentCode}</code>
            </div>
            <a
              href={`${API}/documents/download/${d.id}`}
              onClick={(e) => {
                e.preventDefault();
                fetch(`${API}/documents/download/${d.id}`, {
                  headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("doms_token")}`,
                  },
                })
                  .then((r) => r.blob())
                  .then((b) => {
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(b);
                    a.download = d.fileName;
                    a.click();
                  });
              }}
            >
              <Download />
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
function SearchPageV2() {
  const blank = {
    type: "",
    category: "",
    department: "",
    name: "",
    owner: "",
    confidentiality: "",
    status: "",
    fiscalYear: "",
    referenceNumber: "",
    tags: "",
  };
  const [mode, setMode] = useState("code"),
    [q, setQ] = useState(""),
    [filters, setFilters] = useState(blank),
    [results, setResults] = useState([]),
    [err, setErr] = useState(""),
    [loading, setLoading] = useState(false);
  async function find(current) {
    setLoading(true);
    try {
      const p = new URLSearchParams(
        Object.entries(current).filter(([, v]) => v),
      );
      setResults(await api("/documents/advanced-search?" + p));
      setErr("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (mode !== "manual") return;
    const timer = setTimeout(() => find(filters), 250);
    return () => clearTimeout(timer);
  }, [mode, filters]);
  async function byCode(e) {
    e.preventDefault();
    try {
      setResults([await api("/documents/code/" + encodeURIComponent(q))]);
      setErr("");
    } catch (x) {
      setResults([]);
      setErr(x.message);
    }
  }
  async function remove(id) {
    if (!confirm("Permanently delete this document and its stored file?"))
      return;
    try {
      await api("/documents/" + id, { method: "DELETE" });
      setResults((r) => r.filter((d) => d.id !== id));
    } catch (x) {
      setErr(x.message);
    }
  }
  const change = (k, v) => setFilters({ ...filters, [k]: v });
  return (
    <>
      <div className="tabs">
        <button
          className={mode === "code" ? "active" : ""}
          onClick={() => setMode("code")}
        >
          Unique document number
        </button>
        <button
          className={mode === "manual" ? "active" : ""}
          onClick={() => setMode("manual")}
        >
          Real-time filters
        </button>
      </div>
      <Panel
        title={
          mode === "code"
            ? "Find one document instantly"
            : "Filter your archive in real time"
        }
      >
        {mode === "code" ? (
          <form className="search-form" onSubmit={byCode}>
            <input
              placeholder="DOC-INVO-PDF-U002-XXXXXXXX"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              required
            />
            <button className="primary">
              <Search /> Search
            </button>
          </form>
        ) : (
          <>
            <div className="filter-grid">
              {[
                ["name", "Document name"],
                ["category", "Category"],
                ["department", "Department"],
                ["owner", "Owner"],
                ["referenceNumber", "Reference number"],
                ["fiscalYear", "Fiscal year"],
                ["tags", "Tags"],
              ].map(([k, l]) => (
                <label key={k}>
                  {l}
                  <input
                    value={filters[k]}
                    onChange={(e) => change(k, e.target.value)}
                    placeholder={"Filter by " + l.toLowerCase()}
                  />
                </label>
              ))}
              <label>
                File type
                <select
                  value={filters.type}
                  onChange={(e) => change("type", e.target.value)}
                >
                  <option value="">All types</option>
                  {[
                    "PDF",
                    "DOCX",
                    "DOC",
                    "JPG",
                    "JPEG",
                    "PNG",
                    "XLSX",
                    "CSV",
                    "TXT",
                    "PPTX",
                    "ZIP",
                    "OTHER",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Confidentiality
                <select
                  value={filters.confidentiality}
                  onChange={(e) => change("confidentiality", e.target.value)}
                >
                  <option value="">All levels</option>
                  {["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Status
                <select
                  value={filters.status}
                  onChange={(e) => change("status", e.target.value)}
                >
                  <option value="">All statuses</option>
                  {["DRAFT", "ACTIVE", "APPROVED", "ARCHIVED", "EXPIRED"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </label>
            </div>
            <div className="filter-footer">
              <span>
                {loading
                  ? "Searching…"
                  : results.length +
                    " document" +
                    (results.length === 1 ? "" : "s") +
                    " found"}
              </span>
              <button onClick={() => setFilters(blank)}>
                Clear all filters
              </button>
            </div>
          </>
        )}
        {err && <div className="error">{err}</div>}
      </Panel>
      <div className="results">
        {results.map((d) => (
          <div className="doc" key={d.id}>
            <div className="file-icon">{d.fileType}</div>
            <div>
              <b>{d.fileName}</b>
              <span>
                {d.category || "Uncategorized"} ·{" "}
                {d.department || "No department"} ·{" "}
                {d.documentOwner || "No owner"}
              </span>
              <div className="doc-meta">
                <em>{d.confidentiality || "INTERNAL"}</em>
                <em>{d.documentStatus || "ACTIVE"}</em>
                {d.referenceNumber && <em>Ref: {d.referenceNumber}</em>}
              </div>
              <code>{d.documentCode}</code>
            </div>
            <div className="doc-actions">
              <a
                title="Download"
                href={`${API}/documents/download/${d.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  fetch(`${API}/documents/download/${d.id}`, {
                    headers: {
                      Authorization: `Bearer ${sessionStorage.getItem("doms_token")}`,
                    },
                  })
                    .then((r) => r.blob())
                    .then((b) => {
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(b);
                      a.download = d.fileName;
                      a.click();
                    });
                }}
              >
                <Download />
              </a>
              <button
                className="delete-doc"
                title="Delete document"
                onClick={() => remove(d.id)}
              >
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
        {!loading && !results.length && mode === "manual" && (
          <Empty text="No documents match the selected filters" />
        )}
      </div>
    </>
  );
}
function Profile({ profile, refresh }) {
  const [f, setF] = useState({ ...profile }),
    [msg, setMsg] = useState("");
  return (
    <div className="split">
      <Panel title="Profile details">
        <form
          className="form"
          onSubmit={async (e) => {
            e.preventDefault();
            await api("/user/profile", {
              method: "PUT",
              body: JSON.stringify({ ...f, role: "ROLE_USER", enabled: true }),
            });
            setMsg("Profile updated");
            refresh();
          }}
        >
          <label>
            Full name
            <input
              value={f.fullName}
              onChange={(e) => setF({ ...f, fullName: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </label>
          <button className="primary">Save profile</button>
        </form>
      </Panel>
      <Panel title="Security"><div className="security-heading"><ShieldCheck/><div><h4>Change password</h4><p>Verify your email with an OTP before setting a new password.</p></div></div><PasswordOtpForm initialEmail={profile.email} lockedEmail /></Panel>
    </div>
  );
}
function PasswordOtpForm({ initialEmail = "", lockedEmail = false, onDone }) {
  const [form, setForm] = useState({ email: initialEmail, otp: "", newPassword: "", confirmPassword: "" });
  const [sent, setSent] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  async function requestOtp() { setBusy(true); try { setMessage(await api("/auth/password/request-otp", { method: "POST", body: JSON.stringify({ email: form.email }) })); setSent(true); } catch (e) { setMessage(e.message); } finally { setBusy(false); } }
  async function reset(e) { e.preventDefault(); if (form.newPassword !== form.confirmPassword) return setMessage("Passwords do not match."); setBusy(true); try { setMessage(await api("/auth/password/reset", { method: "POST", body: JSON.stringify({ email: form.email, otp: form.otp, newPassword: form.newPassword }) })); setTimeout(() => onDone?.(), 900); } catch (x) { setMessage(x.message); } finally { setBusy(false); } }
  return <form className="form otp-form" onSubmit={reset}><p className="form-intro">We will verify your email with a one-time code before changing the password.</p><label>Email address<input type="email" required readOnly={lockedEmail} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>{!sent?<button type="button" className="primary" disabled={busy} onClick={requestOtp}>{busy?"Sending code…":"Send email OTP"}</button>:<><label>6-digit OTP<input inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required value={form.otp} onChange={e=>setForm({...form,otp:e.target.value.replace(/\D/g,"").slice(0,6)})}/></label><label>New password<input type="password" minLength="8" required value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/></label><label>Confirm password<input type="password" minLength="8" required value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})}/></label><div className="otp-actions"><button className="primary" disabled={busy}>{busy?"Changing password…":"Change password"}</button><button type="button" disabled={busy} onClick={requestOtp}>Resend OTP</button></div></>}{message&&<p className="notice">{message}</p>}</form>;
}
function Panel({ title, children }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
function Empty({ text }) {
  return (
    <div className="empty">
      <FileText />
      <p>{text}</p>
    </div>
  );
}
function Modal({ close, children }) {
  return (
    <div className="modal" onMouseDown={close}>
      <div onMouseDown={(e) => e.stopPropagation()}>
        <button className="close" onClick={close}>
          <X />
        </button>
        {children}
      </div>
    </div>
  );
}
export default function App() {
  const [u, setU] = useState(readSession);
  useEffect(() => {
    const unauthorized = () => setU(null);
    window.addEventListener("doms:unauthorized", unauthorized);
    return () => window.removeEventListener("doms:unauthorized", unauthorized);
  }, []);
  return <><GlobalLoader/>{u ? (
    <Shell
      user={u}
      onLogout={async () => {
        try { await api("/auth/logout", { method: "POST" }); } catch { /* clear locally even if offline */ }
        clearSession();
        window.history.replaceState({}, "", "#/login");
        setU(null);
      }}
    />
  ) : (
    <Login onLogin={(user) => { window.history.replaceState({}, "", routeFor(user.role === "ROLE_ADMIN", "dashboard")); setU(user); }} />
  )}</>;
}
