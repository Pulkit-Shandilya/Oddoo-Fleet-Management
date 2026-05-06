# Fleet Management System

A comprehensive fleet management system with Flask backend and React frontend.

## 🚀 Features

- **User Authentication** - JWT-based login/register system
- **Vehicle Management** - Track vehicles, mileage, status, and assignments
- **Driver Management** - Manage driver information, licenses, and assignments
- **Role-Based Access Control** - Admin, Manager, and User roles
- **RESTful API** - Well-structured Flask REST API
- **Modern UI** - Responsive React frontend with clean design

## 📋 Prerequisites

- Python 3.10+
- Node.js 24.0+
- Git

## 🛠️ Installation & Setup

### Backend (Flask)

1. **Activate virtual environment:**
   ```bash
   cd C:\Users\dell\Documents\odoo-fleet
   env\Scripts\activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirments.txt
   ```

3. **Configure environment variables:**
   - Edit `backend/.env` file
   - Set SECRET_KEY and JWT_SECRET_KEY

4. **Run the Flask backend:**
   ```bash
   cd backend
   python run.py
   ```
   Backend will run on: `http://localhost:5000`

### Frontend (React)

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   Frontend will run on: `http://localhost:3000`

## 📁 Project Structure

```
odoo-fleet/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── __init__.py      # App factory
│   │   └── config.py        # Configuration
│   ├── run.py               # Application entry point
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Login, Dashboard
│   │   ├── services/        # API services
│   │   └── App.js           # Main app component
│   └── package.json
├── env/                     # Python virtual environment
└── requirments.txt          # Python dependencies
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Vehicles
- `GET /api/vehicles/` - Get all vehicles
- `GET /api/vehicles/<id>` - Get vehicle by ID
- `POST /api/vehicles/` - Create vehicle (admin/manager)
- `PUT /api/vehicles/<id>` - Update vehicle (admin/manager)
- `DELETE /api/vehicles/<id>` - Delete vehicle (admin)

### Drivers
- `GET /api/drivers/` - Get all drivers
- `GET /api/drivers/<id>` - Get driver by ID
- `POST /api/drivers/` - Create driver (admin/manager)
- `PUT /api/drivers/<id>` - Update driver (admin/manager)
- `DELETE /api/drivers/<id>` - Delete driver (admin)

## 👥 User Roles

- **Admin** - Full access to all features
- **Manager** - Can create/update vehicles and drivers
- **User** - Read-only access

## 🔧 Technologies Used

### Backend
- Flask - Web framework
- Flask-SQLAlchemy - ORM
- Flask-JWT-Extended - JWT authentication
- Flask-CORS - Cross-origin resource sharing
- Flask-Bcrypt - Password hashing
- Flask-Migrate - Database migrations

### Frontend
- React - UI library
- React Router - Navigation
- Axios - HTTP client
- JWT Decode - Token handling

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Authors

- Pulkit Shandilya
- Lavya jaitly
- Rishabh Parashar

with the subtle help of our friend copilot baba
