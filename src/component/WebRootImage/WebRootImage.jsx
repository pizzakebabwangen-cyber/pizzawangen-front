/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { getWebRootImageUrlCandidates } from "../../config/apiBase.js";
import "./WebRootImage.css";

/**
 * Lädt /Images/… von mehreren möglichen Hosts (www/apex/API), falls der erste 404/HTML liefert.
 */
export default function WebRootImage({ photoName, alt, className, style, ...rest }) {
  const candidates = useMemo(() => getWebRootImageUrlCandidates(photoName), [photoName]);
  const [idx, setIdx] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  useEffect(() => {
    setIdx(0);
    setAllFailed(false);
  }, [photoName]);

  if (!candidates.length) {
    return null;
  }

  if (allFailed) {
    const letter = (alt && String(alt).trim()[0]) || "?";
    return (
      <div
        className={`webroot-image-fallback ${className || ""}`.trim()}
        style={style}
        role="img"
        aria-label={alt || ""}
        data-no-runtime-translate="true"
      >
        {letter.toUpperCase()}
      </div>
    );
  }

  const safeIdx = Math.min(idx, candidates.length - 1);
  const src = candidates[safeIdx];

  return (
    <img
      {...rest}
      src={src}
      alt={alt || ""}
      className={className}
      style={style}
      onError={() => {
        if (idx < candidates.length - 1) {
          setIdx((i) => i + 1);
        } else {
          setAllFailed(true);
        }
      }}
    />
  );
}
