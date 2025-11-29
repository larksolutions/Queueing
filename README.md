# QR-Based Queueing and Faculty Availability System

A modern MERN stack application for managing student queues and faculty availability in the IT Department Office.

![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Current Progress](#current-progress)
- [Contributing](#contributing)

## ✨ Features

### 🎯 Digital Queueing System
- ✅ Automated queue management with concern categorization
- ✅ Real-time queue status updates (5-second polling)
- ✅ QR code generation for each queue entry
- ✅ Position tracking and estimated wait time calculation
- ✅ Queue history tracking (last 5 entries)
- ✅ Multiple concern categories (ID, OJT, Capstone, Staff/Admin, Enrollment)

### 👥 Faculty Availability Management
- ✅ Real-time faculty status tracking (Available/Busy/Offline)
- ✅ Searchable faculty directory with filters
- ✅ Auto-refresh faculty availability (10-second polling)
- ✅ Faculty can update their status in real-time
- ✅ Display faculty information (specialization, office location)

### 🔐 Authentication & Authorization
- ✅ Separate login/registration for students and faculty
- ✅ JWT-based authentication
- ✅ Role-based access control (Student/Faculty/Admin)
- ✅ Protected routes
- ✅ Password hashing with bcryptjs

### 📱 User Interfaces
- ✅ Modern, professional UI with Tailwind CSS v4
- ✅ Responsive design for all devices
- ✅ Live status indicators with pulse animations
- ✅ Gradient designs and glassmorphism effects
- ✅ Professional login/register pages
- ✅ Enhanced student and faculty dashboards

## 🛠️ Tech Stack

### Frontend
- **React** 18 - UI library
- **Vite** 7.2.4 - Build tool and dev server
- **Tailwind CSS** v4 - Styling framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **qrcode.react** - QR code generation
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **qrcode** - Server-side QR generation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Que/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── FacultyAvailability.jsx
│   │   │   └── FacultyStatusToggle.jsx
│   │   ├── context/       # React context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── StudentQueue.jsx
│   │   │   ├── MyQueue.jsx
│   │   │   └── QueueManagement.jsx
│   │   ├── services/      # API services
│   │   │   ├── api.js
│   │   │   └── index.js
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── tailwind.config.js # Tailwind configuration
│   ├── postcss.config.js  # PostCSS configuration
│   └── package.json
│
└── server/                # Express Backend
    ├── models/            # Mongoose models
    │   ├── User.js
    │   ├── Queue.js
    │   └── FacultyAvailability.js
    ├── controllers/       # Route controllers
    │   ├── authController.js
    │   ├── queueController.js
    │   └── facultyController.js
    ├── routes/            # API routes
    │   ├── authRoutes.js
    │   ├── queueRoutes.js
    │   └── facultyRoutes.js
    ├── utils/             # Utility functions
    │   └── qrUtils.js
    ├── .env               # Environment variables (not in repo)
    ├── .env.example       # Environment template
    ├── server.js          # Entry point
    └── package.json
```

## 🚀 Installation

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** package manager
- **Git** - [Download](https://git-scm.com/)

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/larksolutions/Queueing.git
   cd Queueing
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Setup Environment Variables**
   
   Navigate to the server directory and copy the `.env.example` file:
   ```bash
   cd ../server
   cp .env.example .env
   ```
   
   The `.env` file is already configured with the MongoDB Atlas connection. No changes needed for development.

## ▶️ Running the Application

### Development Mode

You need to run both the server and client simultaneously in separate terminal windows.

#### Terminal 1 - Start the Backend Server
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5001`

#### Terminal 2 - Start the Frontend Client
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`

### Accessing the Application

1. Open your browser and navigate to `http://localhost:5173`
2. You can now:
   - Register as a Student or Faculty member
   - Login with your credentials
   - Access the dashboard based on your role


## 🔧 Environment Variables

### Server (.env)
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://larksolutionstech:21void@larkchive.aaxfp3a.mongodb.net/queueing?retryWrites=true&w=majority&appName=Queueing

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

**Note**: For production deployment, make sure to:
- Change `JWT_SECRET` to a strong, random string
- Update `CLIENT_URL` to your production domain
- Set `NODE_ENV=production`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (student/faculty)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current authenticated user

### Queue Management
- `GET /api/queue` - Get all queues (with filters)
- `POST /api/queue` - Create new queue entry
- `GET /api/queue/stats` - Get queue statistics by category
- `GET /api/queue/my-position/:id` - Get queue position
- `PUT /api/queue/:id` - Update queue status
- `DELETE /api/queue/:id` - Delete/cancel queue

### Faculty
- `GET /api/faculty` - Get all faculty members (with search/filter)
- `GET /api/faculty/:id/availability` - Get faculty availability schedule
- `POST /api/faculty/availability` - Create availability schedule
- `PUT /api/faculty/status` - Update faculty availability status

## 📊 Current Progress

### ✅ Completed Features

#### Backend
- [x] User authentication system (JWT)
- [x] User model with role-based access (Student/Faculty/Admin)
- [x] Queue model with automated position calculation
- [x] Faculty availability model
- [x] Queue CRUD operations
- [x] Faculty status management
- [x] QR code generation utilities
- [x] API endpoints for all features
- [x] Search and filter functionality
- [x] Real-time data updates support

#### Frontend
- [x] Modern login/register pages with role selection
- [x] Protected routes implementation
- [x] Authentication context and state management
- [x] Student dashboard with queue status
- [x] Faculty dashboard with status toggle
- [x] Queue joining interface
- [x] Real-time queue tracking (MyQueue page)
- [x] Queue management interface (Faculty/Admin)
- [x] Faculty availability search component
- [x] Faculty status toggle component
- [x] Queue history display
- [x] QR code display for active queues
- [x] Professional UI with Tailwind CSS v4
- [x] Responsive design for all pages
- [x] Live status indicators
- [x] Auto-refresh functionality (5-10 second intervals)

### 🔄 In Progress
- [ ] QR code scanning verification system
- [ ] Push notifications for queue updates
- [ ] Email notifications
- [ ] Advanced queue analytics
- [ ] Admin panel for system management

### 📋 Planned Features
- [ ] SMS notifications for queue status
- [ ] Faculty scheduling calendar
- [ ] Queue appointment booking
- [ ] Student feedback and rating system
- [ ] Report generation (PDF/Excel)
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Mobile app (React Native)
- [ ] WebSocket implementation for true real-time updates
- [ ] Queue transfer between faculty members

## 🎯 Queue Categories

The system supports the following concern categories:
- **ID** - ID-related concerns
- **OJT** - On-the-Job Training matters
- **Capstone** - Capstone project consultations
- **Staff/Admin** - Administrative concerns
- **Enrollment** - Enrollment-related issues
- **Other** - General concerns

## 🔐 User Roles

1. **Student**
   - Join queues
   - View queue status and position
   - Track queue history
   - Search for available faculty
   - View and share QR codes

2. **Faculty**
   - Update availability status
   - Manage queues by category
   - View queue statistics
   - Process student queues
   - Set office hours

3. **Admin** (Future)
   - Full system access
   - User management
   - System analytics
   - Configuration settings
