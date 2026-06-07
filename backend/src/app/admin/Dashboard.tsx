"use client";

import { useEffect, useState, useCallback } from "react";

const TOPIC_OPTIONS = [
  "gaza",
  "palestine",
  "sudan",
  "kashmir",
  "civil-rights",
  "islamophobia",
  "community-safety",
  "foreign-policy",
];

type LiveItem = {
  id: string;
  headline: string;
  source_name: string;
  published_at: string;
  topics: string[];
};

export default function Dashboard() {
  // compose state
  const [url, setUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceSummary, setSourceSummary] = useState(""); // reading aid only
  const [blurb, setBlurb] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [billId, setBillId] = useState("");
  const [emailContext, setEmailContext] = useState("");
  const [callPoints, setCallPoints] = useState("");

  const [fetching, setFetching] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [live, setLive] = useState<LiveItem[]>([]);

  const loadLive = useCallback(async () => {
    const res = await fetch("/api/admin/items");
    if (res.ok) setLive((await res.json()).items ?? []);
  }, []);

  useEffect(() => {
    loadLive();
  }, [loadLive]);

  async function pullUrl() {
    setErr("");
    setOk("");
    if (!url.trim()) return;
    setFetching(true);
    try {
      const res = await fetch("/api/admin/og", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "Could not read that URL.");
        return;
      }
      setHeadline(data.title || "");
      setSourceName(data.siteName || "");
      setSourceUrl(data.finalUrl || url.trim());
      setSourceSummary(data.description || "");
    } catch {
      setErr("Network error pulling the URL.");
    } finally {
      setFetching(false);
    }
  }

  function toggleTopic(t: string) {
    setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  async function publish() {
    setErr("");
    setOk("");
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          headline,
          blurb,
          sourceName,
          sourceUrl,
          topics,
          billId,
          emailContext,
          callPoints: callPoints
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error === "validation" ? "Check the fields — a blurb is required." : data.message || "Publish failed.");
        return;
      }
      setOk("Published. Live in the app on next fetch.");
      // reset compose
      setUrl("");
      setHeadline("");
      setSourceName("");
      setSourceUrl("");
      setSourceSummary("");
      setBlurb("");
      setTopics([]);
      setBillId("");
      setEmailContext("");
      setCallPoints("");
      loadLive();
    } catch {
      setErr("Network error publishing.");
    } finally {
      setPublishing(false);
    }
  }

  async function unpublish(id: string) {
    if (!confirm("Unpublish this item?")) return;
    const res = await fetch(`/api/admin/items?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) loadLive();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const canPublish = headline.trim() && blurb.trim().length >= 10 && sourceName.trim() && sourceUrl.trim();

  return (
    <div className="wrap">
      <div className="topbar">
        <span className="brand">Khidr.</span>
        <button className="btn btn-line" onClick={logout}>
          Sign out
        </button>
      </div>

      {/* Add by URL (Method 1, primary) */}
      <label className="label">Add by URL</label>
      <div className="row">
        <input
          className="field"
          placeholder="Paste a story URL…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pullUrl()}
        />
        <button className="btn btn-line" onClick={pullUrl} disabled={fetching || !url.trim()} style={{ whiteSpace: "nowrap" }}>
          {fetching ? "Reading…" : "Pull"}
        </button>
      </div>

      <div className="cols" style={{ marginTop: 22 }}>
        {/* compose */}
        <div className="panel">
          <div className="kicker">Compose</div>

          <label className="label">Headline</label>
          <input className="field" value={headline} onChange={(e) => setHeadline(e.target.value)} />

          <label className="label">Source name</label>
          <input className="field" value={sourceName} onChange={(e) => setSourceName(e.target.value)} />

          <label className="label">Source URL</label>
          <input className="field" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />

          {sourceSummary && (
            <>
              <label className="label">Source summary — reading aid only, never published</label>
              <div className="grey">{sourceSummary}</div>
            </>
          )}

          <label className="label">Blurb — your own words (required)</label>
          <textarea className="area" value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="Two sentences in our voice. Facts + framing, never 'demand X'. Put any vote/meeting date in here, not a system field." />

          <label className="label">Topics</label>
          <div className="chips">
            {TOPIC_OPTIONS.map((t) => (
              <span key={t} className={`chip ${topics.includes(t) ? "on" : ""}`} onClick={() => toggleTopic(t)}>
                {t}
              </span>
            ))}
          </div>

          <label className="label">Bill id (optional)</label>
          <input className="field" value={billId} onChange={(e) => setBillId(e.target.value)} />

          <label className="label">Email context (optional, for the static draft)</label>
          <input className="field" value={emailContext} onChange={(e) => setEmailContext(e.target.value)} />

          <label className="label">Call points (optional, one per line)</label>
          <textarea className="area" style={{ minHeight: 80 }} value={callPoints} onChange={(e) => setCallPoints(e.target.value)} />

          <button className="btn btn-solid" style={{ width: "100%", marginTop: 18 }} disabled={!canPublish || publishing} onClick={publish}>
            {publishing ? "Publishing…" : "Publish"}
          </button>
          <div className="err">{err}</div>
          <div className="ok">{ok}</div>
        </div>

        {/* live preview */}
        <div>
          <div className="kicker" style={{ marginBottom: 12 }}>
            Preview — how it appears in the app
          </div>
          <div className="preview">
            <div className="src">{sourceName || "Source"}</div>
            <h3>{headline || "Headline goes here"}</h3>
            <p>{blurb || "Your blurb, in your own words, will show here."}</p>
            {topics.length > 0 && <div className="topics">{topics.join(" · ")}</div>}
          </div>
          <p className="faint" style={{ fontSize: 12, marginTop: 12, lineHeight: 1.5 }}>
            The app shows your headline, your blurb, and a link to the original. The
            source&apos;s own text is never shown to users.
          </p>
        </div>
      </div>

      {/* live now */}
      <div className="live">
        <div className="kicker" style={{ marginBottom: 6 }}>
          Live now — last 30 days
        </div>
        {live.length === 0 && <p className="faint" style={{ fontSize: 14, paddingTop: 10 }}>Nothing published yet.</p>}
        {live.map((it, i) => (
          <div className="liveitem" key={it.id}>
            <div>
              {i === 0 && <span className="leadtag">Today lead · </span>}
              <span className="t">{it.headline}</span>
              <div className="m">
                {it.source_name} · {new Date(it.published_at).toLocaleDateString("en-GB")}
                {it.topics?.length ? " · " + it.topics.join(", ") : ""}
              </div>
            </div>
            <button className="btn btn-danger" onClick={() => unpublish(it.id)}>
              Unpublish
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
