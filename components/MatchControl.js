"use client";

import { useEffect, useState } from "react";
import { money, prettyDate, readData, timeLabel, writeData } from "../lib/demo";
import { clockLabel, defaultMatchRules, dimAt, OVERTIME_RATE, overtimeMinutes, scheduledTimes } from "../lib/match-control.mjs";

export default function MatchControl({ data }) {
  const [now, setNow] = useState(0);
  const [bookingId, setBookingId] = useState("");
  const [teams, setTeams] = useState({ home: "Home", away: "Away" });
  const [rules, setRules] = useState({ ...defaultMatchRules, ...data.matchRules });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const session = data.matchSession && !data.matchSession.endedAt ? data.matchSession : null;
  const currentRules = { ...defaultMatchRules, ...data.matchRules };
  const minutes = session ? overtimeMinutes(session.scheduledEnd, now) : 0;
  const lightDimmed = session && currentRules.dimEnabled && now >= dimAt(session.scheduledEnd, currentRules);
  const ended = session && now >= session.scheduledEnd;
  const bookings = data.bookings.filter(b => b.status === "Confirmed" && !b.matchFinished);

  function saveRules(e) {
    e.preventDefault();
    const dimMinutes = Number(rules.dimMinutes);
    const dimPercent = Number(rules.dimPercent);
    if (!Number.isInteger(dimMinutes) || dimMinutes < 0 || dimMinutes > 60 || !Number.isInteger(dimPercent) || dimPercent < 0 || dimPercent > 100 || !["before", "after"].includes(rules.dimTiming)) {
      setError("Enter a whole number from 0 to 60 minutes and a dim amount from 0 to 100%."); return;
    }
    try {
      const current = readData();
      writeData({ ...current, matchRules: { ...rules, dimMinutes, dimPercent } });
      setError(""); setNotice("Lighting and buzzer rules saved for this browser.");
    } catch { setError("Could not save rules. Check browser storage settings."); }
  }

  function start(e) {
    e.preventDefault();
    const home = teams.home.trim(), away = teams.away.trim();
    if (!home || !away) { setError("Enter both team names."); return; }
    try {
      const current = readData();
      const booking = current.bookings.find(b => b.id === bookingId && b.status === "Confirmed" && !b.matchFinished);
      if (current.matchSession && !current.matchSession.endedAt) { setError("A pitch session is already running."); return; }
      if (!booking) { setError("Choose an available confirmed booking."); return; }
      const { start: scheduledStart, end: scheduledEnd } = scheduledTimes(booking);
      const time = Date.now();
      if (time < scheduledStart || time >= scheduledEnd) { setError("A session can be started only during its booked hour."); return; }
      writeData({ ...current, matchSession: { bookingId: booking.id, bookingName: booking.name, scheduledStart, scheduledEnd, startedAt: time, home, away, homeScore: 0, awayScore: 0 } });
      setError(""); setNotice("Session started. Staff must end it when play stops.");
    } catch { setError("Could not start the session. Check browser storage settings."); }
  }

  function adjustScore(side, amount) {
    try {
      const current = readData();
      if (!current.matchSession || current.matchSession.endedAt || current.matchSession.bookingId !== session?.bookingId) { setError("The session is no longer active."); return; }
      const key = side === "home" ? "homeScore" : "awayScore";
      writeData({ ...current, matchSession: { ...current.matchSession, [key]: Math.max(0, current.matchSession[key] + amount) } });
      setError("");
    } catch { setError("Could not update the score. Check browser storage settings."); }
  }

  function finish() {
    try {
      const current = readData();
      const active = current.matchSession;
      if (!active || active.endedAt || active.bookingId !== session?.bookingId) { setError("The session is no longer active."); return; }
      const endedAt = Date.now();
      const chargedMinutes = overtimeMinutes(active.scheduledEnd, endedAt);
      const record = { ...active, endedAt, overtimeMinutes: chargedMinutes, overtimeCharge: chargedMinutes * OVERTIME_RATE };
      writeData({
        ...current,
        matchSession: record,
        matchHistory: [record, ...(current.matchHistory || [])],
        bookings: current.bookings.map(b => b.id === active.bookingId ? { ...b, matchFinished: true, overtimeMinutes: chargedMinutes, overtimeCharge: record.overtimeCharge } : b),
      });
      setBookingId(""); setError(""); setNotice(`Session ended. ${chargedMinutes} overtime minute(s), estimated charge ${money(record.overtimeCharge)}. No payment was collected.`);
    } catch { setError("Could not end the session. Check browser storage settings."); }
  }

  return <div className="pitch-control">
    <div className="admin-title"><div><div className="eyebrow">PITCH OPERATIONS</div><h2>Pitch control</h2></div><span className="status">Simulation only</span></div>
    <div className="notice"><strong>No devices connected.</strong> Lights, buzzer and scoreboard below are visual simulations only. They cannot control hardware or detect whether anyone is playing. Staff must start and end the session; charges are estimates and are not collected.</div>
    {error && <div className="error" role="alert">{error}</div>}{notice && <div className="success" role="status">{notice}</div>}
    <div className="dashboard-panel control-panel">
      <div className="panel-title"><div><h3>Live scoreboard</h3><p>One pitch session at a time · linked to a confirmed booking.</p></div></div>
      {session ? <>
        <div className="scoreboard"><div className="scoreboard-header"><span>{ended ? "OVERTIME" : "MATCH IN PROGRESS"}</span><strong>{ended ? `+${clockLabel(now - session.scheduledEnd)}` : clockLabel(session.scheduledEnd - now)}</strong></div><div className="scoreboard-teams">{["home", "away"].map(side => <div key={side}><span>{session[side]}</span><strong>{session[`${side}Score`]}</strong><div><button aria-label={`Decrease ${session[side]} score`} onClick={() => adjustScore(side, -1)}>−</button><button aria-label={`Increase ${session[side]} score`} onClick={() => adjustScore(side, 1)}>+</button></div></div>)}</div></div>
        <div className="control-readouts"><div><span>SESSION</span><strong>{session.bookingName}</strong><small>{session.bookingId}</small></div><div><span>LIGHTS · SIMULATED</span><strong>{lightDimmed ? `${100 - currentRules.dimPercent}% brightness` : "100% brightness"}</strong><small>{lightDimmed ? `Dimmed by ${currentRules.dimPercent}%` : "Normal brightness"}</small></div><div><span>BUZZER · SIMULATED</span><strong>{!currentRules.buzzerEnabled ? "Disabled" : ended ? "End signal due" : "Armed"}</strong><small>No sound or hardware signal</small></div><div><span>OVERTIME ESTIMATE</span><strong>{money(minutes * OVERTIME_RATE)}</strong><small>{minutes} started minute(s) · ₹50/min</small></div></div>
        <div className="notice">Overtime starts at the booked end time and continues until staff ends the session. Each started minute is counted. This does not detect actual play.</div><button className="button button-dark finish-session" onClick={finish}>End session &amp; record estimate</button>
      </> : <form onSubmit={start} className="form-grid rates-form"><label className="full">CONFIRMED BOOKING<select required value={bookingId} onChange={e => setBookingId(e.target.value)}><option value="">Select a booking</option>{bookings.map(b => <option value={b.id} key={b.id}>{prettyDate(b.date)} · {timeLabel(b.hour)} · {b.name} · {b.id}</option>)}</select></label><label>HOME TEAM<input required maxLength={24} value={teams.home} onChange={e => setTeams({ ...teams, home: e.target.value })} /></label><label>AWAY TEAM<input required maxLength={24} value={teams.away} onChange={e => setTeams({ ...teams, away: e.target.value })} /></label><button className="button button-dark full">Start pitch session</button><p className="fine-print full">Start during the booked hour. The scheduled end time—not the start button—sets the clock and overtime threshold.</p></form>}
    </div>
    <div className="dashboard-panel control-panel"><div className="panel-title"><div><h3>Automation rules</h3><p>Changes apply immediately to the simulated active session and future sessions.</p></div></div><form className="form-grid rates-form" onSubmit={saveRules}><label className="control-check full"><input type="checkbox" checked={rules.dimEnabled} onChange={e => setRules({ ...rules, dimEnabled: e.target.checked })} /> Enable scheduled dimming</label><label>DIM TIMING<select value={rules.dimTiming} onChange={e => setRules({ ...rules, dimTiming: e.target.value })}><option value="before">Before booking ends</option><option value="after">After booking ends</option></select></label><label>MINUTES<input type="number" min="0" max="60" step="1" required value={rules.dimMinutes} onChange={e => setRules({ ...rules, dimMinutes: e.target.value })} /></label><label>DIM AMOUNT (%)<input type="number" min="0" max="100" step="1" required value={rules.dimPercent} onChange={e => setRules({ ...rules, dimPercent: e.target.value })} /></label><label className="control-check"><input type="checkbox" checked={rules.buzzerEnabled} onChange={e => setRules({ ...rules, buzzerEnabled: e.target.checked })} /> Enable end buzzer</label><button className="button button-dark full">Save automation rules</button></form></div>
    <div className="dashboard-panel control-panel"><div className="panel-title"><div><h3>Session history</h3><p>Finished sessions and estimates saved on this browser.</p></div></div>{data.matchHistory?.length ? data.matchHistory.map(record => <div className="admin-row" key={`${record.bookingId}-${record.startedAt}`}><div><strong>{record.home} {record.homeScore} – {record.awayScore} {record.away}</strong><small>{record.bookingName} · {record.bookingId} · {new Date(record.endedAt).toLocaleString("en-IN")}</small></div><span className="status">{record.overtimeMinutes} min · {money(record.overtimeCharge)}</span></div>) : <div className="empty-state">Finished sessions will appear here.</div>}</div>
  </div>;
}
