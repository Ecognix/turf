"use client";

import Icon from "./Icon";




import { useEffect, useState } from "react";
import { addDays, isPast, isUnavailable, money, prettyDate, priceFor, readData, slots, timeLabel, todayString, writeData } from "../lib/demo";

export default function Booking() {
  const [data, setData] = useState(null);
  const [date, setDate] = useState("");
  const [hour, setHour] = useState(null);
  const [details, setDetails] = useState({ name: "", phone: "", email: "", occasion: "Friendly match", notes: "" });
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get("date");
    setDate(wanted && wanted >= todayString() && wanted <= addDays(todayString(), 30) ? wanted : todayString());
    const occasion = params.get("occasion");
    if (occasion) setDetails(previous => ({ ...previous, occasion }));
    const refresh = () => { try { const stored = readData(); setData(stored); setError(""); } catch { setError("Could not read local data. Check your browser storage settings."); } };
    refresh();
    try { const stored = readData(); const profile = stored.profiles.find(p => p.email === stored.currentProfile); if (profile) setDetails(previous => ({ ...previous, name: profile.name, email: profile.email })); } catch { setError("Could not read your local profile."); }
    window.addEventListener("storage", refresh); window.addEventListener("turf-data-change", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("turf-data-change", refresh); };
  }, []);
  function chooseDate(value) { setDate(value); setHour(null); setConfirmed(null); }
  function submit(e) {
    e.preventDefault();
    if (!date || date < todayString() || date > addDays(todayString(), 30)) { setError("Please choose a date within the next 30 days."); return; }
    if (!details.name.trim()) { setError("Please enter your name."); return; }
    if (hour === null) { setError("Please select an available time slot."); return; }
    try {
      const current = readData();
      if (isPast(date, hour) || isUnavailable(current, date, hour)) { setError("That slot is no longer available. Please choose another."); setHour(null); setData(current); return; }
      const booking = { id: `TRF-${Date.now().toString(36).toUpperCase()}`, date, hour, price: priceFor(hour, current.settings), ...details, name: details.name.trim(), status: "Confirmed", createdAt: new Date().toISOString() };
      writeData({ ...current, bookings: [booking, ...current.bookings] });
      setConfirmed(booking); setHour(null); setError(""); setDetails({ name: "", phone: "", email: "", occasion: "Friendly match", notes: "" });
    } catch { setError("Could not save your booking. Check your browser storage settings."); }
  }
  function cancel(id) {
    try { const current = readData(); if (current.matchSession?.bookingId === id && !current.matchSession.endedAt) { setError("This booking has an active pitch session and cannot be cancelled."); return; } if (current.bookings.some(b => b.id === id && b.matchFinished)) { setError("A finished pitch session cannot be cancelled."); return; } writeData({ ...current, bookings: current.bookings.map(b => b.id === id ? { ...b, status: "Cancelled" } : b) }); } catch { setError("Could not cancel this booking. Check your browser storage settings."); }
  }
  const mine = data?.bookings || [];
  return <section className="booking-page wrap">
    <div className="page-heading"><div><div className="eyebrow"><span className="square" /> YOUR NEXT GAME AWAITS</div><h1>Let's get you <em>playing.</em></h1><p>Pick your moment. We'll save you a place on the pitch.</p></div><div className="demo-pill"><span className="live-dot" /> BOOKING PREVIEW</div></div>
    <div className="notice"><strong>Booking preview.</strong> Slots, rates and details are illustrative. Bookings are saved only in this browser; no payment is taken and no real reservation is made.</div>
    {error && <div className="error" role="alert">{error}</div>}
    {confirmed && <div className="success" role="status"><div><strong>You're on the team, {confirmed.name}!</strong><p>Booking {confirmed.id} · {prettyDate(confirmed.date)} · {timeLabel(confirmed.hour)}–{timeLabel(confirmed.hour + 1)}. No real reservation has been made.</p></div><button onClick={() => setConfirmed(null)} aria-label="Dismiss confirmation"><Icon name="close" /></button></div>}
    <div className="booking-grid"><div className="booking-main">
      <div className="booking-card"><div className="card-heading"><div><span className="step-number">01</span><h2>Pick your day</h2><p>Good games are always worth making time for.</p></div><label className="date-picker">CHOOSE DATE<input type="date" min={date ? todayString() : undefined} max={date ? addDays(todayString(), 30) : undefined} value={date} onChange={e => chooseDate(e.target.value)} /></label></div><div className="date-strip">{date && Array.from({ length: 7 }, (_, i) => addDays(todayString(), i)).map(d => <button key={d} onClick={() => chooseDate(d)} className={date === d ? "date-tile selected" : "date-tile"}><span>{prettyDate(d, { weekday: "short" })}</span><strong>{new Date(`${d}T12:00:00`).getDate()}</strong><small>{prettyDate(d, { month: "short" })}</small></button>)}</div></div>
      <div className="booking-card"><div className="card-heading"><div><span className="step-number">02</span><h2>Choose your time</h2><p>{date ? prettyDate(date, { weekday: "long", day: "numeric", month: "long" }) : "Loading dates…"} · 1 hour per slot</p></div><div className="legend"><span /> Available <i /> Unavailable</div></div><div className="slots">{slots.map(h => { const unavailable = !data || !date || isPast(date, h) || isUnavailable(data, date, h); return <button type="button" disabled={unavailable} onClick={() => { setHour(h); setError(""); }} className={hour === h ? "slot selected" : "slot"} key={h}><strong>{timeLabel(h)}</strong><small>{unavailable ? "Unavailable" : money(priceFor(h, data?.settings))}</small></button>; })}</div><p className="fine-print">Indicative rates: {money(data?.settings.dayRate ?? 1200)}/hour before 5 PM · {money(data?.settings.eveningRate ?? 1500)}/hour from 5 PM. Subject to change.</p></div>
      <form className="booking-card" id="booking-form" onSubmit={submit}><div className="card-heading"><div><span className="step-number">03</span><h2>Your details</h2><p>A few details and you're good to go.</p></div></div><div className="form-grid"><label>FULL NAME <input required maxLength={80} value={details.name} onChange={e => setDetails({ ...details, name: e.target.value })} placeholder="Your name" /></label><label>PHONE NUMBER <input required type="tel" pattern="[0-9]{10,15}" title="Enter 10 to 15 digits" value={details.phone} onChange={e => setDetails({ ...details, phone: e.target.value })} placeholder="10–15 digits" /></label><label>EMAIL <span>(OPTIONAL)</span><input type="email" value={details.email} onChange={e => setDetails({ ...details, email: e.target.value })} placeholder="you@example.com" /></label><label>OCCASION <select value={details.occasion} onChange={e => setDetails({ ...details, occasion: e.target.value })}><option>Friendly match</option><option>Practice session</option><option>Birthday / celebration</option><option>Corporate game</option><option>Other</option></select></label><label className="full">ANYTHING ELSE? <span>(OPTIONAL)</span><textarea maxLength={300} value={details.notes} onChange={e => setDetails({ ...details, notes: e.target.value })} placeholder="Tell us about your game" rows="3" /></label></div><button className="button button-dark mobile-confirm" type="submit">Confirm booking <span><Icon name="arrow" /></span></button></form>
    </div><aside><div className="summary-card"><div className="eyebrow">YOUR GAME PLAN</div><h2>The good stuff.</h2><div className="summary-row"><span>Venue</span><strong>The Turf, Dibrugarh</strong></div><div className="summary-row"><span>Date</span><strong>{date ? prettyDate(date) : "—"}</strong></div><div className="summary-row"><span>Time</span><strong>{hour !== null ? `${timeLabel(hour)} – ${timeLabel(hour + 1)}` : "Choose a slot"}</strong></div><div className="summary-row"><span>Duration</span><strong>1 hour</strong></div><div className="summary-total"><span>Estimated total</span><strong>{hour !== null ? money(priceFor(hour, data?.settings)) : "—"}</strong></div><button form="booking-form" className="button button-lime" type="submit" disabled={!data}>Confirm booking <span><Icon name="arrow" /></span></button><p>No payment required. This is not a real booking.</p></div><div className="aside-note"><span><Icon name="star" /></span><p><strong>Need more than one hour?</strong><br />Make a separate booking for each slot.</p></div></aside></div>
    <div className="my-bookings"><div className="section-heading"><div><div className="eyebrow"><span className="square" /> YOUR LOCAL ACTIVITY</div><h2>Your <em>bookings.</em></h2></div><p>Bookings made in this browser appear here and in the staff dashboard.</p></div>{mine.length === 0 ? <div className="empty-state">No bookings yet. Your next game is waiting <Icon name="up" /></div> : <div className="booking-list">{mine.map(b => <div className="booking-item" key={b.id}><div><strong>{prettyDate(b.date)} · {timeLabel(b.hour)} – {timeLabel(b.hour + 1)}</strong><small>{b.id} · {b.name} · {money(b.price)}</small>{b.matchFinished && <small>Overtime estimate: {b.overtimeMinutes} min · {money(b.overtimeCharge)} (not paid)</small>}</div><span className={b.status === "Cancelled" ? "status cancelled" : "status"}>{b.status}</span>{b.status === "Confirmed" && <button className="small-action" onClick={() => cancel(b.id)}>Cancel booking</button>}</div>)}</div>}</div>
  </section>;
}
