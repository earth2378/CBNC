"use client";

import { useEffect, useRef, useState } from "react";

import { apiFetch } from "../../../src/lib/api";

type Theme = "light" | "dark";

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LocationData = {
  id: string;
  code: string;
  name_th: string;
  name_en: string;
  name_zh: string;
  address_th: string | null;
  address_en: string | null;
  address_zh: string | null;
} | null;

type PublicProfileResponse = {
  profile: {
    public_id: string;
    photo_url: string | null;
    email_public: string;
    phone_number: string;
    location: LocationData;
  };
  enabled_langs: Array<"th" | "en" | "zh">;
  localizations: Partial<
    Record<"th" | "en" | "zh", { full_name: string; position: string; department: string }>
  >;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PublicPage({ params }: { params: { publicId: string } }) {
  const [lang, setLang] = useState<"th" | "en" | "zh">("en");
  const [data, setData] = useState<PublicProfileResponse | null>(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [showQr, setShowQr] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (current === "dark" || current === "light") {
      setTheme(current);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    if (!showQr) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setShowQr(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showQr]);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore storage errors
    }
  }

  useEffect(() => {
    apiFetch<PublicProfileResponse>(`/public/profiles/${params.publicId}`)
      .then((payload) => {
        setData(payload);
        if (payload.enabled_langs.length > 0) {
          const firstEnabled = payload.enabled_langs[0];
          if (firstEnabled) {
            setLang((prev) => (payload.enabled_langs.includes(prev) ? prev : firstEnabled));
          }
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load public card"));
  }, [params.publicId]);

  useEffect(() => {
    if (!data || data.enabled_langs.length === 0) return;
    if (!data.enabled_langs.includes(lang)) {
      const firstEnabled = data.enabled_langs[0];
      if (firstEnabled) setLang(firstEnabled);
    }
  }, [data, lang]);

  const card = data?.localizations?.[lang];

  function getExportName(ext: "jpg" | "pdf") {
    return `cbnc-card-${params.publicId}-${lang}.${ext}`;
  }

  function downloadDataUrl(dataUrl: string, fileName: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function canvasToJpegBlob(canvas: HTMLCanvasElement, quality = 0.95) {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("failed to create blob"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        quality
      );
    });
  }

  async function loadScript(src: string) {
    if (document.querySelector(`script[src="${src}"]`)) return;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  async function renderCardCanvas() {
    if (!cardRef.current) throw new Error("card not found");

    await loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
    const html2canvas = (
      window as typeof window & {
        html2canvas?: (node: HTMLElement, options?: object) => Promise<HTMLCanvasElement>;
      }
    ).html2canvas;
    if (!html2canvas) throw new Error("html2canvas unavailable");

    return html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false
    });
  }

  async function onSaveJpg() {
    if (!cardRef.current) return;
    setExporting(true);
    setActionMessage("");
    try {
      const canvas = await renderCardCanvas();
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      downloadDataUrl(dataUrl, getExportName("jpg"));
    } catch {
      setActionMessage("Unable to save JPG. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function onShareJpg() {
    if (!cardRef.current) return;
    setExporting(true);
    setActionMessage("");
    try {
      const canvas = await renderCardCanvas();
      const blob = await canvasToJpegBlob(canvas, 0.95);
      const file = new File([blob], getExportName("jpg"), { type: "image/jpeg" });
      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };

      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          title: card?.full_name || "CBNC Public Name Card",
          text: "Public employee card",
          files: [file]
        });
        setActionMessage("");
        return;
      }

      if (nav.share) {
        const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
        const configuredOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN?.replace(/\/$/, "");
        const shareUrl = `${configuredOrigin || runtimeOrigin}/p/${params.publicId}`;
        await nav.share({
          title: card?.full_name || "CBNC Public Name Card",
          text: "Public employee card",
          url: shareUrl
        });
        setActionMessage("");
        return;
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      downloadDataUrl(dataUrl, getExportName("jpg"));
      setActionMessage("Image downloaded. On iPhone, open Share and choose Save Image.");
    } catch {
      setActionMessage("Unable to share JPG right now.");
    } finally {
      setExporting(false);
    }
  }

  function onSaveVCard() {
    if (!card) return;
    const esc = (v: string) => v.replace(/[\\,;]/g, (c) => `\\${c}`);
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${esc(card.full_name || "")}`,
      `N:${esc(card.full_name || "")};;;;`,
    ];
    if (card.position && card.position !== "-") lines.push(`TITLE:${esc(card.position)}`);
    if (card.department && card.department !== "-") lines.push(`ORG:${esc(card.department)}`);
    if (data?.profile.email_public && data.profile.email_public !== "-")
      lines.push(`EMAIL;TYPE=WORK:${esc(data.profile.email_public)}`);
    if (data?.profile.phone_number && data.profile.phone_number !== "-")
      lines.push(`TEL;TYPE=WORK,VOICE:${esc(data.profile.phone_number)}`);
    const loc = data?.profile.location;
    const locationName = lang === "th" ? loc?.name_th : lang === "zh" ? loc?.name_zh : loc?.name_en;
    const locationAddress = lang === "th" ? loc?.address_th : lang === "zh" ? loc?.address_zh : loc?.address_en;
    if (locationName && locationName !== "-")
      lines.push(`NOTE:${esc(locationName)}${locationAddress ? ` — ${esc(locationAddress)}` : ""}`);
    if (locationAddress)
      lines.push(`ADR;TYPE=WORK:;;${esc(locationAddress)};;;;`);
    lines.push("END:VCARD");

    const blob = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cbnc-${params.publicId}-${lang}.vcf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function onSavePdf() {
    if (!cardRef.current) return;
    setExporting(true);
    setActionMessage("");
    try {
      const canvas = await renderCardCanvas();
      const dataUrl = canvas.toDataURL("image/png");

      await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js");
      const JsPdfCtor = (
        window as typeof window & {
          jspdf?: {
            jsPDF?: new (options?: object) => {
              internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
              addImage: (data: string, format: string, x: number, y: number, w: number, h: number) => void;
              save: (name: string) => void;
            };
          };
        }
      ).jspdf?.jsPDF;
      if (!JsPdfCtor) throw new Error("jspdf unavailable");

      const width = canvas.width || 1200;
      const height = canvas.height || 800;
      const isLandscape = width > height;
      const pdf = new JsPdfCtor({ orientation: isLandscape ? "landscape" : "portrait", unit: "pt", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const scale = Math.min(availableWidth / width, availableHeight / height);
      const renderWidth = width * scale;
      const renderHeight = height * scale;
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      pdf.addImage(dataUrl, "PNG", x, y, renderWidth, renderHeight);
      pdf.save(getExportName("pdf"));
    } catch {
      setActionMessage("Unable to save PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  if (error) {
    return (
      <div className="public-page">
        <div className="public-card-wrap">
          <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <p className="error" style={{ margin: 0 }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="public-page">
        <div className="public-card-wrap">
          <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <p className="muted" style={{ margin: 0 }}>Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  const initials = card?.full_name ? getInitials(card.full_name) : "?";
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN?.replace(/\/$/, "");
  const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${configuredOrigin || runtimeOrigin}/p/${params.publicId}`;
  const qrUrl = `https://quickchart.io/qr?size=220&text=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="public-page">
      <div className="public-card-wrap">
        {/* Controls row: all display preferences right-aligned */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 12 }}>
          {data.enabled_langs.length > 1 && (
            <div className="lang-tabs" style={{ margin: 0 }}>
              {data.enabled_langs.map((code) => (
                <button
                  key={code}
                  type="button"
                  className={`lang-tab${lang === code ? " active" : ""}`}
                  onClick={() => setLang(code)}
                  aria-pressed={lang === code}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Card — captured for export */}
        <div className="public-card" ref={cardRef}>
          {/* Gradient header banner */}
          <div className="public-card-header" />

          {/* Avatar overlapping the header */}
          <div className="public-card-avatar-wrap">
            <div className="public-card-avatar">
              {data.profile.photo_url ? (
                <img src={data.profile.photo_url} alt={card?.full_name ?? "Profile photo"} />
              ) : (
                <div className="public-card-avatar-initials">{initials}</div>
              )}
            </div>
          </div>

          {/* Card body */}
          <div className="public-card-body">
            <h2 className="public-card-name">{card?.full_name || "-"}</h2>
            {card?.position && card.position !== "-" && (
              <p className="public-card-position">{card.position}</p>
            )}
            {card?.department && card.department !== "-" && (
              <p className="public-card-dept">{card.department}</p>
            )}

            <div className="public-card-divider" />

            <div className="contact-list">
              {(() => {
                const loc = data.profile.location;
                if (!loc) return null;
                const name = lang === "th" ? loc.name_th : lang === "zh" ? loc.name_zh : loc.name_en;
                const address = lang === "th" ? loc.address_th : lang === "zh" ? loc.address_zh : loc.address_en;
                if (!name || name === "-") return null;
                return (
                  <div className="contact-item" style={{ alignItems: "flex-start" }}>
                    <span className="contact-icon" aria-hidden="true" style={{ marginTop: 2 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2ZM12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9C14.5 10.3807 13.3807 11.5 12 11.5Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span>
                      <span style={{ display: "block" }}>{name}</span>
                      {address && <span style={{ display: "block", fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>{address}</span>}
                    </span>
                  </div>
                );
              })()}
              {data.profile.email_public && data.profile.email_public !== "-" && (
                <div className="contact-item">
                  <span className="contact-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 6L12 13L2 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <a href={`mailto:${data.profile.email_public}`}>{data.profile.email_public}</a>
                </div>
              )}
              {data.profile.phone_number && data.profile.phone_number !== "-" && (
                <div className="contact-item">
                  <span className="contact-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 16.92V19.92C22.0011 20.4853 21.7555 21.0238 21.3245 21.3979C20.8934 21.7719 20.3237 21.9473 19.76 21.88C16.4 21.5241 13.1759 20.3779 10.33 18.54C7.67771 16.8522 5.43366 14.6082 3.74598 11.956C1.90097 9.0979 0.754598 5.85792 0.40398 2.47998C0.336886 1.91861 0.510773 1.35207 0.881878 0.921685C1.25298 0.491296 1.78807 0.245163 2.35 0.24H5.35C6.35 0.228 7.19 0.940625 7.35 1.92998C7.52 3.00998 7.8 4.07 8.18 5.1C8.44 5.78 8.26 6.54 7.72 7.06L6.46 8.32C8.01 11.06 10.24 13.29 12.98 14.84L14.24 13.58C14.76 13.04 15.52 12.86 16.2 13.12C17.23 13.5 18.29 13.78 19.37 13.95C20.37 14.11 21.09 14.97 21.08 15.98L22 16.92Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{data.profile.phone_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export actions — outside cardRef so they don't appear in JPG/PDF */}
        <div className="export-bar">
          <button type="button" className="export-btn" onClick={() => setShowQr(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
              <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h2v3h-2zM18 18h3v3h-3z" fill="currentColor" />
            </svg>
            QR Code
          </button>
          <button type="button" className="export-btn" onClick={onSaveVCard}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 10C8 8.89543 8.89543 8 10 8H14C15.1046 8 16 8.89543 16 10C16 11.1046 15.1046 12 14 12H10C8.89543 12 8 11.1046 8 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 16C6.5 14.5 7.5 14 10 14H14C16.5 14 17.5 14.5 18 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Save Contact
          </button>
          <button type="button" className="export-btn" onClick={onShareJpg} disabled={exporting}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 16L4 17C4 18.6569 5.34315 20 7 20L17 20C18.6569 20 20 18.6569 20 17L20 16M16 12L12 16M12 16L8 12M12 16L12 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {exporting ? "Working…" : "Save JPG"}
          </button>
          <button type="button" className="export-btn" onClick={onSavePdf} disabled={exporting}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20M12 18V12M9 15H15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {exporting ? "Working…" : "Save PDF"}
          </button>
          <button type="button" className="export-btn" onClick={onShareJpg} disabled={exporting}
            title="Share this card"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12M16 6L12 2M12 2L8 6M12 2V15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Share
          </button>
        </div>

        {actionMessage && (
          <p className="muted" style={{ marginTop: 10, textAlign: "center", fontSize: "0.875rem" }}>
            {actionMessage}
          </p>
        )}
      </div>

      {/* QR modal */}
      {showQr && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 16
          }}
          onClick={() => setShowQr(false)}
        >
          <div
            className="card"
            style={{ maxWidth: 300, width: "100%", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>QR Code</h3>
            <img
              src={qrUrl}
              alt="Public profile QR code"
              width={220}
              height={220}
              style={{ borderRadius: 10, border: "1px solid var(--line)", background: "#fff" }}
            />
            <p className="muted" style={{ fontSize: "0.8rem", margin: "10px 0 16px" }}>
              Scan to open this name card
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <a
                href={`${qrUrl}&format=png`}
                download={`cbnc-qr-${params.publicId}.png`}
                className="export-btn"
                style={{ textDecoration: "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3V15M12 15L7 10M12 15L17 10M4 17V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Save PNG
              </a>
              <button type="button" className="export-btn" onClick={() => setShowQr(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
