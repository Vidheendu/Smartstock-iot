# SMARTSTOCK — IoT-Based Store Stock Alert System

> **IMPORTANT DISCLAIMER:**  
> **This project is a web-based IoT simulation prototype and does not use physical sensors.**  
> All IoT telemetry, device states, sensor readings, and stock consumption events are modeled and triggered purely through a software-based IoT simulation engine.

---

## 1. Project Purpose
**SMARTSTOCK** is a smart store inventory management system designed to eliminate manual stock counting, prevent stockouts, and automate supplier replenishment through simulated IoT edge devices (e.g. load cell weight sensors, shelf RFID scanners, optical level detectors).

The system continuously tracks simulated stock levels, compares inventory against minimum thresholds, detects anomalies (Normal, Low, Critical, Out of Stock), dispatches real-time alerts, and calculates consumption forecasts.

---

## 2. Technology Stack

### Frontend:
- **React (v18)** — Component-driven user interface
- **Vite (v6)** — Fast local development environment and bundler
- **Tailwind CSS (v3)** — Utility-first styling and responsive UI
- **React Router (v7)** — Client-side route management
- **Axios** — HTTP client for backend REST API communication
- **Recharts** — Data visualization for consumption trends and forecasting
- **Lucide React** — Modern UI icons

### Backend:
- **Node.js (v20+)** — Server runtime
- **Express.js** — RESTful HTTP routing and middleware
- **bcrypt** — Password hashing (for Phase 2 authentication)
- **jsonwebtoken (JWT)** — Token authentication (for Phase 2 authentication)
- **cors** & **dotenv** — Security and configuration management

### Database:
- **Supabase PostgreSQL** — Relational database hosting 9 core tables, relationships, and time-series sensor telemetry

---

## 3. Software IoT Simulation Concept
In place of physical microcontrollers (such as ESP32 or Arduino) and physical load cells:
1. **Virtual IoT Devices:** Modeled in the database table `simulated_devices` with calibrated unit weights, device codes, and shelf locations.
2. **Telemetry Dispatch:** The simulation engine produces realistic sensor payloads (`sensor_readings`) representing weight drops or optical count updates.
3. **Automated Reaction:** The backend processes sensor readings, updates product stock, registers audit trails in `inventory_history`, triggers the alert evaluation engine, and dispatches notifications to store staff.

---

## 4. Folder Structure

```text
smartstock-iot/
├── .gitignore                    # Root gitignore (protects node_modules, builds, and .env)
├── README.md                     # Project documentation
│
├── server/                       # Express & Node.js backend
│   ├── .env.example              # Environment variable template
│   ├── package.json
│   ├── server.js                 # Server entry point & health check
│   ├── database/
│   │   ├── schema.sql            # Complete Supabase PostgreSQL schema (9 tables)
│   │   └── seeds.sql             # Realistic demo products, suppliers, devices & alerts
│   └── src/
│       ├── config/
│       │   ├── env.js            # Environment validation
│       │   └── db.js             # Supabase client initializer
│       ├── middleware/
│       │   └── error.middleware.js # Centralized 404 & error handlers
│       └── utils/
│           └── stockStatus.js    # Stock status threshold evaluation logic
│
└── client/                       # React & Vite frontend
    ├── .env.example              # Frontend environment variable template
    ├── package.json
    ├── vite.config.js            # Vite configuration
    ├── tailwind.config.js        # Tailwind CSS styling configuration
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx              # Application bootstrap
        ├── App.jsx               # Foundation status interface
        └── index.css             # Tailwind base and components
```

---

## 5. Environment Variables

### Backend (`server/.env`):
Create `server/.env` based on `server/.env.example`:
```ini
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-secure-jwt-secret
```

### Frontend (`client/.env`):
Create `client/.env` based on `client/.env.example`:
```ini
VITE_API_URL=http://localhost:5000/api
```

*(Note: Real `.env` files are strictly excluded from version control).*

---

## 6. How to Install & Run

### Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Step 2: Set up Database (Supabase)
1. Open your Supabase project SQL Editor.
2. Execute `server/database/schema.sql` to create all 9 tables, constraints, and indexes.
3. Execute `server/database/seeds.sql` to load demo suppliers, products, and devices.

### Step 3: Run Backend Development Server

```bash
cd server
npm run dev
```
The API starts at `http://localhost:5000`.  
Verify health check at: `http://localhost:5000/api/health`

### Step 4: Run Frontend Development Server

```bash
cd client
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 7. Stock Status Rules
The system evaluates inventory using the following rules:
- **NORMAL:** `current_stock > minimum_stock`
- **LOW:** `0.5 * minimum_stock < current_stock <= minimum_stock`
- **CRITICAL:** `0 < current_stock <= 0.5 * minimum_stock`
- **OUT_OF_STOCK:** `current_stock == 0`
