# TASA Awards 2026 Voting Platform

A full-stack MERN voting platform for the Faculty of Arts Student Association, University of Benin.
All 26 official award categories are built-in. Payments via Paystack.

## Award Categories (26)

1. Most Social Male 2. Most Social Female 3. Course Rep of the Year
2. Most Popular TASA Male 5. Most Popular TASA Female
3. Sportsman of the Year 7. Sportswoman of the Year
4. Most Influential TASA Male 9. Most Influential TASA Female
5. Departmental President of the Year 11. Senator of the Year
6. Parliamentarian of the Year 13. Content Creator of the Year
7. Fashion Icon Male 15. Fashion Icon Female
8. Most Creative TASA 17. Most Talented TASA
9. Artist of the Year 19. Political Personality of the Year
10. Entrepreneur of the Year 21. Brand of the Year
11. Executive of the Year 23. Academic Excellence Award Male
12. Academic Excellence Award Female 25. Most Active Fresher
13. Department of the Year

## Tech Stack

- Frontend: React 18, Vite, Redux Toolkit + RTK Query, React Router v7
- Styling: Tailwind CSS, Google Fonts (Inter + Playfair Display)
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Auth: JWT (jsonwebtoken + bcryptjs)
- Payments: Paystack

## What's new in v3

- All 26 official TASA Awards 2026 categories built in, selectable when creating an event
- Auto-generated unique candidate numbers per event (TASA-0001, TASA-0002, ...)
- Organizers can create, edit, and delete candidates for their own events (not just admin)
- Brand new homepage: animated hero, full category showcase with group filters, live events, how-it-works section
- Category group filter tabs on the public events page

## Setup

1. cd backend && npm install && copy .env.example .env
2. cd ../frontend && npm install && copy .env.example .env
3. cd ../backend && npm run seed
4. Terminal 1: cd backend && npm run dev
5. Terminal 2: cd frontend && npm run dev
6. Open http://localhost:5173
