import axios from "axios";

/*
 * SMS-Telefonbestaetigung (OTP) beim Checkout — eigener Dienst (otp.pizzawangen.ch),
 * NICHT die Shop-API. Die Bestell-API (/api/Cart/order) wird hier nie aufgerufen.
 *
 * Vertrag des OTP-Dienstes:
 *  GET  /api/Otp/status  -> 200 { ok:true, required:boolean }
 *  POST /api/Otp/send    Body { phone }                    -> 200 { ok:true, already_verified? }
 *  POST /api/Otp/verify  Body { phone, code, deviceToken } -> 200 bei Erfolg, 400 { ok:false, error } sonst
 *  Header X-Device-Token + withCredentials bei send und verify (Cookie rs_session fuer .pizzawangen.ch).
 *  Fehler: { ok:false, error }.
 */

/** Basis-URL des OTP-Dienstes (ohne trailing slash). */
export function getOtpBaseUrl() {
  const raw = import.meta.env.VITE_OTP_SERVER;
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().replace(/\/+$/, "");
  }
  return "https://otp.pizzawangen.ch";
}

const OTP_TIMEOUT_MS = 30_000;
const STATUS_TIMEOUT_MS = 4_000;
const PATH_STATUS = "/api/Otp/status";
const PATH_SEND = "/api/Otp/send";
const PATH_VERIFY = "/api/Otp/verify";
const DEVICE_STORAGE_KEY = "rs_dev";

let memoryDeviceToken = "";

const generateToken = () => {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch (_) {
    /* fallthrough */
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random()
    .toString(16)
    .slice(2)}`;
};

/** Zufälliger Geräte-Token, einmal erzeugt und in localStorage («rs_dev») gespeichert. */
export function getDeviceToken() {
  try {
    const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (stored) {
      memoryDeviceToken = stored;
      return stored;
    }
  } catch (_) {
    /* localStorage nicht verfügbar */
  }
  if (!memoryDeviceToken) {
    memoryDeviceToken = generateToken();
    try {
      localStorage.setItem(DEVICE_STORAGE_KEY, memoryDeviceToken);
    } catch (_) {
      /* nur im Speicher halten */
    }
  }
  return memoryDeviceToken;
}

/** Header NUR für Aufrufe an den OTP-Dienst (nie für die Shop-API senden: CORS-Preflight). */
const deviceHeaders = () => ({
  "Content-Type": "application/json",
  "X-Device-Token": getDeviceToken(),
});

const buildSendBody = (phone) => ({ phone });
const buildVerifyBody = (phone, code) => ({ phone, code, deviceToken: getDeviceToken() });

/** Wandelt einen axios-Fehler in eine deutsche Meldung um. Unterstützt { ok:false, error } und { code, message }. */
export function classifyOtpError(err, kind) {
  if (!err?.response) {
    return "Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.";
  }
  const status = err.response.status;
  const d = err.response.data;
  const serverText =
    (typeof d?.error === "string" && d.error.trim()) ||
    (typeof d?.message === "string" && d.message.trim()) ||
    (typeof d === "string" && d.trim()) ||
    "";

  if (serverText && status >= 400 && status < 500) return serverText;
  if (status === 429) {
    return "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es später erneut.";
  }
  if (kind === "verify" && status >= 400 && status < 500) {
    return "Der Code ist falsch oder abgelaufen. Bitte versuchen Sie es erneut.";
  }
  if (kind === "send" && status >= 400 && status < 500) {
    return "Der Code konnte nicht gesendet werden. Bitte prüfen Sie die Telefonnummer.";
  }
  return "Serverfehler. Bitte versuchen Sie es später erneut.";
}

const post = (path, body) =>
  axios.post(`${getOtpBaseUrl()}${path}`, body, {
    headers: deviceHeaders(),
    withCredentials: true,
    timeout: OTP_TIMEOUT_MS,
  });

/**
 * Ist die SMS-Bestätigung aktuell Pflicht? Fail-open: bei jedem Fehler (Dienst nicht
 * erreichbar, Timeout, CORS, ungültige Antwort) -> false, damit nie eine Bestellung blockiert wird.
 */
export async function getOtpRequired() {
  try {
    const res = await axios.get(`${getOtpBaseUrl()}${PATH_STATUS}`, {
      withCredentials: true,
      timeout: STATUS_TIMEOUT_MS,
    });
    return res?.status === 200 && res?.data?.required === true;
  } catch (_) {
    return false;
  }
}

/** Gibt { alreadyVerified } zurück. */
export async function sendOtp(phone) {
  const res = await post(PATH_SEND, buildSendBody(phone));
  return { alreadyVerified: res?.data?.already_verified === true };
}

export async function verifyOtp(phone, code) {
  const res = await post(PATH_VERIFY, buildVerifyBody(phone, code));
  return res.status === 200 && res?.data?.ok !== false;
}
