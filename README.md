# Local Tourist Day-Visit Planner and Information System

A web-based visit-planning system for the Bokundara - Piliyandala locality, built for
**ITE2953 - Programming Group Project**, University of Moratuwa (BIT External Degree).

Implements the requirements in SRS v1.1: browsing and filtering places of interest, viewing
place details and locations on a map, building and saving a one-day visit plan, and a
JWT-protected administrator dashboard for managing place records.

**Tech stack:** React.js (Vite) - Node.js / Express - MySQL - Leaflet + OpenStreetMap (maps)

---

## 1. Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (includes npm)
- MySQL Server (WAMP, XAMPP, or a standalone MySQL install)
- An internet connection (map tiles, routing and weather are fetched from public services)

No API key is required to run the project.

---

## 2. Set up the database

1. Start MySQL (for example from WAMP).
2. Run the two SQL files in order:

```bash
   mysql -u root -p < backend/db/schema.sql
   mysql -u root -p < backend/db/seed.sql
```

   This creates the `tourist_planner` database (tables: `places`, `visit_plans`,
   `visit_plan_places`, `admins`, plus review and photo tables) and loads the 10 places of
   interest from the project proposal.

---

## 3. Run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set `DB_USER`, `DB_PASSWORD`, a long random `JWT_SECRET`, and the
`ADMIN_USERNAME` / `ADMIN_PASSWORD` you want to use. Then create the admin account (the
password is stored as a bcrypt hash - NFR-06) and start the API:

```bash
npm run seed
npm start
```

The API runs at `http://localhost:4000` (health check: `/api/health`).

---

## 4. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` and `/uploads` to the
backend, so both servers must be running.

Production build: `npm run build` (output in `frontend/dist`).

---

## 5. Using the app

- **Explore** (`/`): browse places, filter by category, search, sort, mark favourites.
- **Place details** (`/places/:id`): description, opening times, travel tips, distance,
  photo gallery, map, weather, nearby places and visitor reviews. Add to your plan here.
- **My Plan** (`/plan`): reorder places, optimise the visiting order, see total distance
  and estimated travel time, then save, print or share the plan.
- **Admin** (`/admin/login`): sign in with the credentials you set in `backend/.env`, then
  add, edit, delete (single or bulk), search places, upload photos and export CSV.

---

## 6. SRS traceability

| SRS requirement | Implementation |
|---|---|
| FR-01 to FR-03 View places | `GET /api/places`, `Explore.jsx`, 10 seeded places, default sort by distance |
| FR-04 to FR-06 Category filter | `CategoryFilter.jsx`, `?category=` query, "All" option, no page reload |
| FR-07, FR-08 Place details | `GET /api/places/:id`, `PlaceDetail.jsx`, "Add to plan" control |
| FR-09 to FR-11 Map | `MapView.jsx` (Leaflet + OpenStreetMap), markers and route for a plan, text fallback |
| FR-12 to FR-15 Visit plan | `PlanContext.jsx`, `VisitPlan.jsx`, `POST /api/visit-plans` |
| FR-16 In-progress plan | Stored in `sessionStorage` (browser session), survives navigation between screens |
| FR-17 to FR-21 Admin CRUD | `auth.js`, `AdminLogin.jsx`, `AdminDashboard.jsx`, `PlaceForm.jsx`, server-side validation |
| NFR-03 Data accuracy | `is_verified` flag; unverified data is labelled "approximate" in the UI |
| NFR-04 to NFR-06 Security | JWT-protected admin routes, input validation, bcrypt-hashed passwords |
| BR-03 Minimum ten places | Delete is blocked when only ten places remain |
| Responsive layout | Single responsive stylesheet, light and dark theme |

### Additions beyond the SRS

Visitor reviews and ratings, photo gallery and image upload, nearby-places suggestions,
weather widget, favourites, route optimisation, estimated travel time, print/share of a
plan, dashboard statistics and CSV export.

### Known differences from the SRS

- **Maps:** the SRS names the Google Maps JavaScript API (FR-09). This implementation uses
  Leaflet with OpenStreetMap tiles, which needs no API key or billing account. "Open in
  Google Maps" links are still provided.
- **Admin accounts:** a single admin account created from `.env`; no multi-user roles.
- **Tests:** no automated test suite is included; manual test cases are documented in the
  module's testing deliverable.

---

## 7. Project structure

```
tourist-planner/
  backend/
    db/            schema.sql, seed.sql
    src/           db.js, seed.js, middleware/, routes/
    uploads/       uploaded place photos
    server.js
  frontend/
    src/
      components/  Icon, Navbar, PlaceCard, CategoryFilter, MapView, PlaceForm, ...
      pages/       Explore, PlaceDetail, VisitPlan, AdminLogin, AdminDashboard
      utils/       routeOptimizer, travelTime, nearbyPlaces
      App.jsx, PlanContext.jsx, AuthContext.jsx, api.js, styles.css
```