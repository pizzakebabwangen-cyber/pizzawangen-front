import { useDispatch } from "react-redux";
import "./DeliveryMethod.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { handleDeliveryMethod } from "../../reduxTool/DeliverySlice";
import { useAvailability } from "../../context/AvailabilityContext.jsx";
import useGetDelivery from "../../hooks/useGetDelivery";

const POSTCODE_STORAGE_KEY = "wangen-delivery-postcode";
const POSTCODE_CITY_STORAGE_KEY = "wangen-delivery-city";

const GEO_FETCH_MS = 10_000;

function geoFetchInit() {
  try {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      return { signal: AbortSignal.timeout(GEO_FETCH_MS) };
    }
  } catch {
    /* ignore */
  }
  return {};
}

const extractPlz = (value) => {
  const m = String(value || "").match(/\d{4}/);
  return m ? m[0] : "";
};

const joinStreetAndHouse = (street, houseNumber) =>
  [String(street || "").trim(), String(houseNumber || "").trim()]
    .filter(Boolean)
    .join(" ")
    .trim();

const splitStreetAndHouseNumber = (value) => {
  const raw = String(value || "").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  if (!raw) return { street: "", houseNumber: "" };
  const endMatch = raw.match(/^(.+?)\s+(\d+[a-zA-Z]?(?:\s*[-/]\s*\d+[a-zA-Z]?)?)$/);
  if (endMatch) {
    return {
      street: endMatch[1].trim(),
      houseNumber: endMatch[2].replace(/\s+/g, "").trim(),
    };
  }
  const startMatch = raw.match(/^(\d+[a-zA-Z]?(?:\s*[-/]\s*\d+[a-zA-Z]?)?)\s+(.+)$/);
  if (startMatch) {
    return {
      street: startMatch[2].trim(),
      houseNumber: startMatch[1].replace(/\s+/g, "").trim(),
    };
  }
  return { street: raw, houseNumber: "" };
};

const splitNominatimDisplayName = (displayName) => {
  const parts = String(displayName || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const first = parts[0] || "";
  const second = parts[1] || "";
  const firstIsHouseNumber = /^\d+[a-zA-Z]?(?:\s*[-/]\s*\d+[a-zA-Z]?)?$/.test(first);

  if (firstIsHouseNumber && second) {
    return {
      street: second,
      houseNumber: first.replace(/\s+/g, ""),
    };
  }

  return splitStreetAndHouseNumber(first);
};

/** PLZ aus Photon-Properties (manchmal fehlt postcode, steckt aber in name/Ort). */
const extractPlzFromPhotonProps = (p) => {
  if (!p) return "";
  const fromPostcode = String(p.postcode ?? "").match(/\d{4}/);
  if (fromPostcode) return fromPostcode[0];
  const blob = [
    p.name,
    p.street,
    p.city,
    p.town,
    p.village,
    p.district,
    p.locality,
    p.county,
    p.state,
  ]
    .filter(Boolean)
    .join(" ");
  const m = blob.match(/\b\d{4}\b/);
  return m ? m[0] : "";
};

/** Photon Forward: wenn Reverse/BDc keine PLZ liefern (z. B. CH-Grenzfälle). */
const photonSearchFirstPlzCh = async (query) => {
  const q = String(query || "").trim();
  if (q.length < 3) return null;
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=de`;
  const res = await fetch(url, { cache: "no-store", mode: "cors", ...geoFetchInit() });
  if (!res.ok) return null;
  const data = await res.json();
  const feats = Array.isArray(data?.features) ? data.features : [];
  for (const f of feats) {
    const p = f?.properties;
    if (!p) continue;
    if (String(p.countrycode || "").toLowerCase() !== "ch") continue;
    const pc = extractPlzFromPhotonProps(p);
    if (!pc) continue;
    const city = p.city || p.town || p.village || p.district || p.locality || "";
    const hn = String(p.housenumber || "").trim();
    const st = String(p.street || "").trim();
    return { postcode: pc, city, street: st, houseNumber: hn, props: p };
  }
  return null;
};

/** Fallback wenn Photon unvollständig ist. */
const reverseGeocodeNominatim = async (lat, lon) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&addressdetails=1&zoom=18&email=info%40pizzawangen.ch`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "de",
    },
    ...geoFetchInit(),
  });
  if (!res.ok) throw new Error("nominatim-fail");
  const data = await res.json();
  const addr = data?.address || {};
  const fromAddr = String(addr.postcode ?? "").match(/\d{4}/);
  let postcode = fromAddr ? fromAddr[0] : "";
  if (!postcode) {
    const m2 = String(data?.display_name || "").match(/\b\d{4}\b/);
    postcode = m2 ? m2[0] : "";
  }
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.hamlet ||
    "";
  let street = String(addr.road || addr.pedestrian || addr.path || "").trim();
  let houseNumber = String(addr.house_number || "").trim();
  if (!houseNumber) {
    const split = splitNominatimDisplayName(data?.display_name);
    if (!street && split.street) street = split.street;
    houseNumber = split.houseNumber;
  }
  return { postcode, city, street, houseNumber };
};

/** CORS-freundlicher Fallback wenn Photon/Nominatim blockiert oder leer sind. */
const reverseGeocodeBigDataCloud = async (lat, lon) => {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&localityLanguage=de`;
  const res = await fetch(url, { cache: "no-store", mode: "cors", ...geoFetchInit() });
  if (!res.ok) throw new Error("bdc-fail");
  const data = await res.json();
  let postcode = "";
  const m = String(data?.postcode ?? "").match(/\d{4}/);
  if (m) postcode = m[0];
  if (!postcode) {
    const m2 = String(data?.locality ?? data?.city ?? "").match(/\b\d{4}\b/);
    postcode = m2 ? m2[0] : "";
  }
  const city =
    data?.city ||
    data?.locality ||
    data?.principalSubdivision ||
    "";
  const street = String(data?.streetName || "").trim();
  const houseNumber = String(
    data?.streetNumber ||
      data?.houseNumber ||
      data?.localityInfo?.informative?.find?.((x) => x?.name === "houseNumber")?.description ||
      ""
  ).trim();
  return { postcode, city, street, houseNumber, locality: String(data?.locality || "").trim() };
};

/** Photon Reverse — für CH meist zuverlässig inkl. PLZ. */
const reverseGeocodePhoton = async (lat, lon) => {
  const url = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&lang=de`;
  const photonRes = await fetch(url, { cache: "no-store", mode: "cors", ...geoFetchInit() });
  if (!photonRes.ok) throw new Error("photon-http");
  const data = await photonRes.json();
  const p = data?.features?.[0]?.properties;
  if (!p) return null;
  const pc = extractPlzFromPhotonProps(p);
  const fromName = splitStreetAndHouseNumber(p.name);
  const hn = String(p.housenumber || "").trim() || fromName.houseNumber;
  const st = String(p.street || "").trim() || fromName.street;
  const city = p.city || p.town || p.village || p.district || p.locality || "";
  const country = p.country || (String(p.countrycode || "").toLowerCase() === "ch" ? "Schweiz" : "");
  return { postcode: pc, city, street: st, houseNumber: hn, country };
};

/** Eine Zeile wie in der Referenz-App (Strasse, PLZ Ort, Land). */
const buildGeoDisplayLine = ({ street, houseNumber, postcode, city, country }) => {
  const plzOrt = [postcode, city].filter(Boolean).join(" ").trim();
  const land = country || "Schweiz";
  const parts = [joinStreetAndHouse(street, houseNumber), plzOrt, land].filter((x) => String(x || "").trim());
  return parts.join(", ");
};

/** Begrüssung nach Uhrzeit in Europe/Zürich (24h). Ab 4:00 «Morgen» (z. B. 04:47), nicht erst ab 5:00. */
function getZurichGreeting() {
  try {
    const fmt = new Intl.DateTimeFormat("de-CH", {
      timeZone: "Europe/Zurich",
      hour: "numeric",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const hour = parseInt(parts.find((x) => x.type === "hour")?.value ?? "12", 10);
    if (hour >= 4 && hour < 12) return "Guten Morgen";
    if (hour >= 12 && hour < 18) return "Guten Tag";
    return "Guten Abend";
  } catch {
    return "Guten Tag";
  }
}

const DeliveryMethod = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [postcode, setPostcode] = useState(localStorage.getItem(POSTCODE_STORAGE_KEY) || "");
  const [postcodeFocused, setPostcodeFocused] = useState(false);
  const [postcodeViewValue, setPostcodeViewValue] = useState(localStorage.getItem(POSTCODE_STORAGE_KEY) || "");
  const [postcodeError, setPostcodeError] = useState("");
  const [geoBusy, setGeoBusy] = useState(false);
  /** Zeile unter «Aktueller Standort» — erkannte Adresse (wie Referenz-UI). */
  const [geoResolvedLine, setGeoResolvedLine] = useState("");
  /** Sync-Effect während GPS blockieren (Blur-Reihenfolge Desktop). */
  const geoGestureLockRef = useRef(false);
  const { isAvailable: deliveryNow, isPickupAvailable, isPreorderAllowed, ready } = useAvailability();
  const { getDelivery, deliveryData, loading: deliveryAreasLoading } = useGetDelivery();

  /** Liefern/Vorbestellung: gleiche Freigabe wie bisher. Abholen: auch wenn nur Abhol-Fenster (z. B. Mittagslücke) laut API offen ist. */
  const canLiefern = ready && isPreorderAllowed;
  const canAbholen = ready && (isPreorderAllowed || isPickupAvailable);

  /** Liefergebiete erst bei «Liefern» laden — weniger Konkurrenz mit Availability, schnelleres erstes UI. */
  useEffect(() => {
    if (selectedMethod === "delivery") getDelivery();
  }, [selectedMethod, getDelivery]);

  useEffect(() => {
    if (selectedMethod === "delivery" && !canLiefern) setSelectedMethod(null);
    if (selectedMethod === "collect" && !canAbholen) setSelectedMethod(null);
  }, [canLiefern, canAbholen, selectedMethod]);

  const getDeliveryAreasByPlz = useCallback(
    (plz) => {
      if (!plz || !deliveryData?.length) return null;
      const normalizedPlz = String(plz).trim().toLowerCase();
      return deliveryData.filter((d) => {
        const dbPostBox = String(d.postBox ?? d.PostBox ?? "")
          .trim()
          .toLowerCase();
        return dbPostBox === normalizedPlz;
      });
    },
    [deliveryData]
  );

  const setMethod = (method) => {
    setSelectedMethod(method);
    setPostcodeError("");
    setGeoResolvedLine("");
  };

  const handleSelectdMethod = useCallback(() => {
    if (!selectedMethod) return;

    const cleanPlz = extractPlz(postcodeViewValue || postcode);
    if (!cleanPlz) {
      setPostcodeError("Bitte Postleitzahl eingeben.");
      return;
    }
    localStorage.setItem(POSTCODE_STORAGE_KEY, cleanPlz);

    if (selectedMethod === "delivery") {
      if (!deliveryData?.length) {
        setPostcodeError(
          "Liefergebiete konnten nicht geladen werden. Bitte Seite neu laden oder später erneut versuchen."
        );
        return;
      }
      const areas = getDeliveryAreasByPlz(cleanPlz);
      if (!areas || areas.length === 0) {
        setPostcodeError("Diese PLZ liegt ausserhalb unseres Liefergebiets.");
        return;
      }
      const firstArea = areas[0];
      const pb = firstArea.postBox ?? firstArea.PostBox ?? cleanPlz;
      const ct = firstArea.city ?? firstArea.City ?? "";
      localStorage.setItem(POSTCODE_CITY_STORAGE_KEY, `${pb} ${ct}`.trim());
      if (!deliveryNow) {
        dispatch(handleDeliveryMethod("vorbestellung"));
      } else {
        dispatch(handleDeliveryMethod("delivery"));
      }
    } else {
      const areas = getDeliveryAreasByPlz(cleanPlz);
      if (areas && areas.length > 0) {
        const firstArea = areas[0];
        const pb = firstArea.postBox ?? firstArea.PostBox ?? cleanPlz;
        const ct = firstArea.city ?? firstArea.City ?? "";
        localStorage.setItem(POSTCODE_CITY_STORAGE_KEY, `${pb} ${ct}`.trim());
      } else {
        localStorage.removeItem(POSTCODE_CITY_STORAGE_KEY);
      }
      dispatch(handleDeliveryMethod("collect"));
    }
    setPostcodeError("");
    setOpenDialog(false);
    navigate("/menue");
  }, [
    selectedMethod,
    postcodeViewValue,
    postcode,
    dispatch,
    deliveryNow,
    deliveryData,
    getDeliveryAreasByPlz,
    navigate,
  ]);

  const cleanPostcode = extractPlz(postcodeViewValue);
  const geoSubtitlePlz = extractPlz(geoResolvedLine);
  const showGeoSubtitle =
    Boolean(geoResolvedLine) && (!cleanPostcode || geoSubtitlePlz === cleanPostcode);
  const matchedAreas = selectedMethod === "delivery" ? getDeliveryAreasByPlz(cleanPostcode) || [] : [];
  const cityPreview =
    matchedAreas.length > 0
      ? `${cleanPostcode} ${Array.from(
          new Set(matchedAreas.map((a) => a.city ?? a.City).filter(Boolean))
        ).join(" / ")}`
      : "";

  useEffect(() => {
    // Während GPS läuft kein Sync: sonst blur durch Klick auf «Aktueller Standort» setzt die alte PLZ zurück,
    // bevor fillFromCoords die neue schreibt (8004 im Feld, 8001 in der Geo-Zeile).
    if (postcodeFocused || geoBusy || geoGestureLockRef.current) return;
    if (selectedMethod !== "delivery") {
      setPostcodeViewValue(cleanPostcode);
      return;
    }
    setPostcodeViewValue(cityPreview || cleanPostcode);
  }, [postcodeFocused, geoBusy, selectedMethod, cityPreview, cleanPostcode]);

  const releaseGeoGestureLock = () => {
    queueMicrotask(() => {
      geoGestureLockRef.current = false;
    });
  };

  const beginGeo = () => {
    if (geoBusy) return;
    geoGestureLockRef.current = true;
    setGeoResolvedLine("");
    setGeoBusy(true);
    let hardStopFired = false;
    const hardStopTimer =
      typeof window !== "undefined"
        ? window.setTimeout(() => {
            hardStopFired = true;
            setGeoBusy(false);
            toast.error("Standort dauert zu lange. Bitte erneut versuchen oder PLZ manuell eingeben.");
            releaseGeoGestureLock();
          }, 35_000)
        : null;
    const clearHardStop = () => {
      if (hardStopTimer != null && typeof window !== "undefined") {
        window.clearTimeout(hardStopTimer);
      }
    };
    if (!navigator.geolocation) {
      toast.error("Standort wird von diesem Gerät nicht unterstützt.");
      clearHardStop();
      setGeoBusy(false);
      releaseGeoGestureLock();
      return;
    }
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      toast.error("Standort funktioniert nur über eine sichere Verbindung (HTTPS).");
      clearHardStop();
      setGeoBusy(false);
      releaseGeoGestureLock();
      return;
    }

    const geoRead = (options) =>
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

    const fillFromCoords = async (latitude, longitude) => {
      let pc = "";
      let street = "";
      let houseNumber = "";
      let city = "";
      let country = "Schweiz";
      let bdcLocality = "";

      // 1) Photon Reverse — in der CH meist PLZ + Ort + Strasse
      try {
        const ph = await reverseGeocodePhoton(latitude, longitude);
        if (ph) {
          if (ph.postcode) pc = ph.postcode;
          if (ph.city) city = ph.city;
          if (ph.street) street = ph.street;
          if (ph.houseNumber) houseNumber = ph.houseNumber;
          if (ph.country) country = ph.country;
        }
      } catch {
        /* Netzwerk / Blocker */
      }

      // 2) Nominatim (kann im Browser an CORS scheitern — optional)
      if (!pc || !city || !street || !houseNumber) {
        try {
          const nom = await reverseGeocodeNominatim(latitude, longitude);
          if (!pc && nom.postcode) pc = nom.postcode;
          if (!city && nom.city) city = nom.city;
          if (!street && nom.street) street = nom.street;
          if (!houseNumber && nom.houseNumber) houseNumber = nom.houseNumber;
        } catch {
          /* CORS oder Rate-Limit */
        }
      }

      // 3) BigDataCloud (CORS-frei; PLZ in CH oft leer — Ort/Locality nützlich)
      if (!pc || !city || !street || !houseNumber) {
        try {
          const bd = await reverseGeocodeBigDataCloud(latitude, longitude);
          if (!pc && bd.postcode) pc = bd.postcode;
          if (!city && bd.city) city = bd.city;
          if (!street && bd.street) street = bd.street;
          if (!houseNumber && bd.houseNumber) houseNumber = bd.houseNumber;
          bdcLocality = bd.locality || "";
          if (!city && bdcLocality) city = bdcLocality;
        } catch {
          /* ignorieren */
        }
      }

      // 4) Letzter Fallback: Photon-Suche nach Ort (wenn nur Gemeinde ohne PLZ)
      if (!pc && (city || bdcLocality)) {
        const searchSeed = [bdcLocality || city, "Schweiz"].filter(Boolean).join(" ");
        const hit = await photonSearchFirstPlzCh(searchSeed);
        if (hit) {
          pc = hit.postcode;
          if (!city && hit.city) city = hit.city;
          if (!street && hit.street) street = hit.street;
          if (!houseNumber && hit.houseNumber) houseNumber = hit.houseNumber;
        }
      }

      if (!pc) {
        toast.error("Keine Postleitzahl am aktuellen Standort ermittelbar. Bitte PLZ manuell eingeben.");
        setGeoResolvedLine("");
        return;
      }

      const displayLine = buildGeoDisplayLine({
        street,
        houseNumber,
        postcode: pc,
        city,
        country: country || "Schweiz",
      });
      setGeoResolvedLine(displayLine);

      setPostcodeFocused(true);
      setPostcode(pc);
      setPostcodeViewValue(pc);
      setPostcodeError("");
      localStorage.setItem(POSTCODE_STORAGE_KEY, pc);
      if (city) {
        localStorage.setItem(POSTCODE_CITY_STORAGE_KEY, `${pc} ${city}`);
      }
      if (typeof window !== "undefined") {
        if (displayLine) {
          window.localStorage.setItem("wangen-geo-full-address-hint", displayLine);
        }
        if (street) {
          window.localStorage.setItem("wangen-geo-street-hint", joinStreetAndHouse(street, houseNumber));
        }
        window.localStorage.setItem(
          "wangen-geo-address-hint",
          JSON.stringify({ street, houseNumber, postcode: pc, city })
        );
      }
      toast.success(
        displayLine.length > 12
          ? "Standort übernommen — Adresse unten prüfen, PLZ in der Kasse bestätigen."
          : city
            ? `PLZ ${pc} und Ort übernommen — Strasse in der Kasse prüfen.`
            : `PLZ ${pc} übernommen — Strasse und Ort in der Kasse prüfen.`
      );
    };

    (async () => {
      try {
        // Immer zuerst hohe Genauigkeit: «coarse first» auf Desktop lieferte oft eine weit entfernte
        // WLAN-/IP-Position (z. B. Zürich) bevor GPS nachjustiert — Nutzer sehen beim ersten Tippen die falsche PLZ.
        const optionSets = [
          { enableHighAccuracy: true, maximumAge: 0, timeout: 28_000 },
          { enableHighAccuracy: false, maximumAge: 0, timeout: 24_000 },
          { enableHighAccuracy: false, maximumAge: 120_000, timeout: 22_000 },
        ];
        let pos;
        let lastErr;
        for (const opts of optionSets) {
          try {
            pos = await geoRead(opts);
            lastErr = null;
            break;
          } catch (e) {
            lastErr = e;
            if (e && e.code === 1) break;
          }
        }
        if (!pos) {
          const c = lastErr?.code;
          if (c === 1) {
            toast.error(
              "Standort-Zugriff verweigert. Bitte in den Browser-Einstellungen für diese Seite erlauben oder PLZ eingeben."
            );
          } else if (c === 2) {
            toast.error("Standort konnte nicht ermittelt werden. Bitte PLZ manuell eingeben.");
          } else if (c === 3) {
            toast.error("Standort-Timeout. Bitte erneut versuchen oder PLZ eingeben.");
          } else {
            toast.error("Standort-Zugriff nicht möglich. Bitte PLZ manuell eingeben.");
          }
          return;
        }
        const { latitude, longitude } = pos.coords;
        await fillFromCoords(latitude, longitude);
      } catch (err) {
        if (err && err.code === 1) {
          toast.error("Standort-Zugriff verweigert. Bitte PLZ manuell eingeben.");
        } else {
          toast.error("Standort-Zugriff nicht möglich. Bitte PLZ manuell eingeben.");
        }
      } finally {
        clearHardStop();
        if (hardStopFired) return;
        setGeoBusy(false);
        releaseGeoGestureLock();
      }
    })();
  };

  const greeting = getZurichGreeting();

  return (
    <div
      className="deliveryMethodContainer"
      style={{ display: openDialog ? "flex" : "none" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-choice-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container"
      >
        <h2 id="delivery-choice-title">{greeting}</h2>

        <div className="methods methods-primary">
          <div
            className={`method ${selectedMethod === "delivery" ? "selected" : ""} ${!canLiefern ? "disabled" : ""}`}
            onClick={() => {
              if (canLiefern) setMethod("delivery");
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (canLiefern) setMethod("delivery");
              }
            }}
          >
            <input
              type="radio"
              id="delivery"
              name="delivery"
              value="delivery"
              disabled={!canLiefern}
              checked={selectedMethod === "delivery"}
              onChange={() => {
                if (canLiefern) setMethod("delivery");
              }}
            />
            <label htmlFor="delivery" style={!canLiefern ? { opacity: 0.55 } : undefined}>
              <span className="method-title">Liefern</span>
              <span className="method-sub">Wir bringen die Bestellung zu Ihnen</span>
            </label>
          </div>
          <div
            className={`method ${selectedMethod === "collect" ? "selected" : ""} ${!canAbholen ? "disabled" : ""}`}
            onClick={() => {
              if (canAbholen) setMethod("collect");
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (canAbholen) setMethod("collect");
              }
            }}
          >
            <input
              type="radio"
              id="collect"
              name="delivery"
              value="collect"
              disabled={!canAbholen}
              checked={selectedMethod === "collect"}
              onChange={() => {
                if (canAbholen) setMethod("collect");
              }}
            />
            <label htmlFor="collect" style={!canAbholen ? { opacity: 0.55 } : undefined}>
              <span className="method-title">Abholen</span>
              <span className="method-sub">Abholung im Restaurant</span>
            </label>
          </div>
        </div>

        {selectedMethod ? (
          <div className="postcode-block">
            <div className="postcode-wrap">
              <input
                id="postcode"
                type="text"
                inputMode="numeric"
                maxLength={postcodeFocused ? 4 : 40}
                placeholder="Postleitzahl"
                aria-label="Postleitzahl"
                autoComplete="postal-code"
                value={postcodeViewValue}
                onFocus={() => {
                  setPostcodeFocused(true);
                  setPostcodeViewValue(cleanPostcode);
                }}
                onBlur={() => {
                  setPostcodeFocused(false);
                }}
                onChange={(e) => {
                  const clean = String(e.target.value || "")
                    .replace(/\D+/g, "")
                    .slice(0, 4);
                  setPostcode(clean);
                  setPostcodeViewValue(clean);
                  if (postcodeError) setPostcodeError("");
                  setGeoResolvedLine("");
                }}
              />
              <button
                type="button"
                className="postcode-geo-btn postcode-geo-btn-row"
                disabled={geoBusy}
                aria-busy={geoBusy}
                aria-label="Aktuellen Standort mit GPS ermitteln"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => beginGeo()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    beginGeo();
                  }
                }}
              >
                <span className="postcode-geo-btn-title" aria-hidden>
                  <svg className="postcode-geo-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                  </svg>
                </span>
                <span className="postcode-geo-btn-text">
                  <span className="postcode-geo-btn-main">{geoBusy ? "Wird ermittelt …" : "Aktueller Standort"}</span>
                  {showGeoSubtitle ? (
                    <span className="postcode-geo-btn-sub">{geoResolvedLine}</span>
                  ) : null}
                </span>
              </button>
              {postcodeError ? (
                <p className="postcode-error" role="alert">
                  {postcodeError}
                </p>
              ) : null}
            </div>
            {selectedMethod === "delivery" && deliveryAreasLoading ? (
              <p className="postcode-hint" role="status">
                Liefergebiete werden geladen …
              </p>
            ) : null}
            {selectedMethod && !cleanPostcode ? (
              <p className="postcode-hint">
                Bitte 4-stellige PLZ eingeben oder «Aktueller Standort» tippen. Danach wird «Weiter zur Speisekarte»
                aktiv.
              </p>
            ) : null}
          </div>
        ) : null}

        <p className="delivery-gutschein-skip-wrap">
          <button
            type="button"
            className="delivery-gutschein-skip-btn"
            onClick={() => {
              dispatch(handleDeliveryMethod("collect"));
              setPostcodeError("");
              setOpenDialog(false);
              navigate("/gutscheine");
            }}
          >
            Nur Wertgutschein? Hier zur Bestellung — ohne Liefern/Abholen wählen
          </button>
        </p>

        <button
          type="button"
          className="delivery-continue-btn"
          disabled={
            !selectedMethod ||
            (selectedMethod === "delivery" && !canLiefern) ||
            (selectedMethod === "collect" && !canAbholen) ||
            !cleanPostcode ||
            (selectedMethod === "delivery" && deliveryAreasLoading)
          }
          title={
            !cleanPostcode && selectedMethod
              ? "PLZ (4 Ziffern) oder Standort wählen"
              : selectedMethod === "delivery" && deliveryAreasLoading
                ? "Liefergebiete werden geladen"
                : undefined
          }
          onClick={handleSelectdMethod}
        >
          Weiter zur Speisekarte
        </button>
      </motion.div>
    </div>
  );
};

export default DeliveryMethod;
