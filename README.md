# Fmatputes Dashboard

Internal management platform for the Fmatputes team. Provides centralized control over member profiles, shared expenses, peer evaluations, treasury tracking, and team logistics through a unified web interface.

Built with Angular 17, Node.js/Express, PostgreSQL, and Python. Deployed as a containerized stack via Docker Compose behind Nginx reverse proxy.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Infrastructure Rules](#infrastructure-rules)
- [Git Workflow](#git-workflow)

---

## Architecture Overview

The application follows a three-tier architecture:

- **Presentation Layer** -- Angular 17 SPA served via Nginx, standalone components with lazy-loaded routes.
- **Application Layer** -- Express.js REST API with JWT authentication, Sequelize ORM, and Python subprocess integration for data visualization.
- **Data Layer** -- PostgreSQL 15 with UUID primary keys, transactional operations, and automatic schema synchronization.

All services are orchestrated through Docker Compose and communicate over an internal bridge network. In production, traffic is routed through Nginx Proxy Manager and Cloudflare Zero Trust.

```
Browser --> Cloudflare --> Nginx Proxy Manager --> fmaputes_frontend (port 80)
                                              --> fmaputes_backend  (port 3000)
                                                      |
                                                fmaputes_db (port 5432)
```

---

## Technology Stack

| Layer          | Technology                              | Version   |
|----------------|-----------------------------------------|-----------|
| Frontend       | Angular (standalone components)         | 17.3+     |
| Styling        | Tailwind CSS + custom theme             | 3.4       |
| Backend        | Node.js + Express                       | 20 / 5.2  |
| ORM            | Sequelize                               | 6.37      |
| Database       | PostgreSQL                              | 15-alpine |
| Auth           | JSON Web Tokens (bcryptjs + jsonwebtoken) | --      |
| Data Viz       | Python 3 (SVG radar chart generation)   | 3.x       |
| Containerization | Docker Compose                        | 3.8       |
| Reverse Proxy  | Nginx                                   | alpine    |

---

## Features

### Authentication and Authorization

- JWT-based login with bcrypt password hashing.
- Role-based access control: `admin` and `member` roles.
- Route guards on the frontend (`authGuard`, `adminGuard`) with HTTP interceptor for automatic token injection.
- Session persistence via localStorage.

### Dashboard

- Personalized overview per user: profile card, radar chart, notifications, service debts, and active reminders.
- Period-filtered statistics scoped to the current semester.
- Real-time notification panel with mark-as-read functionality.
- Reminders banner visible to all users (admin-created).

### Peer Evaluation (Voting System)

- Five evaluation categories: Mathematics, Programming, Teamwork, Discipline, Sociability.
- Score range: 1 to 10 per category per member.
- **Semester-based periods** (`YYYY-S1` for January-June, `YYYY-S2` for July-December).
- **One-vote policy**: votes are final and cannot be modified once submitted for a given member in the current semester.
- **Automatic lock**: once all team members have been evaluated, the voting interface locks until the next semester.
- Progress tracking: visual progress bar showing completed vs. pending evaluations.
- Modular UI: `VoteProgressComponent` and `VoteMemberCardComponent` as reusable standalone components.

### Radar Chart Generation

- Python script generates SVG radar charts from five-category score averages.
- Pentagon grid with concentric level indicators, animated data polygon, and labeled axes.
- Called from the backend via child process; output embedded directly in the frontend.

### Team Directory

- Grid view of all registered team members with avatars and display names.
- Click-through to individual member profiles showing read-only radar charts and basic information.

### Profile Management

- View and edit display name, profile photo URL, and role information.
- Bank account management: add, view, and delete personal bank accounts (CLABE, card number, bank name).
- Password change functionality with current password verification.

### Administration Panel (Admin Only)

Five management tabs accessible exclusively to users with the `admin` role:

1. **Users** -- List all users, delete accounts, modify roles.
2. **Shared Services** -- Create, edit (inline), and manage shared services (name, total cost, due date). Track per-user debt allocation.
3. **Transport** -- Create transport entries with seat capacity. Members can reserve seats.
4. **Treasury** -- Define treasury goals with target amounts. Track individual member payments with inline editing.
5. **Reminders** -- Create and delete team-wide reminders (title, message, type: info/warning/urgent).

### Notifications

- Server-side notification creation on key events (votes received, service assignments, reminders).
- Bell icon with unread count badge in the sidebar.
- Expandable notification panel with timestamp display and mark-as-read per notification.

### Reminders

- Admin-created announcements displayed as a top banner on the dashboard.
- Three severity levels: `info`, `warning`, `urgent` (color-coded).
- Visible to all authenticated users.

---

## Project Structure

```
Fmatputes-Dashboard/
  docker-compose.yml
  backend/
    Dockerfile
    package.json
    src/
      index.js                          # Express server entry point
      config/
        db.js                           # Sequelize connection + sync
        seed.js                         # Initial data seeding
      controllers/
        authController.js               # Login, register, password change
        userController.js               # User CRUD, profile updates
        voteController.js               # Voting submission, results, radar
        serviceController.js            # Shared services management
        transportController.js          # Transport + seat reservations
        treasuryController.js           # Treasury goals + payments
        bankAccountController.js        # Bank account CRUD
        notificationController.js       # Notification CRUD + mark-read
        reminderController.js           # Reminder management
        statsController.js              # Legacy stats endpoint
      middlewares/
        authMiddleware.js               # JWT verification + admin check
      models/
        index.js                        # Model associations hub
        User.js                         # User model (UUID, roles)
        Vote.js                         # Vote model (semester periods)
        BankAccount.js
        SharedService.js
        UserServiceDebt.js
        Transport.js
        TransportSeat.js
        Treasury.js
        UserTreasuryPayment.js
        Notification.js
        Reminder.js
      routes/                           # Express route definitions
      services/
        pythonRunner.js                 # Python subprocess executor
        notificationHelper.js           # Notification creation utility
  frontend/
    Dockerfile                          # Multi-stage: node build + nginx
    nginx.conf                          # SPA fallback configuration
    .dockerignore
    src/
      app/
        app.routes.ts                   # Lazy-loaded route definitions
        app.config.ts                   # Providers (HttpClient, router)
        core/
          layout/                       # Sidebar + mobile header layout
        features/
          login/                        # Authentication page
          dashboard/                    # Main dashboard view
          voting/                       # Peer evaluation system
            components/
              vote-progress/            # Reusable progress bar
              vote-member-card/         # Reusable member evaluation card
          profile/                      # User profile + bank accounts
          admin/                        # Administration panel (5 tabs)
          team/                         # Team member directory
          member-profile/               # Individual member detail view
        shared/
          services/                     # AuthService, DashboardService, etc.
          guards/                       # Route guards (auth, admin)
          interceptors/                 # JWT token interceptor
          components/                   # Reusable UI components
  scripts/
    python/
      radar_stats.py                    # SVG radar chart generator
      requirements.txt
```

---

## Getting Started

### Prerequisites

- Docker and Docker Compose installed.
- (Optional) Node.js 20+ and Angular CLI for local development.

### Run with Docker

```bash
git clone <repository-url>
cd Fmatputes-Dashboard
docker compose up --build -d
```

The application will be available at:
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

### Stop Services

```bash
docker compose down
```

To destroy volumes (database data):

```bash
docker compose down -v
```

---

## Environment Variables

Configured in `docker-compose.yml` for the backend service:

| Variable              | Description                        | Default Value                      |
|-----------------------|------------------------------------|------------------------------------|
| `NODE_ENV`            | Runtime environment                | `production`                       |
| `DB_HOST`             | PostgreSQL hostname                | `database`                         |
| `DB_PORT`             | PostgreSQL port                    | `5432`                             |
| `DB_USER`             | Database user                      | `fmaputes_admin`                   |
| `DB_PASSWORD`         | Database password                  | `fmaputes_secure_pass`             |
| `DB_NAME`             | Database name                      | `fmaputes_db`                      |
| `JWT_SECRET`          | Secret key for JWT signing         | (set in compose file)              |
| `PYTHON_SCRIPTS_PATH` | Path to Python scripts directory  | `/usr/src/app/scripts/python`      |

---

## API Reference

All endpoints are prefixed with `/api`. Authentication required unless noted otherwise.

### Authentication (`/api/auth`)

| Method | Endpoint              | Description                  | Auth |
|--------|-----------------------|------------------------------|------|
| POST   | `/auth/register`      | Register a new user          | No   |
| POST   | `/auth/login`         | Authenticate and receive JWT | No   |
| PUT    | `/auth/change-password` | Change current password    | Yes  |

### Users (`/api/users`)

| Method | Endpoint              | Description                  | Auth  |
|--------|-----------------------|------------------------------|-------|
| GET    | `/users`              | List all users               | Yes   |
| GET    | `/users/me`           | Get current user profile     | Yes   |
| PUT    | `/users/me`           | Update current user profile  | Yes   |
| DELETE | `/users/:id`          | Delete a user                | Admin |

### Voting (`/api/votes`)

| Method | Endpoint                    | Description                          | Auth |
|--------|-----------------------------|--------------------------------------|------|
| POST   | `/votes`                    | Submit votes (final, no re-voting)   | Yes  |
| GET    | `/votes/status`             | Check voting lock status             | Yes  |
| GET    | `/votes/pending`            | Get pending evaluations              | Yes  |
| GET    | `/votes/results/:userId`    | Get average scores for a user        | Yes  |
| GET    | `/votes/results/:userId/radar` | Generate radar chart SVG          | Yes  |

### Shared Services (`/api/services`)

| Method | Endpoint              | Description                          | Auth  |
|--------|-----------------------|--------------------------------------|-------|
| GET    | `/services`           | List all services with debts         | Yes   |
| POST   | `/services`           | Create a new service                 | Admin |
| PUT    | `/services/:id`       | Update service details               | Admin |
| DELETE | `/services/:id`       | Delete a service                     | Admin |

### Transport (`/api/transport`)

| Method | Endpoint                         | Description               | Auth  |
|--------|----------------------------------|---------------------------|-------|
| GET    | `/transport`                     | List all transports       | Yes   |
| POST   | `/transport`                     | Create transport          | Admin |
| POST   | `/transport/:id/reserve`         | Reserve a seat            | Yes   |
| DELETE | `/transport/:id`                 | Delete transport          | Admin |

### Treasury (`/api/treasury`)

| Method | Endpoint                         | Description                    | Auth  |
|--------|----------------------------------|--------------------------------|-------|
| GET    | `/treasury`                      | List treasury goals            | Yes   |
| POST   | `/treasury`                      | Create treasury goal           | Admin |
| PUT    | `/treasury/:id`                  | Update treasury goal           | Admin |
| PUT    | `/treasury/:id/payments/:payId`  | Update payment amount          | Admin |
| DELETE | `/treasury/:id`                  | Delete treasury goal           | Admin |

### Bank Accounts (`/api/bank-accounts`)

| Method | Endpoint              | Description                  | Auth |
|--------|-----------------------|------------------------------|------|
| GET    | `/bank-accounts`      | List user's bank accounts    | Yes  |
| POST   | `/bank-accounts`      | Add a bank account           | Yes  |
| DELETE | `/bank-accounts/:id`  | Delete a bank account        | Yes  |

### Notifications (`/api/notifications`)

| Method | Endpoint                    | Description                  | Auth |
|--------|-----------------------------|------------------------------|------|
| GET    | `/notifications`            | Get user's notifications     | Yes  |
| PUT    | `/notifications/:id/read`   | Mark notification as read    | Yes  |

### Reminders (`/api/reminders`)

| Method | Endpoint              | Description                  | Auth  |
|--------|-----------------------|------------------------------|-------|
| GET    | `/reminders`          | List active reminders        | Yes   |
| POST   | `/reminders`          | Create a reminder            | Admin |
| DELETE | `/reminders/:id`      | Delete a reminder            | Admin |

### Health (`/api/health`)

| Method | Endpoint    | Description          | Auth |
|--------|-------------|----------------------|------|
| GET    | `/health`   | Service health check | No   |

---

## Infrastructure Rules

All code merged into protected branches must comply with the following:

1. **Static Asset Routing** -- All Angular resources must be built with relative paths. The `baseHref` configuration must ensure Nginx resolves all sub-routes correctly without generating 404 errors on direct navigation or refresh.

2. **Proxy Header Trust** -- The backend assumes operation behind Nginx Proxy Manager and Cloudflare. Express is configured with `trust proxy` enabled, and client identity must be resolved from `X-Forwarded-For`, `X-Forwarded-Proto`, and `CF-Connecting-IP` headers.

3. **Container Isolation** -- Services communicate exclusively through the internal Docker network. No container exposes raw ports to the public internet in production.

4. **Responsive CSS** -- Tailwind utility classes for responsive breakpoints (`sm:`, `md:`, `lg:`) must have explicit `@media` fallback rules in `styles.css` to guarantee correct rendering in production builds.

---

## Git Workflow

Direct pushes to `main` (production) and `develop` (integration) are restricted by repository policy. All contributions must follow this branch naming convention:

- `feature/<description>` -- New functionality.
- `bugfix/<description>` -- Defect corrections.
- `chore/<description>` -- Maintenance, configuration, or documentation.

Standard flow:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# implement changes
git add -A
git commit -m "feat: description of the change"
git push origin feature/my-feature
# open Pull Request targeting develop
```

---

## License

See [LICENSE](LICENSE) for details.