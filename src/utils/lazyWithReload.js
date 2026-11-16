import { lazy } from "react";
import { store } from "../reduxTool/store.jsx";

const RELOAD_KEY = "wangen-chunk-reload-at";

/** Der Warenkorb liegt nur im Redux-Speicher (nicht in localStorage): ein Reload wuerde ihn leeren. */
const cartHasItems = () => {
  try {
    const items = store.getState().cart?.items;
    return Array.isArray(items) && items.length > 0;
  } catch {
    return true; // im Zweifel nie neu laden
  }
};

/**
 * React.lazy mit Absicherung fuer veraltete Chunk-Dateien (nach einem Deploy heissen die Dateien anders):
 * Schlaegt das Nachladen fehl und der Warenkorb ist leer, wird die Seite hoechstens einmal pro 10 Sekunden
 * neu geladen, damit der Browser die aktuelle index.html und die neuen Chunk-Namen holt.
 * Enthaelt der Warenkorb Artikel, wird NIE neu geladen; der Fehler wird nur weitergereicht.
 * Nur fuer Seiten ausserhalb von Warenkorb/Kasse/Zahlung verwenden.
 */
export function lazyWithReload(factory) {
  return lazy(() =>
    factory().catch((error) => {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
        if (!cartHasItems() && Date.now() - last > 10000) {
          sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
          window.location.reload();
          return new Promise(() => {});
        }
      } catch {
        /* sessionStorage nicht verfuegbar: Fehler normal weiterreichen */
      }
      throw error;
    })
  );
}
