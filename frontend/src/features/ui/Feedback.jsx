import { CheckCircle2, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
export function ProgressBar({ value, max, label }) { const percent=max>0?Math.min(100,Math.max(0,value/max*100)):0; return <div className="progress-block" aria-label={label||`${Math.round(percent)}% used`}><div className="progress-track"><i style={{"--progress":`${percent}%`}}/></div>{label&&<small>{label}</small>}</div>; }
export function Toast({ message, tone="success", onClose }) { if(!message)return null; return <div className={`toast ${tone}`} role="status"><CheckCircle2/><span>{message}</span><button type="button" aria-label="Dismiss notification" onClick={onClose}><X/></button></div>; }
export function BusyButton({ busy, done, children, ...props }) { return <button {...props} disabled={busy||props.disabled}>{busy?<><LoaderCircle className="spin"/>Please wait…</>:done?<><CheckCircle2/>Saved</>:children}</button>; }
export function SkeletonList({ rows=3 }) { return <div className="skeleton-list" aria-label="Loading">{Array.from({length:rows},(_,i)=><div className="skeleton-row" key={i}><i/><span><b/><b/></span></div>)}</div>; }
export function GlobalLoader() {
  const [pending, setPending] = useState(0);
  useEffect(() => { const update = event => setPending(event.detail); window.addEventListener("doms:pending", update); return () => window.removeEventListener("doms:pending", update); }, []);
  return pending > 0 ? <div className="global-loader" role="status" aria-live="polite"><LoaderCircle className="spin"/><span>Loading…</span></div> : null;
}
