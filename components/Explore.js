"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import { regions, experiences, planningTips } from "../lib/explore";

const vibes = ["All", ...Array.from(new Set(regions.flatMap((r) => r.vibe)))];

export default function Explore() {
  const [query, setQuery] = useState("");
  const [vibe, setVibe] = useState("All");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") || "");
    const v = params.get("vibe");
    if (v && vibes.includes(v)) setVibe(v);
  }, []);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return regions.filter((r) => {
      const text = [r.name, r.tag, r.summary, ...r.vibe, ...r.places.flat()].join(" ").toLowerCase();
      return (!q || text.includes(q)) && (vibe === "All" || r.vibe.includes(vibe));
    });
  }, [query, vibe]);

  return (
    <>
      <section className="page-hero wrap"><div className="eyebrow"><span className="square" /> EXPLORE THE NORTH EAST</div><h1>Come for the game.<br /><em>Stay for the hills.</em></h1><p>Visiting Dibrugarh for a match? Here is a guide to the eight states of the North East: what to see, when to go and how to plan. Details are a general guide; confirm permits, timings and conditions before travelling.</p></section>
      <section className="wrap explore-search">
        <label className="search-box"><Icon name="search" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a state, place or experience, e.g. Kaziranga, tea, waterfalls" aria-label="Search destinations" /></label>
        <div className="chip-row" role="group" aria-label="Filter by experience">{vibes.map((v) => <button key={v} type="button" className={v === vibe ? "chip active" : "chip"} onClick={() => setVibe(v)}>{v}</button>)}</div>
        <p className="muted result-count">{results.length} {results.length === 1 ? "destination" : "destinations"} found</p>
      </section>
      <section className="wrap region-grid">
        {results.length === 0 && <p className="empty-state">Nothing matches that search. Try Assam, tea or waterfalls.</p>}
        {results.map((r) => (
          <article className="region-card" key={r.slug} id={r.slug}>
            <div className="region-head"><span className="region-tag">{r.tag}</span><h3>{r.name}</h3><p>{r.summary}</p></div>
            <div className="region-meta"><span><Icon name="clock" /> Best: {r.best}</span><span><Icon name="pin" /> {r.distance}</span></div>
            <ul className="place-list">{r.places.map(([name, text]) => <li key={name}><strong>{name}</strong><span>{text}</span></li>)}</ul>
            <p className="region-tip"><Icon name="star" /> {r.tip}</p>
          </article>
        ))}
      </section>
      <section className="dark-band"><div className="wrap"><div className="eyebrow light"><span className="square" /> THINGS TO DO</div><h2>Experiences worth <em>the trip.</em></h2><div className="exp-grid">{experiences.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>
      <section className="wrap section"><div className="eyebrow"><span className="square" /> PLAN SMART</div><h2>Before you <em>go.</em></h2><div className="tip-grid">{planningTips.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div><div className="cta-row"><Link className="button button-dark" href="/book">Book your match <Icon name="arrow" /></Link><Link className="button button-outline" href="/contact">Ask about local tips <Icon name="arrow" /></Link></div></section>
    </>
  );
}
