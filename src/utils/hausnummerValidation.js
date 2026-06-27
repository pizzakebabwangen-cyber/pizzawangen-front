/**
 * Swiss-style house numbers: "12", "12a", "12A", "12–14", "12/14", "12 bis" not required (letters short).
 */
export function isValidSwissHausnummer(value) {
  const s = String(value || "").trim();
  if (!s) return false;
  return /^[0-9]{1,6}([a-zA-Z\u00C0-\u024F]{1,6})?(\s*[-–\/]\s*[0-9]{1,4}([a-zA-Z\u00C0-\u024F]{0,6})?)?$/u.test(
    s
  );
}

/** CH mobile/landline: digits only; +41… or 0… typical lengths. */
export function isValidSwissPhoneInput(value) {
  const d = String(value || "").replace(/\D/g, "");
  if (d.length < 9) return false;
  if (d.startsWith("41")) return d.length >= 11;
  if (d.startsWith("0")) return d.length >= 10;
  return d.length >= 9;
}
