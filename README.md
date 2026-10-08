# PrepMind AI - Full-Stack AI Interview Preparation Platform

PrepMind AI is a production-ready, full-stack web application designed to help job candidates prepare for interviews through personalized AI question generation, real-time answer evaluation, resume PDF parsing, performance tracking, and vector-quality PDF export.

---

## 🚀 Key Features

- **JWT Authentication & Auth Context**: Secure User registration, login, logout, protected routes, and session persistence using cookies and localStorage.
- **PDF Resume Upload & Text Extraction**: Upload PDF resumes parsed automatically via `pdf-parse` engine to customize AI questions based on true candidate skills and experience.
- **Google Gemini AI Question Generation**: Generates targeted Technical, STAR Behavioral, HR, Resume-based, or Mixed interview question sets using `@google/genai` model engines.
- **Real-Time Answer Evaluation**: Evaluates candidate answers on a scale from 0 to 10, highlighting key strengths, missing technical concepts, and model answers.
- **Dynamic Interview Dashboard**: Comprehensive statistics, metrics, practice history, recent practice sessions, and user progress.
- **Vector-Quality PDF Export**: High-resolution print-ready PDF export utilizing an isolated hidden iframe print frame system.
- **SaaS-Quality SCSS Design System**: Glassmorphic, modern dark mode UI built using custom SCSS design tokens, variables, mixins, and responsive layout breakpoints.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Custom SCSS / Sass (`_variables.scss`, `_mixins.scss`, `_reset.scss`, `_utilities.scss`)
- **State & Router**: React Context API (`AuthContext`), React Router DOM v6
- **API Client**: Axios with request/response interceptors
- **Icons**: `lucide-react`
- **PDF Export**: Hidden print frame rendering system (`printPdf.js`)

### Backend
- **Framework**: Node.js & Express
- **Database**: MongoDB & Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT), `bcryptjs`, Cookie Parser
- **File Upload & PDF Parsing**: `multer` & `pdf-parse`
- **AI Service Integration**: `@google/genai` (Google Gemini models)
- **Environment & Security**: `dotenv`, `cors`, central error middleware

---

## 📁 Directory Structure

```text
AI_Interview_Helper/
│
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── resume.controller.js
│   │   └── interview.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   └── Interview.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── resume.routes.js
│   │   └── interview.routes.js
│   ├── services/
│   │   ├── gemini.service.js
│   │   └── pdf.service.js
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   ├── render-build.sh
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── ProgressBar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ResumePage.jsx
│   │   │   ├── InterviewSetup.jsx
│   │   │   ├── InterviewPractice.jsx
│   │   │   ├── InterviewResult.jsx
│   │   │   ├── InterviewHistory.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── _variables.scss
│   │   │   ├── _mixins.scss
│   │   │   ├── _reset.scss
│   │   │   ├── _utilities.scss
│   │   │   └── main.scss
│   │   ├── utils/
│   │   │   └── printPdf.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster URI)
- [Google Gemini API Key](https://aistudio.google.com/)

### 2. Install Dependencies

#### Install Backend Dependencies
```bash
cd backend
npm install
```

#### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Environment Variables Configuration
Open or create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-interview-prep
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 4. Running Dev Servers

#### Start Backend Server (Port 5000)
```bash
cd backend
npm run dev
```

#### Start Frontend Dev Server (Port 5173)
```bash
cd frontend
npm run dev
```

Open your browser at **http://localhost:5173**.

---

## 📡 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate & retrieve JWT
- `GET  /api/auth/me` - Get current session user profile
- `POST /api/auth/logout` - Clear auth cookies

### Resume Management
- `POST /api/resume/upload` - Upload PDF & extract text
- `GET  /api/resume` - Retrieve user's current resume
- `DELETE /api/resume/:id` - Delete uploaded resume

### Interview AI Generation & Practice
- `POST /api/interviews/generate` - Generate AI interview questions using Gemini
- `GET  /api/interviews` - Fetch user's practice history
- `GET  /api/interviews/:id` - Fetch single interview session & questions
- `POST /api/interviews/:id/answer` - Submit answer for real-time AI evaluation
- `POST /api/interviews/:id/complete` - Finalize session & compute scores
- `DELETE /api/interviews/:id` - Delete session record

---

## ☁️ Deployment on Render

This project includes `./backend/render-build.sh` for seamless Render web service deployment.

- **Build Command**: `chmod +x ./backend/render-build.sh && ./backend/render-build.sh`
- **Start Command**: `node backend/server.js`
- **Environment Variables**: Set `MONGO_URI`, `GOOGLE_GENAI_API_KEY`, `JWT_SECRET`, `NODE_ENV=production`.

---

## 📄 License
MIT License. Created for AI Interview Preparation.
