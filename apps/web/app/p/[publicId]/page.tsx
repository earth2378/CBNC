"use client";

import { useEffect, useRef, useState } from "react";

import { apiFetch } from "../../../src/lib/api";

type PublicProfileResponse = {
  profile: {
    public_id: string;
    photo_url: string | null;
    email_public: string;
    phone_number: string;
  };
  enabled_langs: Array<"th" | "en" | "zh">;
  localizations: Partial<
    Record<"th" | "en" | "zh", { full_name: string; position: string; department: string; bot_location: string }>
  >;
};

export default function PublicPage({ params }: { params: { publicId: string } }) {
  const [lang, setLang] = useState<"th" | "en" | "zh">("en");
  const [data, setData] = useState<PublicProfileResponse | null>(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

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
    if (!data || data.enabled_langs.length === 0) {
      return;
    }
    if (!data.enabled_langs.includes(lang)) {
      const firstEnabled = data.enabled_langs[0];
      if (firstEnabled) {
        setLang(firstEnabled);
      }
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
    if (document.querySelector(`script[src="${src}"]`)) {
      return;
    }
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
    if (!cardRef.current) {
      throw new Error("card not found");
    }

    await loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
    const html2canvas = (window as typeof window & { html2canvas?: (node: HTMLElement, options?: object) => Promise<HTMLCanvasElement> }).html2canvas;
    if (!html2canvas) {
      throw new Error("html2canvas unavailable");
    }

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
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };

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

  async function onSavePdf() {
    if (!cardRef.current) return;
    setExporting(true);
    setActionMessage("");
    try {
      const canvas = await renderCardCanvas();
      const dataUrl = canvas.toDataURL("image/png");

      await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js");
      const JsPdfCtor = (window as typeof window & { jspdf?: { jsPDF?: new (options?: object) => { internal: { pageSize: { getWidth: () => number; getHeight: () => number } }; addImage: (data: string, format: string, x: number, y: number, w: number, h: number) => void; save: (name: string) => void } } }).jspdf?.jsPDF;
      if (!JsPdfCtor) {
        throw new Error("jspdf unavailable");
      }

      const width = canvas.width || 1200;
      const height = canvas.height || 800;
      const isLandscape = width > height;
      const pdf = new JsPdfCtor({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "pt",
        format: "a4"
      });

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

  return (
    <div className="auth-wrap card">
      <h2 style={{ marginTop: 0 }}>Public Name Card</h2>
      <div className="field">
        <label>Language</label>
        <div className="row">
          {(data?.enabled_langs ?? []).map((code) => (
            <button
              key={code}
              type="button"
              className={lang === code ? "" : "secondary"}
              onClick={() => setLang(code)}
              style={{ minWidth: 64 }}
              aria-pressed={lang === code}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {!data && !error && <p>Loading...</p>}
      {data && (
        <>
          <div className="card-soft" ref={cardRef}>
            {data.profile.photo_url && (
              <div
                role="img"
                aria-label={`${card?.full_name || "Profile"} photo`}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 10,
                  border: "1px solid #dbe2f0",
                  backgroundColor: "#ffffff",
                  backgroundImage: `url("${data.profile.photo_url}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "contain",
                  display: "block",
                  margin: "0 auto 10px"
                }}
              />
            )}
            <h3 style={{ marginTop: 0 }}>{card?.full_name || "-"}</h3>
            <dl className="kv">
              <dt>Position</dt>
              <dd>{card?.position || "-"}</dd>
              <dt>Department</dt>
              <dd>{card?.department || "-"}</dd>
              <dt>Location</dt>
              <dd>{card?.bot_location || "-"}</dd>
              <dt>Email</dt>
              <dd>{data.profile.email_public || "-"}</dd>
              <dt>Phone</dt>
              <dd>{data.profile.phone_number || "-"}</dd>
            </dl>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" className="secondary" onClick={onShareJpg} disabled={exporting}>
              Share JPG
            </button>
            <button
              type="button"
              className="secondary"
              disabled={exporting}
              onClick={onSavePdf}
            >
              Save PDF
            </button>
          </div>
          {actionMessage && <p className="ok">{actionMessage}</p>}
        </>
      )}
    </div>
  );
}
