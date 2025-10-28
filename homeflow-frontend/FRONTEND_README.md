# HomeFlow Angular Frontend 🏠

Modern, responsive web application for HomeFlow built with Angular 17 and Angular Material.

## ✨ Features

- **Beautiful UI** - Modern design with Angular Material components
- **Responsive** - Works on desktop, tablet, and mobile
- **Real-time** - Connects to Node.js backend API
- **Smart Dashboard** - Stats cards, quick actions, today's tasks
- **Auto-Assign** - One-click intelligent task distribution ⚡
- **Task Management** - Full CRUD operations with filtering
- **Household Management** - Create/join households, invite members
- **User Profile** - Points, streaks, badges, settings
- **Authentication** - Secure JWT-based auth with guards
- **Type-Safe** - Full TypeScript with interfaces

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- **HomeFlow Backend API** running on port 5000

### Installation

1. **Extract the project**
   ```bash
   tar -xzf homeflow-frontend.tar.gz
   cd homeflow-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   
   Edit `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api'  // Your backend URL
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

5. **Open in browser**
   ```
   http://localhost:4200
   ```

## 📁 Project Structure

```
homeflow-frontend/
├── src/
│   ├── app/
│   │   ├── components/          # UI Components
│   │   │   ├── auth/
│   │   │   │   ├── login/       # Login page
│   │   │   │   └── register/    # Registration page
│   │   │   ├── dashboard/       # Main dashboard (⭐ Auto-Assign!)
│   │   │   ├── tasks/           # Task list & management
│   │   │   ├── household/       # Household management
│   │   │   └── profile/         # User profile
│   │   ├── services/            # API Services
│   │   │   ├── auth.service.ts
│   │   │   ├── task.service.ts
│   │   │   ├── household.service.ts
│   │   │   └── user.service.ts
│   │   ├── guards/              # Route Guards
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/        # HTTP Interceptors
│   │   │   └── jwt.interceptor.ts
│   │   ├── models/              # TypeScript Interfaces
│   │   │   └── models.ts
│   │   ├── app.component.*      # Root component
│   │   ├── app.module.ts        # Main module
│   │   └── app-routing.module.ts
│   ├── environments/            # Environment configs
│   ├── assets/                  # Static assets
│   ├── styles.css              # Global styles
│   └── index.html              # Main HTML
├── angular.json                # Angular configuration
├── package.json                # Dependencies
└── tsconfig.json              # TypeScript config
```

## 🎨 Key Components

### 1. Authentication
- **Login** - Email/password with form validation
- **Register** - Account creation with role selection (Admin/Member)
- **Auth Guard** - Protected routes
- **JWT Interceptor** - Automatic token attachment

### 2. Dashboard
- Household statistics cards
- Quick action buttons
- **Auto-Assign button** (Admin only) ⚡
- Today's task list
- Points and streak display

### 3. Tasks
- View all tasks with filtering (All/My/Open)
- Add new tasks with form
- Task detail view
- Complete tasks (earn points!)
- Delete tasks (Admin only)
- Priority and status badges

### 4. Household
- View household details
- Display invite code
- Member list with stats
- Join household with code
- Create new household

### 5. Profile
- User information
- Points and streak stats
- Account settings
- Logout

## 🔧 Development

### Running Dev Server

```bash
ng serve
# With specific port
ng serve --port 4300
```

### Building for Production

```bash
ng build --configuration production
# Output in dist/ folder
```

### Adding New Components

```bash
ng generate component components/feature-name
```

### Adding New Service

```bash
ng generate service services/service-name
```

## 🎯 Key Features Explained

### Auto-Assign Algorithm Integration

The star feature! Located in `DashboardComponent`:

```typescript
onAutoAssign(): void {
  this.taskService.autoAssignTasks().subscribe({
    next: (result) => {
      // Show success message with assignment count
      // Reload dashboard data
    }
  });
}
```

The backend algorithm analyzes:
- Member workloads
- Available capacity
- Task priorities
- Due dates

Then distributes tasks fairly in seconds!

### Authentication Flow

```
Register/Login → Get JWT Token → Store in localStorage
↓
JWT Interceptor adds token to all requests
↓
Auth Guard protects routes
↓
Logout → Clear storage → Redirect to login
```

### Type Safety

All API responses are typed:

```typescript
interface Task {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'completed';
  // ... more fields
}
```

## 🎨 Styling

### Color System

```css
--primary-color: #4F46E5;  /* Indigo */
--secondary-color: #10B981; /* Green */
--danger-color: #EF4444;    /* Red */
--warning-color: #F59E0B;   /* Amber */
```

### Material Theme

Using Angular Material's Indigo-Pink theme with custom overrides in `styles.css`.

### Responsive Design

- Desktop: 1200px+ (multi-column layouts)
- Tablet: 768px-1199px (adapted layouts)
- Mobile: <768px (single column, simplified nav)

## 📡 API Integration

All services use Angular HttpClient with RxJS observables:

```typescript
// Example API call
getTasks(): Observable<ApiResponse<Task[]>> {
  return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/tasks`);
}
```

Configured in `environment.ts`:
```typescript
apiUrl: 'http://localhost:5000/api'
```

## 🔐 Security

- **JWT Authentication** - Token-based auth
- **Auth Guards** - Route protection
- **Role-Based Access** - Admin/Member permissions
- **HTTP Interceptor** - Automatic token handling
- **Auto-logout** - On 401 responses

## 🐛 Troubleshooting

### "Cannot connect to backend"

1. Verify backend is running: `http://localhost:5000/api/health`
2. Check API URL in `environment.ts`
3. Check browser console for CORS errors
4. Ensure backend has CORS enabled

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
ng serve --port 4300
```

### Build errors

```bash
ng build --configuration development
# Check for TypeScript errors
```

## 📱 Features by Screen

### Login/Register
- Form validation
- Error messages
- Password visibility toggle
- Gradient backgrounds
- Responsive design

### Dashboard
- 4 stat cards (completed, open, members, points)
- Quick action buttons
- **Auto-Assign button** with loading state
- Today's tasks (top 5)
- Refresh functionality

### Tasks
- Tab navigation (All/My/Open)
- Task cards with badges
- Click to view details
- Add task button
- Loading states

### Task Detail
- Full task information
- Complete button (earn points!)
- Delete button (admin)
- Priority and status badges
- Due date display

### Household
- Household name display
- Invite code with copy button
- Member grid with avatars
- Points display per member
- Admin badges

### Profile
- User avatar (initials)
- Stats cards (points, streak, minutes)
- Account settings
- Logout button

## 🚢 Deployment

### Production Build

```bash
npm run build
```

Outputs to `dist/homeflow-frontend/`.

### Deploy Options

**Option 1: Vercel** (Recommended)
```bash
npm install -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Option 3: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

**Option 4: Traditional Server**
- Upload `dist/` folder contents
- Configure web server (nginx, Apache)
- Ensure SPA routing works

### Environment Variables

Create `environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.com/api'
};
```

## 🎓 Learning Angular

### Key Concepts Used

- **Components** - UI building blocks
- **Services** - Business logic and API calls
- **Modules** - Feature organization
- **Routing** - Navigation
- **Guards** - Route protection
- **Interceptors** - HTTP middleware
- **Observables** - Async data streams (RxJS)
- **Forms** - Reactive Forms with validation
- **Material** - Pre-built UI components

### Useful Commands

```bash
ng serve              # Start dev server
ng build             # Build for production
ng test              # Run unit tests
ng generate component # Create component
ng generate service   # Create service
```

## 🔄 Connecting to Backend

Make sure your backend is configured with CORS:

```javascript
// backend/src/server.js
app.use(cors());
```

Update frontend API URL to match backend:
```typescript
// src/environments/environment.ts
apiUrl: 'http://localhost:5000/api'
```

## 📊 Performance

- Lazy loading for large components (can be added)
- OnPush change detection (can be optimized)
- Production builds are minified
- Material components are tree-shakeable

## 🎯 Next Steps

### Immediate
- [x] Authentication (Login/Register)
- [x] Dashboard with stats
- [x] Task management (CRUD)
- [x] **Auto-Assign feature** ⚡
- [x] Household management
- [x] User profile

### Future Enhancements
- [ ] Real-time updates (WebSockets)
- [ ] Task drag-and-drop
- [ ] Calendar view
- [ ] Advanced filtering
- [ ] Charts and analytics
- [ ] Dark mode
- [ ] Notifications
- [ ] Mobile app (PWA)
- [ ] Offline support
- [ ] File uploads
- [ ] Task comments
- [ ] Activity feed

## 🤝 Tech Stack

- **Angular 17** - Framework
- **Angular Material** - UI Components
- **TypeScript** - Type safety
- **RxJS** - Reactive programming
- **SCSS/CSS** - Styling

## 📄 License

MIT

---

## 🎉 You're All Set!

Your Angular frontend is ready! Connect it to the backend and watch HomeFlow come to life!

**Key Features:**
- ✅ Modern, responsive UI
- ✅ Full authentication system
- ✅ Dashboard with **Auto-Assign**
- ✅ Complete task management
- ✅ Household features
- ✅ User profiles

**Start the backend, launch the frontend, and test the auto-assign magic!** ⚡

---

Built with ❤️ using Angular & TypeScript | HomeFlow v1.0.0
