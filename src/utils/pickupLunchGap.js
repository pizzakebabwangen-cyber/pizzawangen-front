/**
 * Mo–Do, Europe/Zürich: zwischen Ende Mittags-Lieferfenster (13:30) und Beginn Abend (16:00), exklusiv.
 * Entspricht dem Backend IsWeekdayDeliveryGapPickupAvailable.
 */
export function isMoDoLieferpauseZuerich(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zurich",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(
    parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  );
  const wd = map.weekday;
  const moDo = ["Mon", "Tue", "Wed", "Thu"].includes(wd);
  if (!moDo) return false;
  const h = parseInt(map.hour, 10);
  const min = parseInt(map.minute, 10);
  if (Number.isNaN(h) || Number.isNaN(min)) return false;
  const mins = h * 60 + min;
  return mins > 13 * 60 + 30 && mins < 16 * 60;
}
