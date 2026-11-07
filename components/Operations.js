"use client";

import Icon from "./Icon";

import { useState } from "react";
import { isPast, isUnavailable, money, prettyDate, priceFor, readData, slots, timeLabel, todayString, writeData } from "../lib/demo";

function MatchBooking({ booking, data, update, setError }) {
  const [date, setDate] = useState(booking.date);
  const [hour, setHour] = useState("");
  function move(e) {
    e.preventDefault();
    const newHour = Number(hour);
    if (!date || hour === "" || !slots.includes(newHour)) { setError("Choose a date and time."); return; }
    try {
      const current = readData();
      const existing = current.bookings.find(item => item.id === booking.id);
      if (!existing || existing.status !== "Confirmed" || isPast(date, newHour) || isUnavailable(current, date, newHour)) { setError("This booking or slot is no longer available."); return; }
      writeData({ ...current, bookings: current.bookings.map(item => item.id === booking.id ? { ...item, date, hour: newHour, price: priceFor(newHour, current.settings), checkedIn: false } : item) });
      setHour(""); setError("");
    } catch { setError("Unable to move the booking. Check browser storage settings."); }
  }
  return <div className="match-booking"><div className="admin-row"><div><strong>{booking.name} <span className="status">{booking.checkedIn ? "Checked in" : "Expected"}</span></strong><small>{prettyDate(booking.date)} · {timeLabel(booking.hour)} · {booking.id}</small></div><div className="row-actions"><button onClick={() => update(d => ({ ...d, bookings: d.bookings.map(item => item.id === booking.id && item.status === "Confirmed" ? { ...item, checkedIn: !item.checkedIn } : item) }))}>{booking.checkedIn ? "Undo check-in" : "Check in"}</button></div></div><details><summary>Move booking</summary><form onSubmit={move} className="block-form"><input className="operation-input" aria-label={`New date for ${booking.name}`} required type="date" min={todayString()} value={date} onChange={e => { setDate(e.target.value); setHour(""); }} /><select aria-label={`New time for ${booking.name}`} value={hour} onChange={e => setHour(e.target.value)} required><option value="">Choose new time</option>{slots.filter(h => !isPast(date, h) && !isUnavailable(data, date, h)).map(h => <option value={h} key={h}>{timeLabel(h)} · {money(priceFor(h, data.settings))}</option>)}</select><button className="button button-dark">Move <Icon name="arrow" /></button></form></details></div>;
}

export default function Operations({ data, tab }) {
  const [task, setTask] = useState("");
  const [error, setError] = useState("");
  const [rates, setRates] = useState(data.settings);
  const [walkIn, setWalkIn] = useState({ name: "", phone: "", date: todayString(), hour: "", occasion: "Friendly match" });
  const [success, setSuccess] = useState("");
  function update(transform) {
    try { writeData(transform(readData())); setError(""); return true; }
    catch { setError("Unable to save changes. Check browser storage settings."); return false; }
  }
  function addTask(e) {
    e.preventDefault();
    if (!task.trim()) { setError("Enter a task description."); return; }
    if (update(d => ({ ...d, tasks: [{ id: `task-${Date.now()}`, text: task.trim(), done: false }, ...d.tasks] }))) setTask("");
  }
  function saveRates(e) {
    e.preventDefault();
    const dayRate = Number(rates.dayRate), eveningRate = Number(rates.eveningRate);
    if (!Number.isInteger(dayRate) || !Number.isInteger(eveningRate) || dayRate < 0 || eveningRate < 0) { setError("Enter valid non-negative whole-number rates."); return; }
    update(d => ({ ...d, settings: { ...d.settings, dayRate, eveningRate } }));
  }
  function addWalkIn(e) {
    e.preventDefault();
    setSuccess("");
    const name = walkIn.name.trim();
    if (!name || !/^[0-9]{10,15}$/.test(walkIn.phone) || walkIn.hour === "") { setError("Enter a name, a phone number of 10–15 digits and a time."); return; }
    try {
      const current = readData(), hour = Number(walkIn.hour);
      if (!slots.includes(hour) || isPast(walkIn.date, hour) || isUnavailable(current, walkIn.date, hour)) { setError("That slot is no longer available. Choose another."); return; }
      const booking = { ...walkIn, name, hour, price: priceFor(hour, current.settings), id: `TRF-${Date.now().toString(36).toUpperCase()}`, status: "Confirmed", createdAt: new Date().toISOString(), source: "Walk-in" };
      writeData({ ...current, bookings: [booking, ...current.bookings] });
      setWalkIn({ name: "", phone: "", date: todayString(), hour: "", occasion: "Friendly match" }); setError(""); setSuccess(`${booking.id} added to this browser. No real reservation has been made.`);
    } catch { setError("Unable to save the booking. Check browser storage settings."); }
  }
  const customers = [...new Set(data.bookings.map(b => b.phone))].map(phone => {
    const bookings = data.bookings.filter(b => b.phone === phone);
    return { phone, name: bookings[0].name, count: bookings.length, active: bookings.filter(b => b.status !== "Cancelled").length };
  });
  return <><div className="admin-title"><div><div className="eyebrow">VENUE OPERATIONS</div><h2>{tab}</h2></div></div>{error && <div className="error" role="alert">{error}</div>}{success && <div className="success" role="status">{success}</div>}
    {tab === "Match day" && <div className="dashboard-panel"><div className="panel-title"><div><h3>Player arrivals</h3><p>Check in players and move confirmed bookings. Changes remain on this browser.</p></div></div>{data.bookings.some(b => b.status === "Confirmed") ? data.bookings.filter(b => b.status === "Confirmed").map(b => <MatchBooking key={b.id} booking={b} data={data} update={update} setError={setError} />) : <div className="empty-state">No confirmed bookings to manage yet.</div>}</div>}
    {tab === "Walk-in" && <div className="dashboard-panel"><div className="panel-title"><div><h3>Add a booking</h3><p>Record a phone or walk-in booking on this browser.</p></div></div><form onSubmit={addWalkIn} className="form-grid rates-form"><label>PLAYER NAME<input required maxLength={80} value={walkIn.name} onChange={e => setWalkIn({ ...walkIn, name: e.target.value })} /></label><label>PHONE NUMBER<input required type="tel" pattern="[0-9]{10,15}" value={walkIn.phone} onChange={e => setWalkIn({ ...walkIn, phone: e.target.value })} /></label><label>DATE<input required type="date" min={todayString()} value={walkIn.date} onChange={e => setWalkIn({ ...walkIn, date: e.target.value, hour: "" })} /></label><label>TIME<select required value={walkIn.hour} onChange={e => setWalkIn({ ...walkIn, hour: e.target.value })}><option value="">Choose available time</option>{slots.filter(h => !isPast(walkIn.date, h) && !isUnavailable(data, walkIn.date, h)).map(h => <option value={h} key={h}>{timeLabel(h)} · {money(priceFor(h, data.settings))}</option>)}</select></label><label>OCCASION<select value={walkIn.occasion} onChange={e => setWalkIn({ ...walkIn, occasion: e.target.value })}><option>Friendly match</option><option>Practice session</option><option>Birthday / celebration</option><option>Corporate game</option><option>Other</option></select></label><button className="button button-dark">Add booking <Icon name="arrow" /></button></form></div>}
    {tab === "Customers" && <div className="dashboard-panel"><div className="panel-title"><div><h3>Player directory</h3><p>Grouped by phone number from bookings saved on this browser.</p></div></div>{customers.length ? customers.map(customer => <div className="admin-row" key={customer.phone}><div className="staff-info"><span className="staff-avatar">{customer.name.charAt(0).toUpperCase()}</span><div><strong>{customer.name}</strong><small>{customer.phone}</small></div></div><span className="status">{customer.active} active / {customer.count} total</span></div>) : <div className="empty-state">Players will appear here when bookings are added.</div>}</div>}
    {tab === "Tasks" && <div className="dashboard-panel"><div className="panel-title"><div><h3>Match-day checklist</h3><p>Keep track of everything the team needs to get done.</p></div></div><form className="block-form" onSubmit={addTask}><input className="operation-input" value={task} maxLength={120} onChange={e => setTask(e.target.value)} placeholder="Add a task or maintenance note" aria-label="Task description" /><button className="button button-dark">Add task <Icon name="arrow" /></button></form>{data.tasks.length ? data.tasks.map(t => <div className="admin-row" key={t.id}><label className="task-label"><input type="checkbox" checked={t.done} onChange={() => update(d => ({ ...d, tasks: d.tasks.map(item => item.id === t.id ? { ...item, done: !item.done } : item) }))} /><span className={t.done ? "task-done" : ""}>{t.text}</span></label><button className="small-action" onClick={() => update(d => ({ ...d, tasks: d.tasks.filter(item => item.id !== t.id) }))}>Remove</button></div>) : <div className="empty-state">No tasks yet. Add one to get started.</div>}</div>}
    {tab === "Enquiries" && <div className="dashboard-panel"><div className="panel-title"><div><h3>Messages</h3><p>Messages saved through the contact form on this browser only.</p></div></div>{data.inquiries.length ? data.inquiries.map(item => <div className="admin-row" key={item.id}><div><strong>{item.name} · {item.subject} <span className="status">{item.status}</span></strong><small>{item.phone || "No phone"} · {item.email || "No email"} · {new Date(item.createdAt).toLocaleDateString("en-IN")}</small><p className="inquiry-message">{item.message}</p></div><div className="row-actions"><button onClick={() => update(d => ({ ...d, inquiries: d.inquiries.map(i => i.id === item.id ? { ...i, status: i.status === "New" ? "Handled" : "New" } : i) }))}>{item.status === "New" ? "Mark handled" : "Reopen"}</button><button onClick={() => update(d => ({ ...d, inquiries: d.inquiries.filter(i => i.id !== item.id) }))}>Remove</button></div></div>) : <div className="empty-state">No messages saved on this browser.</div>}</div>}
    {tab === "Rates" && <div className="dashboard-panel"><div className="panel-title"><div><h3>Hourly pricing</h3><p>Rates apply to new bookings on this browser. Existing bookings keep their original price.</p></div></div><form onSubmit={saveRates} className="form-grid rates-form"><label>BEFORE 5 PM (₹)<input type="number" min="0" step="1" required value={rates.dayRate} onChange={e => setRates({ ...rates, dayRate: e.target.value })} /></label><label>FROM 5 PM (₹)<input type="number" min="0" step="1" required value={rates.eveningRate} onChange={e => setRates({ ...rates, eveningRate: e.target.value })} /></label><button className="button button-dark">Save rates <Icon name="arrow" /></button></form></div>}
  </>;
}
