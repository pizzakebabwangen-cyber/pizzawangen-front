/* eslint-disable no-unused-vars */
import "./CheckOutForm.css";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import checkOut from "../../assets/images/checkOut.jpg";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { successCheckOut } from "../../reduxTool/AuthContext";
import { clearCart } from "../../reduxTool/CartSlice";
import useGetUserData from "../../hook/useGetUserData";
import useGetDeliveryTimes from "../../hooks/useGetDeliveryTimes";
import { useAvailability } from "../../context/AvailabilityContext.jsx";
import {
  resolveVisitorId,
  normalizeVisitorId,
  readCheckoutUnlockedFlag,
  clearCheckoutSessionStorage,
  clearPersistedVisitorId,
  clearCheckoutUnlockedFlag,
  persistVisitorIdFromApiResponse,
  readPersistedVisitorId,
} from "../../utils/checkoutVisitorStorage.js";
import { mapCartItemsForApi } from "../../utils/mapCartItemsForApi.js";
import { clearPendingCashCheckout } from "../../utils/wangenPendingCashCheckout.js";
import { clearWangenCheckoutPaymentSession } from "../../utils/wangenPaymentSessionStorage.js";
import { getApiBaseUrl } from "../../config/apiBase.js";
import { extractOrderErrorMessage } from "../../utils/extractOrderErrorMessage.js";
import { extractPaymentPageUrl } from "../../utils/extractPaymentPageUrl.js";
import {
  isValidSwissHausnummer,
  isValidSwissPhoneInput,
} from "../../utils/hausnummerValidation.js";
import useGetDelivery from "../../hooks/useGetDelivery.jsx";
import { getDeliveryMinimumBlock } from "../../utils/deliveryMinimum.js";

const splitPlzCity = (value) => {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{4})\s*(.*)$/);
  if (!match) {
    return { postBox: "", city: raw };
  }
  return {
    postBox: match[1],
    city: String(match[2] || "").trim(),
  };
};

const focusCheckoutFieldById = (id) => {
  window.requestAnimationFrame(() => {
    const el = document.getElementById(id);
    el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    el?.focus?.({ preventScroll: true });
  });
};

/** Liefergebiete-Liste (normalisierte postBox) — wenn die API leer ist, nicht clientseitig blockieren. */
const isPlzInLiefergebieteRows = (fourDigitPlz, rows) => {
  const p = String(fourDigitPlz || "").trim();
  if (!/^\d{4}$/.test(p)) return true;
  if (!Array.isArray(rows) || rows.length === 0) return true;
  return rows.some((r) => String(r.postBox ?? r.PostBox ?? "").trim() === p);
};

/** Gleiche Keys wie DeliveryMethod / ShoppingCart — Kontext für Strassensuche */
const LS_DELIVERY_POSTCODE = "wangen-delivery-postcode";
const LS_DELIVERY_CITY = "wangen-delivery-city";

/** PLZ + Ort aus Kasse, localStorage (Lieferdialog) oder «PLZ / Ort»-Feld. */
const getEffectivePlzOrtContext = (postBox, cityField) => {
  let plz =
    String(postBox || "")
      .trim()
      .match(/\d{4}/)?.[0] || "";

  const fromCityField = splitPlzCity(cityField);
  if (fromCityField.postBox) plz = plz || fromCityField.postBox;
  let ort = fromCityField.city || String(cityField || "").trim();

  if ((!plz || !ort) && typeof localStorage !== "undefined") {
    const combined = (localStorage.getItem(LS_DELIVERY_CITY) || "").trim();
    if (combined) {
      const p = splitPlzCity(combined);
      if (!plz) plz = p.postBox;
      if (p.city) ort = p.city;
    }
    if (!plz) {
      const fromPc = (localStorage.getItem(LS_DELIVERY_POSTCODE) || "").match(/\d{4}/);
      if (fromPc) plz = fromPc[0];
    }
  }

  return { postBox: plz, city: ort };
};

const formatOrtForSearch = (ort) => {
  const raw = String(ort || "").trim();
  if (!raw) return "";
  return raw
    .split(/\s+/)
    .map((part) => {
      if (/^[a-z]{2}$/i.test(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
};

/** Suchstring für Photon: Strasse + PLZ + Ort (sonst findet z. B. „z“ einen anderen Wangen in der CH). */
const buildStreetSearchQuery = (streetTyped, postBox, cityField) => {
  const q = String(streetTyped || "").trim();
  const { postBox: plz, city: ort } = getEffectivePlzOrtContext(postBox, cityField);
  const tail = [plz, formatOrtForSearch(ort)].filter(Boolean).join(" ").trim();
  if (!tail) return q;
  return `${q} ${tail}`.trim();
};

/** Kurze Eingabe: zuerst «z PLZ Ort», bei 0 Treffern Fallback nur «PLZ Ort» (mehr Strassen). */
const buildPhotonStreetQuery = (streetTyped, postBox, cityField) =>
  buildStreetSearchQuery(streetTyped, postBox, cityField);

const buildPhotonPlzOrtOnlyQuery = (postBox, cityField) => {
  const { postBox: plz, city: ort } = getEffectivePlzOrtContext(postBox, cityField);
  return [plz, formatOrtForSearch(ort)].filter(Boolean).join(" ").trim();
};

/** 24, 24a, 1.1, 3a.1 — geo.admin hängt oft «.1» an die Hausnummer. */
const SWISS_HOUSE_NUMBER = String.raw`\d+[a-zA-Z]?(?:\.\d+[a-zA-Z]?)?(?:\s*[-/]\s*\d+[a-zA-Z]?(?:\.\d+[a-zA-Z]?)?)?`;
const SWISS_HOUSE_NUMBER_RE = new RegExp(`^${SWISS_HOUSE_NUMBER}$`);
const SWISS_HOUSE_NUMBER_END_RE = new RegExp(`^(.+?)\\s+(${SWISS_HOUSE_NUMBER})$`);
const SWISS_HOUSE_NUMBER_START_RE = new RegExp(`^(${SWISS_HOUSE_NUMBER})\\s+(.+)$`);

const splitStreetAndHouseNumber = (value) => {
  const raw = String(value || "").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  if (!raw) return { street: "", houseNumber: "" };

  const endMatch = raw.match(SWISS_HOUSE_NUMBER_END_RE);
  if (endMatch) {
    return {
      street: endMatch[1].trim(),
      houseNumber: endMatch[2].replace(/\s+/g, "").trim(),
    };
  }

  const startMatch = raw.match(SWISS_HOUSE_NUMBER_START_RE);
  if (startMatch) {
    return {
      street: startMatch[2].trim(),
      houseNumber: startMatch[1].replace(/\s+/g, "").trim(),
    };
  }

  return { street: raw, houseNumber: "" };
};

/** Strasse ohne Hausnummer, Nummer nur in houseNumber — auch wenn sie doppelt angehängt ist. */
const separateStreetAndHouse = (street, houseNumber) => {
  let name = String(street || "").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  let hn = String(houseNumber || "").replace(/\s+/g, "").trim();
  if (hn) {
    const escaped = hn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const stripped = name.replace(new RegExp(`(?:\\s+${escaped})+$`, "i"), "").trim();
    if (stripped) name = stripped;
  }
  const split = splitStreetAndHouseNumber(name);
  if (split.houseNumber) {
    name = split.street;
    if (!hn) hn = split.houseNumber;
    if (hn) {
      const escaped = hn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const stripped = name.replace(new RegExp(`(?:\\s+${escaped})+$`, "i"), "").trim();
      if (stripped) name = stripped;
    }
  }
  return { street: name, houseNumber: hn };
};

const splitGeoDisplayAddress = (value) => {
  const parts = String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return { street: "", houseNumber: "" };

  const firstIsHouseNumber = SWISS_HOUSE_NUMBER_RE.test(parts[0]);
  if (firstIsHouseNumber && parts[1]) {
    return separateStreetAndHouse(parts[1], parts[0].replace(/\s+/g, ""));
  }

  return separateStreetAndHouse(parts[0], "");
};

const normalizeStreetSearchText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const removeLeadingHouseNumber = (value) =>
  String(value || "")
    .trim()
    .replace(new RegExp(`^${SWISS_HOUSE_NUMBER}\\s+`), "")
    .trim();

const streetNameOnly = (value) => separateStreetAndHouse(value, "").street;

const getPhotonStreetSearchName = (feature) => {
  const p = feature?.properties || {};
  const fromStreet = String(p.street || "").trim();
  if (fromStreet) return streetNameOnly(fromStreet);

  const fromName = removeLeadingHouseNumber(p.name);
  if (fromName) return streetNameOnly(fromName);

  const addr = photonFeatureToAddress(feature);
  return streetNameOnly(removeLeadingHouseNumber(addr.streetOnly || addr.line1));
};

const photonFeatureMatchesTypedStreet = (feature, typed) => {
  const needle = normalizeStreetSearchText(typed);
  if (!needle) return true;

  return normalizeStreetSearchText(getPhotonStreetSearchName(feature)).startsWith(needle);
};

/** Photon (Komoot) — nur Schweiz: enge Bounding-Box + Filter auf countrycode CH */
const CH_PHOTON_BBOX = "5.95,45.78,10.52,47.84";
const PHOTON_RESULT_LIMIT = 50;
const PHOTON_AUTOCOMPLETE = (q, limit = PHOTON_RESULT_LIMIT) =>
  `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${limit}&lang=de&bbox=${CH_PHOTON_BBOX}`;

const GEO_ADMIN_STREET_SEARCH = (searchText, limit = 30) =>
  `https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=${encodeURIComponent(searchText)}&type=locations&origins=address&limit=${limit}`;

const stripHtmlTags = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const extractPlzFromGeoAdminLabel = (label) => {
  const raw = stripHtmlTags(label);
  return raw.match(/\b(\d{4})\b/)?.[1] || "";
};

const extractOrtFromGeoAdminLabel = (label) => {
  const raw = stripHtmlTags(label);
  const match = raw.match(/\b\d{4}\b\s+(.+)$/);
  return match ? formatOrtForSearch(match[1].trim()) : "";
};

const buildCleanPlzOrt = (postBox, cityName) => {
  const pc = String(postBox || "")
    .trim()
    .match(/\d{4}/)?.[0] || "";
  const ort = formatOrtForSearch(stripHtmlTags(cityName));
  if (pc && ort) return `${pc} ${ort}`.trim();
  return pc || ort || "";
};

const extractStreetFromGeoAdminLabel = (label) => {
  const raw = stripHtmlTags(label);
  if (!raw) return "";
  const withoutLoc = raw.replace(/\s+\d{4}\s+.+$/, "").trim();
  const withoutNum = withoutLoc
    .replace(new RegExp(`\\s+${SWISS_HOUSE_NUMBER}$`), "")
    .trim();
  return withoutNum.replace(/\s+#\s*$/, "").trim();
};

const geoAdminRowToPhotonFeature = (_attrs, street, zipcode, city) => {
  return {
    properties: {
      street: streetNameOnly(stripHtmlTags(street)),
      housenumber: "",
      postcode: stripHtmlTags(zipcode),
      city: stripHtmlTags(city),
      countrycode: "ch",
      type: "street",
    },
  };
};

const fetchGeoAdminStreetSuggestions = async (typed, areaCtx, signal) => {
  const plz = areaCtx.postBox;
  const ort = formatOrtForSearch(areaCtx.city);
  if (!plz) return [];

  const queries = [
    [typed, plz, ort].filter(Boolean).join(" "),
    [plz, ort, typed].filter(Boolean).join(" "),
  ].filter(Boolean);

  const seen = new Set();
  const out = [];
  const needle = normalizeStreetSearchText(typed);
  const targetOrt = normalizeLocalityName(ort);

  for (const query of queries) {
    try {
      const res = await fetch(GEO_ADMIN_STREET_SEARCH(query, 50), {
        cache: "no-store",
        mode: "cors",
        signal,
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const row of data?.results || []) {
        const attrs = row?.attrs || {};
        const label = stripHtmlTags(String(attrs.label || "").trim());
        if (!label) continue;
        const zipcode = extractPlzFromGeoAdminLabel(label);
        if (plz && zipcode && zipcode !== plz) continue;
        const street = extractStreetFromGeoAdminLabel(label);
        if (!street) continue;
        const streetKey = normalizeStreetSearchText(street);
        if (needle && !streetKey.startsWith(needle)) continue;
        const ortName = extractOrtFromGeoAdminLabel(label);
        if (targetOrt) {
          const rowOrt = normalizeLocalityName(ortName);
          if (rowOrt && rowOrt !== targetOrt && !rowOrt.includes(targetOrt) && !targetOrt.includes(rowOrt)) {
            continue;
          }
        }
        if (seen.has(streetKey)) continue;
        seen.add(streetKey);
        out.push(
          geoAdminRowToPhotonFeature(
            attrs,
            street,
            zipcode || plz,
            ortName || ort || areaCtx.city
          )
        );
      }
    } catch (err) {
      if (err?.name === "AbortError") throw err;
    }
  }

  return out.sort((a, b) =>
    normalizeStreetSearchText(getPhotonStreetSearchName(a)).localeCompare(
      normalizeStreetSearchText(getPhotonStreetSearchName(b))
    )
  );
};

const fetchCheckoutStreetSuggestions = async (q, areaCtx, signal) => {
  const typed = String(q || "").trim();
  const geoList = await fetchGeoAdminStreetSuggestions(typed, areaCtx, signal);
  if (geoList.length) return geoList;
  return fetchPhotonStreetSuggestions(typed, areaCtx, signal);
};

/** Wenige Fan-out-Buchstaben (nicht 26 parallel — sonst Photon Rate-Limit / leere Liste). */
const PHOTON_STREET_FANOUT_1 = "aeiorkstn".split("");
const PHOTON_STREET_FANOUT_2 = "aeiou".split("");

const fetchPhotonStreetSuggestions = async (q, areaCtx, signal) => {
  const typed = String(q || "").trim();
  const plzOrtQuery = buildPhotonPlzOrtOnlyQuery(areaCtx.postBox, areaCtx.city);
  const primaryQuery = plzOrtQuery ? `${typed} ${plzOrtQuery}`.trim() : typed;

  const loadRaw = async (searchQuery, limit = PHOTON_RESULT_LIMIT) => {
    if (!searchQuery) return [];
    try {
      const res = await fetch(PHOTON_AUTOCOMPLETE(searchQuery, limit), {
        cache: "no-store",
        mode: "cors",
        signal,
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data?.features) ? data.features : [];
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      return [];
    }
  };

  const filterMerged = (rawParts) => filterPhotonStreetsForCheckout(rawParts.flat(), typed, areaCtx);

  const coreQueries = [...new Set([primaryQuery, plzOrtQuery].filter(Boolean))];
  const coreRaw = await Promise.all(coreQueries.map((query) => loadRaw(query)));
  let list = filterMerged(coreRaw);

  if (list.length < 12 && typed.length <= 2 && plzOrtQuery) {
    const fanoutLetters = typed.length === 1 ? PHOTON_STREET_FANOUT_1 : PHOTON_STREET_FANOUT_2;
    const fanoutRaw = await Promise.all(
      fanoutLetters.map((c) => loadRaw(`${typed}${c} ${plzOrtQuery}`))
    );
    const fanoutList = filterMerged(fanoutRaw);
    if (fanoutList.length) {
      list = dedupePhotonStreetFeatures([...list, ...fanoutList])
        .sort((a, b) => photonStreetResultRank(a) - photonStreetResultRank(b))
        .slice(0, 60);
    }
  }

  if (list.length === 0 && typed.length <= 2 && plzOrtQuery) {
    const fallbackRaw = await loadRaw(plzOrtQuery, 100);
    list = filterMerged([fallbackRaw]);
  }

  return list;
};

/** Städte/Dörfer ausschliessen — nur Strassen, Häuser, benannte Wege (highway) */
const PHOTON_PLACE_ONLY_TYPES = new Set([
  "city",
  "town",
  "village",
  "hamlet",
  "municipality",
  "suburb",
  "neighbourhood",
  "quarter",
  "locality",
  "district",
  "county",
  "state",
  "country",
  "region",
  "postcode",
]);

const isPhotonStreetLevelFeature = (feature) => {
  const p = feature?.properties || {};
  const type = String(p.type || "").toLowerCase();
  const hasStreet = String(p.street || "").trim().length > 0;
  const hasHousenumber = String(p.housenumber || "").trim().length > 0;

  if (hasStreet || hasHousenumber) return true;
  if (type === "street" || type === "house") return true;
  const osmKey = String(p.osm_key || "").toLowerCase();
  if (osmKey === "highway" && String(p.name || "").trim()) return true;

  if (PHOTON_PLACE_ONLY_TYPES.has(type)) return false;

  return false;
};

const photonStreetResultRank = (feature) => {
  const p = feature?.properties || {};
  if (String(p.housenumber || "").trim()) return 0;
  if (String(p.street || "").trim()) return 1;
  if (String(p.type || "").toLowerCase() === "street") return 2;
  return 3;
};

const normalizeLocalityName = (value) =>
  normalizeStreetSearchText(value).replace(/\s+/g, "");

/** Liefergebiete — PLZ aus Ortsname wenn Feld nur «Lachen» ohne PLZ enthält. */
const SERVICE_AREA_PLZ_BY_ORT = {
  altendorf: "8852",
  buttikon: "8863",
  galgenen: "8854",
  lachen: "8853",
  nuolen: "8855",
  reichenburg: "8864",
  schubelbach: "8862",
  siebnen: "8854",
  tuggen: "8856",
  wangen: "8855",
};

const resolvePlzFromOrtName = (cityName, deliveryRows) => {
  const target = normalizeLocalityName(cityName);
  if (!target) return "";

  if (Array.isArray(deliveryRows) && deliveryRows.length) {
    for (const row of deliveryRows) {
      const pc =
        String(row.postBox ?? row.PostBox ?? "")
          .trim()
          .match(/\d{4}/)?.[0] || "";
      const ort = normalizeLocalityName(
        row.city ?? row.City ?? row.ort ?? row.Ort ?? ""
      );
      if (!pc || !ort) continue;
      if (ort === target || ort.includes(target) || target.includes(ort)) return pc;
    }
  }

  return SERVICE_AREA_PLZ_BY_ORT[target] || "";
};

const enrichStreetAreaContext = (areaCtx, deliveryRows) => {
  const postBox = areaCtx.postBox || resolvePlzFromOrtName(areaCtx.city, deliveryRows);
  return { ...areaCtx, postBox };
};

const photonFeatureLocality = (feature) => {
  const p = feature?.properties || {};
  return String(p.city || p.town || p.village || p.locality || "").trim();
};

/** Gleiche PLZ; bei gesetztem Ort nur diese Gemeinde (Wangen ≠ anderer Wangen in der CH). */
const photonFeatureMatchesDeliveryArea = (feature, plz, targetCity) => {
  const p = feature?.properties || {};
  const pc =
    String(p.postcode || "")
      .trim()
      .match(/\d{4}/)?.[0] || "";
  if (plz && pc && pc !== plz) return false;

  const target = normalizeLocalityName(targetCity);
  if (!target) return true;

  const locality = normalizeLocalityName(photonFeatureLocality(feature));
  if (!locality) return true;

  return locality === target || locality.includes(target) || target.includes(locality);
};

const dedupePhotonStreetFeatures = (features) => {
  const seen = new Map();
  features.forEach((feature) => {
    const name = normalizeStreetSearchText(getPhotonStreetSearchName(feature));
    if (!name) return;
    const pc =
      String(feature?.properties?.postcode || "")
        .trim()
        .match(/\d{4}/)?.[0] || "";
    const key = `${pc}|${name}`;
    const existing = seen.get(key);
    if (!existing || photonStreetResultRank(feature) < photonStreetResultRank(existing)) {
      seen.set(key, feature);
    }
  });
  return Array.from(seen.values());
};

const CH_LON_LAT = { minLon: 5.95, maxLon: 10.52, minLat: 45.78, maxLat: 47.84 };

const isPhotonFeatureSwitzerland = (feature) => {
  const p = feature?.properties || {};
  const cc = String(p.countrycode || p.country_code || "").toLowerCase();
  if (cc === "li") return false;
  if (cc === "ch") return true;
  const country = String(p.country || "").toLowerCase();
  if (country === "liechtenstein") return false;
  if (
    country === "switzerland" ||
    country === "schweiz" ||
    country === "suisse" ||
    country === "svizzera"
  ) {
    return true;
  }
  const coords = feature?.geometry?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const lon = Number(coords[0]);
    const lat = Number(coords[1]);
    if (
      lon >= CH_LON_LAT.minLon &&
      lon <= CH_LON_LAT.maxLon &&
      lat >= CH_LON_LAT.minLat &&
      lat <= CH_LON_LAT.maxLat
    ) {
      return true;
    }
  }
  return false;
};

const filterPhotonStreetsForCheckout = (raw, q, areaCtx) => {
  const applyFilters = (withCity) =>
    dedupePhotonStreetFeatures(
      raw
        .filter(isPhotonFeatureSwitzerland)
        .filter(isPhotonStreetLevelFeature)
        .filter((feature) => photonFeatureMatchesTypedStreet(feature, q))
        .filter((feature) =>
          photonFeatureMatchesDeliveryArea(feature, areaCtx.postBox, withCity ? areaCtx.city : "")
        )
    ).sort((a, b) => photonStreetResultRank(a) - photonStreetResultRank(b));

  let list = applyFilters(true);
  if (list.length === 0 && areaCtx.city) {
    list = applyFilters(false);
  }
  return list.slice(0, 60);
};

const photonFeatureToAddress = (feature) => {
  const p = feature?.properties || {};
  const locality = stripHtmlTags(
    p.city ||
      p.town ||
      p.village ||
      p.district ||
      p.locality ||
      ""
  );
  const pc = stripHtmlTags(String(p.postcode || "").trim());
  const hn = stripHtmlTags(String(p.housenumber || "").trim());
  const st = stripHtmlTags(String(p.street || "").trim());
  let line1 = [st, hn].filter(Boolean).join(" ").trim();
  if (!line1 && String(p.osm_key || "").toLowerCase() === "highway" && p.name) {
    line1 = stripHtmlTags(String(p.name).trim());
  }
  if (!line1 && p.name && String(p.type || "").toLowerCase() === "street") {
    line1 = stripHtmlTags(String(p.name).trim());
  }
  const plzOrt = [pc, locality].filter(Boolean).join(" ").trim();
  const label = [line1, plzOrt].filter(Boolean).join(" · ") || plzOrt || line1;
  const streetOnly = st || (hn ? "" : line1);
  return { line1, postBox: pc, plzOrt, label, streetOnly, houseNumber: hn };
};

const CheckOutForm = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("1");
  const { userData, getUserData } = useGetUserData();
  const {
    getDeliveryTimes,
    times,
    dateOptions,
    selectedDate,
    isAvailable: timesApiOk,
    message,
    loading: timesLoading,
  } = useGetDeliveryTimes();
  const {
    isAvailable: deliveryNow,
    isPickupAvailable: pickupNow,
    isPreorderAllowed,
    ready: availReady,
    message: availMessage,
  } = useAvailability();
  const deliverMethod = useSelector((state) => state.delivery.deliverMethod);
  const cart = useSelector((state) => state.cart);
  const cartItemsCount = Array.isArray(cart?.items)
    ? cart.items.reduce((n, it) => n + Number(it?.quantity ?? 0), 0)
    : 0;
  const checkoutButtonTotal = Array.isArray(cart?.items)
    ? cart.items.reduce((sum, item) => {
        const lineTotal =
          deliverMethod === "collect"
            ? item?.totalPriceWithoutDelivery
            : item?.totalPrice;
        return sum + Number(lineTotal || 0);
      }, 0)
    : 0;
  const checkoutSubmitLabel = `Kostenpflichtig bestellen · CHF ${checkoutButtonTotal.toFixed(2)}`;
  const isCollect = deliverMethod === "collect";
  const { deliveryData, getDelivery } = useGetDelivery();

  useEffect(() => {
    if (!isCollect) {
      getDelivery();
    }
  }, [isCollect, getDelivery]);
  const needsWunschzeit =
    availReady &&
    isPreorderAllowed &&
    ((!isCollect && !deliveryNow) || (isCollect && !pickupNow));
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("1");
  /** Einheitlich: AGB + ein «Bestellen» (Bar abschliessen hier, Online → PSP). */
  const [checkoutAgbAccepted, setCheckoutAgbAccepted] = useState(false);
  /** Kurz true → Shake/Highlight bei Validierung ohne AGB (Bar & Online). */
  const [agbHighlightError, setAgbHighlightError] = useState(false);
  const agbHighlightTimerRef = useRef(null);
  const [sent, setSent] = useState(false);
  const { isCheckedOut } = useSelector((state) => state.Auth);

  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [streetSuggestOpen, setStreetSuggestOpen] = useState(false);
  const [streetSearchNoHits, setStreetSearchNoHits] = useState(false);
  const [streetAutoFilledFromGeo, setStreetAutoFilledFromGeo] = useState(false);
  const skipStreetFetchRef = useRef(false);
  /** Server-Warenkorb (Session): leer → 400 «Cart is empty» trotz Gutschein-Feld */
  const [serverCartProbe, setServerCartProbe] = useState("loading");

  const visitorId = resolveVisitorId(location.state?.response);
  /** Einheitliche Kasse: PLZ/Ort auch ohne navigate()-State (z. B. localStorage wie Delivery/Cart). */
  const addressCity =
    (location.state?.city && String(location.state.city).trim()) ||
    (typeof localStorage !== "undefined"
      ? (localStorage.getItem(LS_DELIVERY_CITY) || "").trim()
      : "");
  const parsedAddressCity = splitPlzCity(addressCity);

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    const server = getApiBaseUrl();
    if (!server) {
      setServerCartProbe("ok");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${server}/api/Cart/cart`, {
          withCredentials: true,
        });
        const outer = res.data?.data ?? res.data?.Data;
        const cartObj = outer?.cart ?? outer?.Cart;
        const items = cartObj?.items ?? cartObj?.Items ?? [];
        const count = Array.isArray(items)
          ? items.reduce(
              (n, it) => n + Number(it?.quantity ?? it?.Quantity ?? 0),
              0
            )
          : 0;
        if (!cancelled) setServerCartProbe(count > 0 ? "ok" : "empty");
      } catch (e) {
        const st = e?.response?.status;
        const body = e?.response?.data;
        if (!cancelled) {
          // Kein Session-Cookie (Cross-Site): GET scheitert — Bestellung kann trotzdem mit userId im JSON klappen
          if (st === 401 || st === 403) {
            setServerCartProbe("ok");
            return;
          }
          if (
            st === 404 ||
            (typeof body === "string" && /cart is empty/i.test(body))
          ) {
            setServerCartProbe("empty");
            return;
          }
          setServerCartProbe("ok");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const fullAddressHint = localStorage.getItem("wangen-geo-full-address-hint");
      const fullAddressSplit = splitGeoDisplayAddress(fullAddressHint);
      if (fullAddressHint) {
        localStorage.removeItem("wangen-geo-full-address-hint");
      }

      const addressHint = localStorage.getItem("wangen-geo-address-hint");
      if (addressHint) {
        localStorage.removeItem("wangen-geo-address-hint");
        const parsed = JSON.parse(addressHint);
        const split = splitStreetAndHouseNumber(
          [parsed?.street, parsed?.houseNumber].filter(Boolean).join(" ")
        );
        skipStreetFetchRef.current = true;
        setStreetAutoFilledFromGeo(true);
        setStreetSuggestions([]);
        setStreetSuggestOpen(false);
        setStreetSearchNoHits(false);
        setFormData((prev) => {
          const separated = separateStreetAndHouse(
            fullAddressSplit.street ||
              split.street ||
              String(parsed?.street || "").trim() ||
              String(prev.street || "").trim(),
            fullAddressSplit.houseNumber ||
              String(parsed?.houseNumber || "").trim() ||
              split.houseNumber ||
              String(prev.hausnummer || "").trim()
          );
          return {
            ...prev,
            street: separated.street,
            hausnummer: separated.houseNumber,
            postBox: String(parsed?.postcode || "").trim() || String(prev.postBox || "").trim(),
            city:
              [parsed?.postcode, parsed?.city].filter(Boolean).join(" ").trim() ||
              String(prev.city || "").trim(),
          };
        });
        return;
      }

      const hint = localStorage.getItem("wangen-geo-street-hint");
      if (!hint && !fullAddressHint) return;
      localStorage.removeItem("wangen-geo-street-hint");
      const split = splitStreetAndHouseNumber(hint);
      skipStreetFetchRef.current = true;
      setStreetAutoFilledFromGeo(true);
      setStreetSuggestions([]);
      setStreetSuggestOpen(false);
      setStreetSearchNoHits(false);
      setFormData((prev) => {
        const separated = separateStreetAndHouse(
          fullAddressSplit.street || split.street || String(prev.street || "").trim(),
          fullAddressSplit.houseNumber || split.houseNumber || String(prev.hausnummer || "").trim()
        );
        return {
          ...prev,
          street: separated.street,
          hausnummer: separated.houseNumber,
        };
      });
    } catch (_) {}
  }, []);

  useEffect(() => {
    const raw = (location.hash || "").replace(/^#/, "");
    if (raw !== "gutschein-einloesen" && raw !== "gutscheinCode") return;
    setSelectedPayment("2");
    const run = () => {
      const row = document.getElementById("gutschein-einloesen");
      const input = document.getElementById("discountCode");
      (row || input)?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      input?.focus?.({ preventScroll: true });
    };
    window.requestAnimationFrame(() => window.requestAnimationFrame(run));
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (!location.state?.checkoutUnlocked && !readCheckoutUnlockedFlag()) return;
    const t = window.setTimeout(() => {
      const el =
        document.getElementById("checkout-pay-heading") ||
        document.getElementById("orderForm");
      el?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }, 200);
    return () => window.clearTimeout(t);
  }, [location.state?.checkoutUnlocked, location.pathname]);

  const userName = localStorage.getItem("userName");
  const [formData, setFormData] = useState({
    userId: visitorId || "",
    salute: userData?.salute || "",
    name: userName || "",
    street: userData?.street || "",
    hausnummer: "",
    city: parsedAddressCity.city || "",
    postBox: parsedAddressCity.postBox || userData?.postBox || "",
    gutscheinCode: "",
    discountCode: "",
    notes: "",
    deliveryTime: "so schnell wie möglich",
    deliveryDate: "",
    email: userData?.email || "",
    mobile: userData?.phoneNumber || "",
    paymentWay: 1, // Default: Barzahlung
  });

  useEffect(() => {
    if (selectedPayment === "1") {
      setFormData((prev) => ({ ...prev, gutscheinCode: "" }));
    }
  }, [selectedPayment]);

  useEffect(() => {
    setCheckoutAgbAccepted(false);
  }, [selectedPayment]);

  useEffect(() => {
    if (!checkoutAgbAccepted) return;
    setAgbHighlightError(false);
    if (agbHighlightTimerRef.current) {
      window.clearTimeout(agbHighlightTimerRef.current);
      agbHighlightTimerRef.current = null;
    }
  }, [checkoutAgbAccepted]);

  useEffect(() => {
    return () => {
      if (agbHighlightTimerRef.current) {
        window.clearTimeout(agbHighlightTimerRef.current);
      }
    };
  }, []);

  const pulseAgbValidationError = () => {
    setAgbHighlightError(false);
    window.requestAnimationFrame(() => {
      setAgbHighlightError(true);
      document.getElementById("checkout-agb-unified")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
    if (agbHighlightTimerRef.current) {
      window.clearTimeout(agbHighlightTimerRef.current);
    }
    agbHighlightTimerRef.current = window.setTimeout(() => {
      setAgbHighlightError(false);
      agbHighlightTimerRef.current = null;
    }, 600);
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      city: parsedAddressCity.city || prev.city,
      postBox: parsedAddressCity.postBox || prev.postBox,
      salute: prev.salute || userData?.salute || "",
      street: prev.street || userData?.street || "",
      email: prev.email || userData?.email || "",
      mobile: prev.mobile || userData?.phoneNumber || "",
    }));
  }, [addressCity, userData]);

  useEffect(() => {
    const vid =
      normalizeVisitorId(location.state?.response) ||
      readPersistedVisitorId() ||
      "";
    if (!vid) return;
    setFormData((prev) =>
      prev.userId === vid ? prev : { ...prev, userId: vid }
    );
  }, [location.pathname, location.state?.response]);

  useEffect(() => {
    if (!needsWunschzeit || deliveryTimeOption !== "1") return;
    setDeliveryTimeOption("2");
    setFormData((prev) => ({ ...prev, deliveryTime: "" }));
    getDeliveryTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getDeliveryTimes ist pro Render neu
  }, [needsWunschzeit, deliverMethod, deliveryTimeOption]);

  useEffect(() => {
    if (deliveryTimeOption === "2") {
      getDeliveryTimes();
    }
  }, [deliveryTimeOption]);

  const getTimeValue = (t) =>
    typeof t === "string" ? t : (t?.value ?? t?.Value ?? t?.time ?? t?.Time ?? "");

  const getDateValue = (d) => d?.date ?? d?.Date ?? "";
  const getDateLabel = (d) => d?.label ?? d?.Label ?? getDateValue(d);
  const getDateOptions = (d) => d?.options ?? d?.Options ?? [];
  const orderDateOptions = useMemo(
    () => (Array.isArray(dateOptions) ? dateOptions : []),
    [dateOptions]
  );
  const activeOrderDate =
    formData.deliveryDate || selectedDate || getDateValue(orderDateOptions[0]) || "";
  const activeDateOption =
    orderDateOptions.find((d) => getDateValue(d) === activeOrderDate) ||
    orderDateOptions[0];
  const slotList = useMemo(() => {
    const dateSlots = getDateOptions(activeDateOption);
    if (Array.isArray(dateSlots) && dateSlots.length) return dateSlots;
    return Array.isArray(times) ? times : [];
  }, [activeDateOption, times]);

  const isClockDeliveryTime = (v) => /^\d{1,2}:\d{2}$/.test(String(v || ""));
  const timeOkForWishOption =
    deliveryTimeOption !== "2" ||
    (isClockDeliveryTime(formData.deliveryTime) && timesApiOk);

  /** Fehlende Uhrzeit mit erstem Slot füllen, sobald die API-Zeiten da sind. */
  useEffect(() => {
    if (deliveryTimeOption !== "2" || !slotList.length) return;
    const firstTime = getTimeValue(slotList[0]);
    const current = formData.deliveryTime || "";
    const isValidClock = /^\d{1,2}:\d{2}$/.test(current);
    if (!firstTime) return;
    if (!current || !isValidClock) {
      setFormData((prev) => ({ ...prev, deliveryTime: firstTime }));
    }
  }, [deliveryTimeOption, slotList]);

  useEffect(() => {
    if (deliveryTimeOption !== "2" || !orderDateOptions.length) return;
    const firstDate = getDateValue(orderDateOptions[0]);
    if (!firstDate || formData.deliveryDate) return;
    setFormData((prev) => ({ ...prev, deliveryDate: selectedDate || firstDate }));
  }, [deliveryTimeOption, orderDateOptions, selectedDate, formData.deliveryDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStreetChange = (e) => {
    setStreetAutoFilledFromGeo(false);
    skipStreetFetchRef.current = false;
    setStreetSuggestOpen(true);
    handleChange(e);
  };

  useEffect(() => {
    const q = String(formData.street || "").trim();
    if (streetAutoFilledFromGeo) {
      setStreetSuggestions([]);
      setStreetSuggestOpen(false);
      setStreetSearchNoHits(false);
      return;
    }
    if (skipStreetFetchRef.current) {
      skipStreetFetchRef.current = false;
      setStreetSuggestions([]);
      setStreetSuggestOpen(false);
      setStreetSearchNoHits(false);
      return;
    }
    if (q.length < 1) {
      setStreetSuggestions([]);
      setStreetSuggestOpen(false);
      setStreetSearchNoHits(false);
      return;
    }
    const areaCtx = enrichStreetAreaContext(
      getEffectivePlzOrtContext(formData.postBox, formData.city),
      deliveryData
    );
    if (!areaCtx.postBox && !areaCtx.city) {
      setStreetSuggestions([]);
      setStreetSuggestOpen(false);
      setStreetSearchNoHits(true);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setStreetSearchNoHits(false);
        const list = await fetchCheckoutStreetSuggestions(q, areaCtx, ctrl.signal);
        setStreetSuggestions(list);
        setStreetSuggestOpen(list.length > 0);
        setStreetSearchNoHits(list.length === 0);
      } catch (e) {
        if (e?.name !== "AbortError") {
          setStreetSuggestions([]);
          setStreetSuggestOpen(false);
          setStreetSearchNoHits(true);
        }
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [formData.street, formData.postBox, formData.city, deliveryData]);

  const applyStreetSuggestion = (feature) => {
    const { line1, postBox, plzOrt, streetOnly } = photonFeatureToAddress(feature);
    const cleanPlzOrt =
      buildCleanPlzOrt(postBox, feature?.properties?.city) ||
      buildPhotonPlzOrtOnlyQuery(formData.postBox, formData.city) ||
      plzOrt;
    const streetName = streetNameOnly(streetOnly || line1 || "");
    skipStreetFetchRef.current = true;
    setStreetSuggestions([]);
    setStreetSuggestOpen(false);
    setStreetSearchNoHits(false);
    setFormData((prev) => ({
      ...prev,
      street: streetName || prev.street,
      postBox: postBox || prev.postBox,
      city: cleanPlzOrt || prev.city,
    }));
  };

  // Handle radio button change
  const handleDeliveryOptionChange = (option) => {
    if (option === "1" && needsWunschzeit) {
      toast.error("Bitte wählen Sie eine Wunschzeit");
      return;
    }
    
    if (option === "2") {
      getDeliveryTimes();
      const firstTime = getTimeValue((Array.isArray(times) ? times : [])[0]);
      const validTime = firstTime && /^\d{1,2}:\d{2}$/.test(String(firstTime)) ? firstTime : "";
      setFormData((prev) => ({
        ...prev,
        deliveryTime: validTime || "",
        deliveryDate: prev.deliveryDate || selectedDate || getDateValue(orderDateOptions[0]) || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        deliveryTime: "so schnell wie möglich",
        deliveryDate: "",
      }));
    }
    setDeliveryTimeOption(option);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 200 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="animated-component"
    >
      <div className="check-out">
        <div className="check-out-image">
          <img src={checkOut} alt="checkOut" />
        </div>
        <div className="check-out-container">
          <form id="orderForm">
            <h2>Kasse (Bitte beachten Sie die Lieferzeiten unten)</h2>

            {serverCartProbe === "loading" && (
              <p className="checkout-cart-probe" style={{ color: "#acb2b2", marginBottom: "12px" }}>
                Warenkorb wird geprüft…
              </p>
            )}
            {serverCartProbe === "empty" && (
              <div
                role="alert"
                style={{
                  marginBottom: "16px",
                  padding: "12px 14px",
                  background: "#3d1515",
                  border: "1px solid #c62828",
                  borderRadius: "8px",
                  color: "#ffccbc",
                  lineHeight: 1.45,
                }}
              >
                <strong>Keine Artikel im Server-Warenkorb.</strong> Die Zahl «0» am Warenkorb-Icon
                passt dazu: Bitte zurück zum{" "}
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ffb74d",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    font: "inherit",
                  }}
                >
                  Warenkorb
                </button>
                , Produkte wählen und erneut im Warenkorb auf{" "}
                <strong>Bestellen</strong> tippen (nicht nur diese
                Seite als Lesezeichen). Der Gutschein-Code allein reicht nicht ohne Speisen im Korb.
              </div>
            )}

            {/* --- salute --- */}
            <div className="form-group">
              <label htmlFor="salute">Anrede:</label>
              <select
                id="salute"
                name="salute"
                required
                onChange={handleChange}
                value={formData.salute}
              >
                <option value="" disabled>
                  Anrede
                </option>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
                <option value="Firma">Firma</option>
              </select>
              {errors.salute && <div style={{ color: "red" }}>{errors.salute}</div>}
            </div>

            {/* --- name --- */}
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <div style={{ color: "red" }}>{errors.name}</div>}
            </div>

            {/* --- street (Autocomplete Adresse, CH) --- */}
            <div className="form-group street-autocomplete-wrap">
              <label htmlFor="street">Strasse:</label>
              <input
                type="text"
                id="street"
                name="street"
                autoComplete="off"
                placeholder="Strasse tippen"
                value={formData.street}
                onChange={handleStreetChange}
                onFocus={() => {
                  if (streetAutoFilledFromGeo) return;
                  if (streetSuggestions.length) setStreetSuggestOpen(true);
                }}
                onBlur={() => {
                  window.setTimeout(() => setStreetSuggestOpen(false), 200);
                }}
              />
              {streetSuggestOpen && streetSuggestions.length > 0 && (
                <ul className="street-suggestions" role="listbox">
                  {streetSuggestions.map((f, idx) => {
                    const { streetOnly, line1 } = photonFeatureToAddress(f);
                    const display = streetNameOnly(streetOnly || line1 || "");
                    return (
                      <li
                        key={`${f?.properties?.osm_id ?? idx}-${idx}`}
                        role="option"
                        tabIndex={0}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyStreetSuggestion(f)}
                      >
                        {display}
                      </li>
                    );
                  })}
                </ul>
              )}
              {streetSearchNoHits && (
                <p className="street-autocomplete-hint street-autocomplete-nohits">
                  Keine Vorschläge — weiter tippen oder Strasse und PLZ/Ort manuell prüfen. Wenn die
                  Liste leer bleibt, prüfen Sie die Netzwerkverbindung (Vorschläge kommen von einer
                  externen Adress-Datenbank).
                </p>
              )}
              {errors.street && <div style={{ color: "red" }}>{errors.street}</div>}
            </div>

            <div className="form-group checkout-hausnummer-field">
              <label htmlFor="hausnummer">Hausnummer*</label>
              <input
                type="text"
                id="hausnummer"
                name="hausnummer"
                autoComplete="street-address"
                placeholder="Hausnummer*"
                value={formData.hausnummer}
                onChange={handleChange}
              />
              {errors.hausnummer && <div style={{ color: "red" }}>{errors.hausnummer}</div>}
            </div>

            {/* --- city --- */}
            <div className="form-group">
              <label htmlFor="city">PLZ / Ort:</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="PLZ / Ort"
                value={formData.city}
                onChange={handleChange}
              />
              {errors.city && <div style={{ color: "red" }}>{errors.city}</div>}
            </div>

            {/* --- Rabattcode oder Wertgutschein (ein Feld; Online-Zahlung) --- */}
            <div className="checkout-codes-row">
              <div className="form-group checkout-code-field">
                <label htmlFor="discountCode">Rabattcode / Wertgutschein:</label>
                <input
                  type="text"
                  id="discountCode"
                  name="discountCode"
                  placeholder="Rabattcode / Wertgutschein eingeben"
                  onChange={handleChange}
                  value={formData.discountCode}
                />
              </div>
            </div>

            {/* --- email --- */}
            <div className="form-group">
              <label htmlFor="email">E-mail:</label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
            </div>

            {/* --- phone --- */}
            <div className="form-group">
              <label htmlFor="mobile">Mobile:</label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                placeholder="Mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
              {errors.mobile && <div style={{ color: "red" }}>{errors.mobile}</div>}
            </div>

            {/* --- delivery time --- */}
            <div className="form-group">
              <label htmlFor="deliveryTime">
                Lieferzeit bestätigen oder
                <span style={{ color: "#ff6600", marginLeft: "5px" }}>
                  Wunschzeit angeben.
                </span>
              </label>

<div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: needsWunschzeit ? "not-allowed" : "pointer", opacity: needsWunschzeit ? 0.5 : 1 }}>
    <input
      type="radio"
      name="deliveryOption"
      value="1"
      checked={deliveryTimeOption === "1"}
      required
      disabled={needsWunschzeit}
      onChange={() => handleDeliveryOptionChange("1")}
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        accentColor: "#ff6600",
      }}
    />
    so schnell wie möglich
  </label>

  <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <input
      type="radio"
      name="deliveryOption"
      value="2"
      checked={deliveryTimeOption === "2"}
      onChange={() => handleDeliveryOptionChange("2")}
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        accentColor: "#ff6600",
      }}
    />
    Wunschzeit angeben
  </label>
</div>

            {needsWunschzeit && (
              <p className="notAvailableToOrder" style={{ 
                backgroundColor: "#fff3cd", 
                border: "1px solid #ffc107",
                padding: "10px",
                borderRadius: "5px",
                marginTop: "10px"
              }}>
                {availMessage ||
                  "Bitte wählen Sie eine Wunschzeit (Vorbestellung)."}
              </p>
            )}

            {/* Show message from API if any */}
            {(!needsWunschzeit || deliveryTimeOption === "2") && message && (
              <p className="notAvailableToOrder">{message}</p>
            )}

              {deliveryTimeOption === "2" && (
                <div className="checkout-preorder-selects">
                  <select
                    name="deliveryDate"
                    required
                    value={activeOrderDate}
                    onChange={(e) => {
                      const nextDate = e.target.value;
                      const nextDateOption = orderDateOptions.find(
                        (d) => getDateValue(d) === nextDate
                      );
                      const nextSlots = getDateOptions(nextDateOption);
                      const firstTime = getTimeValue(nextSlots[0]);
                      setFormData((prev) => ({
                        ...prev,
                        deliveryDate: nextDate,
                        deliveryTime: firstTime || "",
                      }));
                    }}
                    style={{
                      marginTop: "10px",
                      padding: "6px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                    disabled={timesLoading || !orderDateOptions.length}
                  >
                    {timesLoading || !orderDateOptions.length ? (
                      <option value="">
                        {timesLoading ? "Laden..." : "Keine Daten verfügbar"}
                      </option>
                    ) : null}
                    {orderDateOptions.map((d) => {
                      const dateVal = getDateValue(d);
                      if (!dateVal) return null;
                      return (
                        <option key={dateVal} value={dateVal}>
                          {getDateLabel(d)}
                        </option>
                      );
                    })}
                  </select>
                  <select
                    name="deliveryTime"
                    required
                    value={
                      isClockDeliveryTime(formData.deliveryTime)
                        ? formData.deliveryTime
                        : ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deliveryTime: e.target.value,
                      }))
                    }
                    style={{
                      marginTop: "10px",
                      padding: "6px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                    disabled={timesLoading || !slotList.length}
                  >
                    <option value="">
                      {timesLoading
                        ? "Laden..."
                        : slotList.length
                          ? "Uhrzeit wählen..."
                          : "Keine Zeiten verfügbar"}
                    </option>
                    {slotList.map((t, idx) => {
                      const timeVal = getTimeValue(t);
                      if (!timeVal || !/^\d{1,2}:\d{2}$/.test(String(timeVal))) return null;
                      return (
                        <option key={`${activeOrderDate}-${timeVal}-${idx}`} value={timeVal}>
                          {timeVal} Uhr
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* --- notes --- */}
            <div className="form-group">
              <label htmlFor="notes">Nachricht:</label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Nachricht (optional)"
                onChange={handleChange}
                value={formData.notes}
              />
            </div>

            <div className="form-group checkout-payment-group">
              <span className="checkout-payment-heading" id="checkout-pay-heading">
                Wie möchten Sie bezahlen?
              </span>
              <div
                className="checkout-payment-methods"
                role="radiogroup"
                aria-labelledby="checkout-pay-heading"
              >
                <div
                  className={`checkout-payment-method ${selectedPayment === "1" ? "selected" : ""}`}
                  role="radio"
                  aria-checked={selectedPayment === "1"}
                  tabIndex={0}
                  onClick={() => setSelectedPayment("1")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPayment("1");
                    }
                  }}
                >
                  <input
                    className="checkout-payment-native-radio"
                    type="radio"
                    name="paymentMethod"
                    value="1"
                    checked={selectedPayment === "1"}
                    onChange={() => setSelectedPayment("1")}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="checkout-payment-method-text checkout-payment-with-icon">
                    <span className="checkout-pay-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M4 6h16v12H4V6zm2 2v2h12V8H6zm0 4v4h4v-4H6z" />
                      </svg>
                    </span>
                    <span className="checkout-payment-line-main">Barzahlung</span>
                  </div>
                </div>

                <div
                  className={`checkout-payment-method ${selectedPayment === "2" ? "selected" : ""}`}
                  role="radio"
                  aria-checked={selectedPayment === "2"}
                  tabIndex={0}
                  onClick={() => setSelectedPayment("2")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPayment("2");
                    }
                  }}
                >
                  <input
                    className="checkout-payment-native-radio"
                    type="radio"
                    name="paymentMethod"
                    value="2"
                    checked={selectedPayment === "2"}
                    onChange={() => setSelectedPayment("2")}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="checkout-payment-method-text checkout-payment-with-icon">
                    <span className="checkout-pay-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
                        <path d="M4 4h16v16H4V4z" />
                        <path d="M4 9h16v3H4z" fillOpacity="0.35" />
                        <path d="M4 15h9v2H4z" fillOpacity="0.45" />
                      </svg>
                    </span>
                    <span className="checkout-payment-line-main">Kreditkarte &amp; Twint &amp; PostFinance</span>
                  </div>
                </div>
              </div>

              <label
                id="checkout-agb-unified"
                className={`checkout-online-agb checkout-agb-unified${agbHighlightError ? " checkout-agb--error" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checkoutAgbAccepted}
                  onChange={(e) => setCheckoutAgbAccepted(e.target.checked)}
                  aria-invalid={agbHighlightError}
                />
                <span>
                  Mit dem Abschicken der Bestellung akzeptieren Sie die{" "}
                  <Link
                    to="/agb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="checkout-online-agb-link"
                  >
                    Allgemeinen Geschäftsbedingungen
                  </Link>{" "}
                  der Pizza Wangen.
                </span>
              </label>

            </div>

            {/* --- submit button --- */}
            <button
                type="button"
                className="checkout-submit-btn"
                disabled={sending || (serverCartProbe === "empty" && cartItemsCount === 0)}
              onClick={async () => {
                if (serverCartProbe === "empty" && cartItemsCount === 0) {
                  toast.error(
                    "Warenkorb leer. Bitte über den Warenkorb erneut zur Kasse gehen."
                  );
                  navigate("/cart");
                  return;
                }
                const fromCityValidate = splitPlzCity(formData.city);
                const postBoxEffectiveValidate = (
                  String(formData.postBox || "").trim() ||
                  fromCityValidate.postBox ||
                  ""
                ).trim();
                const minimumBlock = getDeliveryMinimumBlock({
                  deliveryData,
                  deliveryMethod: deliverMethod,
                  items: cart?.items,
                  postcode: postBoxEffectiveValidate,
                });
                if (minimumBlock) {
                  toast.error(
                    `Mindestbestellwert für diese PLZ: CHF ${minimumBlock.minimum.toFixed(
                      2
                    )}. Aktuell: CHF ${minimumBlock.total.toFixed(2)}.`
                  );
                  navigate("/cart");
                  return;
                }
                const newErrors = {};
                if (!formData.salute || String(formData.salute).trim() === "") {
                  newErrors.salute = "Anrede fehlt";
                }
                if (formData.name.trim() === "") {
                  newErrors.name = "Name fehlt";
                }
                if (formData.street.trim() === "") {
                  newErrors.street = "Strasse fehlt";
                }
                if (String(formData.hausnummer || "").trim() === "") {
                  newErrors.hausnummer = "Hausnummer fehlt";
                } else if (!isValidSwissHausnummer(formData.hausnummer)) {
                  newErrors.hausnummer =
                    "Ungültige Hausnummer (z. B. 12, 12a, 12–14).";
                }
                if (!isCollect) {
                  if (postBoxEffectiveValidate === "") {
                    newErrors.city = "PLZ fehlt (PLZ/Ort oder PLZ-Feld)";
                  } else {
                    const plz4 =
                      String(postBoxEffectiveValidate).match(/\d{4}/)?.[0] ||
                      "";
                    if (
                      plz4 &&
                      !isPlzInLiefergebieteRows(plz4, deliveryData)
                    ) {
                      newErrors.city =
                        newErrors.city ||
                        "Diese PLZ liegt ausserhalb unseres Liefergebiets.";
                    }
                  }
                }
                if (formData.city.trim() === "") {
                  newErrors.city = newErrors.city || "PLZ/Ort fehlt";
                }
                if (formData.email.trim() === "") {
                  newErrors.email = "Email fehlt";
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (
                  formData.email.trim() !== "" &&
                  !emailRegex.test(formData.email)
                ) {
                  newErrors.email = "Bitte eine gültige E-Mail-Adresse eingeben.";
                }
                if (formData.mobile.trim() === "") {
                  newErrors.mobile = "Telefon-Nr. fehlt";
                } else if (!isValidSwissPhoneInput(formData.mobile)) {
                  newErrors.mobile =
                    "Ungültige Telefonnummer (z. B. 076 123 45 67 oder +41…).";
                }

                if (Object.keys(newErrors).length > 0) {
                  setErrors(newErrors);
                  const order = ["salute", "name", "street", "hausnummer", "city", "email", "mobile"];
                  const firstKey = order.find((k) => newErrors[k]);
                  if (firstKey) {
                    window.requestAnimationFrame(() => {
                      const el = document.getElementById(firstKey);
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      el?.focus?.({ preventScroll: true });
                    });
                  }
                  return;
                }

                if (deliveryTimeOption === "2") {
                  if (!formData.deliveryDate) {
                    toast.error("Bitte ein Datum wählen.");
                    return;
                  }
                  if (!isClockDeliveryTime(formData.deliveryTime)) {
                    toast.error("Bitte eine Wunschzeit wählen.");
                    return;
                  }
                  if (!slotList.length) {
                    toast.error("Keine Lieferzeiten verfügbar. Bitte Seite neu laden.");
                    return;
                  }
                }

                if (cartItemsCount === 0) {
                  toast.error(
                    "Warenkorb leer. Bitte Gerichte wählen und erneut zur Kasse."
                  );
                  navigate("/cart");
                  return;
                }

                /* Vorbestellung: useEffect schaltet bei Bedarf auf Wunschzeit um; hier nicht extra blockieren (Race → fälschlich blockiert). */

                const payWay = String(selectedPayment).trim() === "2" ? 2 : 1;
                if (!checkoutAgbAccepted) {
                  pulseAgbValidationError();
                  toast.error("Bitte AGB akzeptieren (Kästchen).");
                  return;
                }
                const gutscheinTrimPre = String(
                  formData.gutscheinCode || ""
                ).trim();
                if (payWay === 1 && gutscheinTrimPre) {
                  toast.error(
                    "Wertgutscheine sind nur bei Online-Zahlung möglich. Bitte Online-Zahlung wählen."
                  );
                  return;
                }

                setErrors({});
                setSending(true);
                try {
                  const server = getApiBaseUrl();
                  if (!server) {
                    toast.error("Server-Adresse fehlt (VITE_SERVER).");
                    return;
                  }

                  let uid;
                  try {
                    const syncUrl = isCollect
                      ? `${server}/api/Cart/pickup_cart/add`
                      : `${server}/api/Cart/cart/add`;
                    const syncRes = await axios.post(
                      syncUrl,
                      {
                        items: mapCartItemsForApi(cart.items),
                        replaceExistingItems: true,
                      },
                      { withCredentials: true, timeout: 120_000 }
                    );
                    persistVisitorIdFromApiResponse(syncRes.data);
                    /* VisitorId direkt aus cart/add — nicht von Router-State abhängig */
                    uid =
                      normalizeVisitorId(syncRes.data) ||
                      readPersistedVisitorId() ||
                      normalizeVisitorId(formData.userId);
                    if (uid) {
                      setFormData((prev) =>
                        prev.userId === uid ? prev : { ...prev, userId: uid }
                      );
                    }
                    setServerCartProbe("ok");
                  } catch (syncErr) {
                    console.error("Cart sync error:", syncErr);
                    const sm = extractOrderErrorMessage(syncErr);
                    toast.error(
                      sm || "Warenkorb konnte nicht synchronisiert werden."
                    );
                    return;
                  }

                  if (!uid) {
                    toast.error(
                      "Warenkorb-Sitzung fehlt (keine VisitorId). Bitte zurück zum Warenkorb und erneut «Bestellen» tippen."
                    );
                    navigate("/cart");
                    return;
                  }

                  const rawTime = (formData.deliveryTime ?? "").trim();
                  let dTime = rawTime;
                  const isClock = /^\d{1,2}:\d{2}$/.test(dTime);
                  const isAsap =
                    dTime.toLowerCase() === "so schnell wie möglich";
                  if (!isClock && !isAsap) {
                    dTime = "so schnell wie möglich";
                  }
                  const fromCity = splitPlzCity(formData.city);
                  const postBoxMerged = (
                    String(formData.postBox || "").trim() ||
                    fromCity.postBox ||
                    ""
                  ).trim();
                  const cityMerged = (
                    fromCity.city ||
                    String(formData.city || "").trim()
                  ).trim();
                  const discountTrim = String(
                    formData.discountCode || ""
                  ).trim();
                  const gutscheinTrim = String(
                    formData.gutscheinCode || ""
                  ).trim();
                  const gutscheinForApi =
                    payWay === 1 ? "" : discountTrim || gutscheinTrim;

                  /* Kein ...formData: verhindert doppelte / veraltete Keys (z. B. gutscheinCode = Rabatt bei Bar). */
                  const separatedAddress = separateStreetAndHouse(
                    formData.street,
                    formData.hausnummer
                  );
                  const payload = {
                    userId: uid,
                    salute: formData.salute,
                    name: formData.name,
                    street: separatedAddress.street,
                    hausnummer: separatedAddress.houseNumber,
                    city: cityMerged,
                    postBox: postBoxMerged,
                    email: formData.email,
                    mobile: formData.mobile,
                    notes: formData.notes || "",
                    deliveryTime: dTime,
                    DeliveryTime: dTime,
                    paymentWay: payWay,
                    discountCode: discountTrim,
                    gutscheinCode: gutscheinForApi,
                  };

                  if (formData.deliveryDate) {
                    payload.deliveryDate = formData.deliveryDate;
                    payload.DeliveryDate = formData.deliveryDate;
                  }

                  if (payWay === 1) {
                    try {
                      const postRes = await axios.post(
                        `${server}/api/Cart/order`,
                        payload,
                        {
                          headers: { "Content-Type": "application/json" },
                          withCredentials: true,
                          timeout: 120_000,
                        }
                      );
                      if (postRes.status < 200 || postRes.status >= 300) {
                        toast.error(
                          "Bestellung konnte nicht ausgelöst werden."
                        );
                        return;
                      }
                      const postBody = postRes.data;
                      const postData = postBody?.data ?? postBody?.Data;
                      const resolvedOrderId = Number(
                        postData?.id ?? postData?.Id
                      );
                      if (!resolvedOrderId) {
                        toast.error(
                          "Bestellnummer fehlt. Bitte erneut versuchen."
                        );
                        return;
                      }
                      await axios.get(`${server}/api/Payment/success`, {
                        params: { orderId: resolvedOrderId },
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                        timeout: 120_000,
                      });
                      clearWangenCheckoutPaymentSession();
                      dispatch(successCheckOut());
                      clearCheckoutSessionStorage();
                      clearPendingCashCheckout();
                      dispatch(clearCart());
                      toast.success("Bestellung erfasst — vielen Dank!");
                      navigate(`/success/${resolvedOrderId}`);
                    } catch (err) {
                      console.error("Barzahlung Abschluss:", err);
                      const isTimeout =
                        err?.code === "ECONNABORTED" ||
                        /timeout/i.test(String(err?.message));
                      toast.error(
                        isTimeout
                          ? "Zeitüberschreitung — bitte erneut versuchen oder uns anrufen."
                          : extractOrderErrorMessage(err)
                      );
                    }
                    return;
                  }

                  try {
                    const response = await axios.post(
                      `${server}/api/Cart/order`,
                      payload,
                      {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                        timeout: 120_000,
                      }
                    );
                    const ok =
                      response.status >= 200 && response.status < 300;
                    if (!ok) {
                      toast.error(
                        "Bestellung wurde abgelehnt. Bitte erneut versuchen oder uns anrufen."
                      );
                      return;
                    }
                    const body = response.data;
                    const data = body?.data ?? body?.Data;
                    const orderId = data?.id ?? data?.Id;
                    if (orderId == null || orderId === "") {
                      toast.error(
                        "Bestellnummer fehlt. Bitte erneut versuchen."
                      );
                      return;
                    }
                    const enriched = { ...body, clientPaymentWay: payWay };
                    const paymentUrl = extractPaymentPageUrl(body);

                    /* Online: sofort zur PSP — vor Redux/Toast, damit keine Zwischen-Navigation (z. B. /payment) sichtbar wird. */
                    if (paymentUrl) {
                      clearPendingCashCheckout();
                      try {
                        sessionStorage.setItem(
                          "wangen_paymentResponse",
                          JSON.stringify(enriched)
                        );
                      } catch (_) {}
                      window.location.replace(paymentUrl);
                      return;
                    }

                    const finalTotalNumber =
                      Number(
                        data?.finalTotalNumber ?? data?.FinalTotalNumber ?? 0
                      ) || 0;
                    const gutscheinDeduction =
                      Number(
                        data?.gutscheinDeduction ?? data?.GutscheinDeduction ?? 0
                      ) || 0;
                    const zeroGutscheinOrder =
                      finalTotalNumber <= 0.005 && gutscheinDeduction > 0.005;

                    if (zeroGutscheinOrder) {
                      await axios.get(`${server}/api/Payment/success`, {
                        params: { orderId },
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                        timeout: 120_000,
                      });
                      clearWangenCheckoutPaymentSession();
                      dispatch(successCheckOut());
                      clearCheckoutSessionStorage();
                      clearPendingCashCheckout();
                      dispatch(clearCart());
                      toast.success("Bestellung erfasst — vielen Dank!");
                      navigate(`/success/${orderId}`);
                      return;
                    }

                    toast.error(
                      "Keine Zahlungs-URL erhalten. Bitte erneut versuchen oder uns anrufen."
                    );
                    navigate("/cart/checkOut", { replace: true });
                  } catch (err) {
                    console.error("Order error:", err);
                    if (err?.response?.status === 400) {
                      console.error(
                        "POST /api/Cart/order 400 body:",
                        err.response?.data
                      );
                    }
                    const msg = extractOrderErrorMessage(err);
                    const rawBody = err?.response?.data;
                    const combined = `${msg} ${typeof rawBody === "string" ? rawBody : ""}`;
                    if (/cart is empty/i.test(combined)) {
                      try {
                        clearPersistedVisitorId();
                        clearCheckoutUnlockedFlag();
                      } catch (_) {}
                      setServerCartProbe("empty");
                      toast.error(
                        "Warenkorb auf dem Server leer. Bitte Menü wählen und erneut «Bestellen» im Warenkorb."
                      );
                      navigate("/cart");
                      return;
                    }
                    toast.error(msg);
                    const lower = msg.toLowerCase();
                    if (lower.includes("gutschein")) {
                      focusCheckoutFieldById("discountCode");
                    } else if (
                      lower.includes("rabatt") ||
                      lower.includes("discount")
                    ) {
                      focusCheckoutFieldById("discountCode");
                    } else if (
                      lower.includes("liefergebiet") ||
                      lower.includes("postleitzahl liegt") ||
                      lower.includes("postleitzahl an")
                    ) {
                      focusCheckoutFieldById("city");
                    }
                  }
                } catch (unexpected) {
                  console.error("Checkout unerwartet:", unexpected);
                  toast.error(
                    "Unerwarteter Fehler. Bitte Seite neu laden oder uns anrufen."
                  );
                } finally {
                  setSending(false);
                }
              }}
            >
              {sending
                ? "Bitte warten..."
                : checkoutSubmitLabel}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckOutForm;
