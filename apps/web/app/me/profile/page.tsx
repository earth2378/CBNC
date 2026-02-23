"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiFetch } from "../../../src/lib/api";

type ProfileResponse = {
  user: { id: string; email: string; role: "employee" | "admin"; is_active: boolean };
  profile: {
    public_id: string;
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

  if (!data) {
    return <div className="card">Loading profile...</div>;
  }
  const profile = data.profile;

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
        <p className="card-soft" style={{ marginTop: 0 }}>
          Public URL: <a href={`/p/${data.profile.public_id}`}>{`/p/${data.profile.public_id}`}</a>
        </p>

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
