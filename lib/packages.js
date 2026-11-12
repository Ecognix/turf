export const occasions = ["Friendly match", "Practice session", "Birthday / celebration", "Corporate game", "Other"];

// Indicative prices only; final pricing is confirmed with the owner.
export const packages = [
  { id: "hourly", name: "Hourly slot", occasion: "Friendly match", price: 1200, unit: "per hour", players: "Up to 14", hours: 1, tag: "Most booked", perks: ["Full pitch, floodlit", "Goal posts and bibs", "Drinking water", "Changing room access"] },
  { id: "practice", name: "Team practice", occasion: "Practice session", price: 3200, unit: "per 3 sessions", players: "Up to 16", hours: 1, tag: "Save 10%", perks: ["Three 1-hour sessions", "Cones, markers and balls", "Priority evening slots", "Free reschedule once"] },
  { id: "birthday", name: "Birthday kickoff", occasion: "Birthday / celebration", price: 4500, unit: "for 2 hours", players: "Up to 20", hours: 2, tag: "Celebrate", perks: ["2 hours on the pitch", "Decor corner and cake table", "Host to run mini games", "Music and scoreboard"] },
  { id: "corporate", name: "Corporate league", occasion: "Corporate game", price: 9500, unit: "per half day", players: "Up to 40", hours: 4, tag: "Teams", perks: ["4 hours, multiple matches", "Referee and scorekeeper", "Trophies and medals", "Refreshment counter"] },
  { id: "tournament", name: "Tournament day", occasion: "Other", price: 14000, unit: "per full day", players: "Up to 80", hours: 8, tag: "Weekend", perks: ["Full-day exclusive use", "Fixtures and live scoreboard", "Referees included", "Photography corner"] },
  { id: "night", name: "Night owl", occasion: "Friendly match", price: 1500, unit: "per hour, after 8 PM", players: "Up to 14", hours: 1, tag: "Late", perks: ["Smart lights at full power", "Quiet, cooler hours", "Buzzer and scoreboard", "Late-night refreshments"] },
];
