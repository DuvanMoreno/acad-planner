import { useState, useEffect, useRef } from "react";
import { api, auth, token, exportToJSON, importFromJSON } from "./api.js";

// ═══════════════════════════════════════════════════════════════════
//  AUTH SCREEN — Login / Registro
// ═══════════════════════════════════════════════════════════════════
function AuthScreen({ onAuth }) {
  const [mode,    setMode]    = useState("login");
  const [form,    setForm]    = useState({ name:"", email:"", password:"", inviteCode:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const sf = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = mode === "login"
        ? await auth.login({ email: form.email, password: form.password })
        : await auth.register({ name: form.name, email: form.email, password: form.password, inviteCode: form.inviteCode });
      token.set(data.token);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const IS2 = {
    width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
    borderRadius:"8px", color:"#f0ece4", padding:"11px 14px", fontSize:"14px",
    fontFamily:"Georgia,serif", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s",
  };

  return (
    <div style={{minHeight:"100vh",background:"#090910",display:"flex",alignItems:"center",
      justifyContent:"center",fontFamily:"Georgia,serif",color:"#f0ece4",padding:"20px"}}>
      <div style={{position:"fixed",top:"20%",left:"50%",transform:"translateX(-50%)",
        width:"400px",height:"400px",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(42,157,143,0.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:"400px",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:"36px"}}>
          <div style={{fontSize:"32px",marginBottom:"12px"}}>📚</div>
          <h1 style={{margin:0,fontSize:"22px",fontWeight:"400",letterSpacing:"1px",color:"#fff"}}>Academic Planner</h1>
          <p style={{margin:"8px 0 0",fontSize:"12px",color:"rgba(255,255,255,0.3)",letterSpacing:"2px",textTransform:"uppercase"}}>UNAD · 2026</p>
        </div>
        <div style={{background:"#111119",border:"1px solid rgba(255,255,255,0.09)",borderRadius:"14px",padding:"32px 28px"}}>
          <div style={{display:"flex",gap:"4px",marginBottom:"28px",background:"rgba(255,255,255,0.04)",borderRadius:"8px",padding:"4px"}}>
            {["login","register"].map(m => (
              <button key={m} onClick={()=>{setMode(m);setError("");}}
                style={{flex:1,padding:"8px",border:"none",borderRadius:"6px",cursor:"pointer",
                  fontSize:"13px",fontFamily:"Georgia,serif",fontWeight:mode===m?"700":"400",
                  background:mode===m?"rgba(255,255,255,0.1)":"transparent",
                  color:mode===m?"#fff":"rgba(255,255,255,0.4)",transition:"all 0.2s"}}>
                {m === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>
          <form onSubmit={submit}>
            {mode === "register" && (
              <div style={{marginBottom:"14px"}}>
                <label style={{display:"block",fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",textTransform:"uppercase",marginBottom:"6px"}}>Nombre</label>
                <input style={IS2} value={form.name} onChange={sf("name")} placeholder="Tu nombre" required autoComplete="name"/>
              </div>
            )}
            <div style={{marginBottom:"14px"}}>
              <label style={{display:"block",fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",textTransform:"uppercase",marginBottom:"6px"}}>Email</label>
              <input style={IS2} type="email" value={form.email} onChange={sf("email")} placeholder="correo@ejemplo.com" required autoComplete="email"/>
            </div>
            <div style={{marginBottom:mode==="register"?"14px":"22px"}}>
              <label style={{display:"block",fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",textTransform:"uppercase",marginBottom:"6px"}}>Contraseña</label>
              <input style={IS2} type="password" value={form.password} onChange={sf("password")}
                placeholder={mode==="register"?"Mínimo 6 caracteres":"••••••••"} required
                autoComplete={mode==="login"?"current-password":"new-password"}/>
            </div>
            {mode === "register" && (
              <div style={{marginBottom:"22px"}}>
                <label style={{display:"block",fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",textTransform:"uppercase",marginBottom:"6px"}}>Código de invitación</label>
                <input style={IS2} value={form.inviteCode} onChange={sf("inviteCode")} placeholder="Código que te compartieron" required autoComplete="off"/>
                <p style={{margin:"6px 0 0",fontSize:"11px",color:"rgba(255,255,255,0.22)"}}>Pídele el código a quien te invitó.</p>
              </div>
            )}
            {error && (
              <div style={{background:"rgba(230,57,70,0.1)",border:"1px solid rgba(230,57,70,0.3)",
                borderRadius:"8px",padding:"10px 14px",marginBottom:"16px",fontSize:"13px",color:"#ff6b6b"}}>{error}</div>
            )}
            <button type="submit" disabled={loading}
              style={{width:"100%",padding:"13px",border:"none",borderRadius:"8px",cursor:"pointer",
                background:loading?"rgba(42,157,143,0.5)":"#2A9D8F",color:"#fff",fontSize:"14px",
                fontWeight:"700",fontFamily:"Georgia,serif",letterSpacing:"0.5px",transition:"all 0.2s",
                boxShadow:loading?"none":"0 4px 20px rgba(42,157,143,0.3)"}}>
              {loading ? "Cargando…" : mode === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>
        </div>
        <p style={{textAlign:"center",marginTop:"20px",fontSize:"11px",color:"rgba(255,255,255,0.15)",letterSpacing:"1px"}}>Academic Planner · UNAD 2026</p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════════════
const TODAY = new Date();
// Para pruebas con los datos semilla, fija la fecha:
// const TODAY = new Date(2026, 2, 10);

function pd(s) {
  if (!s || typeof s !== "string" || s.trim() === "") return null;
  const parts = s.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y,m,d] = parts;
  return new Date(y, m-1, d);
}
function fd(s) { if (!s) return "—"; const d=pd(s); return d?d.toLocaleDateString("es-CO",{day:"numeric",month:"short"}).toUpperCase():"—"; }
function dBet(a,b) { if(!a||!b) return 0; return Math.round((b-a)/86400000); }
function pctTime(s,e) {
  const ds=pd(s), de=pd(e);
  if(!ds||!de) return 0;
  const tot=dBet(ds,de)||1, el=dBet(ds,TODAY);
  return Math.min(100,Math.max(0,Math.round((el/tot)*100)));
}
function dLeft(s) { const d=pd(s); return d?dBet(TODAY,d):0; }
function uid() { return "_"+Math.random().toString(36).slice(2,10); }
function isAct(s,e) { const ds=pd(s),de=pd(e); return !!(ds&&de&&TODAY>=ds&&TODAY<=de); }
function isDn(e)    { const de=pd(e); return !!(de&&TODAY>de); }
function todayStr() { return TODAY.toISOString().slice(0,10); }

const SCOL = ["#E63946","#2A9D8F","#F4A261","#7B2D8B","#457B9D","#E76F51","#264653","#A8DADC"];
const TCFG = {
  individual: { icon:"👤", label:"Individual",   col:"#457B9D" },
  group:      { icon:"👥", label:"Colaborativo", col:"#2A9D8F" },
  document:   { icon:"📄", label:"Documento",    col:"#F4A261" },
  deadline:   { icon:"🔴", label:"Entrega Final",col:"#E63946" },
};

// ═══════════════════════════════════════════════════════════════════
//  ATOMS
// ═══════════════════════════════════════════════════════════════════
function Bar({ v, color, h=5 }) {
  return (
    <div style={{width:"100%",height:h,background:"rgba(255,255,255,0.07)",borderRadius:h}}>
      <div style={{width:`${v}%`,height:"100%",borderRadius:h,background:`linear-gradient(90deg,${color}99,${color})`,
        boxShadow:v>0?`0 0 6px ${color}50`:"none",transition:"width 0.9s cubic-bezier(.4,0,.2,1)"}}/>
    </div>
  );
}

const IS = {width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",
  borderRadius:"6px",color:"#f0ece4",padding:"9px 12px",fontSize:"13px",fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
const BG = {background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.11)",
  color:"rgba(255,255,255,0.6)",padding:"8px 16px",borderRadius:"6px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"};
function BP(c="#E63946") { return {...BG,background:c,border:`1px solid ${c}`,color:"#fff",fontWeight:"700"}; }

function Overlay({ onClose, children }) {
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.82)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{background:"#111119",border:"1px solid rgba(255,255,255,0.11)",borderRadius:"12px",
        padding:"28px 30px",width:"100%",maxWidth:"500px",maxHeight:"90vh",overflowY:"auto"}}>
        {children}
      </div>
    </div>
  );
}
function MH({ title, onClose }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px"}}>
      <span style={{fontSize:"15px",fontWeight:"700"}}>{title}</span>
      <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:"22px",lineHeight:1}}>×</button>
    </div>
  );
}
function F({ label, children }) {
  return (
    <div style={{marginBottom:"14px"}}>
      <label style={{display:"block",fontSize:"9px",letterSpacing:"2px",color:"rgba(255,255,255,0.35)",
        textTransform:"uppercase",marginBottom:"5px"}}>{label}</label>
      {children}
    </div>
  );
}

// Toast notification
function Toast({ msg, type="success" }) {
  const colors = { success:"#4CAF50", error:"#E63946", info:"#457B9D" };
  return (
    <div style={{position:"fixed",bottom:"24px",right:"24px",zIndex:999,
      background:"#1a1a24",border:`1px solid ${colors[type]}60`,
      color:"#fff",padding:"12px 18px",borderRadius:"8px",fontSize:"13px",
      boxShadow:`0 4px 20px rgba(0,0,0,0.5)`,
      animation:"slideIn 0.3s ease"}}>
      <span style={{color:colors[type],marginRight:"8px"}}>{type==="success"?"✓":type==="error"?"✗":"ℹ"}</span>
      {msg}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SEMESTER PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════
function SemBar({ subject, onAddPhase, onEditPhase }) {
  if (!subject.phases.length) return (
    <div style={{padding:"18px 22px",border:"1px dashed rgba(255,255,255,0.1)",borderRadius:"8px",marginBottom:"22px",textAlign:"center"}}>
      <span style={{fontSize:"12px",color:"rgba(255,255,255,0.3)"}}>Sin fases — </span>
      <button onClick={onAddPhase} style={{background:"none",border:"none",color:subject.color,cursor:"pointer",fontSize:"12px",textDecoration:"underline"}}>Agregar primera fase</button>
    </div>
  );

  const allS = subject.phases.map(p=>pd(p.start));
  const allE = subject.phases.map(p=>pd(p.end));
  const semS = new Date(Math.min(...allS)), semE = new Date(Math.max(...allE));
  const semTot = dBet(semS,semE)||1;
  const semPct = Math.min(100,Math.max(0,Math.round((dBet(semS,TODAY)/semTot)*100)));

  return (
    <div style={{padding:"20px 22px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",marginBottom:"24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
        <span style={{fontSize:"9px",letterSpacing:"3px",color:"rgba(255,255,255,0.3)",textTransform:"uppercase"}}>Progreso del semestre</span>
        <span style={{fontSize:"12px",color:subject.color,fontWeight:"700"}}>{semPct}%</span>
      </div>
      <div style={{display:"flex",gap:"3px",height:"30px",marginBottom:"10px",minWidth:0}}>
        {/* Segmentos: ocupan todo el espacio disponible menos el botón */}
        <div style={{display:"flex",gap:"3px",flex:1,minWidth:0,overflow:"hidden"}}>
          {subject.phases.map(ph=>{
            const w = (dBet(pd(ph.start),pd(ph.end))/semTot)*100;
            const p = pctTime(ph.start,ph.end);
            const act=isAct(ph.start,ph.end), dn=isDn(ph.end);
            return (
              <div key={ph._id||ph.id} onClick={()=>onEditPhase(ph)} title={`${ph.name} · click para editar`}
                style={{flex:`${Math.max(w,4)} 0 0`,position:"relative",borderRadius:"4px",overflow:"hidden",
                  cursor:"pointer",background:"rgba(255,255,255,0.05)",minWidth:0}}>
                <div style={{position:"absolute",inset:0,width:`${p}%`,
                  background:dn?`${subject.color}44`:act?subject.color:`${subject.color}28`,transition:"width 0.9s"}}/>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"9px",fontWeight:"700",letterSpacing:"0.5px",overflow:"hidden",
                  color:dn?"rgba(255,255,255,0.25)":act?"#fff":"rgba(255,255,255,0.5)"}}>{ph.name}</div>
                {act&&<div style={{position:"absolute",bottom:0,left:`${p}%`,width:"2px",height:"100%",background:"#fff",opacity:0.5}}/>}
              </div>
            );
          })}
        </div>
        {/* Botón + aislado, ancho fijo */}
        <button onClick={onAddPhase} style={{flexShrink:0,width:"28px",height:"30px",background:"rgba(255,255,255,0.04)",
          border:"1px dashed rgba(255,255,255,0.15)",borderRadius:"4px",color:"rgba(255,255,255,0.3)",
          cursor:"pointer",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>+</button>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",color:"rgba(255,255,255,0.25)",letterSpacing:"0.5px"}}>
        <span>{fd(subject.phases[0].start)}</span>
        <span style={{color:subject.color}}>● {TODAY.toLocaleDateString("es-CO",{day:"numeric",month:"short"}).toUpperCase()}</span>
        <span>{fd(subject.phases[subject.phases.length-1].end)}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  ITEM ROW
// ═══════════════════════════════════════════════════════════════════
function ItemRow({ item, idx, total, color, phaseStart, onEdit, onDelete, onToggle, onDragStart, onDragOver, onDrop, isBeingDragged }) {
  const [hov, setHov] = useState(false);
  const isDeadline = item.type==="deadline";
  const startStr = (item.dateStart && item.dateStart.trim()) ? item.dateStart : (phaseStart || item.dateEnd);
  const iS = pd(startStr);
  const act = iS ? TODAY>=iS&&TODAY<=pd(item.dateEnd) : false;
  const over = isDn(item.dateEnd)&&!item.done;
  const p = pctTime(startStr, item.dateEnd);
  const dl = dLeft(item.dateEnd);
  const dotBg = item.done?"#4CAF50":isDeadline&&!item.done?"#E63946":act?color:over?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.2)";
  const dotGlow = item.done?"0 0 8px #4CAF5090":act?`0 0 10px ${color}80`:isDeadline&&!item.done?"0 0 8px #E6394660":"none";

  const dotSize = act || item.done ? 14 : 10;

  return (
    <div draggable
      onDragStart={e=>{onDragStart(e,idx);e.dataTransfer.effectAllowed="move";}}
      onDragOver={e=>{e.preventDefault();onDragOver(e,idx);}}
      onDrop={e=>{e.preventDefault();onDrop(e,idx);}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"flex-start",opacity:isBeingDragged?0.35:1,transition:"opacity 0.15s",marginBottom:"4px",position:"relative"}}>

      {/* Timeline column — absolute children so lines always span full row height */}
      <div style={{width:"34px",flexShrink:0,alignSelf:"stretch",position:"relative"}}>

        {/* Línea ARRIBA del punto — desde el borde superior hasta el centro del punto */}
        {idx > 0 && (
          <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",
            top:0,height:"20px",width:"2px",background:"rgba(255,255,255,0.08)"}}/>
        )}

        {/* Punto */}
        <div style={{
          position:"absolute",left:"50%",top:"20px",
          transform:"translate(-50%,-50%)",
          width:`${dotSize}px`,height:`${dotSize}px`,borderRadius:"50%",
          background:dotBg,boxShadow:dotGlow,
          border:item.done?"2px solid #4CAF50":act?`2px solid ${color}`:"2px solid rgba(255,255,255,0.12)",
          zIndex:2,transition:"all 0.3s",
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>
          {item.done&&<span style={{fontSize:"7px",color:"#fff",lineHeight:1}}>✓</span>}
        </div>

        {/* Línea ABAJO del punto — desde el centro del punto hasta el borde inferior */}
        {idx < total - 1 && (
          <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",
            top:"20px",bottom:"-4px",width:"2px",background:"rgba(255,255,255,0.08)"}}/>
        )}
      </div>

      {/* Card */}
      <div style={{flex:1,padding:"11px 13px 11px 8px",borderRadius:"8px",
        background:item.done?"rgba(76,175,80,0.05)":isDeadline?"rgba(230,57,70,0.08)":hov?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.02)",
        border:item.done?"1px solid rgba(76,175,80,0.2)":isDeadline?"1px solid rgba(230,57,70,0.28)":`1px solid ${hov?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)"}`,
        transition:"all 0.2s",opacity:item.done?0.72:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"6px",marginBottom:"5px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"7px",flex:1,minWidth:0,flexWrap:"wrap"}}>
            <span title="Arrastra para reordenar" style={{color:"rgba(255,255,255,0.2)",fontSize:"13px",cursor:"grab",userSelect:"none",flexShrink:0}}>⠿</span>
            <button onClick={()=>onToggle(item._id||item.id)}
              style={{width:"17px",height:"17px",borderRadius:"50%",cursor:"pointer",flexShrink:0,
                background:item.done?"#4CAF50":"transparent",
                border:item.done?"2px solid #4CAF50":`2px solid ${isDeadline?"#E63946":color}`,
                display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",padding:0}}>
              {item.done&&<span style={{fontSize:"8px",color:"#fff",lineHeight:1}}>✓</span>}
            </button>
            <span style={{fontSize:"13px",fontWeight:"700",
              color:item.done?"rgba(255,255,255,0.32)":isDeadline?"#ff6b6b":"#fff",
              textDecoration:item.done?"line-through":"none",letterSpacing:"0.3px"}}>
              {isDeadline&&!item.done&&"⚠ "}{item.label}
            </span>
            <span style={{fontSize:"9px",letterSpacing:"1px",textTransform:"uppercase",color:TCFG[item.type]?.col,
              border:`1px solid ${TCFG[item.type]?.col}50`,padding:"1px 7px",borderRadius:"20px",whiteSpace:"nowrap",flexShrink:0}}>
              {TCFG[item.type]?.icon} {TCFG[item.type]?.label}
            </span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"6px",flexShrink:0}}>
            <span style={{fontSize:"10px",fontFamily:"monospace",color:isDeadline?"#ff6b6b":color,
              background:"rgba(0,0,0,0.25)",padding:"2px 8px",borderRadius:"20px",whiteSpace:"nowrap"}}>
              {item.dateStart&&item.dateStart!==item.dateEnd?`${fd(item.dateStart)} – ${fd(item.dateEnd)}`:fd(item.dateEnd)}
            </span>
            {hov&&<>
              <button onClick={()=>onEdit(item)} style={{...BG,padding:"3px 7px",fontSize:"11px"}}>✏️</button>
              <button onClick={()=>onDelete(item._id||item.id)} style={{...BG,padding:"3px 7px",fontSize:"11px",color:"#E63946",borderColor:"rgba(230,57,70,0.3)"}}>🗑</button>
            </>}
          </div>
        </div>
        {item.desc&&<p style={{margin:"0 0 7px 24px",fontSize:"12px",lineHeight:"1.6",color:"rgba(255,255,255,0.38)",fontStyle:"italic"}}>{item.desc}</p>}
        {!item.done?(
          <div style={{marginLeft:"24px"}}>
            <Bar v={p} color={isDeadline?"#E63946":color} h={3}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",color:"rgba(255,255,255,0.22)",marginTop:"3px"}}>
              <span>{p}% del tiempo</span>
              {act&&<span style={{color:dl<=2?"#E63946":dl<=5?"#F4A261":"rgba(255,255,255,0.35)"}}>{dl}d restantes</span>}
              {over&&!item.done&&<span style={{color:"#E63946"}}>Fecha vencida</span>}
            </div>
          </div>
        ):<div style={{marginLeft:"24px",fontSize:"9px",letterSpacing:"1.5px",color:"#4CAF5060",textTransform:"uppercase"}}>● Completada</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  PHASE CARD
// ═══════════════════════════════════════════════════════════════════
function PhaseCard({ phase, subject, onEditPhase, onDeletePhase, onAddItem, onEditItem, onDeleteItem, onToggle, onReorder }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const act=isAct(phase.start,phase.end), dn=isDn(phase.end);
  const p=pctTime(phase.start,phase.end), dl=dLeft(phase.end);
  const doneCount=phase.items.filter(i=>i.done).length;

  function hdDrop(e,idx) {
    if(dragIdx===null||dragIdx===idx){setDragIdx(null);setOverIdx(null);return;}
    const items=[...phase.items]; const[m]=items.splice(dragIdx,1); items.splice(idx,0,m);
    onReorder(phase._id||phase.id,items); setDragIdx(null); setOverIdx(null);
  }

  return (
    <div style={{marginBottom:"22px",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",overflow:"hidden"}}>
      <div style={{padding:"15px 20px",background:act?`${subject.color}12`:"rgba(255,255,255,0.02)",
        borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"4px",flexWrap:"wrap"}}>
            {act&&<span style={{width:"8px",height:"8px",borderRadius:"50%",background:subject.color,
              boxShadow:`0 0 8px ${subject.color}`,display:"inline-block",flexShrink:0,animation:"pulse 2s infinite"}}/>}
            <span style={{fontSize:"15px",fontWeight:"700",color:act?subject.color:dn?"rgba(255,255,255,0.3)":"#fff"}}>{phase.name}</span>
            <span style={{fontSize:"12px",color:"rgba(255,255,255,0.38)",fontStyle:"italic"}}>{phase.subtitle}</span>
            {dn&&<span style={{fontSize:"9px",letterSpacing:"2px",color:"rgba(255,255,255,0.22)",border:"1px solid rgba(255,255,255,0.1)",padding:"1px 7px",borderRadius:"20px"}}>FINALIZADA</span>}
          </div>
          <div style={{display:"flex",gap:"14px",fontSize:"10px",color:"rgba(255,255,255,0.28)",letterSpacing:"0.5px",flexWrap:"wrap"}}>
            <span>{fd(phase.start)} → {fd(phase.end)}</span>
            <span style={{color:subject.color}}>{phase.points} pts</span>
            <span>{doneCount}/{phase.items.length} completadas</span>
            {act&&<span style={{color:dl<=3?"#E63946":dl<=7?"#F4A261":subject.color}}>⏱ {dl}d restantes</span>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{textAlign:"right",minWidth:"75px"}}>
            <div style={{fontSize:"11px",color:subject.color,fontWeight:"700",marginBottom:"5px"}}>{p}%</div>
            <Bar v={p} color={subject.color} h={4}/>
          </div>
          <button onClick={()=>onEditPhase(phase)} style={{...BG,padding:"5px 9px",fontSize:"12px"}}>✏️</button>
          <button onClick={()=>onDeletePhase(phase._id||phase.id)} style={{...BG,padding:"5px 9px",fontSize:"12px",color:"#E63946",borderColor:"rgba(230,57,70,0.3)"}}>🗑</button>
        </div>
      </div>
      <div style={{padding:"12px 14px 10px 4px"}}>
        {phase.items.length===0&&<div style={{textAlign:"center",padding:"18px",color:"rgba(255,255,255,0.2)",fontSize:"12px",fontStyle:"italic"}}>Sin actividades aún</div>}
        {phase.items.map((item,idx)=>(
          <div key={item._id||item.id} style={{background:overIdx===idx&&dragIdx!==null&&dragIdx!==idx?"rgba(255,255,255,0.04)":"transparent",borderRadius:"8px",transition:"background 0.15s"}}>
            <ItemRow item={item} idx={idx} total={phase.items.length} color={subject.color} phaseStart={phase.start}
              onEdit={onEditItem} onDelete={id=>onDeleteItem(phase._id||phase.id,id)}
              onToggle={id=>onToggle(phase._id||phase.id,id)}
              onDragStart={(e,i)=>setDragIdx(i)} onDragOver={(e,i)=>setOverIdx(i)} onDrop={hdDrop}
              isBeingDragged={dragIdx===idx}/>
          </div>
        ))}
        <button onClick={()=>onAddItem(phase._id||phase.id)}
          style={{width:"100%",marginTop:"6px",padding:"9px",background:"none",border:"1px dashed rgba(255,255,255,0.1)",
            borderRadius:"8px",color:"rgba(255,255,255,0.3)",fontSize:"12px",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",transition:"all 0.2s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=subject.color+"80";e.currentTarget.style.color=subject.color;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="rgba(255,255,255,0.3)";}}>
          + Agregar actividad
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════════════════
function SubjectModal({ subject, onSave, onClose }) {
  const [f,setF] = useState(subject?{name:subject.name,code:subject.code,color:subject.color}:{name:"",code:"",color:SCOL[0]});
  return (<Overlay onClose={onClose}><MH title={subject?"Editar materia":"Nueva materia"} onClose={onClose}/>
    <F label="Nombre"><input style={IS} value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} placeholder="Ej: Matemáticas Financieras"/></F>
    <F label="Código"><input style={IS} value={f.code} onChange={e=>setF(p=>({...p,code:e.target.value}))} placeholder="Ej: 100403"/></F>
    <F label="Color"><div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{SCOL.map(c=><div key={c} onClick={()=>setF(p=>({...p,color:c}))} style={{width:"26px",height:"26px",borderRadius:"50%",background:c,cursor:"pointer",border:f.color===c?"3px solid #fff":"3px solid transparent",transition:"border 0.15s"}}/>)}</div></F>
    <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",marginTop:"20px"}}>
      <button style={BG} onClick={onClose}>Cancelar</button>
      <button style={BP(f.color)} onClick={()=>f.name.trim()&&onSave(f)}>{subject?"Guardar":"Crear"}</button>
    </div>
  </Overlay>);
}

function PhaseModal({ phase, color, onSave, onClose }) {
  const [f,setF] = useState(phase?{name:phase.name,subtitle:phase.subtitle,points:phase.points,start:phase.start,end:phase.end}:{name:"",subtitle:"",points:100,start:"",end:""});
  return (<Overlay onClose={onClose}><MH title={phase?"Editar fase":"Nueva fase"} onClose={onClose}/>
    <div style={{display:"flex",gap:"10px"}}>
      <div style={{flex:2}}><F label="Nombre (ej: FASE 2)"><input style={IS} value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} placeholder="FASE 2"/></F></div>
      <div style={{flex:1}}><F label="Puntos"><input style={IS} type="number" value={f.points} onChange={e=>setF(p=>({...p,points:Number(e.target.value)}))}/></F></div>
    </div>
    <F label="Subtítulo"><input style={IS} value={f.subtitle} onChange={e=>setF(p=>({...p,subtitle:e.target.value}))} placeholder="Ej: Diagnóstico organizacional"/></F>
    <div style={{display:"flex",gap:"10px"}}>
      <div style={{flex:1}}><F label="Fecha inicio"><input style={IS} type="date" value={f.start} onChange={e=>setF(p=>({...p,start:e.target.value}))}/></F></div>
      <div style={{flex:1}}><F label="Fecha fin"><input style={IS} type="date" value={f.end} onChange={e=>setF(p=>({...p,end:e.target.value}))}/></F></div>
    </div>
    <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",marginTop:"20px"}}>
      <button style={BG} onClick={onClose}>Cancelar</button>
      <button style={BP(color)} onClick={()=>f.name.trim()&&f.start&&f.end&&onSave(f)}>{phase?"Guardar":"Crear fase"}</button>
    </div>
  </Overlay>);
}

function ItemModal({ item, color, onSave, onClose }) {
  const [f,setF] = useState(item?{label:item.label,dateStart:item.dateStart||"",dateEnd:item.dateEnd,desc:item.desc,type:item.type}:{label:"",dateStart:"",dateEnd:"",desc:"",type:"individual"});
  return (<Overlay onClose={onClose}><MH title={item?"Editar actividad":"Nueva actividad"} onClose={onClose}/>
    <F label="Nombre"><input style={IS} value={f.label} onChange={e=>setF(p=>({...p,label:e.target.value}))} placeholder="Ej: Individual · Tabla en foro"/></F>
    <F label="Tipo"><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{Object.entries(TCFG).map(([k,v])=>(
      <button key={k} onClick={()=>setF(p=>({...p,type:k}))} style={{...BG,padding:"5px 12px",fontSize:"11px",background:f.type===k?`${color}20`:"rgba(255,255,255,0.04)",border:f.type===k?`1px solid ${color}`:"1px solid rgba(255,255,255,0.1)",color:f.type===k?"#fff":"rgba(255,255,255,0.5)"}}>{v.icon} {v.label}</button>
    ))}</div></F>
    <div style={{display:"flex",gap:"10px"}}>
      <div style={{flex:1}}><F label="Fecha inicio"><input style={IS} type="date" value={f.dateStart} onChange={e=>setF(p=>({...p,dateStart:e.target.value}))}/></F></div>
      <div style={{flex:1}}><F label="Fecha fin"><input style={IS} type="date" value={f.dateEnd} onChange={e=>setF(p=>({...p,dateEnd:e.target.value}))}/></F></div>
    </div>
    <F label="Descripción"><textarea style={{...IS,minHeight:"70px",resize:"vertical"}} value={f.desc} onChange={e=>setF(p=>({...p,desc:e.target.value}))} placeholder="Descripción..."/></F>
    <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",marginTop:"20px"}}>
      <button style={BG} onClick={onClose}>Cancelar</button>
      <button style={BP(color)} onClick={()=>f.label.trim()&&f.dateEnd&&onSave(f)}>{item?"Guardar":"Agregar"}</button>
    </div>
  </Overlay>);
}

function ConfirmModal({ msg, onOk, onClose }) {
  return (<Overlay onClose={onClose}><MH title="Confirmar" onClose={onClose}/>
    <p style={{color:"rgba(255,255,255,0.6)",fontSize:"13px",lineHeight:"1.7",marginBottom:"22px"}}>{msg}</p>
    <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
      <button style={BG} onClick={onClose}>Cancelar</button>
      <button style={BP()} onClick={onOk}>Eliminar</button>
    </div>
  </Overlay>);
}

function SemesterModal({ subjects, onClose }) {
  const [tab,setTab] = useState("export");
  const fileRef = useRef();
  const [imp,setImp] = useState(null);
  const [err,setErr] = useState("");
  async function handleFile(e) {
    const file=e.target.files[0]; if(!file)return;
    try{ const d=await importFromJSON(file); setImp(d); setErr(""); }catch{ setErr("Archivo inválido"); }
  }
  return (<Overlay onClose={()=>onClose(null)}><MH title="Gestión de semestres" onClose={()=>onClose(null)}/>
    <div style={{display:"flex",gap:"6px",marginBottom:"20px"}}>
      {["export","import"].map(t=>(
        <button key={t} onClick={()=>setTab(t)} style={{...BG,flex:1,padding:"8px",background:tab===t?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",fontWeight:tab===t?"700":"400",color:tab===t?"#fff":"rgba(255,255,255,0.45)"}}>
          {t==="export"?"📤 Exportar":"📥 Importar"}
        </button>
      ))}
    </div>
    {tab==="export"&&(<div>
      <p style={{fontSize:"13px",color:"rgba(255,255,255,0.55)",lineHeight:"1.7",marginBottom:"16px"}}>Descarga un <code style={{color:"#F4A261"}}>.json</code> con todas tus materias. Guárdalo al finalizar el semestre.</p>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"8px",padding:"14px",marginBottom:"16px"}}>
        {subjects.map(s=>(
          <div key={s._id||s.id} style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"5px"}}>
            <div style={{width:"7px",height:"7px",borderRadius:"50%",background:s.color,flexShrink:0}}/>
            <span style={{fontSize:"12px",color:"rgba(255,255,255,0.6)"}}>{s.name}</span>
            <span style={{fontSize:"9px",color:"rgba(255,255,255,0.28)",marginLeft:"auto"}}>{s.phases.length} fases</span>
          </div>
        ))}
      </div>
      <button style={{...BP("#2A9D8F"),width:"100%"}} onClick={()=>exportToJSON(subjects)}>Descargar archivo del semestre</button>
    </div>)}
    {tab==="import"&&(<div>
      <p style={{fontSize:"13px",color:"rgba(255,255,255,0.55)",lineHeight:"1.7",marginBottom:"16px"}}>Importa materias de un semestre anterior. Se añadirán a las actuales.</p>
      <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{display:"none"}}/>
      <button style={{...BG,width:"100%",marginBottom:"10px",padding:"12px",textAlign:"center"}} onClick={()=>fileRef.current.click()}>Seleccionar archivo .json</button>
      {err&&<div style={{color:"#E63946",fontSize:"12px",marginBottom:"10px"}}>{err}</div>}
      {imp&&<div>
        <div style={{background:"rgba(76,175,80,0.08)",border:"1px solid rgba(76,175,80,0.22)",borderRadius:"8px",padding:"12px",marginBottom:"14px"}}>
          <div style={{fontSize:"9px",color:"#4CAF50",letterSpacing:"2px",marginBottom:"8px",textTransform:"uppercase"}}>Archivo válido · {imp.subjects?.length||0} materias</div>
          {(imp.subjects||[]).map((s,i)=><div key={i} style={{fontSize:"12px",color:"rgba(255,255,255,0.55)",marginBottom:"3px"}}>• {s.name}</div>)}
        </div>
        <button style={{...BP("#2A9D8F"),width:"100%"}} onClick={()=>onClose(imp.subjects||[])}>Importar materias</button>
      </div>}
    </div>)}
  </Overlay>);
}

// ═══════════════════════════════════════════════════════════════════
//  TODAY VIEW — ítems activos de todas las materias
// ═══════════════════════════════════════════════════════════════════
function TodayView({ subjects, onToggleDone }) {

  // Recolectar todos los ítems activos o vencidos-sin-hacer de todas las materias
  const groups = subjects.flatMap(subject =>
    subject.phases.flatMap(phase =>
      phase.items
        .filter(item => {
          if (!item.dateEnd) return false;
          // Si no hay dateStart, usar dateEnd como inicio (ítems de un solo día)
          const startStr = (item.dateStart && item.dateStart.trim()) ? item.dateStart : item.dateEnd;
          const iS = pd(startStr);
          const iE = pd(item.dateEnd);
          if (!iS || !iE) return false;
          const active  = TODAY >= iS && TODAY <= iE;
          const overdue = TODAY > iE && !item.done;
          return active || overdue;
        })
        .map(item => ({
          item,
          phase,
          subject,
          overdue: TODAY > pd(item.dateEnd) && !item.done,
        }))
    )
  );

  const active  = groups.filter(g => !g.overdue && !g.item.done);
  const overdue = groups.filter(g => g.overdue);
  const done    = groups.filter(g => {
    if (!g.item.done) return false;
    const startStr = (g.item.dateStart && g.item.dateStart.trim()) ? g.item.dateStart : g.item.dateEnd;
    return isAct(startStr, g.item.dateEnd);
  });

  const todayLabel = TODAY.toLocaleDateString("es-CO", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  }).toUpperCase();

  function TodayItem({ entry }) {
    const { item, phase, subject, overdue } = entry;
    const [hov, setHov] = useState(false);
    const isDeadline = item.type === "deadline";
    const dl = dLeft(item.dateEnd);
    const startStr = (item.dateStart && item.dateStart.trim()) ? item.dateStart : item.dateEnd;
    const p  = pctTime(startStr, item.dateEnd);

    return (
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{
          padding:"16px 18px", borderRadius:"10px", marginBottom:"8px",
          background: item.done
            ? "rgba(76,175,80,0.05)"
            : overdue
              ? "rgba(230,57,70,0.07)"
              : isDeadline
                ? "rgba(230,57,70,0.07)"
                : hov ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
          border: item.done
            ? "1px solid rgba(76,175,80,0.2)"
            : overdue
              ? "1px solid rgba(230,57,70,0.35)"
              : `1px solid ${hov ? subject.color+"50" : "rgba(255,255,255,0.07)"}`,
          transition:"all 0.2s",
          opacity: item.done ? 0.65 : 1,
        }}>

        {/* Top row */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px",flexWrap:"wrap",marginBottom:"10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"9px",flex:1,minWidth:0,flexWrap:"wrap"}}>
            {/* Done toggle */}
            <button onClick={()=>onToggleDone(subject._id, phase._id||phase.id, item._id||item.id)}
              style={{width:"18px",height:"18px",borderRadius:"50%",cursor:"pointer",flexShrink:0,
                background:item.done?"#4CAF50":"transparent",
                border:item.done?"2px solid #4CAF50":`2px solid ${overdue?"#E63946":subject.color}`,
                display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",padding:0}}>
              {item.done&&<span style={{fontSize:"8px",color:"#fff",lineHeight:1}}>✓</span>}
            </button>

            <div style={{minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:"7px",flexWrap:"wrap"}}>
                <span style={{fontSize:"13px",fontWeight:"700",
                  color:item.done?"rgba(255,255,255,0.3)":overdue?"#ff6b6b":isDeadline?"#ff6b6b":"#fff",
                  textDecoration:item.done?"line-through":"none"}}>
                  {(overdue||isDeadline)&&!item.done&&"⚠ "}{item.label}
                </span>
                <span style={{fontSize:"9px",letterSpacing:"1px",textTransform:"uppercase",
                  color:TCFG[item.type]?.col,border:`1px solid ${TCFG[item.type]?.col}50`,
                  padding:"1px 7px",borderRadius:"20px",whiteSpace:"nowrap",flexShrink:0}}>
                  {TCFG[item.type]?.icon} {TCFG[item.type]?.label}
                </span>
              </div>
              {/* Breadcrumb: materia > fase */}
              <div style={{display:"flex",alignItems:"center",gap:"5px",marginTop:"4px"}}>
                <div style={{width:"6px",height:"6px",borderRadius:"50%",background:subject.color,flexShrink:0}}/>
                <span style={{fontSize:"10px",color:"rgba(255,255,255,0.35)"}}>{subject.name}</span>
                <span style={{fontSize:"10px",color:"rgba(255,255,255,0.2)"}}>›</span>
                <span style={{fontSize:"10px",color:"rgba(255,255,255,0.35)"}}>{phase.name}</span>
              </div>
            </div>
          </div>

          {/* Dates + urgency */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"4px",flexShrink:0}}>
            <span style={{fontSize:"10px",fontFamily:"monospace",
              color:overdue?"#E63946":isDeadline?"#ff6b6b":subject.color,
              background:"rgba(0,0,0,0.25)",padding:"2px 8px",borderRadius:"20px",whiteSpace:"nowrap"}}>
              {item.dateStart&&item.dateStart!==item.dateEnd
                ?`${fd(item.dateStart)} – ${fd(item.dateEnd)}`
                :fd(item.dateEnd)}
            </span>
            {!item.done && (
              <span style={{fontSize:"10px",fontWeight:"700",
                color: overdue?"#E63946":dl===0?"#E63946":dl<=2?"#F4A261":dl<=5?"#f9c784":"rgba(255,255,255,0.3)"}}>
                {overdue ? `Venció hace ${Math.abs(dl)}d` : dl===0 ? "⚡ Vence hoy" : `${dl}d restantes`}
              </span>
            )}
          </div>
        </div>

        {item.desc && (
          <p style={{margin:"0 0 10px 27px",fontSize:"12px",lineHeight:"1.6",color:"rgba(255,255,255,0.38)",fontStyle:"italic"}}>{item.desc}</p>
        )}

        {/* Progress bar */}
        {!item.done && (
          <div style={{marginLeft:"27px"}}>
            <Bar v={p} color={overdue?"#E63946":subject.color} h={3}/>
            <div style={{fontSize:"9px",color:"rgba(255,255,255,0.2)",marginTop:"3px"}}>{p}% del tiempo transcurrido</div>
          </div>
        )}
        {item.done && (
          <div style={{marginLeft:"27px",fontSize:"9px",letterSpacing:"1.5px",color:"#4CAF5060",textTransform:"uppercase"}}>● Completada</div>
        )}
      </div>
    );
  }

  const SectionHead = ({ label, count, color="#fff" }) => (
    <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px",marginTop:"28px"}}>
      <span style={{fontSize:"9px",letterSpacing:"3px",color,textTransform:"uppercase",fontWeight:"700"}}>{label}</span>
      <span style={{fontSize:"10px",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.4)",
        padding:"1px 8px",borderRadius:"20px"}}>{count}</span>
      <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.06)"}}/>
    </div>
  );

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflowY:"auto"}}>

      {/* Header */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"20px 26px 16px",
        background:"linear-gradient(135deg,rgba(255,255,255,0.03) 0%,transparent 60%)"}}>
        <div style={{fontSize:"9px",letterSpacing:"4px",color:"rgba(255,255,255,0.28)",textTransform:"uppercase",marginBottom:"5px"}}>
          Vista de hoy
        </div>
        <h1 style={{margin:0,fontSize:"18px",fontWeight:"400",letterSpacing:"0.3px",color:"#f0ece4"}}>
          {todayLabel}
        </h1>
        <div style={{display:"flex",gap:"16px",marginTop:"8px",flexWrap:"wrap"}}>
          {[
            {label:"En curso",    v:active.length,  c:"#2A9D8F"},
            {label:"Vencidas",    v:overdue.length,  c:"#E63946"},
            {label:"Completadas", v:done.length,     c:"#4CAF50"},
          ].map(s=>(
            <div key={s.label} style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <span style={{fontSize:"18px",fontWeight:"300",color:s.c}}>{s.v}</span>
              <span style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.5px"}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"8px 26px 60px"}}>

        {/* Empty state */}
        {groups.length === 0 && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            padding:"80px 20px",gap:"14px",color:"rgba(255,255,255,0.2)",textAlign:"center"}}>
            <div style={{fontSize:"48px"}}>🎉</div>
            <div style={{fontSize:"16px"}}>Sin actividades pendientes hoy</div>
            <div style={{fontSize:"12px",color:"rgba(255,255,255,0.15)"}}>
              No hay ítems activos en ninguna materia para esta fecha
            </div>
          </div>
        )}

        {/* Overdue */}
        {overdue.length > 0 && (
          <>
            <SectionHead label="Vencidas sin completar" count={overdue.length} color="#E63946"/>
            {overdue.map((g,i)=><TodayItem key={i} entry={g}/>)}
          </>
        )}

        {/* Active */}
        {active.length > 0 && (
          <>
            <SectionHead label="Trabajando ahora" count={active.length} color="#2A9D8F"/>
            {active.map((g,i)=><TodayItem key={i} entry={g}/>)}
          </>
        )}

        {/* Done today (active range but marked done) */}
        {done.length > 0 && (
          <>
            <SectionHead label="Completadas" count={done.length} color="#4CAF50"/>
            {done.map((g,i)=><TodayItem key={i} entry={g}/>)}
          </>
        )}

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  APP ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [user,      setUser]      = useState(null);   // usuario autenticado
  const [authReady, setAuthReady] = useState(false);  // ¿ya verificamos el token?
  const [subjects,  setSubjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [activeId,  setActiveId]  = useState(null);
  const [page,      setPage]      = useState("today");
  const [sidebar,   setSidebar]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [editPh,    setEditPh]    = useState(null);
  const [editIt,    setEditIt]    = useState(null);
  const [toast,     setToast]     = useState(null);
  const [connErr,   setConnErr]   = useState(false);

  function showToast(msg, type="success") {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3000);
  }

  function handleLogout(msg) {
    token.clear();
    setUser(null);
    setSubjects([]);
    setActiveId(null);
    setPage("today");
    if (msg) showToast(msg, "info");
  }

  // ── Verificar token al arrancar y escuchar logout forzado ────────
  useEffect(() => {
    // Si el backend responde 401, la api.js dispara este evento
    const onForceLogout = (e) => handleLogout(e.detail);
    window.addEventListener("acad:logout", onForceLogout);

    const existing = token.get();
    if (!existing) { setAuthReady(true); return; }

    // Verificar que el token sigue válido
    auth.me()
      .then(data => { setUser(data.user); setAuthReady(true); })
      .catch(() => { token.clear(); setAuthReady(true); });

    return () => window.removeEventListener("acad:logout", onForceLogout);
  }, []);

  // ── Carga inicial desde MongoDB (cuando hay usuario) ─────────────
  useEffect(()=>{
    if (!user) { setSubjects([]); setLoading(false); return; }
    setLoading(true);
    api.getSubjects()
      .then(data=>{
        const normalize = (obj) => {
          if (!obj || typeof obj !== "object") return obj;
          if (obj.$oid) return obj.$oid;
          return obj;
        };
        const clean = data.map(s => ({
          ...s,
          _id: normalize(s._id),
          phases: (s.phases||[]).map(ph => ({
            ...ph,
            _id: normalize(ph._id),
            items: (ph.items||[]).map(it => ({ ...it, _id: normalize(it._id) }))
          }))
        }));
        setSubjects(clean);
        setActiveId(clean[0]?._id||null);
        setPage("today");
        setLoading(false);
      })
      .catch(()=>{ setConnErr(true); setLoading(false); });
  },[user]);

  const subject = subjects.find(s=>(s._id||s.id)===activeId);

  // ── Helpers async con toast ──────────────────────────────────────
  async function run(fn, successMsg) {
    setSaving(true);
    try { await fn(); if(successMsg) showToast(successMsg); }
    catch(e) { showToast(e.message,"error"); }
    finally { setSaving(false); }
  }

  // ── Subject CRUD ─────────────────────────────────────────────────
  async function createSubject(f) {
    await run(async()=>{
      const created = await api.createSubject({...f,phases:[]});
      setSubjects(p=>[...p,created]);
      setActiveId(created._id);
      setModal(null);
    },"Materia creada");
  }
  async function updateSubject(f) {
    await run(async()=>{
      const updated = await api.updateSubject(subject._id,{...subject,...f});
      setSubjects(p=>p.map(s=>s._id===subject._id?updated:s));
      setModal(null);
    },"Cambios guardados");
  }
  async function deleteSubject() {
    await run(async()=>{
      await api.deleteSubject(subject._id);
      const next = subjects.filter(s=>s._id!==subject._id);
      setSubjects(next); setActiveId(next[0]?._id||null); setModal(null);
    },"Materia eliminada");
  }

  // ── Phase CRUD ───────────────────────────────────────────────────
  async function createPhase(f) {
    await run(async()=>{
      const newPhase = {...f, id:uid(), items:[]};
      const phases = [...subject.phases, newPhase];
      const updated = await api.updatePhases(subject._id, phases);
      setSubjects(p=>p.map(s=>s._id===subject._id?updated:s));
      setModal(null);
    },"Fase creada");
  }
  async function updatePhase(f) {
    await run(async()=>{
      const phases = subject.phases.map(ph=>(ph._id||ph.id)===(editPh._id||editPh.id)?{...ph,...f}:ph);
      const updated = await api.updatePhases(subject._id, phases);
      setSubjects(p=>p.map(s=>s._id===subject._id?updated:s));
      setModal(null);
    },"Fase actualizada");
  }
  async function deletePhase(phId) {
    await run(async()=>{
      const phases = subject.phases.filter(ph=>(ph._id||ph.id)!==phId);
      const updated = await api.updatePhases(subject._id, phases);
      setSubjects(p=>p.map(s=>s._id===subject._id?updated:s));
      setModal(null);
    },"Fase eliminada");
  }

  // ── Item CRUD ────────────────────────────────────────────────────
  function updPhases(phId, fn) {
    return subject.phases.map(ph=>(ph._id||ph.id)===phId?{...ph,items:fn(ph.items)}:ph);
  }
  async function createItem(phId, f) {
    await run(async()=>{
      const phases = updPhases(phId, items=>[...items,{...f,id:uid(),done:false}]);
      const updated = await api.updatePhases(subject._id, phases);
      setSubjects(p=>p.map(s=>s._id===subject._id?updated:s));
      setModal(null);
    },"Actividad agregada");
  }
  async function updateItem(phId, f) {
    await run(async()=>{
      const phases = updPhases(phId, items=>items.map(it=>(it._id||it.id)===(editIt.item._id||editIt.item.id)?{...it,...f}:it));
      const updated = await api.updatePhases(subject._id, phases);
      setSubjects(p=>p.map(s=>s._id===subject._id?updated:s));
      setModal(null);
    },"Actividad actualizada");
  }
  async function deleteItem(phId, itId) {
    await run(async()=>{
      const phases = updPhases(phId, items=>items.filter(it=>(it._id||it.id)!==itId));
      const updated = await api.updatePhases(subject._id, phases);
      setSubjects(p=>p.map(s=>s._id===subject._id?updated:s));
      setModal(null);
    },"Actividad eliminada");
  }
  async function toggleDone(phId, itId) {
    const phases = updPhases(phId, items=>items.map(it=>(it._id||it.id)===itId?{...it,done:!it.done}:it));
    const updated = await api.updatePhases(subject._id, phases).catch(()=>null);
    if(updated) setSubjects(p=>p.map(s=>s._id===subject._id?updated:s));
  }

  // toggleDone that works from any view (TodayView passes subjectId explicitly)
  async function toggleDoneGlobal(subjectId, phId, itId) {
    const subj = subjects.find(s=>(s._id||s.id)===subjectId);
    if(!subj) return;
    const phases = subj.phases.map(ph=>(ph._id||ph.id)===phId
      ? {...ph, items: ph.items.map(it=>(it._id||it.id)===itId?{...it,done:!it.done}:it)}
      : ph
    );
    const updated = await api.updatePhases(subj._id, phases).catch(()=>null);
    if(updated) setSubjects(p=>p.map(s=>s._id===subj._id?updated:s));
  }
  async function reorder(phId, items) {
    const phases = subject.phases.map(ph=>(ph._id||ph.id)===phId?{...ph,items}:ph);
    const updated = await api.updatePhases(subject._id, phases).catch(()=>null);
    if(updated) setSubjects(p=>p.map(s=>s._id===subject._id?updated:s));
  }

  // ── Import ───────────────────────────────────────────────────────
  async function importSubjects(newSubs) {
    await run(async()=>{
      const created = await Promise.all(newSubs.map(s=>api.createSubject({...s,_id:undefined})));
      setSubjects(p=>[...p,...created]);
      setModal(null);
    },`${newSubs.length} materias importadas`);
  }

  const totalPts = subject?subject.phases.reduce((a,p)=>a+p.points,0):0;

  // ── Auth gate ────────────────────────────────────────────────────
  if (!authReady) return (
    <div style={{minHeight:"100vh",background:"#090910",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.3)",fontFamily:"Georgia,serif",letterSpacing:"3px",fontSize:"11px"}}>
      CARGANDO…
    </div>
  );
  if (!user) return <AuthScreen onAuth={(u) => setUser(u)} />;

  // ── Connection error screen ──────────────────────────────────────
  if(connErr) return (
    <div style={{minHeight:"100vh",background:"#090910",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",fontFamily:"Georgia,serif",color:"rgba(255,255,255,0.5)",padding:"20px",textAlign:"center"}}>
      <div style={{fontSize:"40px"}}>⚠️</div>
      <div style={{fontSize:"16px",color:"#E63946"}}>No se pudo conectar al servidor</div>
      <div style={{fontSize:"13px",lineHeight:"1.8",maxWidth:"400px"}}>
        Asegúrate de que el backend esté corriendo:<br/>
        <code style={{color:"#F4A261",background:"rgba(255,255,255,0.05)",padding:"2px 8px",borderRadius:"4px"}}>cd backend && npm run dev</code>
      </div>
      <button style={BP()} onClick={()=>window.location.reload()}>Reintentar</button>
    </div>
  );

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#090910",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.3)",fontFamily:"Georgia,serif",letterSpacing:"3px",fontSize:"11px"}}>
      CARGANDO…
    </div>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#090910",fontFamily:"'Georgia',serif",color:"#f0ece4"}}>

      {/* ── SIDEBAR ── */}
      <div style={{width:sidebar?"248px":"58px",flexShrink:0,background:"#0b0b14",borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",transition:"width 0.3s cubic-bezier(.4,0,.2,1)",overflow:"hidden",zIndex:10}}>
        <button onClick={()=>setSidebar(o=>!o)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",padding:"15px 17px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",gap:"10px",whiteSpace:"nowrap",overflow:"hidden",transition:"color 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
          <span style={{flexShrink:0,fontSize:"15px"}}>{sidebar?"◀":"▶"}</span>
          {sidebar&&<span style={{fontSize:"9px",letterSpacing:"3px",color:"rgba(255,255,255,0.22)",textTransform:"uppercase"}}>Menú</span>}
        </button>

        {/* Hoy button */}
        {(() => {
          const isToday = page==="today";
          const activeNow = subjects.flatMap(s=>s.phases.flatMap(ph=>ph.items.filter(it=>{
            const iS=pd(it.dateStart)||pd(it.dateEnd); return TODAY>=iS&&TODAY<=pd(it.dateEnd)&&!it.done;
          }))).length;
          return (
            <button onClick={()=>setPage("today")}
              style={{background:isToday?"rgba(255,255,255,0.06)":"transparent",border:"none",cursor:"pointer",
                padding:sidebar?"12px 13px":"12px 15px",display:"flex",alignItems:"center",gap:"9px",
                borderLeft:isToday?"3px solid #2A9D8F":"3px solid transparent",
                borderBottom:"1px solid rgba(255,255,255,0.05)",
                transition:"all 0.2s",textAlign:"left",whiteSpace:"nowrap",overflow:"hidden",width:"100%"}}>
              <div style={{width:"25px",height:"25px",borderRadius:"7px",background:isToday?"#2A9D8F":"rgba(255,255,255,0.08)",
                flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",position:"relative"}}>
                📅
                {activeNow>0&&(
                  <div style={{position:"absolute",top:"-4px",right:"-4px",width:"14px",height:"14px",borderRadius:"50%",
                    background:"#E63946",fontSize:"8px",fontWeight:"700",color:"#fff",
                    display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>
                    {activeNow}
                  </div>
                )}
              </div>
              {sidebar&&<div style={{overflow:"hidden"}}>
                <div style={{fontSize:"12px",fontWeight:isToday?"700":"400",color:isToday?"#fff":"rgba(255,255,255,0.48)"}}>Hoy</div>
                <div style={{fontSize:"9px",color:"rgba(255,255,255,0.22)",letterSpacing:"0.5px",marginTop:"1px"}}>
                  {activeNow>0?`${activeNow} activa${activeNow>1?"s":""}`:
                    subjects.flatMap(s=>s.phases.flatMap(ph=>ph.items.filter(it=>TODAY>pd(it.dateEnd)&&!it.done))).length>0
                    ? `${subjects.flatMap(s=>s.phases.flatMap(ph=>ph.items.filter(it=>TODAY>pd(it.dateEnd)&&!it.done))).length} vencida${subjects.flatMap(s=>s.phases.flatMap(ph=>ph.items.filter(it=>TODAY>pd(it.dateEnd)&&!it.done))).length>1?"s":""}`
                    : "Sin pendientes"}
                </div>
              </div>}
            </button>
          );
        })()}

        {/* Divider + label */}
        {sidebar&&<div style={{padding:"10px 13px 4px",fontSize:"9px",letterSpacing:"2px",color:"rgba(255,255,255,0.18)",textTransform:"uppercase"}}>Materias</div>}
        {!sidebar&&<div style={{height:"6px"}}/>}

        <div style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:"2px 0"}}>
          {subjects.map(s=>{
            const act=page==="subject"&&(s._id||s.id)===activeId;
            return (<button key={s._id||s.id} onClick={()=>{setActiveId(s._id||s.id);setPage("subject");if(!sidebar)setSidebar(true);}}
              style={{width:"100%",background:act?`${s.color}12`:"transparent",border:"none",cursor:"pointer",padding:sidebar?"10px 13px":"10px 15px",display:"flex",alignItems:"center",gap:"9px",borderLeft:act?`3px solid ${s.color}`:"3px solid transparent",transition:"all 0.2s",textAlign:"left",whiteSpace:"nowrap",overflow:"hidden"}}>
              <div style={{width:"25px",height:"25px",borderRadius:"7px",background:s.color,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",color:"#fff"}}>{s.name.charAt(0)}</div>
              {sidebar&&<div style={{overflow:"hidden"}}>
                <div style={{fontSize:"12px",fontWeight:act?"700":"400",color:act?"#fff":"rgba(255,255,255,0.48)",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                <div style={{fontSize:"9px",color:"rgba(255,255,255,0.22)",letterSpacing:"0.5px",marginTop:"1px"}}>{s.code}</div>
              </div>}
            </button>);
          })}
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",padding:"4px 0"}}>
          {[{icon:"＋",label:"Nueva materia",fn:()=>setModal("new-subject")},{icon:"📦",label:"Semestres",fn:()=>setModal("semester")}].map(b=>(
            <button key={b.label} onClick={b.fn} style={{width:"100%",background:"none",border:"none",color:"rgba(255,255,255,0.28)",cursor:"pointer",padding:"9px 17px",display:"flex",alignItems:"center",gap:"9px",whiteSpace:"nowrap",overflow:"hidden",transition:"color 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.28)"}>
              <span style={{flexShrink:0,fontSize:"16px",lineHeight:1}}>{b.icon}</span>
              {sidebar&&<span style={{fontSize:"11px"}}>{b.label}</span>}
            </button>
          ))}
        </div>

        {/* User info + logout */}
        <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",padding:"10px 10px 12px"}}>
          {sidebar ? (
            <div style={{display:"flex",alignItems:"center",gap:"9px",padding:"4px 6px"}}>
              <div style={{width:"28px",height:"28px",borderRadius:"50%",flexShrink:0,
                background:"linear-gradient(135deg,#2A9D8F,#457B9D)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"12px",fontWeight:"700",color:"#fff",letterSpacing:"0.5px"}}>
                {user?.name?.charAt(0)?.toUpperCase()||"?"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"12px",color:"rgba(255,255,255,0.7)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</div>
                <div style={{fontSize:"9px",color:"rgba(255,255,255,0.25)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</div>
              </div>
              <button onClick={()=>handleLogout()}
                title="Cerrar sesión"
                style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"6px",
                  color:"rgba(255,255,255,0.3)",cursor:"pointer",padding:"4px 7px",fontSize:"12px",
                  flexShrink:0,transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.color="#E63946";e.currentTarget.style.borderColor="rgba(230,57,70,0.4)";}}
                onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.3)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
                ⏻
              </button>
            </div>
          ) : (
            <button onClick={()=>handleLogout()}
              title="Cerrar sesión"
              style={{width:"100%",background:"none",border:"none",color:"rgba(255,255,255,0.25)",
                cursor:"pointer",padding:"8px 0",fontSize:"15px",transition:"color 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.color="#E63946"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.25)"}>
              ⏻
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflowY:"auto"}}>
        {saving&&<div style={{position:"fixed",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#2A9D8F,transparent)",animation:"saving 1.2s infinite",zIndex:999}}/>}

        {/* TODAY PAGE */}
        {page==="today" && (
          <TodayView subjects={subjects} onToggleDone={toggleDoneGlobal}/>
        )}

        {/* SUBJECT PAGE */}
        {page==="subject" && (!subject?(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"14px",color:"rgba(255,255,255,0.22)"}}>
            <div style={{fontSize:"44px"}}>📚</div>
            <div style={{fontSize:"14px"}}>No hay materias</div>
            <button style={BP()} onClick={()=>setModal("new-subject")}>Crear primera materia</button>
          </div>
        ):(
          <>
            <div style={{borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"18px 24px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:"10px",background:`linear-gradient(135deg,${subject.color}08 0%,transparent 50%)`}}>
              <div>
                <div style={{fontSize:"9px",letterSpacing:"4px",color:"rgba(255,255,255,0.28)",textTransform:"uppercase",marginBottom:"4px"}}>UNAD · {subject.code} · 2026-I</div>
                <h1 style={{margin:0,fontSize:"18px",fontWeight:"400",letterSpacing:"0.3px"}}>{subject.name}</h1>
              </div>
              <div style={{display:"flex",gap:"7px",alignItems:"center",flexWrap:"wrap"}}>
                <div style={{textAlign:"right",fontSize:"10px",color:"rgba(255,255,255,0.28)"}}>
                  <div style={{color:subject.color,fontWeight:"700",fontSize:"11px"}}>HOY · {TODAY.toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"}).toUpperCase()}</div>
                  <div>{totalPts} pts · {subject.phases.length} fases</div>
                </div>
                <button style={{...BG,padding:"5px 10px",fontSize:"12px"}} onClick={()=>setModal("edit-subject")}>✏️</button>
                <button style={{...BG,padding:"5px 10px",fontSize:"12px",color:"#E63946",borderColor:"rgba(230,57,70,0.3)"}} onClick={()=>setModal("confirm-del-subject")}>🗑</button>
              </div>
            </div>
            <div style={{padding:"22px 24px 60px"}}>
              <SemBar subject={subject} onAddPhase={()=>setModal("new-phase")} onEditPhase={ph=>{setEditPh(ph);setModal("edit-phase");}}/>
              {subject.phases.length===0&&(
                <div style={{textAlign:"center",padding:"44px 20px",border:"1px dashed rgba(255,255,255,0.08)",borderRadius:"10px",marginBottom:"20px",color:"rgba(255,255,255,0.2)"}}>
                  <div style={{fontSize:"26px",marginBottom:"10px"}}>📋</div>
                  <div style={{fontSize:"13px"}}>Sin fases — agrega una para comenzar</div>
                </div>
              )}
              {subject.phases.map(ph=>(
                <PhaseCard key={ph._id||ph.id} phase={ph} subject={subject}
                  onEditPhase={p=>{setEditPh(p);setModal("edit-phase");}}
                  onDeletePhase={id=>{setEditPh({_id:id});setModal("confirm-del-phase");}}
                  onAddItem={phId=>{setEditIt({phaseId:phId});setModal("new-item");}}
                  onEditItem={it=>{setEditIt({phaseId:ph._id||ph.id,item:it});setModal("edit-item");}}
                  onDeleteItem={(phId,itId)=>{setEditIt({phaseId:phId,itemId:itId});setModal("confirm-del-item");}}
                  onToggle={toggleDone} onReorder={reorder}/>
              ))}
              <button onClick={()=>setModal("new-phase")}
                style={{width:"100%",padding:"12px",background:"none",border:`1px dashed ${subject.color}50`,borderRadius:"10px",color:subject.color,fontSize:"13px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",transition:"background 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${subject.color}0e`}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                + Agregar nueva fase
              </button>
            </div>
          </>
        ))}
      </div>

      {/* ── MODALS ── */}
      {modal==="new-subject"        &&<SubjectModal onSave={createSubject} onClose={()=>setModal(null)}/>}
      {modal==="edit-subject"       &&<SubjectModal subject={subject} onSave={updateSubject} onClose={()=>setModal(null)}/>}
      {modal==="confirm-del-subject"&&<ConfirmModal msg={`¿Eliminar "${subject?.name}"?`} onOk={deleteSubject} onClose={()=>setModal(null)}/>}
      {modal==="new-phase"          &&<PhaseModal color={subject?.color} onSave={createPhase} onClose={()=>setModal(null)}/>}
      {modal==="edit-phase"         &&<PhaseModal phase={editPh} color={subject?.color} onSave={updatePhase} onClose={()=>setModal(null)}/>}
      {modal==="confirm-del-phase"  &&<ConfirmModal msg="¿Eliminar esta fase y todas sus actividades?" onOk={()=>deletePhase(editPh?._id||editPh?.id)} onClose={()=>setModal(null)}/>}
      {modal==="new-item"           &&<ItemModal color={subject?.color} onSave={f=>createItem(editIt?.phaseId,f)} onClose={()=>setModal(null)}/>}
      {modal==="edit-item"          &&<ItemModal item={editIt?.item} color={subject?.color} onSave={f=>updateItem(editIt?.phaseId,f)} onClose={()=>setModal(null)}/>}
      {modal==="confirm-del-item"   &&<ConfirmModal msg="¿Eliminar esta actividad?" onOk={()=>deleteItem(editIt?.phaseId,editIt?.itemId)} onClose={()=>setModal(null)}/>}
      {modal==="semester"           &&<SemesterModal subjects={subjects} onClose={imp=>{if(Array.isArray(imp))importSubjects(imp);else setModal(null);}}/>}

      {toast&&<Toast msg={toast.msg} type={toast.type}/>}

      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.4);}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.3);}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes saving{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
      `}</style>
    </div>
  );
}
