import axios from "axios";
import { getApiBaseUrl } from "../config/apiBase";

/*
 * SMS-Telefonbestaetigung (OTP) beim Checkout.
 *
 * Backend-Vertrag:
 *  POST /api/Otp/send    Body { phone }                    -> 200 { ok:true, already_verified? }
 *  POST /api/Otp/verify  Body { phone, code, deviceToken } -> 200 bei Erfolg, 400 { ok:false, error } sonst
 *  Header X-Device-Token + withCredentials bei send, verify und Cart/order.
 *  OTP-Fehler: { ok:false, error }.  CreateOrder-Fehler: { code, message }.
 */

const OTP_TIMEOUT_MS = 30_000;
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

/** Header für OTP- und Order-Aufrufe. */
export const deviceHeaders = () => ({
  "Content-Type": "application/json",
  "X-Device-Token": getDeviceToken(),
});

const buildSendBody = (phone) => ({ phone });
const buildVerifyBody = (phone, code) => ({ phone, code, deviceToken: getDeviceToken() });

const orderCode = (err) => {
  const data = err?.response?.data;
  return data?.code ?? data?.Code;
};

/** true, wenn die Antwort von /api/Cart/order «Nummer noch nicht bestaetigt» meldet. */
export function isPhoneNotVerifiedError(err) {
  return err?.response?.status === 409 && orderCode(err) === "PHONE_NOT_VERIFIED";
}

export function isInvalidPhoneError(err) {
  return err?.response?.status === 400 && orderCode(err) === "INVALID_PHONE";
}

export function isRateLimitedError(err) {
  return err?.response?.status === 429 && orderCode(err) === "RATE_LIMITED";
}

export function getPhoneFromNotVerifiedError(err) {
  const data = err?.response?.data;
  const p = data?.phone ?? data?.Phone;
  return typeof p === "string" ? p.trim() : "";
}

/**
 * Meldung für INVALID_PHONE / RATE_LIMITED aus CreateOrder ({ code, message }).
 * Gibt "" zurück, wenn der Fehler keiner dieser Fälle ist.
 */
export function getOrderPhoneOrRateMessage(err) {
  const msg = err?.response?.data?.message;
  const text = typeof msg === "string" ? msg.trim() : "";
  if (isInvalidPhoneError(err)) {
    return text || "Die Telefonnummer ist ungültig. Bitte prüfen Sie Ihre Eingabe.";
  }
  if (isRateLimitedError(err)) {
    return text || "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es später erneut.";
  }
  return "";
}

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
  axios.post(`${getApiBaseUrl()}${path}`, body, {
    headers: deviceHeaders(),
    withCredentials: true,
    timeout: OTP_TIMEOUT_MS,
  });

/** Gibt { alreadyVerified } zurück. */
export async function sendOtp(phone) {
  const res = await post(PATH_SEND, buildSendBody(phone));
  return { alreadyVerified: res?.data?.already_verified === true };
}

export async function verifyOtp(phone, code) {
  const res = await post(PATH_VERIFY, buildVerifyBody(phone, code));
  return res.status === 200 && res?.data?.ok !== false;
}
