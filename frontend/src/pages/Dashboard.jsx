import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = ['Dashboard', 'Vehicle Registry', 'Trip Dispatcher', 'Maintenance', 'Trip & Expense', 'Performance', 'Analytics'];

const mockVehicles = [
  { id: 1, vehicle_number: 'V001', make: 'Ford', model: 'Transit', license_plate: 'ABC123', status: 'active' },
  { id: 2, vehicle_number: 'V002', make: 'Mercedes', model: 'Sprinter', license_plate: 'DEF456', status: 'maintenance' },
  { id: 3, vehicle_number: 'V003', make: 'Toyota', model: 'HiAce', license_plate: 'GHI789', status: 'inactive' },
  { id: 4, vehicle_number: 'V004', make: 'Volkswagen', model: 'Crafter', license_plate: 'JKL012', status: 'active' },
  { id: 5, vehicle_number: 'V005', make: 'Iveco', model: 'Daily', license_plate: 'MNO345', status: 'active' },
];

const mockDrivers = [
  { id: 1, name: 'James Wilson', email: 'james@fleet.com', license_number: 'DL001', status: 'available' },
  { id: 2, name: 'Sarah Chen', email: 'sarah@fleet.com', license_number: 'DL002', status: 'assigned' },
  { id: 3, name: 'Mike Torres', email: 'mike@fleet.com', license_number: 'DL003', status: 'inactive' },
  { id: 4, name: 'Priya Patel', email: 'priya@fleet.com', license_number: 'DL004', status: 'available' },
];

export default function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [vehicles] = useState(mockVehicles);
  const [drivers] = useState(mockDrivers);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  const { totalV, activeV, maintV, inactiveV } = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === 'active').length;
    const maint = vehicles.filter(v => v.status === 'maintenance').length;
    return { totalV: total, activeV: active, maintV: maint, inactiveV: total - active - maint };
  }, [vehicles]);

  const { totalD, availD, assignedD, inactiveD } = useMemo(() => {
    const total = drivers.length;
    const avail = drivers.filter(d => d.status === 'available').length;
    const assigned = drivers.filter(d => d.status === 'assigned').length;
    return { totalD: total, availD: avail, assignedD: assigned, inactiveD: total - avail - assigned };
  }, [drivers]);

  const filteredVehicles = useMemo(() =>
    vehicles.filter(v => [v.vehicle_number, v.make, v.model, v.license_plate, v.status].join(' ').toLowerCase().includes(searchTerm.toLowerCase())),
    [vehicles, searchTerm]);

  const filteredDrivers = useMemo(() =>
    drivers.filter(d => [d.name, d.email, d.license_number, d.status].join(' ').toLowerCase().includes(searchTerm.toLowerCase())),
    [drivers, searchTerm]);

  const toggleRow = useCallback(pk => {
    setSelectedRows(prev => prev.includes(pk) ? prev.filter(r => r !== pk) : [...prev, pk]);
  }, []);

  const vehicleSegments = [
    { label: 'Active', value: activeV, pct: totalV ? Math.round(activeV/totalV*100) : 0, color: '#1a1a1a' },
    { label: 'Maintenance', value: maintV, pct: totalV ? Math.round(maintV/totalV*100) : 0, color: '#e8d44d' },
    { label: 'Inactive', value: inactiveV, pct: totalV ? Math.round(inactiveV/totalV*100) : 0, color: '#c8c8c8' },
  ];
  const driverSegments = [
    { label: 'Available', value: availD, pct: totalD ? Math.round(availD/totalD*100) : 0, color: '#1a1a1a' },
    { label: 'Assigned', value: assignedD, pct: totalD ? Math.round(assignedD/totalD*100) : 0, color: '#e8d44d' },
    { label: 'Inactive', value: inactiveD, pct: totalD ? Math.round(inactiveD/totalD*100) : 0, color: '#c8c8c8' },
  ];
  const segments = activeTab === 'Drivers' ? driverSegments : vehicleSegments;

  const styles = {
    root: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: 'linear-gradient(135deg, #b8f55a 0%, #d4f76e 25%, #f0f870 50%, #f5f870 70%, #fafad0 100%)',
      minHeight: '100vh',
    },
    topbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      background: 'transparent',
    },
    logo: {
      background: '#111',
      color: '#fff',
      fontWeight: 700,
      fontSize: '15px',
      padding: '7px 18px',
      borderRadius: '20px',
      letterSpacing: '-0.3px',
    },
    accountBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: 'rgba(255,255,255,0.85)',
      border: '1px solid rgba(0,0,0,0.1)',
      borderRadius: '20px',
      padding: '6px 14px',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      backdropFilter: 'blur(8px)',
    },
    body: {
      display: 'flex',
      flex: 1,
      gap: '12px',
      padding: '0 14px 14px 14px',
      overflow: 'hidden',
    },
    sidebar: {
      width: '180px',
      background: 'rgba(255,255,255,0.75)',
      borderRadius: '16px',
      padding: '10px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.9)',
      flexShrink: 0,
    },
    navItem: (active) => ({
      padding: '10px 14px',
      borderRadius: '10px',
      fontSize: '13px',
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
      background: active ? '#111' : 'transparent',
      color: active ? '#fff' : '#333',
      border: 'none',
      textAlign: 'left',
      width: '100%',
      transition: 'all 0.15s ease',
    }),
    logoutBtn: {
      marginTop: '20px',
      padding: '12px 16px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      background: '#dc2626',
      color: '#fff',
      border: 'none',
      textAlign: 'center',
      width: '100%',
      transition: 'all 0.15s ease',
    },
    main: {
      flex: 1,
      background: 'rgba(235,240,220,0.55)',
      borderRadius: '16px',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.7)',
      overflow: 'auto',
    },
    statBar: {
      background: 'rgba(255,255,255,0.6)',
      borderRadius: '10px',
      padding: '10px 14px',
      border: '1.5px solid rgba(255,255,255,0.9)',
    },
    statLabels: {
      display: 'flex',
      gap: '16px',
      marginBottom: '8px',
    },
    statLabelItem: {
      fontSize: '12px',
      color: '#555',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    segBar: {
      display: 'flex',
      borderRadius: '6px',
      overflow: 'hidden',
      height: '10px',
    },
    cardsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '14px',
    },
    card: {
      background: 'rgba(255,255,255,0.85)',
      borderRadius: '14px',
      padding: '20px',
      border: '1px solid rgba(255,255,255,0.95)',
      minHeight: '120px',
    },
    cardTitle: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#888',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px',
    },
    cardNumber: {
      fontSize: '36px',
      fontWeight: 700,
      color: '#111',
      lineHeight: 1.1,
    },
    cardSub: {
      fontSize: '12px',
      color: '#888',
      marginTop: '6px',
    },
    tableCard: {
      background: 'rgba(255,255,255,0.85)',
      borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.95)',
      overflow: 'hidden',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '13px',
    },
    th: {
      padding: '10px 14px',
      textAlign: 'left',
      fontWeight: 600,
      color: '#888',
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
      borderBottom: '1px solid #eee',
      background: '#fafafa',
    },
    td: {
      padding: '10px 14px',
      borderBottom: '1px solid #f0f0f0',
      color: '#333',
    },
    statusBadge: (status) => ({
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      background: status === 'active' || status === 'available' ? '#dcfce7' : status === 'maintenance' || status === 'assigned' ? '#fef9c3' : '#f1f5f9',
      color: status === 'active' || status === 'available' ? '#166534' : status === 'maintenance' || status === 'assigned' ? '#854d0e' : '#64748b',
    }),
    actionRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addBtn: {
      background: '#111',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    searchInput: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '7px 12px',
      fontSize: '13px',
      background: 'rgba(255,255,255,0.8)',
      outline: 'none',
      width: '200px',
    },
    filterRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chip: {
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '5px 10px',
      fontSize: '12px',
      background: 'rgba(255,255,255,0.7)',
      cursor: 'pointer',
      marginRight: '6px',
    },
    pageTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#111',
      margin: 0,
    },
    profilePopup: {
      position: 'absolute',
      top: '60px',
      right: '20px',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '16px',
      padding: '24px',
      minWidth: '280px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid rgba(255,255,255,0.9)',
      backdropFilter: 'blur(12px)',
      zIndex: 1000,
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
    },
    profileAvatar: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #111 0%, #333 100%)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 700,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: '16px',
      fontWeight: 700,
      color: '#111',
      marginBottom: '4px',
    },
    profileRole: {
      fontSize: '12px',
      color: '#888',
      textTransform: 'capitalize',
    },
    profileDetail: {
      marginBottom: '14px',
    },
    profileLabel: {
      fontSize: '11px',
      fontWeight: 600,
      color: '#888',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '4px',
    },
    profileValue: {
      fontSize: '14px',
      color: '#333',
      fontWeight: 500,
    },
    closeBtn: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      color: '#888',
      fontSize: '20px',
      lineHeight: 1,
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
  };

  const isDashboard = activeTab === 'Dashboard';
  const isVehicles = activeTab === 'Vehicle Registry';
  const isDrivers = activeTab === 'Drivers';

  return (
    <div style={styles.root}>
      {/* Profile Popup Overlay */}
      {showProfile && <div style={styles.overlay} onClick={() => setShowProfile(false)} />}
      
      {/* Profile Popup */}
      {showProfile && (
        <div style={styles.profilePopup}>
          <button style={styles.closeBtn} onClick={() => setShowProfile(false)}>×</button>
          <div style={styles.profileHeader}>
            <div style={styles.profileAvatar}>
              {user?.username?.charAt(0)?.toUpperCase() || user?.phone?.charAt(0) || 'U'}
            </div>
            <div style={styles.profileInfo}>
              <div style={styles.profileName}>
                {user?.username || 'User'}
              </div>
              <div style={styles.profileRole}>{user?.role || 'user'}</div>
            </div>
          </div>
          <div style={styles.profileDetail}>
            <div style={styles.profileLabel}>Phone Number</div>
            <div style={styles.profileValue}>{user?.phone || 'N/A'}</div>
          </div>
          <div style={styles.profileDetail}>
            <div style={styles.profileLabel}>Email</div>
            <div style={styles.profileValue}>{user?.email || 'N/A'}</div>
          </div>
          <div style={styles.profileDetail}>
            <div style={styles.profileLabel}>Member Since</div>
            <div style={styles.profileValue}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <button
            style={styles.logoutBtn}
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      )}

      {/* Top Bar */}
      <header style={styles.topbar}>
        <div style={styles.logo}>FleeFo</div>
        <button style={styles.accountBtn} onClick={() => setShowProfile(!showProfile)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          Account
        </button>
      </header>

      {/* Body */}
      <div style={styles.body}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          {NAV_ITEMS.map(item => (
            <button
              key={item}
              style={styles.navItem(activeTab === item)}
              onClick={() => setActiveTab(item)}
            >
              {item}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main style={styles.main}>
          <h1 style={styles.pageTitle}>{activeTab}</h1>

          {/* Stat bar */}
          <div style={styles.statBar}>
            <div style={styles.statLabels}>
              {segments.map(s => (
                <span key={s.label} style={styles.statLabelItem}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }}></span>
                  {s.label} <strong>{s.pct}%</strong>
                </span>
              ))}
            </div>
            <div style={styles.segBar}>
              {segments.map(s => (
                <div key={s.label} style={{ width: `${s.pct || 1}%`, background: s.color, transition: 'width 0.4s ease' }} />
              ))}
            </div>
          </div>

          {/* Dashboard: 3 summary cards */}
          {isDashboard && (
            <div style={styles.cardsRow}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Total Vehicles</div>
                <div style={styles.cardNumber}>{totalV}</div>
                <div style={styles.cardSub}>Active: {activeV} · Maintenance: {maintV}</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Total Drivers</div>
                <div style={styles.cardNumber}>{totalD}</div>
                <div style={styles.cardSub}>Available: {availD} · Assigned: {assignedD}</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Fleet Utilization</div>
                <div style={styles.cardNumber}>{totalV ? Math.round(activeV/totalV*100) : 0}%</div>
                <div style={styles.cardSub}>Active vehicles in operation</div>
              </div>
            </div>
          )}

          {/* Tables for non-dashboard tabs */}
          {!isDashboard && (
            <>
              <div style={styles.actionRow}>
                <div></div>
                <button style={styles.addBtn}>+ Add {activeTab === 'Vehicle Registry' ? 'Vehicle' : 'Item'}</button>
              </div>
              <div style={styles.filterRow}>
                <div>
                  <span style={styles.chip}>Columns ▾</span>
                  <span style={styles.chip}>Status ▾</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    style={styles.searchInput}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <button style={{ ...styles.chip, margin: 0 }}>↗ Export</button>
                </div>
              </div>
              <div style={styles.tableCard}>
                {isVehicles && (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}><input type="checkbox" /></th>
                        <th style={styles.th}>Vehicle #</th>
                        <th style={styles.th}>Make</th>
                        <th style={styles.th}>Model</th>
                        <th style={styles.th}>Plate</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehicles.map(v => (
                        <tr key={v.id} style={{ background: selectedRows.includes(v.id) ? '#fafff0' : 'transparent' }}>
                          <td style={styles.td}><input type="checkbox" checked={selectedRows.includes(v.id)} onChange={() => toggleRow(v.id)} /></td>
                          <td style={styles.td}>{v.vehicle_number}</td>
                          <td style={styles.td}>{v.make}</td>
                          <td style={styles.td}>{v.model}</td>
                          <td style={styles.td}>{v.license_plate}</td>
                          <td style={styles.td}><span style={styles.statusBadge(v.status)}>{v.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {!isVehicles && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                    {activeTab} — coming soon
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}