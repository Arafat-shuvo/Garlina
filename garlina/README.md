# Garlina — Girls' Outfit Store (Full‑Stack Starter)

An end‑to‑end e‑commerce starter for a boutique called **Garlina** focused on girls' outfits.
- **Backend:** Node.js + Express, JWT auth, file‑based JSON storage (no DB needed), product CRUD, orders API, image upload.
- **Frontend:** Vanilla HTML + CSS + JS with React (from CDN) for a smooth SPA, shopping cart, checkout, and basic admin.

## Quick Start

### 1) Requirements
- Node.js 18+
- npm 9+

### 2) Install & Run
```bash
cd backend
cp .env.example .env   # update values if you want
npm install
npm start
```
The server runs at **http://localhost:4000** and serves the frontend from `/frontend` automatically.

### 3) Default Admin
On first start, the backend will ensure an admin account based on `.env`:
- **Email:** `admin@garlina.local`
- **Password:** `garlina123`

Change these in your `.env` file before going to production.

### 4) Using the App
- Visit **http://localhost:4000** to browse products.
- Add items to the cart and place an order (Cash on Delivery demo).
- Admin routes:
  - **Login:** http://localhost:4000/login.html
  - **Admin Panel:** http://localhost:4000/admin.html  (requires login)
- Upload product images from Admin → "Create Product" (saved to `backend/uploads`).

### 5) Project Structure
```
garlina/
  backend/
    data/
      users.json
      products.json
      orders.json
    uploads/              # product images
    routes/               # API routes
    middleware/           # auth middleware
    .env.example
    package.json
    server.js
    db.js
  frontend/
    index.html
    styles.css
    app.js
    login.html
    admin.html
    admin.js
```

### 6) Notes
- This uses file‑based JSON storage for simplicity. You can later swap `db.js` for MongoDB or PostgreSQL.
- JWT tokens expire in 7 days by default.
- CORS is enabled for local development.
- Image filenames are sanitized & stored in `/uploads` with unique prefixes.

### 7) Security Checklist (Production)
- Set a strong `JWT_SECRET` in `.env`.
- Change the admin credentials.
- Put the app behind HTTPS (e.g., Nginx + Certbot).
- If deploying publicly, use a robust DB instead of JSON files.

Enjoy building **Garlina**! 💖
