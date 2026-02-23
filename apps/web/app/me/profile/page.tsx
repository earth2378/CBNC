"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { apiFetch } from "../../../src/lib/api";

type ProfileResponse = {
  user: { id: string; email: string; role: "employee" | "admin"; is_active: boolean };
  profile: {
    public_id: string;
    photo_url: string | null;
    email_public: string;
    phone_number: string;
    pref_enable_th: boolean;
    pref_enable_en: boolean;
    pref_enable_zh: boolean;
  };
  enabled_langs: Array<"th" | "en" | "zh">;
  localizations: Partial<
    Record<"th" | "en" | "zh", { full_name: string; position: string; department: string; bot_location: string }>
  >;
};

const fallbackLocalization = {
  full_name: "-",
  position: "-",
  department: "-",
  bot_location: "-"
};

const languages = ["th", "en", "zh"] as const;
type LanguageCode = (typeof languages)[number];

export default function MyProfilePage() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savePopup, setSavePopup] = useState<{ open: boolean; ok: boolean; message: string }>({
    open: false,
    ok: true,
    message: ""
  });

  useEffect(() => {
    apiFetch<ProfileResponse>("/me/profile")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  useEffect(() => {
    if (!savePopup.open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") {
        setSavePopup((prev) => ({ ...prev, open: false }));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [savePopup.open]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;

    const enabledCount = [
      data.profile.pref_enable_th,
      data.profile.pref_enable_en,
      data.profile.pref_enable_zh
    ].filter(Boolean).length;
    if (enabledCount === 0) {
      setSavePopup({
        open: true,
        ok: false,
        message: "At least one language must remain enabled."
      });
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        email_public: data.profile.email_public,
        phone_number: data.profile.phone_number,
        pref_enable_th: data.profile.pref_enable_th,
        pref_enable_en: data.profile.pref_enable_en,
        pref_enable_zh: data.profile.pref_enable_zh,
        localizations: {
          th: data.localizations.th,
          en: data.localizations.en,
          zh: data.localizations.zh
        }
      };

      const updated = await apiFetch<ProfileResponse>("/me/profile", {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      setData(updated);
      setSavePopup({
        open: true,
        ok: true,
        message: "Profile saved successfully."
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save";
      setError(message);
      setSavePopup({
        open: true,
        ok: false,
        message
      });
    } finally {
      setSaving(false);
    }
  }

  async function onDownloadQr() {
    try {
      const response = await fetch(`${qrUrl}&format=png`);
      if (!response.ok) {
        throw new Error(`Failed to download QR (${response.status})`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `cbnc-qr-${data?.profile.public_id ?? "profile"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setSavePopup({
        open: true,
        ok: false,
        message: "Unable to download QR right now. Please try again."
      });
    }
  }

  async function onPhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !data) {
      return;
    }

    const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedMimeTypes.has(file.type)) {
      setSavePopup({
        open: true,
        ok: false,
        message: "Only JPG, PNG, and WEBP images are allowed."
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSavePopup({
        open: true,
        ok: false,
        message: "Photo size must be 2 MB or less."
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const payload = await apiFetch<{ photo_url: string | null }>("/me/photo", {
        method: "POST",
        body: formData
      });

      setData({
        ...data,
        profile: {
          ...data.profile,
          photo_url: payload.photo_url
        }
      });
      setSavePopup({
        open: true,
        ok: true,
        message: "Photo uploaded successfully."
      });
    } catch (e) {
      setSavePopup({
        open: true,
        ok: false,
        message: e instanceof Error ? e.message : "Failed to upload photo."
      });
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function onPhotoRemove() {
    if (!data) {
      return;
    }

    setUploadingPhoto(true);
    try {
      await apiFetch<{ photo_url: string | null }>("/me/photo", {
        method: "DELETE"
      });
      setData({
        ...data,
        profile: {
          ...data.profile,
          photo_url: null
        }
      });
      setSavePopup({
        open: true,
        ok: true,
        message: "Photo removed successfully."
      });
    } catch (e) {
      setSavePopup({
        open: true,
        ok: false,
        message: e instanceof Error ? e.message : "Failed to remove photo."
      });
    } finally {
      setUploadingPhoto(false);
    }
  }

  if (!data) {
    return <div className="card">Loading profile...</div>;
  }
  const profile = data.profile;
  const publicPath = `/p/${data.profile.public_id}`;
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN?.replace(/\/$/, "");
  const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${configuredOrigin || runtimeOrigin}${publicPath}`;
  const qrUrl = `https://quickchart.io/qr?size=220&text=${encodeURIComponent(publicUrl)}`;

  function isLanguageEnabled(lang: LanguageCode) {
    if (lang === "th") return profile.pref_enable_th;
    if (lang === "en") return profile.pref_enable_en;
    return profile.pref_enable_zh;
  }

  function setLanguageEnabled(lang: LanguageCode, checked: boolean) {
    setData((prev) => {
      if (!prev) return prev;
      const enabledCount = [
        prev.profile.pref_enable_th,
        prev.profile.pref_enable_en,
        prev.profile.pref_enable_zh
      ].filter(Boolean).length;
      const currentlyEnabled =
        lang === "th" ? prev.profile.pref_enable_th : lang === "en" ? prev.profile.pref_enable_en : prev.profile.pref_enable_zh;

      if (!checked && currentlyEnabled && enabledCount <= 1) {
        setSavePopup({
          open: true,
          ok: false,
          message: "At least one language must remain enabled."
        });
        return prev;
      }

      if (lang === "th") {
        return { ...prev, profile: { ...prev.profile, pref_enable_th: checked } };
      }
      if (lang === "en") {
        return { ...prev, profile: { ...prev.profile, pref_enable_en: checked } };
      }
      return { ...prev, profile: { ...prev.profile, pref_enable_zh: checked } };
    });
  }

  const enabledLanguages = languages.filter((lang) => isLanguageEnabled(lang));

  return (
    <>
      <div className="grid-2">
        <div className="card">
        <h2 style={{ marginTop: 0 }}>Profile Editor</h2>
        <p style={{ color: "#475467", marginTop: 0 }}>
          Manage localized card data and public contact fields.
        </p>

        <div className="card-soft" style={{ marginBottom: 12 }}>
          <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
            <div className="row" style={{ alignItems: "center", gap: 10 }}>
              {data.profile.photo_url ? (
                <img
                  src={data.profile.photo_url}
                  alt="Profile photo"
                  width={96}
                  height={96}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 10,
                    objectFit: "contain",
                    border: "1px solid #dbe2f0",
                    background: "#ffffff"
                  }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 10,
                    border: "1px dashed #94a3b8",
                    color: "#64748b",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "0.75rem",
                    background: "#f8fafc"
                  }}
                >
                  No Photo
                </div>
              )}
              <div>
                <strong>Profile Photo</strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "#64748b" }}>
                  JPG, PNG, WEBP up to 2 MB.
                </p>
              </div>
            </div>

            <div className="row" style={{ gap: 8 }}>
              <label style={{ margin: 0, display: "inline-block" }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={onPhotoUpload}
                  disabled={uploadingPhoto}
                />
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 10,
                    padding: "10px 12px",
                    background: "#334155",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: uploadingPhoto ? "not-allowed" : "pointer",
                    opacity: uploadingPhoto ? 0.65 : 1
                  }}
                >
                  {uploadingPhoto ? "Working..." : "Upload"}
                </span>
              </label>
              <button
                type="button"
                className="secondary"
                onClick={onPhotoRemove}
                disabled={uploadingPhoto || !data.profile.photo_url}
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Public Email</label>
            <input
              value={data.profile.email_public}
              onChange={(e) => setData({ ...data, profile: { ...data.profile, email_public: e.target.value } })}
              required
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              value={data.profile.phone_number}
              onChange={(e) => setData({ ...data, profile: { ...data.profile, phone_number: e.target.value } })}
              required
            />
          </div>

          {languages.map((lang) => {
            const localized = data.localizations[lang] || fallbackLocalization;
            const enabled = isLanguageEnabled(lang);

            return (
              <div key={lang} className="card-soft" style={{ marginBottom: 10 }}>
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <strong>{lang.toUpperCase()}</strong>
                  <div className="row" style={{ gap: 8, alignItems: "center" }}>
                    <span className="pill">{enabled ? "Enabled" : "Disabled"}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`${lang.toUpperCase()} language toggle`}
                      className={`switch-btn ${enabled ? "on" : ""}`}
                      onClick={() => setLanguageEnabled(lang, !enabled)}
                    >
                      <span className="switch-knob" />
                    </button>
                  </div>
                </div>
                {enabled ? (
                  <>
                    <div className="field" style={{ marginTop: 8 }}>
                      <label>Full Name</label>
                      <input
                        value={localized.full_name}
                        onChange={(e) =>
                          setData({
                            ...data,
                            localizations: {
                              ...data.localizations,
                              [lang]: { ...localized, full_name: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                    <div className="field">
                      <label>Position</label>
                      <input
                        value={localized.position}
                        onChange={(e) =>
                          setData({
                            ...data,
                            localizations: {
                              ...data.localizations,
                              [lang]: { ...localized, position: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                    <div className="field">
                      <label>Department</label>
                      <input
                        value={localized.department}
                        onChange={(e) =>
                          setData({
                            ...data,
                            localizations: {
                              ...data.localizations,
                              [lang]: { ...localized, department: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                      <label>BOT Location</label>
                      <input
                        value={localized.bot_location}
                        onChange={(e) =>
                          setData({
                            ...data,
                            localizations: {
                              ...data.localizations,
                              [lang]: { ...localized, bot_location: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                  </>
                ) : (
                  <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "0.9rem" }}>
                    This language is disabled. Turn it on to edit content.
                  </p>
                )}
              </div>
            );
          })}

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        </div>

        <div className="card">
        <h2 style={{ marginTop: 0 }}>Live Preview</h2>

        <div className="card-soft" style={{ marginBottom: 10, textAlign: "center" }}>
          <img
            src={qrUrl}
            alt="Public profile QR code"
            width={180}
            height={180}
            style={{ borderRadius: 10, border: "1px solid #dbe2f0", background: "#fff" }}
          />
          <div
            className="row"
            style={{ justifyContent: "center", marginTop: 8, flexWrap: "nowrap", overflowX: "auto", gap: 8 }}
          >
            <button
              type="button"
              className={copied ? "" : "secondary"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                fontSize: "0.84rem",
                padding: "8px 10px"
              }}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(publicUrl);
                  setCopied(true);
                } catch {
                  setSavePopup({
                    open: true,
                    ok: false,
                    message: "Unable to copy link. Please copy it manually."
                  });
                }
              }}
            >
              <span aria-hidden="true" style={{ display: "inline-flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 4H8C6.89543 4 6 4.89543 6 6V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V6C18 4.89543 17.1046 4 16 4Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                textDecoration: "none",
                fontWeight: 600,
                whiteSpace: "nowrap",
                fontSize: "0.84rem"
              }}
            >
              <span aria-hidden="true" style={{ display: "inline-flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10 14L14 10M8.5 7H6.8C5.11984 7 4.27976 7 3.63803 7.32698C3.07354 7.6146 2.6146 8.07354 2.32698 8.63803C2 9.27976 2 10.1198 2 11.8V17.2C2 18.8802 2 19.7202 2.32698 20.362C2.6146 20.9265 3.07354 21.3854 3.63803 21.673C4.27976 22 5.11984 22 6.8 22H12.2C13.8802 22 14.7202 22 15.362 21.673C15.9265 21.3854 16.3854 20.9265 16.673 20.362C17 19.7202 17 18.8802 17 17.2V15.5M15.5 2H21.5M21.5 2V8M21.5 2L13 10.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Open Link
            </a>
            <button
              type="button"
              onClick={onDownloadQr}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                fontSize: "0.84rem",
                padding: "8px 10px"
              }}
            >
              <span aria-hidden="true" style={{ display: "inline-flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3V15M12 15L7 10M12 15L17 10M4 17V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Save QR as PNG
            </button>
          </div>
        </div>

        {enabledLanguages.map((lang) => {
          const v = data.localizations[lang] || fallbackLocalization;
          return (
            <div className="card-soft" style={{ marginBottom: 10 }} key={lang}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <strong>{v.full_name}</strong>
                <span className="pill">{lang.toUpperCase()}</span>
              </div>
              <dl className="kv" style={{ marginTop: 8 }}>
                <dt>Position</dt>
                <dd>{v.position}</dd>
                <dt>Department</dt>
                <dd>{v.department}</dd>
                <dt>Location</dt>
                <dd>{v.bot_location}</dd>
                <dt>Email</dt>
                <dd>{data.profile.email_public}</dd>
                <dt>Phone</dt>
                <dd>{data.profile.phone_number}</dd>
              </dl>
            </div>
          );
        })}
        </div>
      </div>

      {savePopup.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 16
          }}
        >
          <div className="card" style={{ maxWidth: 420, width: "100%" }}>
            <h3 style={{ marginTop: 0 }}>{savePopup.ok ? "Save Complete" : "Save Failed"}</h3>
            <p style={{ marginTop: 0, color: "#475467" }}>{savePopup.message}</p>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button
                className={savePopup.ok ? "" : "secondary"}
                onClick={() => setSavePopup((prev) => ({ ...prev, open: false }))}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
