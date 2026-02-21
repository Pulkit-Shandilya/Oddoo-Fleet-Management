# Fleet Management Backend - Flask REST API

## Setup Instructions

### 1. Activate Virtual Environment
```bash
# Navigate to project root
cd C:\Users\dell\Documents\odoo-fleet

# Activate virtual environment (Windows)
env\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirments.txt
```

### 3. Configure Environment Variables
Edit `backend/.env` file and set your secret keys:
- Change `SECRET_KEY`
- Change `JWT_SECRET_KEY`
- Modify `DATABASE_URL` if using PostgreSQL or MySQL

### 4. Initialize Database
```bash
cd backend
python run.py
```

The database will be created automatically on first run.

### 5. Run the Server
```bash
python run.py
```

Server will run on: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info (requires JWT)

### Vehicles
- `GET /api/vehicles/` - Get all vehicles (requires JWT)
- `GET /api/vehicles/<id>` - Get vehicle by ID (requires JWT)
- `POST /api/vehicles/` - Create vehicle (admin/manager only)
- `PUT /api/vehicles/<id>` - Update vehicle (admin/manager only)
- `DELETE /api/vehicles/<id>` - Delete vehicle (admin only)

### Drivers
- `GET /api/drivers/` - Get all drivers (requires JWT)
- `GET /api/drivers/<id>` - Get driver by ID (requires JWT)
- `POST /api/drivers/` - Create driver (admin/manager only)
- `PUT /api/drivers/<id>` - Update driver (admin/manager only)
- `DELETE /api/drivers/<id>` - Delete driver (admin only)

## User Roles
- `admin` - Full access
- `manager` - Can create/update vehicles and drivers
- `user` - Read-only access
