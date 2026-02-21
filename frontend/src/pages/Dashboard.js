import React, { useState, useEffect } from 'react';
import { vehicleService, driverService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
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
      setVehicles(vehiclesRes.data.vehicles || []);
      setDrivers(driversRes.data.drivers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const totalV = vehicles.length;
  const activeV = vehicles.filter((v) => v.status === 'active').length;
  const maintV = vehicles.filter((v) => v.status === 'maintenance').length;
  const inactiveV = totalV - activeV - maintV;

  const totalD = drivers.length;
  const availD = drivers.filter((d) => d.status === 'available').length;
  const assignedD = drivers.filter((d) => d.status === 'assigned').length;
  const inactiveD = totalD - availD - assignedD;

  // Search
  const filteredVehicles = vehicles.filter((v) =>
    [v.vehicle_number, v.make, v.model, v.license_plate, v.status]
      .join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDrivers = drivers.filter((d) =>
    [d.name, d.email, d.license_number, d.status]
      .join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Row selection
  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const navTabs = ['Dashboard', 'Vehicles', 'Drivers'];

  // Stat segments for the colored bar
  const vehicleSegments = [
    { label: 'Active', value: activeV, pct: totalV ? Math.round((activeV / totalV) * 100) : 0, color: '#3d3d3d' },
    { label: 'Maintenance', value: maintV, pct: totalV ? Math.round((maintV / totalV) * 100) : 0, color: '#f5d94e' },
    { label: 'Inactive', value: inactiveV, pct: totalV ? Math.round((inactiveV / totalV) * 100) : 0, color: '#c4c4c4' },
  ];
  const driverSegments = [
    { label: 'Available', value: availD, pct: totalD ? Math.round((availD / totalD) * 100) : 0, color: '#3d3d3d' },
    { label: 'Assigned', value: assignedD, pct: totalD ? Math.round((assignedD / totalD) * 100) : 0, color: '#f5d94e' },
    { label: 'Inactive', value: inactiveD, pct: totalD ? Math.round((inactiveD / totalD) * 100) : 0, color: '#c4c4c4' },
  ];
  const segments = activeTab === 'drivers' ? driverSegments : vehicleSegments;

  return (
    <div className="crextio-layout">
      {/* ====== TOP NAVBAR ====== */}
      <header className="top-navbar">
        <div className="nav-logo">🚛 Fleet</div>
        <nav className="nav-tabs">
          {navTabs.map((tab) => {
            const key = tab.toLowerCase();
            return (
              <button
                key={tab}
                className={`nav-tab ${key === activeTab ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {tab}
              </button>
            );
          })}
        </nav>
        <div className="nav-right">
          <button className="icon-btn">🔔</button>
          <div className="avatar-sm">F</div>
        </div>
      </header>

      {/* ====== PAGE CONTENT ====== */}
      <main className="page-body">
        {/* Page Title */}
        <h1 className="page-title">
          {activeTab === 'vehicles' ? 'Vehicles' : activeTab === 'drivers' ? 'Drivers' : 'Dashboard'}
        </h1>

        {/* ---- Stat Labels ---- */}
        <div className="stat-labels">
          {segments.map((s) => (
            <span key={s.label} className="stat-label-item">
              {s.label} <span className="stat-label-pct">{s.pct}%</span>
            </span>
          ))}
        </div>

        {/* ---- Segmented Stat Bar ---- */}
        <div className="segmented-bar">
          {segments.map((s) => (
            <div
              key={s.label}
              className="seg"
              style={{ width: `${s.pct || 1}%`, backgroundColor: s.color }}
            >
              {s.pct >= 10 && <span className="seg-text">{s.pct}%</span>}
            </div>
          ))}
        </div>

        {/* ---- Action Row ---- */}
        {activeTab !== 'dashboard' && (
          <div className="action-row">
            <div className="action-row-right">
              <button className="action-btn primary">
                + Add {activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}
              </button>
            </div>
          </div>
        )}

        {/* ---- Filter Row ---- */}
        {activeTab !== 'dashboard' && (
          <div className="filter-row">
            <div className="filter-chips">
              <span className="filter-chip">Columns ▾</span>
              <span className="filter-chip">Status ▾</span>
            </div>
            <div className="filter-right">
              <input
                className="search-input"
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="export-btn">↗ Export</button>
            </div>
          </div>
        )}

        {/* ---- Dashboard Summary View ---- */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-summary">
            <div className="summary-card">
              <h3>Vehicles</h3>
              <div className="summary-number">{totalV}</div>
              <div className="summary-breakdown">
                <span className="sb-item"><span className="sb-dot" style={{background:'#3d3d3d'}}></span> Active: {activeV}</span>
                <span className="sb-item"><span className="sb-dot" style={{background:'#f5d94e'}}></span> Maintenance: {maintV}</span>
                <span className="sb-item"><span className="sb-dot" style={{background:'#c4c4c4'}}></span> Inactive: {inactiveV}</span>
              </div>
            </div>
            <div className="summary-card">
              <h3>Drivers</h3>
              <div className="summary-number">{totalD}</div>
              <div className="summary-breakdown">
                <span className="sb-item"><span className="sb-dot" style={{background:'#3d3d3d'}}></span> Available: {availD}</span>
                <span className="sb-item"><span className="sb-dot" style={{background:'#f5d94e'}}></span> Assigned: {assignedD}</span>
                <span className="sb-item"><span className="sb-dot" style={{background:'#c4c4c4'}}></span> Inactive: {inactiveD}</span>
              </div>
            </div>
          </div>
        )}

        {/* ---- Data Table ---- */}
        {activeTab !== 'dashboard' && <div className="table-card">
          {loading ? (
            <div className="loading-text">Loading…</div>
          ) : activeTab === 'vehicles' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="th-check"><input type="checkbox" /></th>
                  <th></th>
                  <th>Name</th>
                  <th>Make / Model</th>
                  <th>Department</th>
                  <th>Site</th>
                  <th>Mileage</th>
                  <th>Start Date</th>
                  <th>Lifecycle</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr><td colSpan="10" className="empty-row">No vehicles found</td></tr>
                ) : (
                  filteredVehicles.map((v) => {
                    const selected = selectedRows.includes(v.id);
                    return (
                      <tr key={v.id} className={selected ? 'row-selected' : ''}>
                        <td className="td-check">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleRow(v.id)}
                          />
                        </td>
                        <td>
                          <div className="row-avatar">{v.make?.charAt(0)}</div>
                        </td>
                        <td className="td-name">{v.vehicle_number}</td>
                        <td>{v.make} {v.model}</td>
                        <td>{v.fuel_type || 'General'}</td>
                        <td>
                          <span className="site-dot" style={{ background: siteColor(v.license_plate) }}></span>
                          {v.license_plate || '—'}
                        </td>
                        <td>${v.mileage?.toLocaleString() || '0'}</td>
                        <td>{v.created_at?.slice(0, 10) || '—'}</td>
                        <td>{v.year || '—'}</td>
                        <td><span className={`badge ${v.status}`}>{v.status}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="th-check"><input type="checkbox" /></th>
                  <th></th>
                  <th>Name</th>
                  <th>License No.</th>
                  <th>Department</th>
                  <th>Site</th>
                  <th>Phone</th>
                  <th>Start Date</th>
                  <th>Lifecycle</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.length === 0 ? (
                  <tr><td colSpan="10" className="empty-row">No drivers found</td></tr>
                ) : (
                  filteredDrivers.map((d) => {
                    const selected = selectedRows.includes(d.id);
                    return (
                      <tr key={d.id} className={selected ? 'row-selected' : ''}>
                        <td className="td-check">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleRow(d.id)}
                          />
                        </td>
                        <td>
                          <div className="row-avatar">{d.name?.charAt(0)}</div>
                        </td>
                        <td className="td-name">{d.name}</td>
                        <td>{d.license_number}</td>
                        <td>Operations</td>
                        <td>
                          <span className="site-dot" style={{ background: siteColor(d.email) }}></span>
                          {d.email || '—'}
                        </td>
                        <td>{d.phone || '—'}</td>
                        <td>{d.created_at?.slice(0, 10) || '—'}</td>
                        <td>{d.license_expiry || '—'}</td>
                        <td><span className={`badge ${d.status}`}>{d.status}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>}
      </main>
    </div>
  );
};

/* Pseudo-random dot color based on string */
function siteColor(str) {
  if (!str) return '#ccc';
  const colors = ['#f5d94e', '#e57373', '#81c784', '#64b5f6', '#ffb74d', '#ba68c8'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default Dashboard;
