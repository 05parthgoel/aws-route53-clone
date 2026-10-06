# AWS Route 53 Console Clone

A full-stack, pixel-perfect clone of the **Amazon Route 53** web application built with **Next.js (TypeScript)**, **FastAPI (Python)**, and persistent **SQLite** storage.

---

## 🌟 Overview & Features

### Core Functionality
- **Authentication**:
  - Mocked AWS IAM User Sign-In with Account ID, Username, and Password.
  - Session persistence using localStorage & API token header handling.
- **Hosted Zones Management**:
  - View, Search, Filter (Public / Private), Create, Edit, and Delete Hosted Zones.
  - Automatic generation of default `NS` and `SOA` records on zone creation.
  - Generates realistic AWS-style Hosted Zone IDs (e.g. `Z019283748392`).
- **DNS Records Management**:
  - View, Search, Filter by Type, Create, Edit, Single Delete, and **Bulk Delete** records.
  - Supported Record Types: `A`, `AAAA`, `CNAME`, `TXT`, `MX`, `NS`, `PTR`, `SRV`, `CAA`.
  - Configurable TTLs, Values, and Routing Policies (`Simple`, `Weighted`, `Latency`, `Failover`, `Geolocation`, `Multi-value answer`).
- **BIND Zone File Import & Export**:
  - **Import**: Parse standard BIND format zone files (`$ORIGIN`, `$TTL`, `IN A`, `CNAME`, `TXT`, `MX`, `NS`, `CAA`) directly into hosted zones.
  - **Export**: Export any hosted zone's records in **BIND zone file format** or **JSON format**.
- **AWS Route 53 User Experience**:
  - Authentic AWS Console top header bar, region indicator, and navigation drawer.
  - AWS Cloudscape-styled tables, search bars, item counters, status pills, and modals.
  - **Dark / Light Mode Toggle** matching AWS Console dark theme.
  - Keyboard shortcuts (`Ctrl+K` for search focus, `Esc` for modal dismiss).
- **Auxiliary Sections**:
  - Route 53 Dashboard with metric cards & quick actions.
  - Mocked sections for Traffic Policies, Health Checks, Resolver, and Profiles.

---

## 🛠️ Architecture Overview

```
                                +-----------------------------------+
                                |     Next.js 14 Frontend           |
                                |     (TypeScript + Tailwind)       |
                                |   AWS Console UI / Cloudscape     |
                                +-----------------+-----------------+
                                                  |
                                             REST HTTP API
                                                  |
                                +-----------------v-----------------+
                                |        FastAPI Backend            |
                                |     (Python 3.13 + Pydantic)      |
                                +-----------------+-----------------+
                                                  |
                                             SQLAlchemy ORM
                                                  |
                                +-----------------v-----------------+
                                |        SQLite Database            |
                                |          route53.db               |
                                +-----------------------------------+
```

---

## 🗄️ Database Schema

The application uses an SQLite database (`backend/route53.db`).

### Tables

#### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Unique User ID |
| `aws_account_id` | String | Default "1234-5678-9012" | AWS Account ID |
| `username` | String | Unique, Indexed | IAM Username |
| `hashed_password` | String | Not Null | Password Hash |
| `created_at` | DateTime | Default UTC | Account Creation Timestamp |

#### 2. `hosted_zones`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key (e.g. `Z0192...`) | AWS-style Hosted Zone ID |
| `name` | String | Indexed, Not Null | Domain Name (e.g. `example.com`) |
| `type` | String | Default "Public" | `Public` or `Private` |
| `comment` | Text | Nullable | Description / Comment |
| `vpc_id` | String | Nullable | Amazon VPC ID (for private zones) |
| `vpc_region` | String | Nullable | VPC AWS Region |
| `created_at` | DateTime | Default UTC | Creation Timestamp |

#### 3. `dns_records`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key (e.g. `R0192...`) | Unique Record ID |
| `hosted_zone_id` | String | Foreign Key (`hosted_zones.id`) | Parent Hosted Zone ID |
| `name` | String | Indexed, Not Null | Record Name (e.g. `api.example.com`) |
| `type` | String | Not Null | `A`, `AAAA`, `CNAME`, `TXT`, `MX`, `NS`, `PTR`, `SRV`, `CAA` |
| `ttl` | Integer | Default 300 | Time To Live (seconds) |
| `records` | Text | Not Null (JSON String) | Array of Record Values |
| `routing_policy` | String | Default "Simple" | `Simple`, `Weighted`, `Latency`, `Failover`, etc. |
| `weight` | Integer | Nullable | Weight (0-255) for Weighted Routing |
| `set_identifier` | String | Nullable | Record Set Identifier |
| `created_at` | DateTime | Default UTC | Creation Timestamp |

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Python 3.10+** (Python 3.13 recommended)
- **Node.js 18+** (Node v22 recommended) and `npm`

---

### 1. Run Backend (FastAPI)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run database seeder & start FastAPI server
python main.py
```
The FastAPI backend will start at **`http://localhost:8000`**.
Interactive API Swagger Documentation will be available at **`http://localhost:8000/docs`**.

#### Run Backend Automated Tests
```bash
cd backend
python -m pytest test_main.py
```

---

### 2. Run Frontend (Next.js)

```bash
cd frontend

# Install Node modules
npm install

# Start Next.js development server
npm run dev
```
The Next.js frontend will start at **`http://localhost:3000`**.

---

## 📡 API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user & return token.
- `GET /api/auth/me` - Get active session user info.
- `POST /api/auth/logout` - Logout user session.

### Hosted Zones (`/api/zones`)
- `GET /api/zones` - List hosted zones (supports `search` and `zone_type` filters).
- `POST /api/zones` - Create a new hosted zone & auto-populate default `NS` and `SOA` records.
- `GET /api/zones/{zone_id}` - Get hosted zone details with records.
- `PUT /api/zones/{zone_id}` - Update zone details/comment.
- `DELETE /api/zones/{zone_id}` - Delete hosted zone and all associated records.
- `GET /api/zones/{zone_id}/export/bind` - Export zone records in BIND text format.
- `GET /api/zones/{zone_id}/export/json` - Export zone records in JSON format.

### DNS Records (`/api`)
- `GET /api/zones/{zone_id}/records` - List DNS records for a zone.
- `POST /api/zones/{zone_id}/records` - Create a new DNS record.
- `GET /api/records/{record_id}` - Get record details.
- `PUT /api/records/{record_id}` - Update DNS record.
- `DELETE /api/records/{record_id}` - Delete a single DNS record.
- `POST /api/records/bulk-delete` - Bulk delete multiple DNS records.
- `POST /api/zones/{zone_id}/import/bind` - Import BIND zone file content into a zone.

---

## 🎹 Keyboard Shortcuts

- `Ctrl + K`: Quick focus on Console Search Bar.
- `Esc`: Close any open modal dialog or drawer.

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── zones.py
│   │   └── records.py
│   ├── bind_parser.py      # BIND zone file parser & exporter logic
│   ├── database.py         # SQLAlchemy engine & SQLite configuration
│   ├── main.py             # FastAPI app entry point & CORS
│   ├── models.py           # SQLAlchemy database tables
│   ├── requirements.txt    # Python dependencies
│   ├── schemas.py          # Pydantic data schemas
│   ├── seed.py             # Database initial seeder
│   └── test_main.py        # Pytest test suite
├── frontend/
│   ├── app/
│   │   ├── dashboard/      # Route 53 Dashboard
│   │   ├── hosted-zones/   # Hosted Zones list & zone detail views
│   │   ├── login/          # AWS IAM Sign-In page
│   │   ├── traffic-policies/# Mocked sections
│   │   ├── health-checks/
│   │   ├── resolver/
│   │   └── profiles/
│   ├── components/
│   │   ├── layout/         # AWS Header, Sidebar, Container
│   │   └── ui/             # AWS Table, Modal, Notifications
│   ├── context/            # AuthContext & Dark Mode Provider
│   ├── lib/                # Axios API client
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```
