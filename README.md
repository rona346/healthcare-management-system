# Healthcare Management System

A healthcare management web application built using React, TypeScript, Firebase Authentication, Cloud Firestore, Tailwind CSS, Vite, and Express. The project demonstrates role-based access control (RBAC), appointment management, authentication, real-time data synchronization with Firebase, and clean frontend architecture suitable for a software developer internship portfolio.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [User Roles & Capabilities](#-user-roles--capabilities)
  - [Patient Role](#1-patient-role)
  - [Doctor Role](#2-doctor-role)
  - [Admin Role](#3-admin-role)
- [Architecture Overview](#-architecture-overview)
- [Authentication Flow](#-authentication-flow)
- [Service Layer Architecture](#-service-layer-architecture)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [What I Learned](#-what-i-learned)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

---

## 🏥 Project Overview

The **Healthcare Management System** is a responsive web application created to simplify clinic appointment workflows and demonstrate a role-based healthcare application architecture. Patients can book appointments, receive appointment updates, and communicate with doctors, while doctors and administrators can manage schedules, users, appointments, and dashboard analytics.

Designed with modularity and scalability in mind, the frontend leverages React, TypeScript, and Tailwind CSS for a clean, fast user interface, while Firebase (Authentication and Cloud Firestore) handles identity management and real-time database capabilities. An Express server is included to support backend routing and future API integration.

---

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and permission flows tailored for Patients, Doctors, and Administrators.
- **Appointment Scheduling:** Patients can select a doctor, choose a date and time, and create appointment requests that doctors can manage.
- **Appointment Status Tracking:** Doctors can confirm or cancel appointments, and patients receive updated appointment status information.
- **Doctor-Patient Chat (In Progress):** A chat module is being integrated so doctors and patients can communicate directly through the application.
- **Dashboard Analytics:** Admin dashboard displays operational summaries, booking information, and user statistics.
- **Secure Authentication:** Multi-provider authentication with session persistence and route protection.
- **Responsive Interface:** Mobile-first layout engineered with Tailwind CSS for seamless access on desktop, tablet, and mobile browsers.

---

## 👥 User Roles & Capabilities

### 1. Patient Role

- **Personal Dashboard:** View upcoming appointments, active prescriptions, and recent updates at a glance.
- **Appointment Booking:** Select preferred doctors, choose consultation modes (In-Person / Virtual), and reserve available time slots.
- **Prescription Portal:** Access a history of issued prescriptions with detailed dosage and doctor instructions.
- **Direct Messaging:** Send direct follow-up messages to assigned medical personnel.
- **Profile Management:** Update contact information, medical history notes, and personal demographics securely.

### 2. Doctor Role

- **Schedule Management:** Review appointment requests and patient details.
- **Patient Directory:** View registered patient information relevant to appointments and consultation workflows.
- **AI-Assisted Diagnosis:** Review patient symptoms and access AI-assisted diagnosis support within the dashboard.
- **Appointment Status Updates:** Approve, reschedule, or complete pending appointment requests in real time.

### 3. Admin Role

- **Operational Analytics:** Monitor total patient registrations, completed consultations, and booking trends over time.
- **Doctor Directory Management:** Add, edit, or manage doctor profiles, specialties, and schedule configurations.
- **Patient Management:** Overview of all registered accounts with permissions to resolve account issues.
- **Master Appointment Control:** View and manage appointments across all doctors and patients.

---

## 🏗️ Architecture Overview

The project follows a modular React architecture with Firebase services and an Express backend bridge:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                       │
│  (React 19 + TypeScript + Tailwind CSS + Vite Engine)   │
└───────────┬─────────────────────────────────┬───────────┘
            │                                 │
     HTTP / REST API                     Firebase SDK
            │ (Express / Node.js)             │
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│     Express Server    │         │       Firebase        │
│  (API Middleware /    │         │  - Auth (Identity)    │
│   Routing / Asset)    │         │  - Firestore (NoSQL)  │
└───────────────────────┘         └───────────────────────┘
```

- **Frontend:** Single-page application built with React and TypeScript, using Vite for development and bundling. Styling is handled via Tailwind CSS utility classes.
- **Backend Bridge:** An Express.js server used for routing and future API integrations.
- **Database & Auth:** Firebase Authentication handles user identity, while Cloud Firestore stores collections such as users, appointments, messages, and notifications.

---

## 🔐 Authentication Flow

1. **Identity Request:** The user selects their authentication method (Email/Password or Google OAuth) via the login component.
2. **Firebase Auth Verification:** Firebase Authentication processes the request and returns a user token along with unique UID metadata.
3. **Role Resolution:** Upon successful authentication, the application queries the `users` collection in Cloud Firestore using the authenticated UID to resolve the assigned user role (`patient`, `doctor`, or `admin`).
4. **Context & Route Protection:** The `useAuth` hook stores the current user state and role in a global React context wrapper. Protected routes check this state before mounting, redirecting unauthorized users to appropriate portals or the login screen.
5. **Session Persistence:** Firebase automatically maintains login state across browser sessions. On application mount, `onAuthStateChanged` restores the user context gracefully.

---

## 🛠️ Service Layer Architecture

To maintain separation of concerns and prevent tightly coupled code, the application separates UI components from data-fetching logic:

- **Firebase Service Module (`src/firebase.ts`):** Initializes the Firebase App instance, exports `auth` and `db` references, and standardizes configuration settings.
- **Data Collections Structure:**
  - `users`: Stores user profile data, contact information, and role assignments (`patient`, `doctor`, `admin`).
  - `appointments`: Stores scheduled appointment records including doctor ID, patient ID, date, time slot, status (`pending`, `confirmed`, `completed`, `cancelled`), and type (`in-person`, `virtual`).
  - `prescriptions`: Contains issued medication records tied to specific appointments and patients.
  - `messages`: Manages chat message streams between patients and healthcare providers.
- **Service Decoupling:** Components interact with Firestore via modular helper functions, keeping components clean and testable.

---

## 📁 Project Structure

```
├── public/                    # Static assets
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ErrorBoundary.tsx  # Runtime error boundary handler
│   │   ├── Navbar.tsx         # Responsive top navigation header
│   │   ├── Notifications.tsx  # In-app notification popovers
│   │   └── Sidebar.tsx        # Role-based navigation menu
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.tsx        # Global auth context and role hook
│   ├── pages/                 # Role-based route screens
│   │   ├── AdminAnalytics.tsx
│   │   ├── AdminAppointments.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminDoctors.tsx
│   │   ├── AdminPatients.tsx
│   │   ├── AppointmentBooking.tsx
│   │   ├── Chat.tsx
│   │   ├── DoctorAppointments.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── DoctorPatients.tsx
│   │   ├── PatientAppointments.tsx
│   │   ├── PatientDashboard.tsx
│   │   ├── PatientPrescriptions.tsx
│   │   └── Profile.tsx
│   ├── services/              # API and external service wrappers
│   ├── types.ts               # Shared TypeScript interfaces & enums
│   ├── firebase.ts            # Firebase app and database initialization
│   ├── index.css              # Global styles importing Tailwind CSS
│   ├── main.tsx               # Application entry point
│   └── App.tsx                # Main router and layout manager
├── .env.example               # Template for environment configuration
├── .gitignore                 # Excluded git tracking files
├── firestore.rules            # Firestore security rules
├── index.html                 # Main HTML document template
├── package.json               # Project dependencies and script declarations
├── server.ts                  # Express backend entry point
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite bundler configuration
```

---

## 💻 Tech Stack

| Technology          | Purpose                                                   |
| :------------------ | :-------------------------------------------------------- |
| **React 19**        | User interface library for building component-driven SPA  |
| **TypeScript**      | Static typing for data models, props, and API contracts   |
| **Firebase Auth**   | User authentication and session management                |
| **Cloud Firestore** | Real-time NoSQL database for application data             |
| **Tailwind CSS**    | Utility-first CSS framework for responsive layout styling |
| **Vite 6**          | Modern build tool and development server                  |
| **Express.js**      | Node.js web framework for backend serving and routing     |
| **Lucide React**    | Scalable vector icon library                              |
| **Motion**          | Fluid animations and UI transitions                       |
| **Recharts**        | Data visualization for admin metrics and reporting        |

---

## ⚡ Installation & Setup

Follow these steps to run the project locally:

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Firebase Account**: Access to Firebase Console to create a Firestore database

### 1. Clone the Repository

```bash
git clone https://github.com/guptaronak810/healthcare-management-system.git
cd healthcare-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

Fill in your Firebase credentials and environment details in `.env` (see below).

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with your Firebase configuration values:

```env
# Application Host URL
APP_URL="http://localhost:3000"

# Firebase Client Configuration
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

---

## 💡 What I Learned

Building this project helped me strengthen practical React and Firebase development skills:

- **Authentication & Context Management:** Implementing a reusable `useAuth` hook and authentication flow with Firebase.
- **Role-Based Access Control:** Designing separate dashboards and permission flows for Admin, Doctor, and Patient users.
- **TypeScript & React:** Using interfaces and component-based architecture to keep the application organized and maintainable.
- **Service Layer Architecture:** Keeping Firebase logic separate from UI components for easier maintenance and future database migration.
- **Project Organization:** Structuring the project with reusable components, custom hooks, and modular service functions.

---

## 🚀 Future Improvements

- **Complete Role-Based Authorization:** Ensure each user can access only the dashboard assigned to their role.
- **Real-Time Doctor-Patient Chat:** Complete the dynamic chat implementation between authenticated users.
- **MySQL + Node.js/Express Backend:** Migrate Firestore data operations through a dedicated backend API layer.
- **Video Consultation & Notifications:** Expand appointment reminders and consultation features.

---

## 👤 Author

**Ronak Gupta**

- GitHub: [github.com/rona346](https://github.com/rona346)
- LinkedIn: [www.linkedin.com/in/ronak-gupta-6a5382244](https://www.linkedin.com/in/ronak-gupta-6a5382244)
- Email: guptaronak810@gmail.com

---

_This project was developed as a software engineering portfolio application to demonstrate full-stack web development skills._
