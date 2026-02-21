import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehicleService, driverService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, driversRes] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll(),
      ]);
      setVehicles(vehiclesRes.data.vehicles);
      setDrivers(driversRes.data.drivers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>Fleet Management</h2>
        </div>
        <div className="navbar-user">
          <span>Welcome, {user?.username}</span>
          <span className="user-role">({user?.role})</span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Vehicles</h3>
            <p className="stat-number">{vehicles.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Drivers</h3>
            <p className="stat-number">{drivers.length}</p>
          </div>
          <div className="stat-card">
            <h3>Active Vehicles</h3>
            <p className="stat-number">
              {vehicles.filter((v) => v.status === 'active').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Available Drivers</h3>
            <p className="stat-number">
              {drivers.filter((d) => d.status === 'available').length}
            </p>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            Vehicles
          </button>
          <button
            className={`tab ${activeTab === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            Drivers
          </button>
        </div>

        <div className="table-container">
          {loading ? (
            <p>Loading...</p>
          ) : activeTab === 'vehicles' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>License Plate</th>
                  <th>Status</th>
                  <th>Mileage</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.vehicle_number}</td>
                    <td>{vehicle.make}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.year}</td>
                    <td>{vehicle.license_plate}</td>
                    <td>
                      <span className={`status-badge ${vehicle.status}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td>{vehicle.mileage} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>License Number</th>
                  <th>License Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td>{driver.name}</td>
                    <td>{driver.email || 'N/A'}</td>
                    <td>{driver.phone || 'N/A'}</td>
                    <td>{driver.license_number}</td>
                    <td>{driver.license_expiry || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${driver.status}`}>
                        {driver.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
