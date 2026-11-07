# The Turf Dibrugarh — frontend concept

Run `npm run dev` from this folder and open `http://localhost:3010`. Install dependencies with `npm install` if they are not already available.

The public website includes venue and gallery, games, contact, a local profile, and slot booking pages. The staff workspace is at `/admin` and the owner analytics workspace is at `/owner`; neither is linked from the public navigation. Staff can manage bookings, check-ins, rescheduling, walk-ins, schedules, customers, team, tasks, enquiries and rates. Owner reports are calculated from the bookings on the current browser.

The separate `/turfs` marketplace includes fictional sample venues, browser-local community listings and independent one-hour bookings. Create a turf owner / organizer profile to add and manage listings. Marketplace data is separate from the main venue's bookings and dashboard. Listing visibility and reservations are local only, and organizer profiles do not provide real access control.

The staff workspace's Pitch control simulates a scoreboard, configurable end-of-booking dimming and buzzer state. A staff member starts a confirmed booking during its booked hour and manually ends the pitch session when play stops. Overtime is calculated at ₹50 for each started minute after the scheduled end and recorded as an estimate on that booking; it is not collected or included in booking-value analytics. Closing the page does not control hardware, play a sound or detect players. Real automation, reliable alerts, occupancy detection, billing and authenticated access require server and hardware integration.

Everything is stored in browser localStorage and is available only in the same browser and origin. Profiles are not authenticated, contact messages are not sent, and no reservations or payments are processed. Both management pages are publicly accessible by URL; hiding links is not access control. Do not enter real customer information. Production use requires a backend, secure authentication and authorization, shared availability, payment and messaging integrations, and validated venue details.

Rates, opening hours, staff, amenities, activity options, and venue size are illustrative. Gallery photos are inspirational stock images, not photos of the venue. The address, contact details, and Instagram account are awaiting confirmation.
