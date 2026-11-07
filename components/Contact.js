"use client";
import { useState } from "react";
import { readData, writeData } from "../lib/demo";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "General question", message: "" });
  const [notice, setNotice] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) { setNotice("Please enter your name and message."); return; }
    try {
      const data = readData();
      writeData({ ...data, inquiries: [{ ...form, name: form.name.trim(), message: form.message.trim(), id: `INQ-${Date.now().toString(36).toUpperCase()}`, status: "New", createdAt: new Date().toISOString() }, ...data.inquiries] });
      setForm({ name: "", phone: "", email: "", subject: "General question", message: "" });
      setNotice("Saved on this browser only. Your message has not been sent to the venue.");
    } catch { setNotice("Your message could not be saved. Check your browser storage settings."); }
  }
  return <section className="section wrap contact-grid"><div><div className="eyebrow"><span className="square" /> SAY HELLO</div><h1>Let's talk<br /><em>about the game.</em></h1><p className="contact-intro">Questions about the pitch, planning a tournament or bringing your team? We're here for all of it.</p><div className="contact-options"><div><span>01 / VISIT</span><strong>Dibrugarh, Assam</strong><p>Exact address to be confirmed.</p></div><div><span>02 / CALL OR MESSAGE</span><strong>Contact details coming soon</strong><p>Phone and WhatsApp details will be shared once confirmed.</p></div><div><span>03 / SOCIAL</span><strong>Find us on Instagram</strong><p>Our official account will be announced soon.</p></div></div></div><div className="booking-card contact-form"><div className="eyebrow">DROP US A NOTE</div><h2>We're all ears.</h2><p>This form saves a message on this browser only. It does not send an enquiry yet; please don't enter sensitive information.</p><form onSubmit={submit} className="form-grid"><label>YOUR NAME<input required maxLength={80} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>PHONE <span>(OPTIONAL)</span><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label><label className="full">EMAIL <span>(OPTIONAL)</span><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label className="full">WHAT'S IT ABOUT?<select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}><option>General question</option><option>Booking enquiry</option><option>Tournament or event</option><option>Partnership</option><option>Other</option></select></label><label className="full">MESSAGE<textarea required maxLength={500} rows="5" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></label><button className="button button-dark full">Save message <span>↗</span></button></form>{notice && <p className="notice" role="status">{notice}</p>}</div></section>;
}
