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
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

</div>

---

## 📌 Overview

**TaskFlow** is designed for high-performing teams to organize workspaces, track projects, and manage sprints with intuitive Drag-and-Drop Kanban boards and real-time visual analytics. Built from the ground up focusing on performance, modular architecture, and developer best practices.

---

## ✨ Features

- 🔐 **Secure Authentication & RBAC**: JWT-based authentication with bcrypt password hashing and role-ready workspace access.
- 🏢 **Multi-Workspace & Projects**: Hierarchical structure: Users belong to Workspaces, which contain Projects, which contain Tasks.
- 📋 **Interactive Kanban Board**: 3-column workflow (*To Do*, *In Progress*, *Done*) powered by `@dnd-kit` with seamless drag-and-drop and optimistic UI updates.
- 📊 **Real-time Analytics Dashboard**: Interactive charts with `recharts` visualizing total task count, overdue alerts, and completion percentages.
- 🛡️ **Robust Validation & Error Handling**: Server-side request validation with `express-validator` and centralized error middleware.
- 🎨 **Modern Responsive UI**: Built with React, Vite, and Tailwind CSS v4, perfectly responsive across desktop, tablet, and mobile.
- 🧪 **Automated Testing Suite**: Integration tests for API routes using `jest` and `supertest`.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Drag & Drop:** [@dnd-kit/core](https://dndkit.com/), `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing & HTTP:** `react-router-dom`, `axios`

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database & ODM:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication:** `jsonwebtoken` (JWT), `bcryptjs`
- **Validation:** `express-validator`
- **Testing:** `jest`, `supertest`

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   TaskFlow Frontend                    │
│      (React + Vite + Tailwind CSS + @dnd-kit)          │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST (JWT Bearer)
┌──────────────────────────▼─────────────────────────────┐
│                   Express.js Backend                   │
│  ┌───────────────────────┬──────────────────────────┐  │
│  │   Auth Middleware     │   Validation Middleware  │  │
│  ├───────────────────────┴──────────────────────────┤  │
│  │     Controllers: Auth, Workspace, Project, Task  │  │
│  ├──────────────────────────────────────────────────┤  │
│  │          Centralized Error Handler               │  │
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
│   ├── controllers/         # Request handling logic
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── workspaceController.js
│   ├── middleware/          # JWT protection & error handler
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
│   ├── tests/               # Jest & Supertest integration tests
│   │   └── auth.test.js
│   ├── app.js               # Express application initialization
│   ├── server.js            # Entry point & DB connection
│   └── package.json
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
│   │   ├── utils/           # Axios instance & interceptors
│   │   │   └── api.js
│   │   ├── App.jsx          # Route configuration
│   │   ├── main.jsx         # React root
│   │   └── index.css        # Tailwind CSS imports
│   ├── vite.config.js       # Vite build configuration
│   └── package.json
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

### Workspaces (`/api/workspaces`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/workspaces` | Get all workspaces user is member of | ✅ |
| `POST` | `/api/workspaces` | Create a new workspace (user becomes owner/admin) | ✅ |

### Projects (`/api/projects`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/projects/:workspaceId` | Get all projects for a workspace | ✅ |
| `POST` | `/api/projects/:workspaceId` | Create a project within a workspace | ✅ |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/tasks/project/:projectId` | Fetch all tasks for a project | ✅ |
| `POST` | `/api/tasks/project/:projectId` | Create a new task (todo, in-progress, done) | ✅ |
| `PUT` | `/api/tasks/:id` | Update task details or move status | ✅ |
| `DELETE`| `/api/tasks/:id` | Delete a task | ✅ |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0 or later)
- **npm** or **yarn**
- **MongoDB** running locally (`mongodb://localhost:27017/taskflow`) or a MongoDB Atlas URI

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

# Start Vite development server
npm run dev
```
> Frontend runs at `http://localhost:5173`

---

## 🧪 Running Tests

TaskFlow includes integration tests using Jest and Supertest to verify authentication and API contracts.

```bash
cd backend
npm test
```

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **Real-time Synchronization:** Integrate Socket.io for instant collaborative board updates.
- [ ] **TypeScript Migration:** Convert frontend and backend for strict compile-time type safety.
- [ ] **Cloud Deployment:** Production Dockerfile setup with one-click deployment templates for Render and Vercel.
- [ ] **Task Comments & File Attachments:** Enable team discussions and file uploads via AWS S3 / Cloudinary.
- [ ] **Activity Audit Log:** Track historical changes for task movements and status updates.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/xNima-Dev">xNima-Dev</a></sub>
</div>
