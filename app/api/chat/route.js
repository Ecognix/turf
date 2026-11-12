import { NextResponse } from "next/server";
import { regions } from "../../../lib/explore";

const facts = `THE TURF is a new turf stadium in Dibrugarh, Assam. Pages: /book (slot booking, saved in the visitor's browser only, no payment, not a confirmed reservation yet), /games, /venue (gallery), /turfs (list other turfs), /explore (North East guide), /contact, /account. Overtime is estimated at Rs 50 per started minute. Exact address, phone and final prices are not confirmed yet.`;

export const maxDuration = 60;

export async function POST(request) {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) return NextResponse.json({ error: "The assistant is not available right now. Please use the contact page." }, { status: 503 });
  let input;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const list = input?.messages;
  if (!Array.isArray(list) || list.length < 1 || list.length > 12 || list.some((m) => !["user", "assistant"].includes(m?.role) || typeof m.content !== "string" || m.content.length > 2000) || list.at(-1).role !== "user") {
    return NextResponse.json({ error: "Please enter a message of up to 2,000 characters." }, { status: 400 });
  }
  const guide = regions.map((r) => `${r.name}: ${r.summary} Highlights: ${r.places.map((p) => p[0]).join(", ")}. Best time ${r.best}.`).join("\n");
  const system = `You are the concise customer assistant for THE TURF Dibrugarh. Use only these facts; do not invent prices, availability, phone numbers or policies, and say when something is not confirmed. You cannot create or change bookings. Never ask for passwords or payment details. Facts: ${facts}\nNorth East guide:\n${guide}`;
  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "minimaxai/minimax-m3.1-flash", messages: [{ role: "system", content: system }, ...list], max_tokens: 2000, temperature: 0.4 }),
      signal: AbortSignal.timeout(90000),
    });
    if (!response.ok) return NextResponse.json({ error: "The assistant is temporarily unavailable. Please try again." }, { status: 502 });
    const result = await response.json();
    const reply = result?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return NextResponse.json({ error: "Empty reply. Please try again." }, { status: 502 });
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "The assistant is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
