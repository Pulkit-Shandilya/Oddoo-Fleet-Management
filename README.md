# Oddoo-Fleet-Management

**Actual Project Name: FleetFlow – Modular Fleet & Logistics Management System**

This repository contains the hackathon implementation of **FleetFlow**, a modular fleet and logistics management system built using **Flask, React, and SQLAlchemy**. The system replaces inefficient manual fleet logbooks with a centralized digital platform to manage vehicles, drivers, trips, maintenance, and operational expenses.

FleetFlow provides real-time fleet visibility, improves operational efficiency, ensures driver compliance, and enables data-driven decision making.

---

## Hackathon Project Overview

FleetFlow was developed during a hackathon to demonstrate how logistics and fleet operations can be digitized using modern full-stack technologies.

The system focuses on:

* Fleet lifecycle management
* Trip dispatch and monitoring
* Driver compliance tracking
* Maintenance and expense logging
* Operational analytics

---

## Tech Stack

### Backend

* Flask (Python web framework)
* SQLAlchemy (ORM for database management)
* Flask-CORS (Frontend integration)
* Flask-Login (Authentication)

### Frontend

* React.js
* JavaScript
* HTML/CSS

### Database

* SQLite (Development)
* PostgreSQL / MySQL (Production ready)

---

## Architecture Overview

```
React Frontend  →  Flask Backend API  →  SQLAlchemy ORM  →  Database
```

* React handles UI and user interaction
* Flask provides REST APIs and business logic
* SQLAlchemy manages database operations
* Database stores fleet, driver, trip, and expense data

---

## Features

### Authentication

* Secure login system
* Role-based access control

### Dashboard

* Fleet overview
* Active vehicles and trips
* Maintenance alerts
* Utilization tracking

### Vehicle Management

* Register vehicles
* Track vehicle capacity and status
* Manage vehicle lifecycle

### Trip Management

* Create and dispatch trips
* Assign drivers and vehicles
* Capacity validation logic
* Track trip status

### Driver Management

* Manage driver profiles
* License compliance tracking
* Driver availability status

### Maintenance Management

* Log vehicle maintenance
* Automatically update vehicle availability

### Expense and Fuel Tracking

* Log fuel usage
* Track maintenance costs
* Calculate operational expenses

### Analytics

* Fleet performance insights
* Cost tracking
* Operational monitoring

---

## Project Structure

```
Oddoo-Fleet-Management/
│
├── backend/
│   ├── app/
│   ├── models/
│   ├── routes/
│   ├── config.py
│   └── run.py
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── package.json
│
├── requirements.txt
└── README.md
```

---

## Installation and Setup

### 1. Clone Repository

```
git clone https://github.com/yourusername/Oddoo-Fleet-Management.git
cd Oddoo-Fleet-Management
```

---

### 2. Backend Setup (Flask)

Create virtual environment:

```
python -m venv venv
```

Activate:

Windows:

```
venv\Scripts\activate
```

Mac/Linux:

```
source venv/bin/activate
```

Install dependencies:

```
pip install -r requirements.txt
```

Run Flask server:

```
python run.py
```

Backend runs on:

```
http://127.0.0.1:5000
```

---

### 3. Frontend Setup (React)

Go to frontend folder:

```
cd frontend
```

Install dependencies:

```
npm install
```

Run React app:

```
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## Core Workflow

1. Add vehicle → Available
2. Add driver → Verified
3. Assign trip → Vehicle and driver dispatched
4. Complete trip → Vehicle available again
5. Log maintenance → Vehicle marked In Shop
6. Log expenses → Analytics updated

---

## Hackathon Goals

* Demonstrate scalable fleet management architecture
* Build modular backend using Flask and SQLAlchemy
* Create responsive frontend using React
* Implement real-world logistics workflows

---

## Future Improvements

* REST API expansion
* Real-time updates
* GPS tracking integration
* Advanced analytics dashboard
* Mobile app support

---

## Authors

Pulkit Shandilya, Lavya Jaitley, Rishabh Parashar

Hackathon Project – FleetFlow
