<div align="center">

# ⚡ TaskFlow

**A modern, full-stack collaborative team task manager built on the MERN stack.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-api-endpoints">API Endpoints</a> •
  <a href="#-production-deployment">Deployment Guide</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-automated-testing">Testing</a>
</p>

</div>

---

## 📌 Overview

**TaskFlow** is designed for teams to organize workspaces, track projects, and manage sprints with intuitive Drag-and-Drop Kanban boards and visual analytics. Built from the ground up focusing on clean architecture, security best practices (mass-assignment protection, tenant isolation, rate limiting), and responsive UX.

---

## ✨ Features

- 🔐 **JWT Authentication & Tenant Isolation**: Secure user registration, bcrypt password hashing, and strict authorization ensuring users can only access their authorized workspaces and projects.
- 👥 **Team Workspaces & RBAC**: Multi-user workspaces supporting **Admin** and **Member** roles. Admins invite registered teammates by email and manage projects; members collaborate on tasks.
- 📋 **Interactive Kanban Board**: 3-column workflow (*To Do*, *In Progress*, *Done*) powered by `@dnd-kit` with seamless drag-and-drop, optimistic UI updates, and task management.
- 🎯 **Full Task Details**: Set priority (*Low*, *Medium*, *High*), due dates with overdue highlighting, assign tasks to workspace members, and manage task lifecycle.
- 📊 **Interactive KPI & Progress Analytics**: Dashboard powered by `recharts` calculating total task load, overdue alerts, and completion rates dynamically.
- 🛡️ **Defensive Security & Robust Error Handling**:
  - Whitelisted updates on task modification to prevent **Mass Assignment** vulnerabilities.
  - HTTP security headers via `helmet` and brute-force protection with `express-rate-limit`.
  - Configurable CORS origin restriction.
  - Standardized error middleware ensuring proper HTTP status codes (400 for validation/CastErrors, 401 for unauthorized, 403 for forbidden, 500 for server exceptions).
- 🧪 **API & Security Test Suite**: Automated tests using `jest` and `supertest` covering authentication, multi-tenant isolation, RBAC enforcement, mass assignment guards, and error responses.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Drag & Drop:** [@dnd-kit/core](https://dndkit.com/), `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing & HTTP:** `react-router-dom`, `axios` (with dynamic `VITE_API_URL` and 401 auth interceptor)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database & ODM:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Security:** `helmet`, `express-rate-limit`, `bcryptjs`, `jsonwebtoken`
- **Validation:** `express-validator`
- **Testing:** `jest`, `supertest`

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   TaskFlow Frontend                    │
│      (React + Vite + Tailwind CSS + @dnd-kit)          │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST (JWT Bearer Token)
┌──────────────────────────▼─────────────────────────────┐
│                   Express.js Backend                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Helmet Security Headers & Rate Limiters        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   JWT Auth Middleware (Tenant & User Context)    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   RBAC & Ownership Validation Middleware         │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   Controllers: Auth, Workspace, Project, Task    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   Centralized Error Handling (400/401/403/500)   │  │
│  └───────────────────────┬──────────────────────────┘  │
└──────────────────────────┼─────────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼─────────────────────────────┐
│                     MongoDB Database                   │
│       Collections: Users, Workspaces, Projects, Tasks  │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```bash
taskflow/
├── backend/
│   ├── controllers/         # Request handling & sanitization
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── workspaceController.js
│   ├── middleware/          # JWT protection, RBAC, error handler
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/              # Mongoose data schemas
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── User.js
│   │   └── Workspace.js
│   ├── routes/              # Express API route declarations
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── workspaceRoutes.js
│   ├── tests/               # Jest & Supertest API/Security tests
│   │   ├── api.test.js
│   │   └── auth.test.js
│   ├── app.js               # Express application initialization & middleware
│   ├── server.js            # Entry point & DB connection
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Kanban, Stats, Navbar)
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── StatsDashboard.jsx
│   │   ├── pages/           # Routed views
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProjectBoard.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/           # Axios instance & dynamic VITE_API_URL interceptor
│   │   │   └── api.js
│   │   ├── App.jsx          # Route configuration & PrivateRoute wrapper
│   │   ├── main.jsx         # React root
│   │   └── index.css        # Tailwind CSS imports
│   ├── vite.config.js       # Vite build configuration
│   └── .env.example
├── .gitignore
└── README.md
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | ❌ |
| `GET` | `/api/auth/me` | Fetch current logged-in user profile | ✅ |

### Workspaces & Team Members (`/api/workspaces`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/workspaces` | Get all workspaces user belongs to | ✅ (Member) |
| `POST` | `/api/workspaces` | Create new workspace (creator is admin) | ✅ (User) |
| `GET` | `/api/workspaces/:id` | Get single workspace details & team members | ✅ (Member) |
| `POST` | `/api/workspaces/:id/members` | Invite member by email with role (admin/member) | ✅ (Admin only) |
| `DELETE`| `/api/workspaces/:id/members/:userId` | Remove member from workspace | ✅ (Admin/Self) |

### Projects (`/api/projects`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/projects/:workspaceId` | Get all projects in a workspace | ✅ (Member) |
| `GET` | `/api/projects/detail/:projectId`| Get project details & workspace members | ✅ (Member) |
| `POST` | `/api/projects/:workspaceId` | Create a project within a workspace | ✅ (Member) |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/tasks/project/:projectId` | Fetch all tasks for a project | ✅ (Member) |
| `POST` | `/api/tasks/project/:projectId` | Create a task (title, description, status, priority, dueDate, assignee) | ✅ (Member) |
| `PUT` | `/api/tasks/:id` | Update task fields (sanitized against mass assignment) | ✅ (Member) |
| `DELETE`| `/api/tasks/:id` | Delete a task | ✅ (Member) |

---

## 🌐 Production Deployment Guide

Deploying TaskFlow into production with a live URL takes under 10 minutes:

### 1. Database: MongoDB Atlas (Free Tier)
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a user with a secure password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
5. Click **Connect** → **Drivers** (Node.js) and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority
   ```

### 2. Backend: Render (Free Web Service)
1. Push your repository to GitHub.
2. Sign in to [render.com](https://render.com) and click **New +** → **Web Service**.
3. Connect your GitHub repository `xNima-Dev/taskflow`.
4. Configure service settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *Your random secure secret string*
   - `CLIENT_URL`: *Your Vercel frontend URL (e.g. `https://taskflow-app.vercel.app`)*
6. Click **Deploy Web Service** and copy your backend URL (e.g., `https://taskflow-api.onrender.com`).

### 3. Frontend: Vercel (Free Static Hosting)
1. Sign in to [vercel.com](https://vercel.com) and click **Add New** → **Project**.
2. Select your repository `xNima-Dev/taskflow`.
3. Configure project settings:
   - **Root Directory:** Click Edit and select `frontend`.
   - **Framework Preset:** `Vite`
4. Add **Environment Variable**:
   - `VITE_API_URL`: `https://taskflow-api.onrender.com/api` *(Your Render backend URL + `/api`)*
5. Click **Deploy**. Your live TaskFlow app will be deployed with HTTPS!

---

## 🚀 Local Getting Started

### Prerequisites
- **Node.js** (v18.0 or later)
- **MongoDB** running locally (`mongodb://localhost:27017/taskflow`) or an Atlas connection URI

---

### 1. Clone the Repository
```bash
git clone git@github.com:xNima-Dev/taskflow.git
cd taskflow
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env if needed (default points to localhost:27017/taskflow)

# Start backend server in development mode
npm run dev
```
> Backend runs at `http://localhost:5000`

### 3. Frontend Setup
```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Vite development server
npm run dev
```
> Frontend runs at `http://localhost:5173`

---

## 🧪 Automated Testing

TaskFlow features an automated test suite verifying security controls, authorization boundaries, and API contracts.

```bash
cd backend
npm test
```

### Test Coverage Highlights:
- **Authentication**: User registration, password encryption, and duplicate email prevention.
- **Tenant Isolation**: Verifies that users cannot access tasks or projects belonging to other workspaces.
- **Mass Assignment Defense**: Ensures sensitive fields (e.g. `project` foreign keys) cannot be hijacked via update payloads.
- **RBAC**: Enforces that only workspace admins can invite new members.
- **Error Handling**: Verifies that server exceptions return HTTP 500 and Mongoose CastErrors return HTTP 400 (never erroneous HTTP 200s).

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **Real-time Synchronization:** Integrate Socket.io for live multi-user board updates.
- [ ] **TypeScript Migration:** Convert codebase for strict compile-time type safety.
- [ ] **Task Comments & Activity Log:** Enable team discussion threads and historical audit trails.
- [ ] **File Attachments:** Support task asset uploads via AWS S3 or Cloudinary.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/xNima-Dev">xNima-Dev</a></sub>
</div>
