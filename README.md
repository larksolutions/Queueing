# QR-Based Queueing and Faculty Availability System

A MERN stack application for managing student queues and faculty availability in the IT Department Office.

## 🚀 Tech Stack

### Frontend
- **React** (via Vite)
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **qrcode.react** - QR code generation

### Backend
- **Node.js** & **Express** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **qrcode** - QR code generation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Que/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React Context (Auth)
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── .env.example       # Environment variables template
│   └── package.json
│
└── server/                # Node.js Backend
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
    ├── middleware/        # Custom middleware
    │   └── auth.js
    ├── utils/             # Utility functions
    │   ├── tokenUtils.js
    │   └── qrUtils.js
    ├── server.js          # Entry point
    ├── .env.example       # Environment variables template
    └── package.json
```

## 🛠️ Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the repository
```bash
cd Que
```

### 2. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Create .env file (already done)
# Edit .env with your MongoDB URI and secrets

# Start development server
npm run dev
```

### 3. Setup Frontend

```bash
cd client

# Install dependencies (already done)
npm install

# Create .env file (already done)
# Edit .env if needed

# Start development server
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/queue-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Queue Management
- `POST /api/queue` - Create queue entry (Student)
- `GET /api/queue` - Get all queue entries
- `PUT /api/queue/:id` - Update queue status (Faculty/Admin)
- `DELETE /api/queue/:id` - Delete queue entry

### Faculty
- `GET /api/faculty` - Get all faculty members
- `GET /api/faculty/:id/availability` - Get faculty availability
- `POST /api/faculty/availability` - Create availability schedule (Faculty)
- `PUT /api/faculty/status` - Update availability status (Faculty)

## 👥 User Roles

1. **Student** - Can join queue, view status
2. **Faculty** - Can manage queue, set availability
3. **Admin** - Full system access

## 🚦 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## 🔐 Default Test Users

Create users through the registration page or use MongoDB to seed initial data.

## 📝 Features

- ✅ User authentication (JWT)
- ✅ Role-based access control
- ✅ QR code generation for queue entries
- ✅ Real-time queue management
- ✅ Faculty availability scheduling
- ✅ Responsive UI design

## 🛣️ Roadmap

- [ ] Real-time updates with Socket.io
- [ ] Email notifications
- [ ] Queue analytics and reports
- [ ] Mobile app integration
- [ ] QR code scanning functionality
- [ ] Appointment scheduling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

IT Department - Queue Management System

## 🙏 Acknowledgments

- React Vite for fast development
- MongoDB for flexible data storage
- Express.js for robust API development
