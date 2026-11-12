"use client";

import { useRef, useState } from "react";
import Icon from "./Icon";

const intro = { role: "assistant", content: "Hi, I'm the Turf assistant. Ask about the venue, games, booking steps or things to see around the North East. I can't create or change bookings." };

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([intro]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef(null);

  async function send(event) {
    event.preventDefault();
    const content = text.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setText("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.slice(1).slice(-10) }) });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply || data.error || "Something went wrong." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "I couldn't reach the assistant. Please try again or use the contact page." }]);
    } finally {
      setBusy(false);
      setTimeout(() => end.current?.scrollIntoView({ block: "end" }), 50);
    }
  }

  return (
    <div className="assistant-root">
      {open && (
        <div className="assistant-panel" role="dialog" aria-label="Turf assistant">
          <div className="assistant-head"><strong>Turf assistant</strong><button type="button" onClick={() => setOpen(false)} aria-label="Close assistant"><Icon name="close" /></button></div>
          <div className="assistant-log" aria-live="polite">{messages.map((m, i) => <p key={i} className={m.role}>{m.content}</p>)}{busy && <p className="assistant-msg assistant">Thinking...</p>}<span ref={end} /></div>
          <form onSubmit={send}><input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Ask a question" aria-label="Message" /><button type="submit" disabled={busy} aria-label="Send"><Icon name="send" /></button></form>
        </div>
      )}
      <button type="button" className="assistant-fab" onClick={() => setOpen(!open)} aria-label={open ? "Close assistant" : "Open assistant"}><Icon name={open ? "close" : "chat"} /></button>
    </div>
  );
}
