"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { regions } from "../lib/explore";

import { occasions as games } from "../lib/packages";
const experiences = Array.from(new Set(regions.flatMap((r) => r.vibe)));

function isoDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HomeSearch() {
  const router = useRouter();
  const [tab, setTab] = useState("play");
  const [date, setDate] = useState("");
  const [game, setGame] = useState(games[0]);
  const [budget, setBudget] = useState(0);
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [vibe, setVibe] = useState("All");

  function go(event) {
    event.preventDefault();
    if (tab === "play") {
      const params = new URLSearchParams({ occasion: game });
      if (date) params.set("date", date);
      router.push(`/book?${params}`);
    } else if (tab === "packages") {
      const params = new URLSearchParams();
      params.set("occasion", game);
      if (budget) params.set("budget", budget);
      router.push(`/packages?${params}`);
    } else {
      const params = new URLSearchParams();
      const text = [state, q.trim()].filter(Boolean).join(" ");
      if (text) params.set("q", text);
      if (vibe !== "All") params.set("vibe", vibe);
      router.push(`/explore${params.toString() ? `?${params}` : ""}`);
    }
  }

  return (
    <section className="wrap home-search-wrap">
      <form className="home-search" onSubmit={go}>
        <div className="search-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "play"} className={tab === "play" ? "active" : ""} onClick={() => setTab("play")}>Book a game</button>
          <button type="button" role="tab" aria-selected={tab === "packages"} className={tab === "packages" ? "active" : ""} onClick={() => setTab("packages")}>Packages</button>
          <button type="button" role="tab" aria-selected={tab === "explore"} className={tab === "explore" ? "active" : ""} onClick={() => setTab("explore")}>Explore North East</button>
        </div>
        <div className="search-fields">
          {tab === "packages" ? (
            <>
              <label><span>Occasion</span><select value={game} onChange={(e) => setGame(e.target.value)}>{games.map((g) => <option key={g}>{g}</option>)}</select></label>
              <label><span>Budget</span><select value={budget} onChange={(e) => setBudget(Number(e.target.value))}><option value={0}>Any budget</option><option value={2000}>Under ₹2,000</option><option value={5000}>Under ₹5,000</option><option value={10000}>Under ₹10,000</option></select></label>
            </>
          ) : tab === "play" ? (
            <>
              <label><span>Date</span><input type="date" min={isoDate()} max={isoDate(30)} value={date} onChange={(e) => setDate(e.target.value)} /></label>
              <label><span>Type of game</span><select value={game} onChange={(e) => setGame(e.target.value)}>{games.map((g) => <option key={g}>{g}</option>)}</select></label>
            </>
          ) : (
            <>
              <label className="grow"><span>Search</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kaziranga, tea, waterfalls..." /></label>
              <label><span>State</span><select value={state} onChange={(e) => setState(e.target.value)}><option value="">All states</option>{regions.map((r) => <option key={r.slug}>{r.name}</option>)}</select></label>
              <label><span>Experience</span><select value={vibe} onChange={(e) => setVibe(e.target.value)}><option>All</option>{experiences.map((v) => <option key={v}>{v}</option>)}</select></label>
            </>
          )}
          <button className="button button-dark" type="submit"><Icon name="search" /> Search <Icon name="arrow" /></button>
        </div>
      </form>
    </section>
  );
}
