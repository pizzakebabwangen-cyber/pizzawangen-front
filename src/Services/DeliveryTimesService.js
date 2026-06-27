import { apiUrl, getApiBaseCandidatesFor404Retry } from "../config/apiBase.js";

/** Gleiche Host-Reihenfolge-Idee wie Gutscheine: zuerst aktuelle Origin (wenn API unter gleicher Domain), dann VITE_SERVER, Fallback, runasp. */
function basesForOrderTimes() {
  const list = [];
  const seen = new Set();
  const push = (b) => {
    if (typeof b !== "string" || !b.trim()) return;
    const n = b.trim().replace(/\/+$/, "");
    if (seen.has(n)) return;
    seen.add(n);
    list.push(n);
  };
  if (typeof window !== "undefined" && window.location?.origin) {
    push(window.location.origin.replace(/\/+$/, ""));
  }
  for (const b of getApiBaseCandidatesFor404Retry()) push(b);
  return list;
}

const PATH = "/api/Company/available-order-times";

const DeliveryTimesService = {
  getDeliveryTimes: async () => {
    const bases = basesForOrderTimes();
    let lastProblem = null;
    for (const base of bases) {
      const url = apiUrl(PATH, base);
      try {
        const res = await fetch(url, { credentials: "include" });
        const text = await res.text();
        if (!res.ok || !text) {
          lastProblem = `HTTP ${res.status}`;
          continue;
        }
        try {
          return JSON.parse(text);
        } catch {
          lastProblem = "not-json";
          continue;
        }
      } catch (e) {
        lastProblem = e?.message || "network";
      }
    }
    if (lastProblem) {
      console.warn("[DeliveryTimesService] available-order-times failed on all bases:", lastProblem);
    }
    return null;
  },
};

export default DeliveryTimesService;
