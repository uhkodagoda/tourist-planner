# Local Tourist Day-Visit Planner and Information System

A web-based visit-planning system for the Bokundara–Piliyandala locality, built for
**ITE2953 – Programming Group Project**, University of Moratuwa.

Implements the functional and non-functional requirements from SRS v1.1: browsing and
filtering places of interest, viewing place details and locations on a map, building and
saving a one-day visit plan, and an authenticated administrator dashboard for managing
place records.

Tech stack (matches the approved project proposal):
**React.js** (frontend) · **Node.js / Express** (backend) · **MySQL** (database) ·
**Google Maps JavaScript API** (optional — the app degrades gracefully without it, per FR-11).

---

## 1. Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (includes npm)
- MySQL Server (e.g. via [WAMP](https://www.wampserver.com/), [XAMPP](https://www.apachefriends.org/),
  or a standalone MySQL install)
- (Optional) A [Google Maps JavaScript API key](https://developers.google.com/maps/documentation/javascript/get-api-key)
  — the app works fine without one; it just shows a list view instead of an interactive map.

---

## 2. Set up the database

1. Start your MySQL server (e.g. start MySQL in WAMP).
2. Open a MySQL client (phpMyAdmin, MySQL Workbench, or the command line) and run the two
   SQL files in order:

   ```bash
   mysql -u root -p < backend/db/schema.sql
   mysql -u root -p < backend/db/seed.sql
   ```

   This creates the `tourist_planner` database with `places`, `visit_plans`,
   `visit_plan_places` and `admins` tables, and seeds it with the 10 places of interest
   from the project proposal (Section 1.8).

---

## 3. Set up and run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set your MySQL credentials (`DB_USER`, `DB_PASSWORD`), and optionally an
admin username/password and a Google Maps API key.

Create the administrator account (reads `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env`
and stores a bcrypt-hashed password — see NFR-06):

```bash
npm run seed
```

Start the API server:

```bash
npm start
```

The API runs at `http://localhost:4000`. Check it's alive at
`http://localhost:4000/api/health`.

---

## 4. Set up and run the frontend

In a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

If you have a Google Maps API key, add it to `frontend/.env` as `VITE_GOOGLE_MAPS_API_KEY`.
Otherwise leave it blank — the app will automatically fall back to a text/list view for
locations (FR-11).

Start the frontend dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The dev server proxies `/api` requests to
the backend on port 4000 (see `vite.config.js`), so both servers need to be running.

---

## 5. Using the app

- **Explore** (`/`): browse and filter all places by category.
- **Place details** (`/places/:id`): full description, opening times, travel tips, and a
  map (or list) of its location. Add it to your visit plan from here.
- **My Plan** (`/plan`): reorder your selected places, see the running total distance, and
  save the plan.
- **Admin** (`/admin/login`): log in with the credentials from `backend/.env`
  (defaults: `admin` / `Admin@123` — **change these before any real deployment**), then
  add, edit or delete place records from `/admin`.

---

## 6. Project structure

```
tourist-planner/
├── backend/
│   ├── db/
│   │   ├── schema.sql        # tables: places, visit_plans, visit_plan_places, admins
│   │   └── seed.sql          # the 10 places from the project proposal
│   ├── src/
│   │   ├── db.js             # MySQL connection pool
│   │   ├── seed.js           # creates the admin account from .env
│   │   ├── middleware/auth.js
│   │   └── routes/
│   │       ├── auth.js       # POST /api/auth/login
│   │       ├── places.js     # GET/POST/PUT/DELETE /api/places
│   │       └── visitPlans.js # POST/GET /api/visit-plans
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/       # Navbar, PlaceCard, CategoryFilter, MapView, PlaceForm
    │   ├── pages/             # Explore, PlaceDetail, VisitPlan, AdminLogin, AdminDashboard
    │   ├── App.jsx, PlanContext.jsx, AuthContext.jsx, api.js, styles.css
    │   └── main.jsx
    └── .env.example
```

## 7. How this maps to the SRS (v1.1)

| SRS Feature | Where it's implemented |
|---|---|
| 4.1 View list of places (FR-01–03) | `GET /api/places`, `Explore.jsx` |
| 4.2 Filter by category (FR-04–06) | `CategoryFilter.jsx`, `?category=` query param |
| 4.3 View place details (FR-07–08) | `GET /api/places/:id`, `PlaceDetail.jsx` |
| 4.4 View location on map (FR-09–11) | `MapView.jsx` (with list fallback) |
| 4.5 Create a visit plan (FR-12–16) | `PlanContext.jsx`, `VisitPlan.jsx`, `POST /api/visit-plans` |
| 4.6 Admin manage places (FR-17–21) | `auth.js`, `AdminLogin.jsx`, `AdminDashboard.jsx`, `PlaceForm.jsx` |
| NFR-04–06 (security) | JWT-protected admin routes, bcrypt-hashed passwords |
| NFR-03 (data accuracy) | `is_verified` flag shown as "approximate" in the UI |

## 8. Known limitations (see SRS Appendix C)

- Admin authentication is a single hardcoded account (from `.env`), appropriate for this
  academic prototype — not a multi-user permission system.
- No automated tests are included; this is left for the module's testing/evaluation phase.
- The Google Maps API key, if used, should be restricted (HTTP referrer) before any public
  deployment.
