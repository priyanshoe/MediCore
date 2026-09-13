<div align="center">
<img width="1200" height="475" alt="GHBanner" src="/banner.png" />
</div>

# 🏥 MediCore

A modern and responsive medical management web application designed to provide a smooth healthcare experience for patients, doctors, and administrators.

Users can find doctors, view doctor profiles, book and manage appointments, and manage their healthcare-related information. The application also includes role-based functionality for **Admin, Doctor, and Patient** users.

**Live:** https://medi-core-vert.vercel.app/

## ✨ Features

1. 🔐 User registration and authentication
2. 👨‍⚕️ Browse and search doctors
3. 🔎 Doctor search and filtering
4. 👤 Doctor and patient profile management
5. 📅 Book and manage appointments
6. ❌ Cancel appointments
7. 📝 Appointment notes and details
8. 👨‍⚕️ Doctor appointment management
9. ✅ Accept or reject appointment requests
10. 👤 View patient information
11. 👨‍💼 Admin dashboard
12. 🧑‍⚕️ Doctor dashboard
13. 🧑‍🤝‍🧑 Patient dashboard
14. 🔒 Role-based protected routes
15. 📱 Responsive design for desktop, tablet, and mobile devices

## 🛠️ Technologies Used

**Frontend:** React.js, JavaScript, HTML, CSS

**Styling:** Tailwind CSS

**Routing:** React Router

**HTTP Client:** Axios

**Backend / API:** JSON Server

**State Management:** React Context API

**Authentication:** Local Storage

**Build Tool:** Vite

**Database:** JSON Server / JSON Data

**Deployment:** Vercel / Render

## 🚀 Getting Started

### Prerequisites

* Node.js
* npm

### Installation

1. Clone the repository

```bash
git clone https://github.com/priyanshoe/medicore.git
```

2. Navigate to the project directory

```bash
cd medicore
```

3. Install dependencies

```bash
npm install
```

4. Create a `.env.local` file and add your backend API URL

```env
VITE_API_URL=http://localhost:3000
```

5. Start the React development server

```bash
npm run dev
```

6. Start the JSON Server

```bash
npm run dev:server
```

The application will now be available locally.

## 👥 User Roles

### 👨‍💼 Admin

* Manage doctors
* Manage patients
* Manage users
* Manage appointments
* View overall system information

### 👨‍⚕️ Doctor

* Manage doctor profile
* View appointments
* Accept or reject appointment requests
* View patient information
* Manage appointment-related information

### 🧑‍🤝‍🧑 Patient

* Create and manage profile
* Browse doctors
* Search and filter doctors
* View doctor profiles
* Book appointments
* Cancel appointments
* View appointment details and status

## 📌 Project Purpose

This project was built to demonstrate the development of a real-world medical management platform using React and modern frontend technologies.

The main focus of the project is on **role-based authentication, protected routes, API integration, reusable React components, appointment management, profile management, and responsive UI design**.

The project also demonstrates the use of **JSON Server as a lightweight REST API** for frontend development and application prototyping.

## 🌐 Live Demo

**Live:** https://medi-core-vert.vercel.app/

## 💡 Project Highlights

* Role-based access control
* Protected routes
* Reusable React components
* REST API integration
* JSON Server backend
* Responsive user interface
* Doctor and patient profile management
* Appointment booking workflow
* Appointment status management
* Local storage authentication
* Clean and maintainable React architecture
