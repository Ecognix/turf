export const defaultMatchRules = {
  dimEnabled: true,
  dimTiming: "before",
  dimMinutes: 5,
  dimPercent: 30,
  buzzerEnabled: true,
};

export const OVERTIME_RATE = 50;

export function scheduledTimes(booking) {
  const start = new Date(`${booking.date}T${String(booking.hour).padStart(2, "0")}:00:00`).getTime();
  return { start, end: start + 60 * 60 * 1000 };
}

export function overtimeMinutes(end, now) {
  return Math.max(0, Math.ceil((now - end) / 60000));
}

export function dimAt(end, rules) {
  return end + (rules.dimTiming === "before" ? -1 : 1) * rules.dimMinutes * 60000;
}

export function clockLabel(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours ? `${hours}:` : ""}${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
