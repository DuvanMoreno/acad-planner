// ═══════════════════════════════════════════════════════════════════
//  API SERVICE — comunicación con el backend Express
// ═══════════════════════════════════════════════════════════════════

const BASE = import.meta.env.VITE_API_URL || "/api";

// ── Token helpers ─────────────────────────────────────────────────
export const token = {
  get:    ()      => localStorage.getItem("acad_token"),
  set:    (t)     => localStorage.setItem("acad_token", t),
  clear:  ()      => localStorage.removeItem("acad_token"),
};

async function req(url, options = {}) {
  const t = token.get();
  const res = await fetch(`${BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    ...options,
  });

  // Token expirado o inválido → forzar logout
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));
    token.clear();
    // Disparar evento global para que App.jsx reaccione
    window.dispatchEvent(new CustomEvent("acad:logout", { detail: body.error }));
    throw new Error(body.error || "Sesión expirada");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Error de servidor");
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────
export const auth = {
  register: (data) => req("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login:    (data) => req("/auth/login",    { method: "POST", body: JSON.stringify(data) }),
  me:       ()     => req("/auth/me"),
};

// ── Subjects ──────────────────────────────────────────────────────
export const api = {
  getSubjects:   ()            => req("/subjects"),
  getArchived:   ()            => req("/subjects?archived=true"),
  createSubject: (data)        => req("/subjects",     { method: "POST",  body: JSON.stringify(data) }),
  updateSubject: (id, data)    => req(`/subjects/${id}`,{ method: "PUT",   body: JSON.stringify(data) }),
  deleteSubject: (id)          => req(`/subjects/${id}`,{ method: "DELETE" }),
  archiveSubject:(id)          => req(`/subjects/${id}/archive`, { method: "PATCH" }),
  updatePhases:  (id, phases)  => req(`/subjects/${id}/phases`,  { method: "PATCH", body: JSON.stringify({ phases }) }),
};

// ── Export / Import JSON ──────────────────────────────────────────
export function exportToJSON(subjects) {
  const blob = new Blob(
    [JSON.stringify({ exportedAt: new Date().toISOString(), subjects }, null, 2)],
    { type: "application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `semestre-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

export function importFromJSON(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => {
      try { res(JSON.parse(e.target.result)); }
      catch { rej(new Error("Archivo JSON inválido")); }
    };
    r.readAsText(file);
  });
}
