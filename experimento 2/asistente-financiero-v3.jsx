import { useState, useEffect, useRef, useCallback } from "react";

const NOTION_DB_ID = "2962eee9-6612-41cd-81d7-7b110f2a2888";
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const CATS_INGRESO = ["Ventas","Servicios","Honorarios","Intereses","Otros ingresos"];
const CATS_GASTO   = ["Nomina","Renta","Marketing","Operaciones","Tecnologia","Impuestos","Financieros","Otros gastos"];
const fmtMXN = (n) => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0}).format(n||0);

// ─── API ──────────────────────────────────────────────────────────────────────
async function aiParse(text, month, year) {
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:1000,
      system:`Eres contador mexicano. Extrae movimientos financieros y devuelve SOLO un JSON array.
Cada objeto: {"tipo":"ingreso"|"gasto","monto":numero,"concepto":"string","categoria":"string","fecha":"YYYY-MM-DD","cliente_proveedor":"string o null"}
Categorias ingreso: ${CATS_INGRESO.join(", ")}
Categorias gasto: ${CATS_GASTO.join(", ")}
Si no hay fecha usa ${year}-${String(month+1).padStart(2,"0")}-01
Responde UNICAMENTE el JSON array sin markdown ni explicacion.`,
      messages:[{role:"user",content:text}]
    })
  });
  const d = await r.json();
  const raw = (d.content?.[0]?.text || "[]").replace(/```json|```/g,"").trim();
  return JSON.parse(raw);
}

async function notionQuery(month, year) {
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","anthropic-beta":"mcp-client-2025-04-04"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:4000,
      mcp_servers:[{type:"url",url:"https://mcp.notion.com/mcp",name:"notion"}],
      messages:[{role:"user",content:
        `Query the Notion database with ID "${NOTION_DB_ID}". Find all pages where the "Mes" select equals "${MONTHS[month]}" and the "Anio" number equals ${year}. Return all matching pages with all their properties.`
      }]
    })
  });
  const d = await r.json();
  for (const block of (d.content || [])) {
    const txt = block.type === "mcp_tool_result"
      ? (block.content?.[0]?.text || "")
      : (block.type === "text" ? block.text : "");
    if (!txt) continue;
    try {
      const parsed = JSON.parse(txt);
      if (Array.isArray(parsed?.results)) return parsed.results;
      if (Array.isArray(parsed) && (parsed.length === 0 || parsed[0]?.properties)) return parsed;
    } catch {}
  }
  return [];
}

function pageToEntry(page) {
  const p = page.properties || {};
  const title = p["Concepto"]?.title?.[0]?.plain_text
    || p["Concepto"]?.title?.[0]?.text?.content || "";
  const sel  = (k) => p[k]?.select?.name || "";
  const num  = (k) => p[k]?.number || 0;
  const rich = (k) => p[k]?.rich_text?.[0]?.plain_text || "";
  const date = (k) => p[k]?.date?.start || "";
  return {
    id: page.id,
    notionId: page.id,
    concepto: title,
    tipo: (sel("Tipo") || "Gasto").toLowerCase(),
    monto: num("Monto"),
    categoria: sel("Categoria"),
    fecha: date("Fecha"),
    cliente_proveedor: rich("Cliente_Proveedor"),
  };
}

async function notionCreate(entry, month, year) {
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","anthropic-beta":"mcp-client-2025-04-04"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:2000,
      mcp_servers:[{type:"url",url:"https://mcp.notion.com/mcp",name:"notion"}],
      messages:[{role:"user",content:
        `Create a page in Notion database "${NOTION_DB_ID}" with these properties:
- Concepto (title): "${entry.concepto}"
- Tipo (select): "${entry.tipo==="ingreso"?"Ingreso":"Gasto"}"
- Monto (number): ${entry.monto}
- Categoria (select): "${entry.categoria}"
- Fecha (date): "${entry.fecha}"
- Cliente_Proveedor (rich_text): "${entry.cliente_proveedor||""}"
- Mes (select): "${MONTHS[month]}"
- Anio (number): ${year}`
      }]
    })
  });
  const d = await r.json();
  for (const block of (d.content||[])) {
    const txt = block.type === "mcp_tool_result"
      ? (block.content?.[0]?.text || "")
      : (block.type === "text" ? block.text : "");
    if (!txt) continue;
    try { const p = JSON.parse(txt); if (p.id) return p.id; } catch {}
    const m = txt.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
    if (m) return m[0];
  }
  return null;
}

async function notionDelete(pageId) {
  await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","anthropic-beta":"mcp-client-2025-04-04"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:500,
      mcp_servers:[{type:"url",url:"https://mcp.notion.com/mcp",name:"notion"}],
      messages:[{role:"user",content:`Archive/delete Notion page with ID "${pageId}".`}]
    })
  });
}

async function aiAnalysis(entries, month, year) {
  const ti = entries.filter(e=>e.tipo==="ingreso").reduce((s,e)=>s+e.monto,0);
  const tg = entries.filter(e=>e.tipo==="gasto").reduce((s,e)=>s+e.monto,0);
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:600,
      messages:[{role:"user",content:
        `Resumen ejecutivo financiero de ${MONTHS[month]} ${year} (max 150 palabras, espanol, lenguaje de negocios): Ingresos: ${fmtMXN(ti)} | Gastos: ${fmtMXN(tg)} | Utilidad: ${fmtMXN(ti-tg)} | Margen: ${ti>0?((ti-tg)/ti*100).toFixed(1):0}%. Movimientos: ${JSON.stringify(entries.map(e=>({t:e.tipo,m:e.monto,c:e.concepto})))}`
      }]
    })
  });
  const d = await r.json();
  return d.content?.[0]?.text || "";
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  bg:"#0d1117", surface:"#161b22", alt:"#1c2333", border:"#30363d",
  accent:"#e6b84a", accentL:"rgba(230,184,74,0.15)", accentB:"rgba(230,184,74,0.3)",
  green:"#3fb950", greenL:"rgba(63,185,80,0.12)", greenB:"rgba(63,185,80,0.3)",
  red:"#f85149", redL:"rgba(248,81,73,0.12)", redB:"rgba(248,81,73,0.3)",
  blue:"#58a6ff", blueL:"rgba(88,166,255,0.12)",
  tx:"#e6edf3", tx2:"#8b949e", tx3:"#484f58",
};

const Badge = ({c,children}) => {
  const m={green:{bg:S.greenL,cl:S.green,b:S.greenB},red:{bg:S.redL,cl:S.red,b:S.redB},gold:{bg:S.accentL,cl:S.accent,b:S.accentB},blue:{bg:S.blueL,cl:S.blue,b:"rgba(88,166,255,0.3)"}};
  const s=m[c]||m.blue;
  return <span style={{background:s.bg,color:s.cl,border:`1px solid ${s.b}`,padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:700,letterSpacing:"0.05em"}}>{children}</span>;
};

const TabBtn = ({active,onClick,children}) => (
  <button onClick={onClick} style={{background:active?S.accentL:"none",border:active?`1px solid ${S.accentB}`:"1px solid transparent",color:active?S.accent:S.tx3,borderRadius:6,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}>
    {children}
  </button>
);

const SectionBar = ({children}) => (
  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
    <div style={{width:3,height:14,background:S.accent,borderRadius:2}}/>
    <span style={{color:S.tx3,fontSize:10,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700}}>{children}</span>
  </div>
);

function EntryRow({e, onDel, deleting}) {
  const ing = e.tipo==="ingreso";
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 11px",background:S.alt,borderRadius:7,marginBottom:5,border:`1px solid ${S.border}`,opacity:deleting?0.4:1,transition:"opacity 0.2s"}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:ing?S.green:S.red,flexShrink:0}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{color:S.tx,fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.concepto}</div>
        <div style={{color:S.tx3,fontSize:11,marginTop:1}}>{e.categoria}{e.cliente_proveedor?` - ${e.cliente_proveedor}`:""}</div>
      </div>
      <div style={{color:ing?S.green:S.red,fontFamily:"monospace",fontSize:13,fontWeight:700,flexShrink:0}}>{ing?"+":"-"}{fmtMXN(e.monto)}</div>
      <button onClick={()=>onDel(e)} disabled={deleting} style={{background:"none",border:"none",cursor:"pointer",color:S.tx3,fontSize:16,padding:"0 2px",lineHeight:1}}>x</button>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function Resumen({entries,month,year}) {
  const [analysis,setAnalysis]=useState("");
  const [loading,setLoading]=useState(false);
  const ti=entries.filter(e=>e.tipo==="ingreso").reduce((s,e)=>s+e.monto,0);
  const tg=entries.filter(e=>e.tipo==="gasto").reduce((s,e)=>s+e.monto,0);
  const util=ti-tg;
  const gen=async()=>{if(!entries.length)return;setLoading(true);try{setAnalysis(await aiAnalysis(entries,month,year));}finally{setLoading(false);}};
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[[fmtMXN(ti),"Ingresos",S.green],[fmtMXN(tg),"Gastos",S.red],[fmtMXN(util),"Utilidad",util>=0?S.green:S.red]].map(([v,l,c])=>(
          <div key={l} style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:9,padding:"14px 16px"}}>
            <div style={{color:S.tx3,fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{l}</div>
            <div style={{color:c,fontSize:19,fontWeight:700,fontFamily:"monospace"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
        {[[`${ti>0?((util/ti)*100).toFixed(1):0}%`,"Margen"],[`${entries.length} mov.`,"Registros"],[util>=0?"Superavit":"Deficit","Balance"]].map(([v,l])=>(
          <div key={l} style={{background:S.alt,border:`1px solid ${S.border}`,borderRadius:7,padding:"10px 12px"}}>
            <div style={{color:S.tx3,fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>{l}</div>
            <div style={{color:S.tx,fontSize:14,fontWeight:700}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{background:S.alt,border:`1px solid ${S.border}`,borderRadius:10,padding:18,minHeight:110}}>
        {analysis
          ? <><p style={{color:S.tx,fontSize:13,lineHeight:1.75,margin:"0 0 12px"}}>{analysis}</p>
              <button onClick={gen} disabled={loading} style={{background:"none",border:`1px solid ${S.border}`,color:S.tx3,borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>{loading?"...":"Regenerar"}</button></>
          : <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:100,gap:10}}>
              <span style={{color:S.tx3,fontSize:13}}>Analisis ejecutivo con IA</span>
              <button onClick={gen} disabled={loading||!entries.length} style={{background:entries.length?S.accent:"none",color:entries.length?"#000":S.tx3,border:`1px solid ${entries.length?S.accent:S.border}`,borderRadius:8,padding:"8px 20px",fontWeight:700,fontSize:13,cursor:entries.length?"pointer":"not-allowed"}}>
                {loading?"Analizando...":"Generar Resumen"}
              </button>
            </div>
        }
      </div>
    </div>
  );
}

function Resultados({entries}) {
  const ingresos=entries.filter(e=>e.tipo==="ingreso");
  const gastos=entries.filter(e=>e.tipo==="gasto");
  const ti=ingresos.reduce((s,e)=>s+e.monto,0);
  const tg=gastos.reduce((s,e)=>s+e.monto,0);
  const util=ti-tg;
  const bycat=(arr)=>arr.reduce((a,e)=>{(a[e.categoria]=a[e.categoria]||[]).push(e);return a;},{});
  const Sec=({title,items,color,total})=>{
    const g=bycat(items);
    return (
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",padding:"7px 11px",background:color==="green"?S.greenL:S.redL,border:`1px solid ${color==="green"?S.greenB:S.redB}`,borderRadius:7,marginBottom:5}}>
          <span style={{color:color==="green"?S.green:S.red,fontWeight:700,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>{title}</span>
          <span style={{color:color==="green"?S.green:S.red,fontFamily:"monospace",fontWeight:700,fontSize:13}}>{fmtMXN(total)}</span>
        </div>
        {Object.entries(g).map(([cat,its])=>{
          const sub=its.reduce((s,i)=>s+i.monto,0);
          return (
            <div key={cat}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 11px"}}>
                <span style={{color:S.tx2,fontSize:12,fontWeight:600}}>{cat}</span>
                <span style={{color:S.tx2,fontFamily:"monospace",fontSize:12}}>{fmtMXN(sub)}</span>
              </div>
              {its.map(i=>(
                <div key={i.id} style={{display:"flex",justifyContent:"space-between",padding:"3px 22px"}}>
                  <span style={{color:S.tx3,fontSize:12}}>{i.concepto}</span>
                  <span style={{color:S.tx3,fontFamily:"monospace",fontSize:12}}>{fmtMXN(i.monto)}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div>
      <Sec title="Ingresos" items={ingresos} color="green" total={ti}/>
      <Sec title="Gastos" items={gastos} color="red" total={tg}/>
      <div style={{borderTop:`1px solid ${S.border}`,paddingTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{color:util>=0?S.green:S.red,fontWeight:800,fontSize:18,fontFamily:"monospace"}}>{fmtMXN(util)}</div>
          <div style={{color:S.tx3,fontSize:12,marginTop:2}}>Utilidad Neta - {ti>0?((util/ti)*100).toFixed(1):0}% margen</div>
        </div>
        <Badge c={util>=0?"green":"red"}>{util>=0?"SUPERAVIT":"DEFICIT"}</Badge>
      </div>
    </div>
  );
}

function Flujo({entries}) {
  const sorted=[...entries].sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
  let saldo=0;
  const rows=sorted.map(e=>{saldo+=e.tipo==="ingreso"?e.monto:-e.monto;return{...e,saldo};});
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"70px 1fr 100px 100px 100px",padding:"5px 10px",borderBottom:`1px solid ${S.border}`,marginBottom:3}}>
        {["Fecha","Concepto","Entrada","Salida","Saldo"].map((h,i)=>(
          <div key={h} style={{color:S.tx3,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",textAlign:i>1?"right":"left"}}>{h}</div>
        ))}
      </div>
      {!rows.length && <div style={{color:S.tx3,textAlign:"center",padding:36,fontSize:13}}>Sin movimientos este mes</div>}
      {rows.map(r=>(
        <div key={r.id} style={{display:"grid",gridTemplateColumns:"70px 1fr 100px 100px 100px",padding:"7px 10px",borderBottom:`1px solid ${S.border}`,alignItems:"center"}}>
          <div style={{color:S.tx3,fontSize:11,fontFamily:"monospace"}}>{(r.fecha||"").slice(5)}</div>
          <div style={{color:S.tx,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>{r.concepto}</div>
          <div style={{textAlign:"right",color:S.green,fontFamily:"monospace",fontSize:12}}>{r.tipo==="ingreso"?fmtMXN(r.monto):""}</div>
          <div style={{textAlign:"right",color:S.red,fontFamily:"monospace",fontSize:12}}>{r.tipo==="gasto"?fmtMXN(r.monto):""}</div>
          <div style={{textAlign:"right",color:r.saldo>=0?S.tx:S.red,fontFamily:"monospace",fontSize:12,fontWeight:700}}>{fmtMXN(r.saldo)}</div>
        </div>
      ))}
    </div>
  );
}

function Balance({entries}) {
  const ti=entries.filter(e=>e.tipo==="ingreso").reduce((s,e)=>s+e.monto,0);
  const tg=entries.filter(e=>e.tipo==="gasto").reduce((s,e)=>s+e.monto,0);
  const util=ti-tg;
  const R=({l,v,bold,color,indent})=>(
    <div style={{display:"flex",justifyContent:"space-between",padding:`${bold?8:5}px ${indent?20:10}px`,borderBottom:bold?`1px solid ${S.border}`:"none"}}>
      <span style={{color:bold?S.tx:S.tx2,fontSize:bold?13:12,fontWeight:bold?700:400}}>{l}</span>
      <span style={{color:color||(bold?S.tx:S.tx2),fontFamily:"monospace",fontSize:bold?13:12,fontWeight:bold?700:400}}>{fmtMXN(v)}</span>
    </div>
  );
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div>
        <div style={{background:S.blueL,border:"1px solid rgba(88,166,255,0.3)",borderRadius:7,padding:"6px 10px",color:S.blue,fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>ACTIVO</div>
        <R l="Efectivo y equiv." v={Math.max(0,util)} bold/>
        <R l="Cuentas por cobrar" v={0} indent/>
        <R l="Total Activo Circ." v={Math.max(0,util)} bold color={S.blue}/>
        <div style={{marginTop:10}}><R l="Activo Fijo" v={0} indent/><R l="Total Activo No Circ." v={0} bold color={S.blue}/></div>
        <div style={{marginTop:8,borderTop:`2px solid ${S.blue}`,paddingTop:6}}><R l="TOTAL ACTIVO" v={Math.max(0,util)} bold color={S.blue}/></div>
      </div>
      <div>
        <div style={{background:S.accentL,border:`1px solid ${S.accentB}`,borderRadius:7,padding:"6px 10px",color:S.accent,fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>PASIVO + CAPITAL</div>
        <R l="Cuentas por pagar" v={0} indent/>
        <R l="Total Pasivo Circ." v={0} bold color={S.accent}/>
        <div style={{marginTop:10}}><R l="Pasivo LP" v={0} indent/><R l="Total Pasivo" v={0} bold color={S.accent}/></div>
        <div style={{marginTop:10}}><R l="Capital Contable" v={0} indent/><R l="Utilidad del ejercicio" v={util} indent color={util>=0?S.green:S.red}/><R l="Total Capital" v={util} bold color={util>=0?S.green:S.red}/></div>
        <div style={{marginTop:8,borderTop:`2px solid ${S.accent}`,paddingTop:6}}><R l="TOTAL PASIVO + CAPITAL" v={Math.max(0,util)} bold color={S.accent}/></div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const now = new Date();
  const [month, setMonth]       = useState(now.getMonth());
  const [year,  setYear]        = useState(now.getFullYear());
  const [entries, setEntries]   = useState([]);
  const [input,   setInput]     = useState("");
  const [phase,   setPhase]     = useState("idle");
  const [note,    setNote]      = useState({msg:"",ok:true});
  const [tab,     setTab]       = useState("resumen");
  const [deletingId, setDeletingId] = useState(null);
  const noteTimer = useRef(null);

  const flash = useCallback((msg, ok=true, ms=4000) => {
    setNote({msg,ok});
    clearTimeout(noteTimer.current);
    if (ms) noteTimer.current = setTimeout(()=>setNote({msg:"",ok:true}), ms);
  }, []);

  // useCallback ensures useEffect always has the current month/year via stable reference
  const load = useCallback(async () => {
    setPhase("loading");
    setNote({msg:`Cargando ${MONTHS[month]} ${year}...`, ok:true});
    try {
      const pages = await notionQuery(month, year);
      const mapped = pages.map(pageToEntry);
      setEntries(mapped);
      flash(`Listo: ${mapped.length} movimiento(s) en ${MONTHS[month]} ${year}`, true);
    } catch(err) {
      flash(`Error al cargar: ${err.message}`, false);
      setEntries([]);
    } finally {
      setPhase("idle");
    }
  }, [month, year, flash]);

  // Runs on mount AND whenever month/year changes
  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!input.trim() || phase !== "idle") return;
    setPhase("parsing");
    flash("Parseando con IA...", true, 0);
    try {
      const parsed = await aiParse(input, month, year);
      if (!parsed.length) {
        flash("No identifique movimientos. Se mas especifico.", false);
        setPhase("idle");
        return;
      }
      setPhase("saving");
      flash(`Guardando ${parsed.length} movimiento(s) en Notion...`, true, 0);
      const saved = [];
      for (const e of parsed) {
        const nid = await notionCreate(e, month, year);
        saved.push({...e, id: nid||`tmp-${Date.now()}-${Math.random()}`, notionId: nid});
      }
      setEntries(prev=>[...prev,...saved]);
      setInput("");
      flash(`${saved.length} movimiento(s) guardado(s) en Notion`, true);
    } catch(err) {
      flash(`Error: ${err.message}`, false);
    } finally {
      setPhase("idle");
    }
  };

  const handleDelete = async (e) => {
    if (phase !== "idle") return;
    setDeletingId(e.id);
    setPhase("deleting");
    try {
      if (e.notionId) await notionDelete(e.notionId);
      setEntries(prev=>prev.filter(x=>x.id!==e.id));
      flash("Eliminado", true);
    } catch(err) {
      flash(`Error: ${err.message}`, false);
    } finally {
      setDeletingId(null);
      setPhase("idle");
    }
  };

  const busy = phase !== "idle";
  const TABS = [
    {id:"resumen",l:"Resumen"},
    {id:"resultados",l:"Estado de Resultados"},
    {id:"flujo",l:"Flujo de Caja"},
    {id:"balance",l:"Balance"}
  ];

  return (
    <div style={{minHeight:"100vh",background:S.bg,color:S.tx,fontFamily:"system-ui,-apple-system,sans-serif",fontSize:14}}>
      {/* HEADER */}
      <div style={{background:S.surface,borderBottom:`1px solid ${S.border}`,padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:7,background:S.accentL,border:`1px solid ${S.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:S.accent}}>$</div>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>Asistente Financiero</div>
            <div style={{color:S.tx3,fontSize:11}}>Sincronizado con Notion</div>
          </div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <select value={month} onChange={e=>setMonth(+e.target.value)}
            style={{background:S.alt,border:`1px solid ${S.border}`,color:S.tx,borderRadius:6,padding:"5px 9px",fontSize:12,cursor:"pointer"}}>
            {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={e=>setYear(+e.target.value)}
            style={{background:S.alt,border:`1px solid ${S.border}`,color:S.tx,borderRadius:6,padding:"5px 9px",fontSize:12,cursor:"pointer"}}>
            {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={load} disabled={busy}
            style={{background:S.alt,border:`1px solid ${S.border}`,color:busy?S.tx3:S.tx2,borderRadius:6,padding:"5px 14px",fontSize:12,cursor:busy?"not-allowed":"pointer",fontWeight:600}}>
            {phase==="loading"?"Cargando...":"Recargar"}
          </button>
          <Badge c="gold">{entries.length} mov.</Badge>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"290px 1fr",minHeight:"calc(100vh - 53px)"}}>
        {/* LEFT PANEL */}
        <div style={{borderRight:`1px solid ${S.border}`,padding:16,display:"flex",flexDirection:"column",gap:12}}>
          <SectionBar>Registrar movimiento</SectionBar>
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))handleAdd();}}
            placeholder={'Ej: "Cobre $45,000 de honorarios a KEEWE" o "Pague renta $8,500 y servicios $3,200"'}
            rows={4}
            style={{width:"100%",background:S.alt,border:`1px solid ${S.border}`,borderRadius:8,padding:"10px 11px",color:S.tx,fontSize:13,resize:"vertical",fontFamily:"inherit",lineHeight:1.6,boxSizing:"border-box",outline:"none"}}
          />
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
            <span style={{color:note.ok?S.tx3:S.red,fontSize:12,flex:1}}>{note.msg}</span>
            <button onClick={handleAdd} disabled={busy||!input.trim()}
              style={{background:busy||!input.trim()?S.alt:S.accent,color:busy||!input.trim()?S.tx3:"#000",border:"none",borderRadius:7,padding:"8px 15px",fontWeight:700,fontSize:13,cursor:busy||!input.trim()?"not-allowed":"pointer",flexShrink:0,transition:"all 0.15s"}}>
              {phase==="parsing"?"Parseando...":phase==="saving"?"Guardando...":"Registrar"}
            </button>
          </div>
          <div style={{color:S.tx3,fontSize:11,marginTop:-6}}>Cmd/Ctrl + Enter para enviar</div>

          <div style={{flex:1,overflowY:"auto",marginTop:4}}>
            <SectionBar>{MONTHS[month]} {year}</SectionBar>
            {phase==="loading"
              ? <div style={{color:S.tx3,textAlign:"center",padding:28,fontSize:13}}>Cargando desde Notion...</div>
              : entries.length===0
                ? <div style={{color:S.tx3,textAlign:"center",padding:28,fontSize:13}}>Sin movimientos este mes.<br/>Registra el primero arriba.</div>
                : entries.map(e=><EntryRow key={e.id} e={e} onDel={handleDelete} deleting={deletingId===e.id}/>)
            }
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{padding:22}}>
          <div style={{display:"flex",gap:3,marginBottom:18,background:S.surface,borderRadius:9,padding:3,border:`1px solid ${S.border}`,width:"fit-content"}}>
            {TABS.map(t=><TabBtn key={t.id} active={tab===t.id} onClick={()=>setTab(t.id)}>{t.l}</TabBtn>)}
          </div>
          <div style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:12,padding:22}}>
            <div style={{marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:15}}>{TABS.find(t=>t.id===tab)?.l}</div>
              <div style={{color:S.tx3,fontSize:12,marginTop:2}}>{MONTHS[month]} {year} · Notion</div>
            </div>
            {tab==="resumen"    && <Resumen    entries={entries} month={month} year={year}/>}
            {tab==="resultados" && <Resultados entries={entries}/>}
            {tab==="flujo"      && <Flujo      entries={entries}/>}
            {tab==="balance"    && <Balance    entries={entries}/>}
          </div>
        </div>
      </div>
    </div>
  );
}
