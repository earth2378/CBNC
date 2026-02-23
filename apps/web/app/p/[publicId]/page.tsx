"use client";

import { useEffect, useState } from "react";

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
        <div className="card-soft">
          {data.profile.photo_url && (
            <img
              src={data.profile.photo_url}
              alt={`${card?.full_name || "Profile"} photo`}
              width={120}
              height={120}
              style={{
                width: 120,
                height: 120,
                borderRadius: 10,
                objectFit: "contain",
                border: "1px solid #dbe2f0",
                background: "#ffffff",
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
      )}
    </div>
  );
}
