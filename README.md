# The Turf Dibrugarh — frontend concept

Run `npm run dev` from this folder and open `http://localhost:3010`. Install dependencies with `npm install` if they are not already available.

The public website includes venue and gallery, games, contact, a local profile, and slot booking pages. The staff workspace is at `/admin` and the owner analytics workspace is at `/owner`; neither is linked from the public navigation. Staff can manage bookings, check-ins, rescheduling, walk-ins, schedules, customers, team, tasks, enquiries and rates. Owner reports are calculated from the bookings on the current browser.

Everything is stored in browser localStorage and is available only in the same browser and origin. Profiles are not authenticated, contact messages are not sent, and no reservations or payments are processed. Both management pages are publicly accessible by URL; hiding links is not access control. Do not enter real customer information. Production use requires a backend, secure authentication and authorization, shared availability, payment and messaging integrations, and validated venue details.

Rates, opening hours, staff, amenities, activity options, and venue size are illustrative. Gallery photos are inspirational stock images, not photos of the venue. The address, contact details, and Instagram account are awaiting confirmation.
