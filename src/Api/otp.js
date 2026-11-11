import axios from "axios";
import { getApiBaseUrl } from "../config/apiBase";

/*
 * SMS-Telefonbestaetigung (OTP) beim Checkout.
 *
 * ANNAHMEN (Backend-JSON ist nicht bekannt) – alles hier anpassbar:
 *  TODO: POST /api/Otp/send    Body { phone }        Erfolg = HTTP 200
 *  TODO: POST /api/Otp/verify  Body { phone, code }  Erfolg = HTTP 200
 *  TODO: Fehler-Erkennung (abgelaufen / zu viele Versuche) per Text in
 *        response.data.code | message | error – siehe classifyOtpError().
 *  Cookie-Session (rs_session / rs_dev) -> withCredentials: true.
 */

const OTP_TIMEOUT_MS = 30_000;
const PATH_SEND = "/api/Otp/send"; // TODO: ggf. anpassen
const PATH_VERIFY = "/api/Otp/verify"; // TODO: ggf. anpassen

const buildSendBody = (phone) => ({ phone }); // TODO
const buildVerifyBody = (phone, code) => ({ phone, code }); // TODO

/** true, wenn die Antwort von /api/Cart/order «Nummer noch nicht bestaetigt» meldet. */
export function isPhoneNotVerifiedError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const code = data?.code ?? data?.Code;
  return (status === 403 || status === 409) && code === "PHONE_NOT_VERIFIED";
}

export function getPhoneFromNotVerifiedError(err) {
  const data = err?.response?.data;
  const p = data?.phone ?? data?.Phone;
  return typeof p === "string" ? p.trim() : "";
}

/** Wandelt einen axios-Fehler in eine deutsche Meldung um. */
export function classifyOtpError(err, kind) {
  if (!err?.response) {
    return "Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.";
  }
  const status = err.response.status;
  const d = err.response.data;
  const text = [
    typeof d === "string" ? d : "",
    d?.code,
    d?.message,
    d?.error,
  ]
    .filter(Boolean)
    .join(" ");

  if (status === 429 || /rate|too.?many|zu viele/i.test(text)) {
    return "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es später erneut.";
  }
  if (/expired|abgelaufen/i.test(text)) {
    return "Der Code ist abgelaufen. Bitte fordern Sie einen neuen Code an.";
  }
  if (kind === "verify" && status >= 400 && status < 500) {
    return "Der Code ist falsch. Bitte prüfen Sie die Eingabe.";
  }
  if (kind === "send" && status >= 400 && status < 500) {
    return "Der Code konnte nicht gesendet werden. Bitte prüfen Sie die Telefonnummer.";
  }
  return "Serverfehler. Bitte versuchen Sie es später erneut.";
}

const post = (path, body) =>
  axios.post(`${getApiBaseUrl()}${path}`, body, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
    timeout: OTP_TIMEOUT_MS,
  });

export async function sendOtp(phone) {
  return post(PATH_SEND, buildSendBody(phone));
}

export async function verifyOtp(phone, code) {
  const res = await post(PATH_VERIFY, buildVerifyBody(phone, code));
  return res.status === 200; // TODO: ggf. res.data.verified prüfen
}
