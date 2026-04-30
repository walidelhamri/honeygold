# 🍯 HoneyGold — Premium Honey E-Commerce

A full-stack, premium honey store with a customer-facing frontend, REST API backend, and a complete admin dashboard.

---

## Project Structure

```
honeygold/
├── backend/              # Node.js + Express API
│   ├── server.js         # Entry point
│   ├── routes/
│   │   ├── products.js   # GET/POST/PUT/DELETE /api/products
│   │   └── auth.js       # POST /api/auth/login
│   ├── middleware/
│   │   └── auth.js       # JWT verification
│   ├── data/
│   │   └── db.json       # JSON database (products + admin)
│   └── uploads/          # Uploaded product images
│
├── frontend/             # Customer-facing website
│   ├── pages/
│   │   ├── index.html    # Homepage
│   │   ├── products.html # Product catalog with filters
│   │   ├── about.html    # Brand story
│   │   └── contact.html  # Contact form + FAQ
│   └── assets/
│       ├── css/style.css
│       └── js/main.js
│
└── admin/                # Admin dashboard
    ├── pages/
    │   ├── login.html    # Admin login
    │   └── dashboard.html # Product management
    └── assets/
        ├── css/admin.css
        └── js/admin.js
```

---

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Start the server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 3. Open in browser

| Page          | URL                            |
|---------------|--------------------------------|
| Store Home    | http://localhost:3001          |
| Products      | http://localhost:3001/products |
| About         | http://localhost:3001/about    |
| Contact       | http://localhost:3001/contact  |
| Admin Login   | http://localhost:3001/admin    |
| Dashboard     | http://localhost:3001/admin/dashboard |

---

## Admin Credentials

```
Username: admin
Password: password
```

> To change the password: generate a new bcrypt hash and update `backend/data/db.json` → `admin.password`

---

## REST API

### Products (Public)

| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | /api/products         | List all products  |
| GET    | /api/products/:id     | Get single product |

### Products (Protected — requires JWT)

| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| POST   | /api/products         | Create product      |
| PUT    | /api/products/:id     | Update product      |
| DELETE | /api/products/:id     | Delete product      |

### Auth

| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| POST   | /api/auth/login       | Login → returns JWT |
| GET    | /api/auth/verify      | Verify JWT token    |

**Protected requests** require header:
```
Authorization: Bearer <your_token>
```

**Image upload**: Use `multipart/form-data` with field `image`

### Example: Create Product (curl)

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Mountain Clover" \
  -F "price=19.99" \
  -F "category=Pure" \
  -F "weight=500g" \
  -F "description=Light and floral." \
  -F "image=@/path/to/image.jpg"
```

---

## Database (JSON)

Products are stored in `backend/data/db.json`.
This file is read and written on every API call — no database setup required.

For production, replace with MongoDB or PostgreSQL using the same route interfaces.

---

## Design

- **Fonts**: Cormorant Garamond (display) + Jost (body)
- **Colors**: Gold, cream, warm brown palette
- **Hover effects only** — no heavy animations
- **Mobile responsive** — hamburger nav, fluid grid

---

## Tech Stack

| Layer    | Technology       |
|----------|-----------------|
| Backend  | Node.js, Express |
| Auth     | JWT + bcryptjs   |
| Upload   | Multer           |
| Database | JSON file (db.json) |
| Frontend | Vanilla HTML/CSS/JS |
| Fonts    | Google Fonts     |
