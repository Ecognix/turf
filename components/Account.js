"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readData, writeData } from "../lib/demo";

export default function Account() {
  const [mode, setMode] = useState("sign-in");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");
  useEffect(() => { try { const data = readData(); setProfile(data.profiles.find(p => p.email === data.currentProfile) || null); } catch { setMessage("Unable to read profiles from browser storage."); } }, []);
  function submit(e) {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    try {
      const data = readData();
      const existing = data.profiles.find(p => p.email === email);
      if (mode === "sign-up" && existing) { setMessage("A profile with that email already exists on this browser. Sign in instead."); return; }
      if (mode === "sign-in" && !existing) { setMessage("No profile found on this browser. Create one first."); return; }
      if (mode === "sign-up" && !form.name.trim()) { setMessage("Please enter your name."); return; }
      const next = existing || { name: form.name.trim(), email };
      writeData({ ...data, profiles: existing ? data.profiles : [...data.profiles, next], currentProfile: email });
      setProfile(next); setMessage("");
    } catch { setMessage("Unable to save your profile. Check your browser storage settings."); }
  }
  function signOut() { try { const data = readData(); writeData({ ...data, currentProfile: null }); setProfile(null); } catch { setMessage("Unable to sign out. Check your browser storage settings."); } }
  return <section className="account-page wrap"><div className="account-intro"><div className="eyebrow"><span className="square" /> YOUR PLACE IN THE GAME</div><h1>Good to have<br /><em>you here.</em></h1><p>Keep your details close and get back to the game faster.</p></div><div className="booking-card account-card"><div className="notice">Profiles are saved only in this browser. There is no password or secure authentication yet; do not use sensitive information.</div>{profile ? <><h2>Welcome, {profile.name}.</h2><p>{profile.email}</p><Link className="button button-dark" href="/book">Book a game ↗</Link><button className="text-link account-signout" onClick={signOut}>Sign out</button></> : <><div className="account-tabs"><button className={mode === "sign-in" ? "active" : ""} onClick={() => { setMode("sign-in"); setMessage(""); }}>Sign in</button><button className={mode === "sign-up" ? "active" : ""} onClick={() => { setMode("sign-up"); setMessage(""); }}>Create account</button></div><h2>{mode === "sign-in" ? "Welcome back." : "Join the team."}</h2><p>{mode === "sign-in" ? "Find a profile created on this browser." : "Create a local profile to prefill your booking details."}</p><form onSubmit={submit} className="form-grid">{mode === "sign-up" && <label className="full">YOUR NAME<input required maxLength={80} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>}<label className="full">EMAIL ADDRESS<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><button className="button button-dark full">{mode === "sign-in" ? "Sign in" : "Create account"} <span>↗</span></button></form></>}{message && <div className="error" role="alert">{message}</div>}</div></section>;
}
