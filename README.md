# BloodLink — Blood Donor Finder & Request System

> **"Every donor can make a difference."**
> A production-grade full-stack MERN (MongoDB, Express, React, Node.js) web application that connects voluntary blood donors with urgent patient requirements while strictly safeguarding personal contact privacy.

---

## 1. Project Overview

**BloodLink** is designed to address a critical healthcare challenge: safely and quickly matching patients requiring immediate or scheduled blood transfusions with voluntary donors in their city. 

Unlike traditional open directories that expose personal donor phone numbers to scrapers and harassment, BloodLink implements a **mutual acceptance privacy protocol**: direct contact details (phone number and email) remain completely hidden until the recipient accepts an incoming request or donation offer.

---

## 2. Key Features

### For Recipients & Caregivers
- **Create Blood Requests:** Post patient requirements with hospital name, city, district, state, required units, deadline, urgency level (`normal`, `urgent`, `critical`), and medical notes.
- **Search Available Donors:** Location-based filtering by city, district, state, pincode, blood group, and verified status.
- **Privacy Controls:** Requester phone number is hidden from public listings and only shared with accepted donors.
- **Request Lifecycle Management:** Mark requests as fulfilled, cancel open requests, or let past-due requests expire automatically.

### For Voluntary Blood Donors
- **Opt-in Donor Directory:** Only users who explicitly check "Register as a voluntary donor" and maintain an active status appear in searches.
- **Availability Toggle:** Easily pause or resume donor availability at any time (e.g. while traveling, recovering, or unwell).
- **Offer to Donate:** Send donation offers directly to hospital requests with a single click.
- **Last Donation Tracking:** Log your previous donation date with guidance on the 90-day whole blood recovery interval.

### Contact Inbox & Coordination Workflow
- **Mutual Acceptance Workflow:** Contact requests have lifecycle statuses (`pending`, `accepted`, `rejected`, `cancelled`).
- **Contact Privacy Unlocking:** Direct phone and email details are revealed *only* after mutual acceptance.
- **Duplicate Prevention:** Automated checks prevent duplicate pending requests and self-contact.

### In-App Notification System
- Real-time unread counter badge in navbar.
- Automatic alerts when a donor makes an offer, when a request is accepted/rejected, or when verification status changes.
- Quick navigation links directly to the relevant inbox conversation.

### Administrator Command Center
- **Executive Analytics:** Live count of total members, active donors, pending verifications, open requests, and fulfilled transfusions.
- **Donor Verification Queue:** Review donor profile details, approve accounts, or decline with feedback notes.
- **User Account Moderation:** Search accounts, inspect permitted records, and suspend/reactivate accounts (with built-in self-suspension protection).
- **Blood Request Moderation:** Oversee all hospital postings and override statuses when justified.

---

## 3. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v7, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js (ES Modules), Express.js, Mongoose ODM |
| **Database** | MongoDB (supports Local MongoDB and MongoDB Atlas) |
| **Authentication** | JSON Web Tokens (JWT) stored in secure HTTP-only cookies, bcryptjs password hashing |
| **Security** | Helmet HTTP headers, CORS origin restrictions, express-rate-limit, express-validator |
| **Testing** | Vitest, Supertest, MongoMemoryServer for isolated in-memory test suites |

---

## 4. Folder Structure

```
c:\Users\Mohit\Desktop\FSD Project/
├── package.json               # Root monorepo orchestration scripts
├── .gitignore                 # Git ignore configuration
├── .env.example               # Template environment configuration
├── README.md                  # Complete documentation
│
├── server/                    # Express + Node.js REST API
│   ├── package.json
│   ├── server.js              # Server entry point with shutdown traps
│   ├── app.js                 # Express application, middleware & route mounts
│   ├── vitest.config.js       # Test runner configuration
│   ├── config/
│   │   └── db.js              # Mongoose connection with startup diagnostics
│   ├── models/
│   │   ├── User.js            # User and Donor Profile schema with validation
│   │   ├── BloodRequest.js    # Blood request model with indexes
│   │   ├── ContactRequest.js  # Contact request model with privacy checks
│   │   └── Notification.js    # In-app notifications schema
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & role authorization
│   │   ├── errorHandler.js    # Centralized error handler
│   │   └── rateLimiter.js     # Rate limiters for auth and API
│   ├── validators/
│   │   ├── authValidators.js  # Registration, login, profile validation
│   │   └── requestValidators.js # Request, contact, objectId validation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── bloodRequestController.js
│   │   ├── contactRequestController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── bloodRequestRoutes.js
│   │   ├── contactRequestRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── adminRoutes.js
│   ├── scripts/
│   │   ├── createAdmin.js     # Admin initialization script
│   │   └── seedData.js        # Fictitious development seeding
│   └── tests/
│       ├── setup.js           # MongoMemoryServer lifecycle
│       └── api.test.js        # Automated integration test suite
│
└── client/                    # React + Vite + Tailwind CSS Frontend
    ├── package.json
    ├── vite.config.js         # Vite config with API proxy
    ├── tailwind.config.js     # Healthcare color palette
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx           # React root initialization
        ├── App.jsx            # Router and Provider tree
        ├── index.css          # Tailwind directives and custom tokens
        ├── context/
        │   ├── AuthContext.jsx   # Session management & HTTP-only auth
        │   └── ToastContext.jsx  # In-app notification toast system
        ├── services/
        │   ├── api.js            # Axios client with credentials
        │   ├── authService.js
        │   ├── userService.js
        │   ├── bloodRequestService.js
        │   ├── contactRequestService.js
        │   ├── notificationService.js
        │   └── adminService.js
        ├── components/
        │   ├── common/           # Navbar, Footer, Badge, Modal, Loader, EmergencyNotice
        │   ├── layout/           # AppLayout, ProtectedRoute, AdminRoute
        │   ├── donors/           # DonorCard, DonorFilterSidebar, ContactDonorModal
        │   └── requests/         # BloodRequestCard, OfferHelpModal
        └── pages/
            ├── HomePage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DonorSearchPage.jsx
            ├── BloodRequestsPage.jsx
            ├── BloodRequestDetailPage.jsx
            ├── CreateBloodRequestPage.jsx
            ├── UserDashboardPage.jsx
            ├── DonorProfilePage.jsx
            ├── MyRequestsPage.jsx
            ├── ContactInboxPage.jsx
            ├── NotificationsPage.jsx
            ├── SettingsPage.jsx
            ├── NotFoundPage.jsx
            └── admin/
                ├── AdminDashboardPage.jsx
                ├── AdminVerificationsPage.jsx
                ├── AdminUsersPage.jsx
                └── AdminRequestsPage.jsx
```

---

## 5. Prerequisites

Before running the application locally, ensure you have:
1. **Node.js**: v18.0.0 or higher (v20+ recommended). Check with `node -v`.
2. **NPM**: v9.0.0 or higher. Check with `npm -v`.
3. **MongoDB**:
   - A local MongoDB instance running on `mongodb://127.0.0.1:27017/bloodlink`, OR
   - A free MongoDB Atlas cluster connection string.

---

## 6. Environment Configuration

Copy the template `.env.example` to `.env` in the root and in `server/`:

```bash
# In the project root
cp .env.example .env
cp .env.example server/.env
```

### Environment Variables Reference

| Variable | Description | Default Development Value |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/bloodlink` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `your_secure_random_jwt_secret_here` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `CLIENT_URL` | Allowed frontend URL for CORS with credentials | `http://localhost:5173` |
| `ADMIN_EMAIL` | Email for initial administrator account | `admin@bloodlink.org` |
| `ADMIN_PASSWORD` | Password for initial administrator account | `AdminSecurePass123!` |
| `ADMIN_NAME` | Full name for administrator | `System Administrator` |
| `ADMIN_PHONE` | Emergency phone number for administrator | `9876543210` |
| `VITE_API_BASE_URL`| Frontend API prefix | `http://localhost:5000/api` |

---

## 7. Installation and Execution Workflow

### Step 1: Install All Dependencies
Run from the root directory to install root, backend, and frontend packages:
```bash
npm run install:all
```

### Step 2: Start the Complete Development Application
Run both the Express backend and the Vite frontend simultaneously:
```bash
npm run dev
```
- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

To run them individually in separate terminals:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

---

## 8. Database Setup & Initialization

### Option A: Local MongoDB
1. Ensure the MongoDB service is running (e.g. `mongod` or through Windows Services).
2. The default `MONGODB_URI` (`mongodb://127.0.0.1:27017/bloodlink`) will connect automatically.

### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write permissions.
3. Whitelist your IP address (or `0.0.0.0/0` during development).
4. Update `MONGODB_URI` in `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bloodlink?retryWrites=true&w=majority
   ```

### Creating the Administrator Account
Execute the safe admin setup script:
```bash
npm run create-admin
```
- Validates that `ADMIN_EMAIL` and `ADMIN_PASSWORD` are present and password is at least 8 characters.
- Hashes password with bcryptjs and sets `role: 'admin'`.
- Safe to re-run; will elevate an existing user or create a new administrator account without duplicating records.

### Optional: Seeding Fictitious Demo Data
To populate the application with realistic demo donors, blood requests, and contact offers for local testing:
```bash
npm run seed
```
> **Note:** The seed script strictly refuses to run if `NODE_ENV === 'production'` to protect real databases.

#### Pre-seeded Demo Credentials:
- **Administrator:** `admin@bloodlink.org` / `DemoPass123!`
- **Verified O+ Donor:** `aarav.donor@example.com` / `DemoPass123!`
- **Verified A+ Donor:** `priya.patel@example.com` / `DemoPass123!`
- **Patient Requester:** `sunita.roy@example.com` / `DemoPass123!`

---

## 9. REST API Documentation

All routes use the `/api` prefix.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new account (public role locked to `user`) | No |
| `POST` | `/api/auth/login` | Log in and receive HTTP-only session cookie | No |
| `POST` | `/api/auth/logout` | Clear session cookie | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user session | Yes |
| `PATCH`| `/api/auth/change-password` | Update password securely | Yes |

### User & Donor Discovery (`/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Get personal profile with private phone & address | Yes |
| `PATCH`| `/api/users/me` | Update name, phone, or address | Yes |
| `PATCH`| `/api/users/me/donor-profile` | Toggle availability, update blood group & bio | Yes |
| `GET` | `/api/users/donors` | Search verified & available donors (private info hidden) | No |
| `GET` | `/api/users/donors/:id` | View public donor profile card | No |

### Blood Requests (`/api/blood-requests`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/blood-requests` | List open requests with blood group & location filters | No |
| `GET` | `/api/blood-requests/:id` | View blood request details | Optional |
| `GET` | `/api/blood-requests/my-requests` | View requests created by logged-in user | Yes |
| `POST` | `/api/blood-requests` | Create new blood request | Yes |
| `PATCH`| `/api/blood-requests/:id` | Update request details (Owner/Admin only) | Yes |
| `PATCH`| `/api/blood-requests/:id/status` | Update status (`open`, `fulfilled`, `cancelled`) | Yes |
| `DELETE`| `/api/blood-requests/:id` | Delete request (Owner/Admin only) | Yes |

### Contact Requests & Privacy (`/api/contact-requests`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/contact-requests` | Send donation offer or donor inquiry | Yes |
| `GET` | `/api/contact-requests/incoming` | View incoming requests (phone revealed if accepted) | Yes |
| `GET` | `/api/contact-requests/outgoing` | View outgoing requests (phone revealed if accepted) | Yes |
| `PATCH`| `/api/contact-requests/:id/respond`| Accept or decline an incoming request | Yes |
| `PATCH`| `/api/contact-requests/:id/cancel` | Cancel an outgoing pending request | Yes |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Get user notifications with pagination | Yes |
| `GET` | `/api/notifications/unread-count` | Get count of unread notifications | Yes |
| `PATCH`| `/api/notifications/:id/read` | Mark single notification as read | Yes |
| `PATCH`| `/api/notifications/read-all` | Mark all notifications as read | Yes |

### Administrator Endpoints (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Aggregated metrics, donor counts & activity | Admin |
| `GET` | `/api/admin/users` | Search and filter all member accounts | Admin |
| `PATCH`| `/api/admin/users/:id/verification`| Approve or reject donor verification | Admin |
| `PATCH`| `/api/admin/users/:id/status` | Suspend or reactivate user account | Admin |
| `GET` | `/api/admin/blood-requests` | List all requests across the system | Admin |
| `PATCH`| `/api/admin/blood-requests/:id/status`| Moderate or override blood request status | Admin |

### Health Check (`/api/health`)
- `GET /api/health` returns HTTP 200 with `{ status: 'ok', service: 'BloodLink REST API', database: 'connected'|'disconnected', timestamp, uptime }`.

---

## 10. Automated Testing

The backend includes a comprehensive automated test suite powered by **Vitest** and **Supertest**, utilizing **MongoMemoryServer** for 100% isolated in-memory test execution without modifying any persistent database.

To run the test suite:
```bash
npm test
```

### Verified Test Cases:
1. **Health Check:** Validates service status and database state.
2. **User Registration:** Tests password hashing with bcryptjs, cookie generation, and omission of passwordHash in API responses.
3. **Duplicate Detection:** Confirms rejection of duplicate emails (HTTP 409).
4. **Admin Protection:** Strict validation forbidding client assignment of `role: 'admin'`.
5. **Authentication:** Validates successful login and rejects invalid passwords (HTTP 401).
6. **Donor Discovery & Privacy:** Confirms only verified and available donors are discoverable in public searches, and verifies that private phone and email details are hidden.
7. **Request Ownership:** Enforces creator ownership; forbids unauthorized users from modifying or deleting requests (HTTP 403).
8. **Contact Request Privacy Workflow:** Prevents self-contact, blocks duplicate pending offers, confirms private phone is hidden while pending, and verifies phone is unlocked upon acceptance.
9. **Role Protection:** Prevents non-admin users from accessing administrative endpoints (HTTP 403).
10. **Admin Moderation:** Verifies admin dashboard metrics, donor verification approvals, and in-app notification triggers.

---

## 11. Production Build

To compile the React frontend for production deployment:
```bash
npm run build
```
This runs Vite build and produces optimized bundles in `client/dist/`.

To serve the frontend production bundle via an Express static handler or preview it:
```bash
npm run preview --prefix client
```

---

## 12. Troubleshooting & Common Issues

### Issue 1: `connect ECONNREFUSED 127.0.0.1:27017`
- **Cause:** Local MongoDB service is not started.
- **Resolution:** Start your local MongoDB service via Windows Services or run `mongod`. Alternatively, set `MONGODB_URI` in `server/.env` to a MongoDB Atlas cluster URI.
- **Note:** The backend automatically prints clear startup diagnostics and will continue running while logging that database operations will queue or fail until connected.

### Issue 2: "Unauthorized. Please log in."
- **Cause:** Session cookie has expired or was cleared.
- **Resolution:** Re-authenticate at `/login`. Ensure your browser allows first-party cookies. In production, ensure `CLIENT_URL` matches your actual domain and `NODE_ENV === 'production'` has HTTPS enabled.

### Issue 3: Port 5000 or 5173 already in use
- **Resolution:** Change `PORT=5001` in `.env` and `server/.env`, and update the proxy in `client/vite.config.js` accordingly.

---

## 13. Limitations and Future Enhancements

1. **SMS / WhatsApp Alerts:** Integrate Twilio or WhatsApp Business API to deliver instant SMS notifications when an urgent or critical request matches a donor's blood type in their city.
2. **Interactive Map Exploration:** Add Mapbox or Leaflet mapping to display donor counts by district or hospital zone without exposing precise coordinates.
3. **Digital Donor Badges:** Reward milestone donors (e.g. 5+ donations, 10+ donations) with certified community badges.
4. **Hospital Portal Integration:** Dedicated hospital administration accounts to directly verify transfusions on-site.
