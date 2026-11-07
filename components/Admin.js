"use client";

import Icon from "./Icon";


import { useEffect, useState } from "react";
import { isPast, isUnavailable, money, prettyDate, readData, slots, timeLabel, todayString, writeData } from "../lib/demo";
import Operations from "./Operations";
import Link from "next/link";

export default function Admin() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [blockHour, setBlockHour] = useState("");
  const [staff, setStaff] = useState({ name: "", role: "Front desk", shift: "Morning" });
  const [error, setError] = useState("");
  useEffect(() => {
    setDate(todayString());
    const refresh = () => { try { setData(readData()); setError(""); } catch { setError("Could not read local data. Check your browser storage settings."); } };
    refresh();
    window.addEventListener("storage", refresh); window.addEventListener("turf-data-change", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("turf-data-change", refresh); };
  }, []);
  function update(transform) {
    try { writeData(transform(readData())); setError(""); } catch { setError("Could not update local data. Check your browser storage settings."); }
  }
  function changeStatus(id, status) { update(d => ({ ...d, bookings: d.bookings.map(b => b.id === id ? { ...b, status } : b) })); }
  function addBlock(e) {
    e.preventDefault();
    if (blockHour === "") return;
    try {
      const current = readData(); const hour = Number(blockHour);
      if (isPast(date, hour) || isUnavailable(current, date, hour)) { setError("This slot is past, booked or already blocked. Choose another slot."); return; }
      writeData({ ...current, blocks: [...current.blocks, { date, hour }] }); setBlockHour(""); setError("");
    } catch { setError("Could not block this slot. Check your browser storage settings."); }
  }
  function addStaff(e) {
    e.preventDefault();
    const name = staff.name.trim();
    if (!name) { setError("Enter a staff member's name."); return; }
    update(d => ({ ...d, staff: [...d.staff, { ...staff, name, id: `s-${Date.now()}`, status: "Off duty" }] }));
    setStaff({ name: "", role: "Front desk", shift: "Morning" });
  }
  if (!data) return <div className="wrap admin-loading">{error || "Loading dashboard…"}</div>;
  const active = data.bookings.filter(b => b.status !== "Cancelled");
  const todayBookings = active.filter(b => b.date === todayString());
  const filtered = data.bookings.filter(b => (filter === "All" || b.status === filter) && `${b.name} ${b.phone} ${b.id}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="admin-page wrap"><div className="page-heading"><div><div className="eyebrow"><span className="square" /> THE TURF / OPERATIONS</div><h1>Welcome to <em>the clubhouse.</em></h1><p>Your venue, your people and your bookings, all in one place.</p></div><div className="demo-pill"><span className="live-dot" /> STAFF WORKSPACE</div></div><div className="notice"><strong>Browser-local workspace.</strong> This dashboard is public and has no authentication. Data is stored only in this browser; revenue and bookings are illustrative, not real.</div>{error && <div className="error" role="alert">{error}</div>}
    <div className="admin-layout"><aside className="admin-sidebar"><div className="sidebar-label">WORKSPACE</div>{["Overview", "Bookings", "Match day", "Walk-in", "Schedule", "Customers", "Team", "Tasks", "Enquiries", "Rates"].map((item, i) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}><span><Icon name={["overview", "bookings", "flag", "plus", "clock", "target", "team", "check", "mail", "rupee"][i]} /></span>{item}</button>)}<Link className="owner-link" href="/owner">Owner insights <Icon name="arrow" /></Link><div className="sidebar-bottom"><span><Icon name="star" /></span><p><strong>Made for match day.</strong><br />A little more organised.</p></div></aside><div className="admin-content">
      {tab === "Overview" && <><div className="admin-title"><div><div className="eyebrow">YOUR VENUE AT A GLANCE</div><h2>Overview</h2></div><span>{prettyDate(todayString(), { weekday: "long", day: "numeric", month: "long" })}</span></div><div className="metrics"><div><span>TODAY'S BOOKINGS</span><strong>{todayBookings.length.toString().padStart(2, "0")}</strong><small>Active bookings</small></div><div><span>BOOKING VALUE</span><strong>{money(active.reduce((sum, b) => sum + b.price, 0))}</strong><small>Not payments collected</small></div><div><span>TEAM ON DUTY</span><strong>{data.staff.filter(s => s.status === "On duty").length.toString().padStart(2, "0")}</strong><small>Out of {data.staff.length} team members</small></div></div><div className="dashboard-panel"><div className="panel-title"><div><h3>Today's game plan</h3><p>Here's what's happening on the pitch today.</p></div><button className="small-action" onClick={() => setTab("Bookings")}>All bookings <Icon name="arrow" /></button></div>{todayBookings.length ? todayBookings.map(b => <div className="admin-row" key={b.id}><div><strong>{timeLabel(b.hour)} · {b.name}</strong><small>{b.id} · {b.occasion}</small></div><span className="status">{b.status}</span></div>) : <div className="empty-state">No games booked today. The pitch is ready when you are.</div>}</div><div className="dashboard-callout"><span><Icon name="star" /></span><div><h3>Keep the good games going.</h3><p>Manage your schedule, bookings and team from one simple workspace.</p></div><button onClick={() => setTab("Schedule")} className="button button-dark">View schedule <Icon name="arrow" /></button></div></>}
      {tab === "Bookings" && <><div className="admin-title"><div><div className="eyebrow">ALL THE ACTION</div><h2>Bookings</h2></div><span>{data.bookings.length} total</span></div><div className="dashboard-panel"><div className="filters"><input aria-label="Search bookings" placeholder="Search name, phone or booking ID" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Filter bookings" value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select></div>{filtered.length ? filtered.map(b => <div className="admin-row booking-admin-row" key={b.id}><div><strong>{b.name} <span className={b.status === "Cancelled" ? "status cancelled" : "status"}>{b.status}</span></strong><small>{b.id} · {b.phone} · {b.occasion}</small><small>{prettyDate(b.date)} · {timeLabel(b.hour)} – {timeLabel(b.hour + 1)} · {money(b.price)}</small>{b.notes && <small>Note: {b.notes}</small>}</div>{b.status === "Confirmed" && <div className="row-actions"><button onClick={() => changeStatus(b.id, "Completed")}>Complete</button><button onClick={() => changeStatus(b.id, "Cancelled")}>Cancel</button></div>}</div>) : <div className="empty-state">No bookings found. Try a different filter or make a booking.</div>}</div></>}
      {tab === "Schedule" && <><div className="admin-title"><div><div className="eyebrow">MAKE ROOM FOR THE GAME</div><h2>Pitch schedule</h2></div><label className="date-picker">SELECT DATE<input type="date" min={todayString()} value={date} onChange={e => setDate(e.target.value)} /></label></div><div className="dashboard-panel"><div className="panel-title"><div><h3>{date && prettyDate(date, { weekday: "long", day: "numeric", month: "long" })}</h3><p>Block time for maintenance or other venue needs.</p></div></div><form className="block-form" onSubmit={addBlock}><select aria-label="Time to block" value={blockHour} onChange={e => setBlockHour(e.target.value)} required><option value="">Select a time to block</option>{slots.filter(h => !isPast(date, h) && !isUnavailable(data, date, h)).map(h => <option value={h} key={h}>{timeLabel(h)} – {timeLabel(h + 1)}</option>)}</select><button className="button button-dark">Block slot</button></form><div className="schedule-list">{slots.map(h => { const booking = active.find(b => b.date === date && b.hour === h); const blocked = data.blocks.some(b => b.date === date && b.hour === h); return <div className="schedule-row" key={h}><strong>{timeLabel(h)}</strong><span>{booking ? `Booked · ${booking.name}` : blocked ? "Blocked" : isPast(date, h) ? "Past" : "Available"}</span>{blocked && <button className="small-action" onClick={() => update(d => ({ ...d, blocks: d.blocks.filter(b => !(b.date === date && b.hour === h)) }))}>Unblock</button>}</div>; })}</div></div></>}
      {tab === "Team" && <><div className="admin-title"><div><div className="eyebrow">THE PEOPLE BEHIND THE PLAY</div><h2>Team</h2></div><span>{data.staff.length} team members</span></div><div className="dashboard-panel"><div className="panel-title"><div><h3>Your crew</h3><p>Sample staff data for illustration only.</p></div></div>{data.staff.map(s => <div className="admin-row" key={s.id}><div className="staff-info"><span className="staff-avatar">{s.name.charAt(0).toUpperCase()}</span><div><strong>{s.name}</strong><small>{s.role} · {s.shift} shift</small></div></div><div className="row-actions"><button onClick={() => update(d => ({ ...d, staff: d.staff.map(member => member.id === s.id ? { ...member, status: member.status === "On duty" ? "Off duty" : "On duty" } : member) }))}>{s.status}</button><button onClick={() => update(d => ({ ...d, staff: d.staff.filter(member => member.id !== s.id) }))}>Remove</button></div></div>)}<form className="staff-form" onSubmit={addStaff}><h3>Add a team member</h3><div className="form-grid"><label>NAME<input required maxLength={80} value={staff.name} onChange={e => setStaff({ ...staff, name: e.target.value })} placeholder="Team member name" /></label><label>ROLE<select value={staff.role} onChange={e => setStaff({ ...staff, role: e.target.value })}><option>Front desk</option><option>Venue manager</option><option>Ground staff</option></select></label><label>SHIFT<select value={staff.shift} onChange={e => setStaff({ ...staff, shift: e.target.value })}><option>Morning</option><option>Evening</option></select></label><button className="button button-dark">Add member <Icon name="arrow" /></button></div></form></div></>}
      {["Match day", "Walk-in", "Customers", "Tasks", "Enquiries", "Rates"].includes(tab) && <Operations key={tab} data={data} tab={tab} />}
    </div></div>
  </section>;
}
