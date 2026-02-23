"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "../../../src/lib/api";

type PublicProfileResponse = {
  profile: {
    public_id: string;
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
    apiFetch<PublicProfileResponse>(`/public/profiles/${params.publicId}?lang=${lang}`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load public card"));
  }, [params.publicId, lang]);

  const card = data?.localizations?.[lang];

  return (
    <div className="auth-wrap card">
      <h2 style={{ marginTop: 0 }}>Public Name Card</h2>
      <div className="field">
        <label>Language</label>
        <select value={lang} onChange={(e) => setLang(e.target.value as "th" | "en" | "zh")}>
          <option value="th">TH</option>
          <option value="en">EN</option>
          <option value="zh">ZH</option>
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      {!data && !error && <p>Loading...</p>}
      {data && (
        <div className="card-soft">
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
