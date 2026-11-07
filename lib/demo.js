export const STORAGE_KEY = "the-turf-demo-v1";
export const slots = Array.from({ length: 17 }, (_, i) => i + 6);
export const defaultStaff = [
  { id: "s1", name: "Arjun Das", role: "Venue manager", shift: "Morning", status: "On duty" },
  { id: "s2", name: "Riya Sharma", role: "Front desk", shift: "Evening", status: "On duty" },
  { id: "s3", name: "Rahul Bora", role: "Ground staff", shift: "Morning", status: "Off duty" },
];
export const defaultSettings = { dayRate: 1200, eveningRate: 1500 };

export function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function addDays(date, days) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function prettyDate(date, options = { weekday: "short", day: "numeric", month: "short" }) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", options);
}
export function timeLabel(hour) {
  return `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`;
}
export function priceFor(hour, settings = defaultSettings) { return hour >= 17 ? settings.eveningRate : settings.dayRate; }
export function readData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { bookings: [], blocks: [], staff: defaultStaff, tasks: [], inquiries: [], profiles: [], settings: defaultSettings };
  const data = JSON.parse(raw);
  if (!Array.isArray(data.bookings) || !Array.isArray(data.blocks) || !Array.isArray(data.staff)) throw new Error("Invalid demo data");
  return { tasks: [], inquiries: [], profiles: [], settings: defaultSettings, ...data, settings: { ...defaultSettings, ...data.settings } };
}
export function writeData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("turf-data-change"));
}
export function isUnavailable(data, date, hour) {
  return data.bookings.some(b => b.date === date && b.hour === hour && b.status !== "Cancelled") || data.blocks.some(b => b.date === date && b.hour === hour);
}
export function isPast(date, hour) {
  return new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`).getTime() <= Date.now();
}
export function money(value) { return `₹${value.toLocaleString("en-IN")}`; }
