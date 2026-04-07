# Library Management System

A college-level library management system built with React and modern web technologies.

## Features

### For Users (Students)
- Browse and search books
- Borrow books (max 3 at a time)
- View currently borrowed books
- Track due dates and fines
- View strike count and status
- Profile management

### For Admin (Librarian)
- Dashboard with statistics
- Add, edit, and delete books
- Manage users
- Issue and return books
- Strike management system
- View all issued books and history

### Strike System
- **1 Strike**: Book returned after due date
- **2 Strikes**: Book returned damaged
- **3 Strikes**: Account suspended (cannot borrow)
- Admin can add/remove strikes manually

## Tech Stack

- **Frontend**: React 18, React Router v6
- **Styling**: Custom CSS (college-level design)
- **Build Tool**: Vite
- **API Communication**: Fetch API

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Backend Setup
Make sure your backend API is running on `http://localhost:5000`

Expected API endpoints:
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- GET `/api/books` - Get all books
- POST `/api/books` - Add new book (admin only)
- PUT `/api/books/:id` - Update book (admin only)
- DELETE `/api/books/:id` - Delete book (admin only)
- GET `/api/users` - Get all users (admin only)
- POST `/api/users/:id/strike` - Add strike (admin only)
- DELETE `/api/users/:id/strike` - Remove strike (admin only)
- GET `/api/issued` - Get issued books
- POST `/api/issued` - Issue book (admin only)
- PUT `/api/issued/:id/return` - Return book (admin only)

## Project Structure

```
library/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   └── ProtectedRoute.jsx    # Route protection
│   ├── context/
│   │   ├── AuthContext.jsx       # Authentication state
│   │   └── ToastContext.jsx      # Toast notifications
│   ├── pages/
│   │   ├── AuthPage.jsx          # Login/Register
│   │   ├── UserDashboard.jsx     # User dashboard
│   │   ├── BrowseBooks.jsx       # Browse books
│   │   ├── MyBooks.jsx           # User's borrowed books
│   │   ├── UserProfile.jsx       # User profile
│   │   ├── AdminDashboard.jsx    # Admin dashboard
│   │   ├── AdminBooks.jsx        # Manage books
│   │   ├── AdminUsers.jsx        # Manage users
│   │   ├── AdminIssued.jsx       # Issued books
│   │   └── AdminStrikes.jsx      # Strike management
│   ├── styles/
│   │   └── global.css            # Global styles
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Default Credentials

### User Account
- Email: `user@example.com`
- Password: `user123`

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`

## Color Scheme

- Primary: #3498db (Blue)
- Success: #27ae60 (Green)
- Danger: #e74c3c (Red)
- Warning: #f39c12 (Orange)
- Secondary: #95a5a6 (Gray)
- Dark: #34495e (Dark Blue-Gray)

## Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## License

This project is for educational purposes.
