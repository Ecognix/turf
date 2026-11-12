"use client";

import Icon from "./Icon";




import Link from "next/link";
import { useEffect, useState } from "react";
import { addDays, isPast, money, prettyDate, readData, slots, timeLabel, todayString, writeData } from "../lib/demo";

const examples = [
  { id: "example-1", name: "Riverside Arena", city: "Dibrugarh", area: "Upper Assam", sport: "Football", rate: 1000, description: "A compact pitch for friendly matches and training sessions.", example: true },
  { id: "example-2", name: "The Playfield", city: "Dibrugarh", area: "Upper Assam", sport: "Football", rate: 1400, description: "A neighbourhood space for evening games and weekend teams.", example: true },
];
const emptyListing = { name: "", city: "", area: "", sport: "Football", rate: "", description: "" };
const emptyPlayer = { name: "", phone: "" };

export default function Marketplace() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All games");
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [player, setPlayer] = useState(emptyPlayer);
  const [listing, setListing] = useState(emptyListing);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDate(todayString());
    const refresh = () => {
      try { setData(readData()); }
      catch { setError("Could not read local data. Check your browser storage settings."); }
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("turf-data-change", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("turf-data-change", refresh); };
  }, []);

  const profile = data?.profiles.find(p => p.email === data.currentProfile);
  const organizer = profile?.role === "organizer";
  const venues = [...examples, ...(data?.marketplaceVenues || []).filter(v => !v.hidden)];
  const filtered = venues.filter(v => `${v.name} ${v.city} ${v.area} ${v.sport}`.toLowerCase().includes(query.trim().toLowerCase()) && (sport === "All games" || v.sport === sport));
  const ownVenues = data?.marketplaceVenues.filter(v => v.owner === profile?.email) || [];
  const ownBookings = data?.marketplaceBookings.filter(b => ownVenues.some(v => v.id === b.venueId)) || [];
  const localBookings = data?.marketplaceBookings || [];

  function addListing(e) {
    e.preventDefault();
    if (!listing.name.trim() || !listing.city.trim() || !listing.area.trim() || !listing.description.trim()) { setError("Please complete the listing details."); return; }
    const rate = Number(listing.rate);
    if (!Number.isInteger(rate) || rate <= 0 || rate > 100000) { setError("Enter an hourly rate between ₹1 and ₹1,00,000."); return; }
    try {
      const current = readData();
      const owner = current.profiles.find(p => p.email === current.currentProfile);
      if (!owner || owner.role !== "organizer") { setError("Sign in with an organizer profile on this browser to add a listing."); return; }
      const venue = { ...listing, name: listing.name.trim(), city: listing.city.trim(), area: listing.area.trim(), description: listing.description.trim(), rate, owner: owner.email, id: `venue-${Date.now().toString(36)}`, hidden: false };
      writeData({ ...current, marketplaceVenues: [...current.marketplaceVenues, venue] });
      setListing(emptyListing); setShowForm(false); setError(""); setNotice("Your listing has been saved on this browser only. It is not published online.");
    } catch { setError("Could not save your listing. Check your browser storage settings."); }
  }

  function book(e) {
    e.preventDefault();
    if (!selected || !date || date < todayString() || date > addDays(todayString(), 30) || hour === "" || !player.name.trim() || !/^[0-9]{10,15}$/.test(player.phone)) { setError("Choose a date and time, and enter a name and a 10–15 digit phone number."); return; }
    try {
      const current = readData();
      const venue = selected.example ? examples.find(v => v.id === selected.id) : current.marketplaceVenues.find(v => v.id === selected.id && !v.hidden);
      const chosenHour = Number(hour);
      if (!venue || !slots.includes(chosenHour) || isPast(date, chosenHour) || current.marketplaceBookings.some(b => b.venueId === venue.id && b.date === date && b.hour === chosenHour && b.status !== "Cancelled")) { setError("This listing or time is no longer available. Please choose another."); setHour(""); return; }
      const booking = { id: `MKT-${Date.now().toString(36).toUpperCase()}`, venueId: venue.id, venueName: venue.name, date, hour: chosenHour, name: player.name.trim(), phone: player.phone, price: venue.rate, status: "Confirmed" };
      writeData({ ...current, marketplaceBookings: [booking, ...current.marketplaceBookings] });
      setNotice(`${booking.id} saved on this browser. No real booking or payment was made.`); setSelected(null); setHour(""); setPlayer(emptyPlayer); setError("");
    } catch { setError("Could not save the booking. Check your browser storage settings."); }
  }

  function cancel(id) {
    try { const current = readData(); writeData({ ...current, marketplaceBookings: current.marketplaceBookings.map(b => b.id === id ? { ...b, status: "Cancelled" } : b) }); setNotice("Booking cancelled on this browser."); setError(""); }
    catch { setError("Could not cancel the booking. Check your browser storage settings."); }
  }

  function hideListing(id) {
    try {
      const current = readData();
      const venue = current.marketplaceVenues.find(v => v.id === id);
      if (!venue || venue.owner !== current.currentProfile) { setError("Sign in as the listing owner on this browser."); return; }
      writeData({ ...current, marketplaceVenues: current.marketplaceVenues.map(v => v.id === id ? { ...v, hidden: !v.hidden } : v) });
      setNotice(venue.hidden ? "Listing visible on this browser." : "Listing hidden on this browser. Existing bookings remain in your organizer view."); setError("");
    } catch { setError("Could not update the listing. Check your browser storage settings."); }
  }

  return <section className="marketplace wrap">
    <div className="market-hero"><div><div className="eyebrow"><span className="square" /> MORE PLACES. MORE PLAY.</div><h1>Find your next<br /><em>field of dreams.</em></h1><p>Discover spaces for your next match, wherever the game takes you.</p><a className="button button-dark" href="#find-turfs">Explore turfs <span><Icon name="arrow" /></span></a></div><div className="market-hero-art"><div className="market-art-lines"><span><Icon name="star" /></span><strong>THE GAME<br />GOES ON.</strong><small>FIND A PITCH. BRING YOUR PEOPLE.</small></div></div></div>
    <div className="notice"><strong>Preview only.</strong> Listings, profiles and bookings stay on this browser. Nothing is published or reserved, and no payment is collected. Example venues are fictional.</div>
    {error && <div className="error" role="alert">{error}</div>}{notice && <div className="success" role="status">{notice}</div>}
    <div className="market-section" id="find-turfs"><div className="section-heading"><div><div className="eyebrow"><span className="square" /> A PLACE FOR EVERY GAME</div><h2>Find your <em>turf.</em></h2></div><p>Find the right space for your crew, or add your own pitch to the mix.</p></div><div className="market-filters"><input aria-label="Search turfs" placeholder="Search by turf, location or game" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Filter by game" value={sport} onChange={e => setSport(e.target.value)}><option>All games</option><option>Football</option><option>Cricket</option><option>Multi-sport</option></select></div>
      <div className="market-grid">
        {(!query || "the turf dibrugarh football".includes(query.trim().toLowerCase())) && (sport === "All games" || sport === "Football") && <article className="market-card"><div className="market-image market-main"><span className="market-badge">OUR HOME PITCH</span><strong>THE TURF<br />DIBRUGARH</strong></div><div className="market-card-body"><div className="market-meta">DIBRUGARH · FOOTBALL</div><h3>The Turf, Dibrugarh</h3><p>Our home for the beautiful game. Pick your time and bring your crew.</p><div className="market-card-bottom"><span>Our venue</span><Link href="/book" className="small-action">View & book <Icon name="arrow" /></Link></div></div></article>}
        {filtered.map(v => <article className="market-card" key={v.id}><div className="market-image"><span className="market-badge">{v.example ? "FICTIONAL EXAMPLE" : "COMMUNITY LISTING"}</span><strong>PLAY<br />YOUR WAY.</strong></div><div className="market-card-body"><div className="market-meta">{v.city.toUpperCase()} · {v.sport.toUpperCase()}</div><h3>{v.name}</h3><p>{v.area} · {v.description}</p><div className="market-card-bottom"><span>From <strong>{money(v.rate)}</strong> / hour</span><button className="small-action" onClick={() => { setSelected(v); setHour(""); setDate(todayString()); setError(""); setNotice(""); }}>{v.example ? "View example" : "View & book"} <Icon name="arrow" /></button></div></div></article>)}
      </div>
      {filtered.length === 0 && !((!query || "the turf dibrugarh football".includes(query.trim().toLowerCase())) && (sport === "All games" || sport === "Football")) && <div className="empty-state">No turfs match your search. Try another location or game.</div>}
    </div>
    {selected && <div className="market-detail" id="booking-details"><div className="market-detail-heading"><div><div className="eyebrow"><span className="square" /> {selected.example ? "FICTIONAL EXAMPLE" : "COMMUNITY LISTING"}</div><h2>{selected.name}</h2><p>{selected.area}, {selected.city} · {selected.sport} · {money(selected.rate)} / hour</p></div><button className="small-action" onClick={() => setSelected(null)}>Close <Icon name="close" /></button></div><p>{selected.description}</p><div className="notice">This booking stays on this browser. The venue is not notified and no payment is taken.</div><form onSubmit={book} className="form-grid market-book-form"><label>DATE<input required type="date" min={todayString()} max={addDays(todayString(), 30)} value={date} onChange={e => { setDate(e.target.value); setHour(""); }} /></label><label>AVAILABLE TIME<select required value={hour} onChange={e => setHour(e.target.value)}><option value="">Choose a one-hour slot</option>{slots.filter(h => !isPast(date, h) && !localBookings.some(b => b.venueId === selected.id && b.date === date && b.hour === h && b.status !== "Cancelled")).map(h => <option value={h} key={h}>{timeLabel(h)} – {timeLabel(h + 1)}</option>)}</select></label><label>YOUR NAME<input required maxLength={80} value={player.name} onChange={e => setPlayer({ ...player, name: e.target.value })} /></label><label>PHONE NUMBER<input required type="tel" pattern="[0-9]{10,15}" value={player.phone} onChange={e => setPlayer({ ...player, phone: e.target.value })} /></label><button className="button button-dark full">Save booking · {money(selected.rate)} <span><Icon name="arrow" /></span></button></form></div>}
    <div className="market-list-cta"><div><div className="eyebrow"><span className="square" /> FOR TURF OWNERS & ORGANIZERS</div><h2>Got a pitch?<br /><em>Let's get it playing.</em></h2><p>Put your space in front of players looking for their next game.</p></div>{organizer ? <button className="button button-dark" onClick={() => { setShowForm(!showForm); setError(""); }}>{showForm ? "Close form" : "Add your turf"} <Icon name="arrow" /></button> : <Link className="button button-dark" href="/account">Create an organizer profile <Icon name="arrow" /></Link>}</div>
    {showForm && organizer && <form className="booking-card listing-form" onSubmit={addListing}><h2>Tell us about your turf.</h2><p className="fine-print">Your listing will be visible only on this browser. Please use placeholder details.</p><div className="form-grid"><label>TURF NAME<input required maxLength={80} value={listing.name} onChange={e => setListing({ ...listing, name: e.target.value })} /></label><label>CITY<input required maxLength={60} value={listing.city} onChange={e => setListing({ ...listing, city: e.target.value })} /></label><label>AREA<input required maxLength={80} value={listing.area} onChange={e => setListing({ ...listing, area: e.target.value })} /></label><label>GAME<select value={listing.sport} onChange={e => setListing({ ...listing, sport: e.target.value })}><option>Football</option><option>Cricket</option><option>Multi-sport</option></select></label><label className="full">HOURLY RATE (₹)<input required type="number" min="1" max="100000" step="1" value={listing.rate} onChange={e => setListing({ ...listing, rate: e.target.value })} /></label><label className="full">ABOUT THE SPACE<textarea required maxLength={250} rows="3" value={listing.description} onChange={e => setListing({ ...listing, description: e.target.value })} /></label><button className="button button-dark full">Save listing <Icon name="arrow" /></button></div></form>}
    {organizer && ownVenues.length > 0 && <div className="market-section"><div className="eyebrow"><span className="square" /> YOUR ORGANIZER SPACE</div><h2>Your <em>listings.</em></h2><p className="fine-print">Listings and reservations are visible only on this browser.</p>{ownVenues.map(v => <div className="booking-item" key={v.id}><div><strong>{v.name}</strong><small>{v.city} · {v.sport} · {v.hidden ? "Hidden" : "Visible"}</small></div><button className="small-action" onClick={() => hideListing(v.id)}>{v.hidden ? "Show listing" : "Hide listing"}</button></div>)}<h3 className="market-subheading">Bookings at your turfs</h3>{ownBookings.length ? ownBookings.map(b => <div className="booking-item" key={b.id}><div><strong>{b.venueName} · {b.name}</strong><small>{prettyDate(b.date)} · {timeLabel(b.hour)} · {b.id}</small></div><span className={b.status === "Cancelled" ? "status cancelled" : "status"}>{b.status}</span>{b.status !== "Cancelled" && <button className="small-action" onClick={() => cancel(b.id)}>Cancel</button>}</div>) : <div className="empty-state">No bookings for your listings yet.</div>}</div>}
    {localBookings.length > 0 && <div className="market-section"><div className="eyebrow"><span className="square" /> ON THIS BROWSER</div><h2>Marketplace <em>bookings.</em></h2>{localBookings.map(b => <div className="booking-item" key={b.id}><div><strong>{b.venueName} · {prettyDate(b.date)} · {timeLabel(b.hour)}</strong><small>{b.id} · {b.name} · {money(b.price)}</small></div><span className={b.status === "Cancelled" ? "status cancelled" : "status"}>{b.status}</span>{b.status !== "Cancelled" && <button className="small-action" onClick={() => cancel(b.id)}>Cancel</button>}</div>)}</div>}
  </section>;
}
