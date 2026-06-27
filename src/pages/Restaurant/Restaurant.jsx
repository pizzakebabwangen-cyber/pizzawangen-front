import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { getApiBaseUrl } from "../../config/apiBase.js";
import WebRootImage from "../../component/WebRootImage/WebRootImage.jsx";
import Delivery from "../../component/Delivery/Delivery";
import Location from "../../component/Location/Location";
import "./Restaurant.css";

const scrollToTop = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

function toEmbedVideoUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^Videos\//i.test(trimmed)) {
    return { type: "file", src: `${getApiBaseUrl()}/${trimmed}` };
  }
  if (trimmed.startsWith("/Videos/")) {
    return { type: "file", src: `${getApiBaseUrl()}${trimmed}` };
  }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(trimmed)) return { type: "file", src: trimmed };
  try {
    const u = new URL(trimmed);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? { type: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? { type: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
  } catch {
    return null;
  }
  return { type: "iframe", src: trimmed };
}

const Restaurant = () => {
  const server = import.meta.env.VITE_SERVER;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${server}/api/Restaurant/GetRestaurantPage`);
        if (!response.ok) throw new Error("load failed");
        const json = await response.json();
        setPage(json?.data ?? null);
      } catch (err) {
        console.error(err);
        setPage(null);
      }
      setLoading(false);
    };
    load();
  }, [server]);

  const settings = page?.settings ?? page?.Settings ?? {};
  const images = page?.images ?? page?.Images ?? [];
  const title = settings.title ?? settings.Title ?? "Unser Restaurant";
  const description =
    settings.description ?? settings.Description ?? "";
  const video = useMemo(
    () => toEmbedVideoUrl(settings.videoUrl ?? settings.VideoUrl),
    [settings]
  );

  const hero =
    images.find((i) => i.isHero || i.IsHero) ?? images[0] ?? null;
  const gallery = images.filter((i) => hero == null || i.id !== hero.id);

  return (
    <div className="restaurant-page">
      <motion.section
        ref={ref}
        initial={{ opacity: 0, y: 48 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
        className="restaurant-hero"
      >
        <h1 className="restaurant-title">
          <span className="highlight">{title}</span>
        </h1>
        {description && <p className="restaurant-intro">{description}</p>}
      </motion.section>

      {loading && <p className="restaurant-loading">Laden…</p>}

      {!loading && hero && (
        <div className="restaurant-hero-media">
          <WebRootImage
            photoName={hero.photoName ?? hero.PhotoName}
            alt={hero.caption ?? hero.Caption ?? title}
            className="restaurant-hero-img"
          />
          {(hero.caption || hero.Caption) && (
            <p className="restaurant-hero-caption">{hero.caption ?? hero.Caption}</p>
          )}
        </div>
      )}

      {!loading && video && (
        <div className="restaurant-video-wrap">
          {video.type === "iframe" ? (
            <iframe
              title="Restaurant Video"
              src={video.src}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={video.src} controls playsInline poster={hero ? undefined : undefined} />
          )}
        </div>
      )}

      {!loading && gallery.length > 0 && (
        <section className="restaurant-gallery" aria-label="Galerie">
          <h2 className="restaurant-gallery-heading">Galerie</h2>
          <div className="restaurant-gallery-grid">
            {gallery.map((img) => (
              <figure key={img.id ?? img.Id} className="restaurant-gallery-item">
                <WebRootImage
                  photoName={img.photoName ?? img.PhotoName}
                  alt={img.caption ?? img.Caption ?? ""}
                  className="restaurant-gallery-img"
                />
                {(img.caption || img.Caption) && (
                  <figcaption>{img.caption ?? img.Caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {!loading && images.length === 0 && (
        <p className="restaurant-empty">
          Bald finden Sie hier Fotos unseres Restaurants.
        </p>
      )}

      <div className="restaurant-cta">
        <Link to="/reservation" className="restaurant-cta-btn">
          Reservation
        </Link>
        <Link to="/menue" className="restaurant-cta-btn secondary">
          Zur Speisekarte
        </Link>
      </div>

      <Delivery />
      <Location />
    </div>
  );
};

export default Restaurant;
