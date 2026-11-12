"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Icon from "./Icon";
import { packages, occasions } from "../lib/packages";

const budgets = [["Any budget", 0], ["Under ₹2,000", 2000], ["Under ₹5,000", 5000], ["Under ₹10,000", 10000]];

function Inner() {
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [occasion, setOccasion] = useState("All");
  const [budget, setBudget] = useState(0);
  const [size, setSize] = useState(0);

  useEffect(() => {
    if (params.get("q")) setQ(params.get("q"));
    if (params.get("occasion")) setOccasion(params.get("occasion"));
    if (params.get("budget")) setBudget(Number(params.get("budget")) || 0);
  }, [params]);

  const list = useMemo(() => packages.filter((p) => {
    const text = `${p.name} ${p.occasion} ${p.perks.join(" ")}`.toLowerCase();
    const max = Number(p.players.replace(/\D/g, ""));
    return (!q || text.includes(q.toLowerCase())) && (occasion === "All" || p.occasion === occasion) && (!budget || p.price <= budget) && max >= size;
  }), [q, occasion, budget, size]);

  return (
    <div className="wrap packages-page">
      <div className="inner-hero"><div className="eyebrow"><span className="square" /> PACKAGES</div><h1>Pick a plan.<br /><em>Play your way.</em></h1><p>From a one-hour kickabout to a full tournament day. Prices are indicative and confirmed at booking.</p></div>
      <form className="home-search" onSubmit={(e) => e.preventDefault()}>
        <div className="search-fields">
          <label className="grow"><span>Search</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Birthday, night, referee..." /></label>
          <label><span>Occasion</span><select value={occasion} onChange={(e) => setOccasion(e.target.value)}><option>All</option>{occasions.map((o) => <option key={o}>{o}</option>)}</select></label>
          <label><span>Budget</span><select value={budget} onChange={(e) => setBudget(Number(e.target.value))}>{budgets.map(([l, v]) => <option key={l} value={v}>{l}</option>)}</select></label>
          <label><span>Players</span><select value={size} onChange={(e) => setSize(Number(e.target.value))}><option value={0}>Any</option><option value={14}>14+</option><option value={20}>20+</option><option value={40}>40+</option></select></label>
        </div>
      </form>
      <p className="results-count">{list.length} package{list.length === 1 ? "" : "s"} found</p>
      <div className="package-grid">
        {list.map((p) => (
          <article className="package-card" key={p.id}>
            <span className="package-tag">{p.tag}</span>
            <h3>{p.name}</h3>
            <div className="package-price"><strong>₹{p.price.toLocaleString("en-IN")}</strong><small>{p.unit}</small></div>
            <p className="muted">{p.players} players · {p.hours} hr{p.hours > 1 ? "s" : ""}</p>
            <ul>{p.perks.map((x) => <li key={x}><Icon name="star" /> {x}</li>)}</ul>
            <Link className="button button-dark" href={`/book?occasion=${encodeURIComponent(p.occasion)}`}>Book this <Icon name="arrow" /></Link>
          </article>
        ))}
      </div>
      {!list.length && <div className="empty-state"><p>No packages match. Try clearing a filter, or <Link className="text-link" href="/contact">ask us for a custom plan</Link>.</p></div>}
    </div>
  );
}

export default function Packages() { return <Suspense fallback={null}><Inner /></Suspense>; }
