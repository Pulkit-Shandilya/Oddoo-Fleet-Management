# Tracktable Fleet Management System - Frontend

A vanilla JavaScript, HTML, and CSS frontend for the Tracktable fleet management application. This is a modern, responsive web application without any external JavaScript frameworks.

## Project Structure

```
frontend/
├── index.html           # Main HTML file with all page templates
├── style.css            # All CSS styling (login, dashboard, responsive)
├── app.js               # Main application logic and state management
├── api.js               # API service layer with fetch-based HTTP calls
├── package.json         # Project dependencies
└── README.md            # Documentation
```

## Features

- **Authentication**: Login and registration system
- **Dashboard**: Overview of vehicles, drivers, and fleet statistics
- **Vehicle Management**: Add, edit, and delete vehicles
- **Driver Management**: Add, edit, and delete drivers
- **Trip Dispatcher**: Create and track vehicle trips
- **Maintenance Tracking**: Record and manage vehicle maintenance
- **Expense Management**: Track trip and operational expenses
- **User Management**: Manage user roles and permissions
- **Data Export**: Export vehicle, driver, and user data to CSV
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js and npm (for serving the application)
- A running backend API server on `http://localhost:5000`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open automatically in your browser at `http://localhost:3000`.

Alternatively, to run the server without opening the browser:
```bash
npm run serve
```

## Architecture

### State Management
The application uses a simple JavaScript object (`appState`) to manage application state:
- `user`: Current logged-in user
- `vehicles`: Array of vehicle objects
- `drivers`: Array of driver objects
- `users`: Array of user objects
- `maintenanceRecords`: Array of maintenance records (localStorage)
- `tripRecords`: Array of trip records (localStorage)
- `expenseRecords`: Array of expense records (localStorage)

### API Service (api.js)
Implements service modules for:
- `authService`: Login, registration, logout
- `vehicleService`: CRUD operations for vehicles
- `driverService`: CRUD operations for drivers
- `userService`: User role management

All API calls use the Fetch API with JWT token authentication.

### Local Storage
Persists the following data in browser localStorage:
- `access_token`: JWT authentication token
- `refresh_token`: Refresh token for session extension
- `maintenanceRecords`: Maintenance history
- `tripRecords`: Trip records
- `expenseRecords`: Expense records

## API Backend

The frontend expects a backend API server running at:
```
http://localhost:5000/api
```

### Required Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

#### Vehicles
- `GET /vehicles/` - Get all vehicles
- `POST /vehicles/` - Create vehicle
- `PUT /vehicles/{id}` - Update vehicle
- `DELETE /vehicles/{id}` - Delete vehicle

#### Drivers
- `GET /drivers/` - Get all drivers
- `POST /drivers/` - Create driver
- `PUT /drivers/{id}` - Update driver
- `DELETE /drivers/{id}` - Delete driver

#### Users
- `GET /users/` - Get all users
- `PUT /users/{phone}/role` - Update user role
- `DELETE /users/{phone}` - Delete user

## CSS Structure

The `style.css` file is organized into sections:

1. **Global Styles**: Reset, fonts, and base elements
2. **Login Page**: Authentication form styling
3. **Dashboard Page**: Layout, navigation, and dashboard UI
4. **Data Tables**: Table styling and responsiveness
5. **Modals**: Dialog boxes for forms
6. **Buttons & Forms**: Common UI components
7. **Responsive**: Mobile and tablet breakpoints

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Adding New Features

1. Update `index.html` with new HTML elements
2. Add styling to `style.css`
3. Implement functionality in `app.js`
4. Add API calls to `api.js` if needed

### Code Conventions

- Use camelCase for function and variable names
- Use UPPERCASE for constants
- Add JSDoc comments for functions
- Keep functions small and single-responsibility
- Use `async/await` for asynchronous operations

## Performance Considerations

- Minimal dependency loading (vanilla JS only)
- LocalStorage for offline data persistence
- Efficient DOM manipulation with `innerHTML`
- CSS animations for smooth UX

## Known Limitations

- LocalStorage has a ~5-10MB limit per domain
- Real-time updates require manual page refresh
- No offline mode beyond cached data

## Future Improvements

- WebSocket support for real-time updates
- IndexedDB for larger data storage
- Service Worker for offline functionality
- Progressive Web App (PWA) features

## License

This project is proprietary and confidential.
