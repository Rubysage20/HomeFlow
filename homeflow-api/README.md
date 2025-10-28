# HomeFlow API

Backend API for HomeFlow - A smart household task management app that automatically divides tasks among family members based on availability, skill, workload, and time capacity.

## 🚀 Features

- **Smart Task Distribution** - Intelligent algorithm automatically assigns tasks based on:
  - Available time capacity
  - Current workload
  - Task priority
  - Due date urgency
  - Member preferences
  
- **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- **Household Management** - Create households, invite members, manage roles
- **Task Management** - Full CRUD operations for tasks with priorities, tags, and recurring options
- **Gamification** - Points, badges, and streaks to motivate task completion
- **RESTful API** - Clean, documented API endpoints

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update these variables in `.env`:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/homeflow
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRE=30d
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your machine:
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
   ```

5. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users` - Get all users in household (Protected)
- `GET /api/users/:id` - Get single user (Protected)
- `PUT /api/users/:id` - Update user (Protected)
- `DELETE /api/users/:id` - Delete user (Protected/Admin)
- `PUT /api/users/:id/points` - Update user points (Protected)

### Households
- `POST /api/households` - Create household (Protected)
- `GET /api/households` - Get user's households (Protected)
- `GET /api/households/:id` - Get single household (Protected)
- `PUT /api/households/:id` - Update household (Protected/Admin)
- `DELETE /api/households/:id` - Delete household (Protected/Admin)
- `POST /api/households/join` - Join household with invite code (Protected)
- `POST /api/households/:id/leave` - Leave household (Protected)
- `DELETE /api/households/:id/members/:userId` - Remove member (Protected/Admin)
- `GET /api/households/:id/stats` - Get household statistics (Protected)

### Tasks
- `POST /api/tasks` - Create task (Protected)
- `GET /api/tasks` - Get all household tasks (Protected)
- `GET /api/tasks/user/:userId` - Get tasks for specific user (Protected)
- `GET /api/tasks/:id` - Get single task (Protected)
- `PUT /api/tasks/:id` - Update task (Protected)
- `DELETE /api/tasks/:id` - Delete task (Protected/Admin)
- `PUT /api/tasks/:id/complete` - Mark task complete (Protected)
- `POST /api/tasks/auto-assign` - Auto-assign all open tasks (Protected/Admin)
- `POST /api/tasks/:id/swap` - Swap task with another user (Protected)

## 🧠 Smart Auto-Assign Algorithm

The core feature of HomeFlow is the intelligent task distribution algorithm located in `/src/utils/taskSplitter.js`.

### How it works:

1. **Collects open tasks** - Gets all unassigned tasks in the household
2. **Analyzes members** - Calculates current workload and available capacity for each member
3. **Scores assignments** - For each task, scores each eligible member based on:
   - Available time capacity (40% weight)
   - Current task balance (30% weight)
   - Task urgency (30% weight)
4. **Assigns optimally** - Assigns each task to the highest-scoring member
5. **Updates workloads** - Tracks assignments to ensure fair distribution

### Usage:
```bash
POST /api/tasks/auto-assign
Authorization: Bearer {admin_token}
```

## 📝 Example Requests

### Register a User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Create a Household
```bash
POST http://localhost:5000/api/households
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "name": "The Doe Family",
  "description": "Our family household"
}
```

### Create a Task
```bash
POST http://localhost:5000/api/tasks
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "title": "Vacuum living room",
  "description": "Vacuum the entire living room area",
  "estimatedMinutes": 30,
  "dueDate": "2025-10-25",
  "priority": "medium",
  "tags": ["cleaning", "living room"]
}
```

### Auto-Assign Tasks
```bash
POST http://localhost:5000/api/tasks/auto-assign
Authorization: Bearer {admin_token}
```

## 🏗️ Project Structure

```
homeflow-api/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── householdController.js # Household management
│   │   ├── taskController.js     # Task management
│   │   └── userController.js     # User management
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── errorHandler.js       # Global error handling
│   ├── models/
│   │   ├── Household.js          # Household schema
│   │   ├── Task.js               # Task schema
│   │   └── User.js               # User schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── householdRoutes.js    # Household endpoints
│   │   ├── taskRoutes.js         # Task endpoints
│   │   └── userRoutes.js         # User endpoints
│   ├── utils/
│   │   ├── generateToken.js      # JWT token generation
│   │   └── taskSplitter.js       # Smart assignment algorithm
│   └── server.js                 # Express app setup
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** express-validator
- **CORS:** cors middleware

## 🚧 Development

For development with auto-reload:
```bash
npm run dev
```

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "express-validator": "^7.0.1"
}
```

## 🎯 Next Steps

1. **Frontend Development** - Build Angular frontend to consume this API
2. **Testing** - Add unit and integration tests
3. **Notifications** - Implement push notifications with Firebase
4. **Analytics** - Add household performance dashboards
5. **Deployment** - Deploy to Render, Railway, or AWS

## 📄 License

MIT

## 👨‍💻 Author

Your Name - HomeFlow

---

**Happy Task Managing! 🏠✨**
