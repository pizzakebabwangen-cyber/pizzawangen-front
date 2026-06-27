/** Antwort von ASP.NET / axios (String, ProblemDetails, Validation) → eine Zeile für den Toast */
export function extractOrderErrorMessage(err) {
  const d = err?.response?.data;
  if (typeof d === "string" && d.trim()) return d.trim();
  if (d && typeof d === "object" && d.value == null && d.result != null) {
    const r = d.result;
    if (typeof r === "string" && r.trim()) return r.trim();
    const inner = r?.value ?? r?.Value;
    if (typeof inner === "string" && inner.trim()) return inner.trim();
    if (inner && typeof inner === "object") {
      if (typeof inner.detail === "string" && inner.detail.trim())
        return inner.detail.trim();
      if (typeof inner.title === "string" && inner.title.trim())
        return inner.title.trim();
    }
    if (typeof r?.detail === "string" && r.detail.trim()) return r.detail.trim();
    if (typeof r?.title === "string" && r.title.trim()) return r.title.trim();
  }
  if (d?.errors && typeof d.errors === "object") {
    const flat = Object.values(d.errors).flat();
    const joined = flat.map((x) => String(x)).filter(Boolean).join(" ");
    if (joined) return joined;
  }
  if (d?.detail) return String(d.detail);
  if (d?.title && d?.detail) return `${d.title}: ${d.detail}`;
  if (d?.message) return String(d.message);
  if (d?.Message) return String(d.Message);
  if (d?.title) return String(d.title);
  return err?.message || "Bestellung fehlgeschlagen.";
}
