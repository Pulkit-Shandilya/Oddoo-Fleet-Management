import { useState, useEffect, useCallback, useMemo } from 'react';
import { vehicleService, driverService } from '../services/api';
import VehicleTable from '../components/VehicleTable';
import DriverTable from '../components/DriverTable';
import './Dashboard.css';

const NAV_TABS = ['Dashboard', 'Vehicles', 'Drivers'];

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Derived stats (memoised) ---
  const { totalV, activeV, maintV, inactiveV } = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter((v) => v.status === 'active').length;
    const maint = vehicles.filter((v) => v.status === 'maintenance').length;
    return { totalV: total, activeV: active, maintV: maint, inactiveV: total - active - maint };
  }, [vehicles]);

  const { totalD, availD, assignedD, inactiveD } = useMemo(() => {
    const total = drivers.length;
    const avail = drivers.filter((d) => d.status === 'available').length;
    const assigned = drivers.filter((d) => d.status === 'assigned').length;
    return { totalD: total, availD: avail, assignedD: assigned, inactiveD: total - avail - assigned };
  }, [drivers]);

  // --- Filtered lists ---
  const filteredVehicles = useMemo(
    () =>
      vehicles.filter((v) =>
        [v.vehicle_number, v.make, v.model, v.license_plate, v.status]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [vehicles, searchTerm]
  );

  const filteredDrivers = useMemo(
    () =>
      drivers.filter((d) =>
        [d.name, d.email, d.license_number, d.status]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [drivers, searchTerm]
  );

  // --- Row selection ---
  const toggleRow = useCallback((pk) => {
    setSelectedRows((prev) =>
      prev.includes(pk) ? prev.filter((r) => r !== pk) : [...prev, pk]
    );
  }, []);

  // --- Stat bar segments ---
  const buildSegments = (items) =>
    items.map(([label, value, total, color]) => ({
      label,
      value,
      pct: total ? Math.round((value / total) * 100) : 0,
      color,
    }));

  const vehicleSegments = buildSegments([
    ['Active', activeV, totalV, '#3d3d3d'],
    ['Maintenance', maintV, totalV, '#f5d94e'],
    ['Inactive', inactiveV, totalV, '#c4c4c4'],
  ]);
  const driverSegments = buildSegments([
    ['Available', availD, totalD, '#3d3d3d'],
    ['Assigned', assignedD, totalD, '#f5d94e'],
    ['Inactive', inactiveD, totalD, '#c4c4c4'],
  ]);
  const segments = activeTab === 'drivers' ? driverSegments : vehicleSegments;

  return (
    <div className="crextio-layout">
      {/* ====== TOP NAVBAR ====== */}
      <header className="top-navbar">
        <div className="nav-logo">🚛 Fleet</div>
        <nav className="nav-tabs">
          {NAV_TABS.map((tab) => {
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
                <span className="sb-item"><span className="sb-dot" style={{ background: '#3d3d3d' }}></span> Active: {activeV}</span>
                <span className="sb-item"><span className="sb-dot" style={{ background: '#f5d94e' }}></span> Maintenance: {maintV}</span>
                <span className="sb-item"><span className="sb-dot" style={{ background: '#c4c4c4' }}></span> Inactive: {inactiveV}</span>
              </div>
            </div>
            <div className="summary-card">
              <h3>Drivers</h3>
              <div className="summary-number">{totalD}</div>
              <div className="summary-breakdown">
                <span className="sb-item"><span className="sb-dot" style={{ background: '#3d3d3d' }}></span> Available: {availD}</span>
                <span className="sb-item"><span className="sb-dot" style={{ background: '#f5d94e' }}></span> Assigned: {assignedD}</span>
                <span className="sb-item"><span className="sb-dot" style={{ background: '#c4c4c4' }}></span> Inactive: {inactiveD}</span>
              </div>
            </div>
          </div>
        )}

        {/* ---- Data Table ---- */}
        {activeTab !== 'dashboard' && (
          <div className="table-card">
            {loading ? (
              <div className="loading-text">Loading…</div>
            ) : activeTab === 'vehicles' ? (
              <VehicleTable
                vehicles={filteredVehicles}
                selectedRows={selectedRows}
                onToggleRow={toggleRow}
              />
            ) : (
              <DriverTable
                drivers={filteredDrivers}
                selectedRows={selectedRows}
                onToggleRow={toggleRow}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
