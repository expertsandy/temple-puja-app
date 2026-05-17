import { useState } from "react";

const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4", success: "#2d7a4f", successBg: "#e8f5ee", pending: "#b8860b", pendingBg: "#fff8e1", cancelled: "#c0392b", cancelledBg: "#fde8e8" };
const inputStyle = { fontFamily: sansFont, fontSize: 14, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, width: "100%", boxSizing: "border-box", outline: "none", color: C.dark, background: "#fff" };
const labelStyle = { fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" };

// ─── Priests Admin Panel ───
export function PriestsAdmin({ priests, temples, registrations, onRefresh, dbAddPriest, dbUpdatePriest, dbDeletePriest, dbAssignPriest, dispatch }) {
  const [view, setView] = useState("list"); // list | add | edit | workload
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: 0 }}>👨‍🦱 Priests Management</h3>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setView("list")} style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${view === "list" ? C.saffron : C.border}`, cursor: "pointer", background: view === "list" ? C.saffronLight : "#fff", color: view === "list" ? C.saffron : C.mid }}>📋 List</button>
          <button onClick={() => setView("workload")} style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${view === "workload" ? C.saffron : C.border}`, cursor: "pointer", background: view === "workload" ? C.saffronLight : "#fff", color: view === "workload" ? C.saffron : C.mid }}>📊 Workload</button>
          <button onClick={() => { setView("add"); setEditing(null); }} style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: C.saffron, color: "#fff" }}>➕ Add Priest</button>
        </div>
      </div>

      {view === "list" && <PriestsList priests={priests} temples={temples} registrations={registrations} onEdit={(p) => { setEditing(p); setView("edit"); }} onDelete={async (id) => { if (!confirm("Remove this priest?")) return; await dbDeletePriest(id); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: "Priest removed" }); }} />}
      {view === "add" && <PriestForm temples={temples} onSave={async (p) => { await dbAddPriest(p); await onRefresh(); setView("list"); dispatch({ type: "SET_NOTIFICATION", payload: "Priest added!" }); }} onCancel={() => setView("list")} />}
      {view === "edit" && <PriestForm priest={editing} temples={temples} onSave={async (p) => { await dbUpdatePriest(p); await onRefresh(); setView("list"); dispatch({ type: "SET_NOTIFICATION", payload: "Priest updated!" }); }} onCancel={() => setView("list")} />}
      {view === "workload" && <PriestWorkload priests={priests} temples={temples} registrations={registrations} />}
    </div>
  );
}

// ─── Priests List ───
function PriestsList({ priests, temples, registrations, onEdit, onDelete }) {
  const activePriests = priests.filter(p => p.active);
  const inactivePriests = priests.filter(p => !p.active);

  const getAssignmentCount = (priestId) => {
    const today = new Date(); today.setHours(0,0,0,0);
    return registrations.filter(r => r.priestId === priestId && new Date(r.date) >= today).length;
  };

  const getTempleNames = (templeIds) => {
    if (!templeIds || templeIds.length === 0) return "—";
    return templeIds.map(id => temples.find(t => t.id === id)?.name || "Unknown").join(", ");
  };

  if (priests.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40, background: C.cream, borderRadius: 12, fontFamily: sansFont, color: C.light }}>
        <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>👨‍🦱</span>
        No priests added yet. Add your first priest to start assigning them to pujas.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {activePriests.map(p => (
        <div key={p.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.saffronLight, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, fontSize: 20, color: C.saffron, fontWeight: 700 }}>{p.name.charAt(0)}</div>
            <div>
              <h4 style={{ fontFamily: sansFont, fontSize: 15, fontWeight: 600, color: C.dark, margin: "0 0 2px" }}>{p.name}</h4>
              <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: 0 }}>{p.phone || "No phone"} {p.specializations ? `• ${p.specializations}` : ""}</p>
              <p style={{ fontFamily: sansFont, fontSize: 11, color: C.mid, margin: "2px 0 0" }}>🛕 {getTempleNames(p.temple_ids)}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: getAssignmentCount(p.id) > 0 ? C.goldLight : C.cream, color: getAssignmentCount(p.id) > 0 ? C.gold : C.light }}>
              {getAssignmentCount(p.id)} upcoming
            </span>
            <button onClick={() => onEdit(p)} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.saffron}`, background: "transparent", color: C.saffron, cursor: "pointer" }}>✏️ Edit</button>
            <button onClick={() => onDelete(p.id)} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.cancelled}`, background: "transparent", color: C.cancelled, cursor: "pointer" }}>🗑️</button>
          </div>
        </div>
      ))}
      {inactivePriests.length > 0 && (
        <>
          <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, marginTop: 12, marginBottom: 4 }}>Inactive Priests</p>
          {inactivePriests.map(p => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 20px", border: `1px solid ${C.border}`, opacity: 0.6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: sansFont, fontSize: 14, color: C.mid }}>{p.name} — {p.phone || "No phone"}</span>
              <button onClick={() => onEdit(p)} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.saffron}`, background: "transparent", color: C.saffron, cursor: "pointer" }}>✏️ Edit</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Priest Form (Add/Edit) ───
function PriestForm({ priest, temples, onSave, onCancel }) {
  const [f, setF] = useState({
    name: priest?.name || "",
    phone: priest?.phone || "",
    email: priest?.email || "",
    specializations: priest?.specializations || "",
    temple_ids: priest?.temple_ids || [],
    notes: priest?.notes || "",
    active: priest?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const toggleTemple = (id) => {
    setF(x => ({ ...x, temple_ids: x.temple_ids.includes(id) ? x.temple_ids.filter(t => t !== id) : [...x.temple_ids, id] }));
  };

  const handleSubmit = async () => {
    if (!f.name) { alert("Enter priest name"); return; }
    setSaving(true);
    try {
      await onSave({ id: priest?.id || "pr_" + Date.now(), ...f });
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 560, background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: 0 }}>{priest ? "✏️ Edit Priest" : "➕ Add Priest"}</h3>
        <button onClick={onCancel} style={{ fontFamily: sansFont, fontSize: 13, color: C.saffron, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>← Back</button>
      </div>

      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Name *</label><input value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} placeholder="Pandit ji's full name" style={inputStyle} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div><label style={labelStyle}>Phone</label><input value={f.phone} onChange={e => setF(x => ({ ...x, phone: e.target.value }))} placeholder="Mobile number" style={inputStyle} type="tel" /></div>
        <div><label style={labelStyle}>Email</label><input value={f.email} onChange={e => setF(x => ({ ...x, email: e.target.value }))} placeholder="email@example.com" style={inputStyle} type="email" /></div>
      </div>
      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Specializations</label><input value={f.specializations} onChange={e => setF(x => ({ ...x, specializations: e.target.value }))} placeholder="e.g. Rudrabhishek, Ganesh Puja, Satyanarayan" style={inputStyle} /></div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Assigned Temples</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {temples.map(t => {
            const selected = f.temple_ids.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggleTemple(t.id)}
                style={{ fontFamily: sansFont, fontSize: 13, padding: "8px 14px", borderRadius: 8, cursor: "pointer", border: `1.5px solid ${selected ? C.saffron : C.border}`, background: selected ? C.saffronLight : "#fff", color: selected ? C.saffron : C.mid, fontWeight: selected ? 600 : 400 }}>
                {selected ? "✓ " : ""}{t.name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Notes</label><textarea value={f.notes} onChange={e => setF(x => ({ ...x, notes: e.target.value }))} placeholder="Internal notes about this priest" rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>

      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <input type="checkbox" id="priestActive" checked={f.active} onChange={e => setF(x => ({ ...x, active: e.target.checked }))} />
        <label htmlFor="priestActive" style={{ fontFamily: sansFont, fontSize: 14, color: C.dark, cursor: "pointer" }}>Active (available for assignments)</label>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleSubmit} disabled={saving} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1 }}>{saving ? "Saving..." : priest ? "💾 Update" : "➕ Add Priest"}</button>
        <button onClick={onCancel} style={{ fontFamily: sansFont, fontSize: 14, padding: "12px 20px", borderRadius: 10, border: `1.5px solid ${C.border}`, cursor: "pointer", background: "#fff", color: C.mid }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Priest Workload View ───
function PriestWorkload({ priests, temples, registrations }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = registrations.filter(r => new Date(r.date) >= today && r.status !== "cancelled");
  const activePriests = priests.filter(p => p.active);

  return (
    <div>
      <h4 style={{ fontFamily: sansFont, fontSize: 15, fontWeight: 700, color: C.dark, margin: "0 0 16px" }}>📊 Upcoming Assignments</h4>

      {activePriests.length === 0 ? (
        <p style={{ fontFamily: sansFont, color: C.light }}>No active priests.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {activePriests.map(p => {
            const assigned = upcoming.filter(r => r.priestId === p.id).sort((a,b) => new Date(a.date) - new Date(b.date));
            return (
              <div key={p.id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", background: C.cream, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.saffronLight, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, fontSize: 16, color: C.saffron, fontWeight: 700 }}>{p.name.charAt(0)}</div>
                    <div>
                      <h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: C.dark, margin: 0 }}>{p.name}</h4>
                      <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: 0 }}>{p.specializations || "General"}</p>
                    </div>
                  </div>
                  <span style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 700, color: assigned.length > 0 ? C.saffron : C.light }}>{assigned.length} upcoming</span>
                </div>
                {assigned.length > 0 ? (
                  <div style={{ padding: "10px 18px" }}>
                    {assigned.map(r => {
                      const temple = temples.find(t => t.id === r.templeId);
                      const pujaNames = temple ? temple.pujas.filter(pu => (r.pujaIds || []).includes(pu.id)).map(pu => pu.name).join(", ") : "—";
                      const daysLeft = Math.ceil((new Date(r.date) - today) / (1000*60*60*24));
                      return (
                        <div key={r.id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                          <div>
                            <p style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.dark, margin: 0 }}>{r.devoteeName} — {pujaNames}</p>
                            <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: "2px 0 0" }}>🛕 {temple?.name || "—"} • 📅 {r.date} • 👨‍👩‍👧‍👦 {r.members || 1}</p>
                          </div>
                          <span style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: daysLeft <= 1 ? C.saffronLight : C.goldLight, color: daysLeft <= 1 ? C.saffron : C.gold, whiteSpace: "nowrap" }}>
                            {daysLeft <= 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: "16px 18px", fontFamily: sansFont, fontSize: 13, color: C.light, fontStyle: "italic" }}>No upcoming assignments</div>
                )}
              </div>
            );
          })}

          {/* Unassigned registrations */}
          {(() => {
            const unassigned = upcoming.filter(r => !r.priestId);
            if (unassigned.length === 0) return null;
            return (
              <div style={{ background: C.pendingBg, borderRadius: 14, border: `1px solid ${C.pending}`, padding: "14px 18px" }}>
                <h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, color: C.pending, margin: "0 0 10px" }}>⚠️ Unassigned ({unassigned.length})</h4>
                {unassigned.map(r => {
                  const temple = temples.find(t => t.id === r.templeId);
                  return (
                    <div key={r.id} style={{ padding: "6px 0", fontFamily: sansFont, fontSize: 13, color: C.mid }}>
                      {r.devoteeName} — {temple?.name || "—"} — 📅 {r.date}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── Priest Assignment Widget (used inside registration detail) ───
export function PriestAssignment({ registration, priests, temples, onAssign }) {
  const [priestId, setPriestId] = useState(registration.priestId || "");
  const [notes, setNotes] = useState(registration.priestNotes || "");
  const [saving, setSaving] = useState(false);

  // Filter priests for this temple
  const temple = temples.find(t => t.id === registration.templeId);
  const availablePriests = priests.filter(p => p.active && (!p.temple_ids || p.temple_ids.length === 0 || p.temple_ids.includes(registration.templeId)));
  const assignedPriest = priests.find(p => p.id === priestId);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onAssign(registration.id, priestId || null, notes || null);
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div style={{ marginTop: 14, padding: "14px 16px", background: C.goldLight, borderRadius: 10, border: `1px solid ${C.gold}` }}>
      <div style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 700, color: C.maroon, marginBottom: 10 }}>👨‍🦱 Priest Assignment</div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <select value={priestId} onChange={e => setPriestId(e.target.value)} style={{ ...inputStyle, fontSize: 13, padding: "8px 12px", cursor: "pointer" }}>
            <option value="">— Not Assigned —</option>
            {availablePriests.map(p => <option key={p.id} value={p.id}>{p.name}{p.specializations ? ` (${p.specializations})` : ""}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes for priest (optional)" style={{ ...inputStyle, fontSize: 13, padding: "8px 12px" }} />
        </div>
        <button onClick={handleSave} disabled={saving} style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1, whiteSpace: "nowrap" }}>{saving ? "..." : "💾 Assign"}</button>
      </div>
      {assignedPriest && <p style={{ fontFamily: sansFont, fontSize: 12, color: C.success, margin: "8px 0 0" }}>✓ Assigned to {assignedPriest.name}</p>}
    </div>
  );
}
