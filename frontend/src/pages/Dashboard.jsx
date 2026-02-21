import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleService, driverService, userService } from '../services/api';
import './Dashboard.css';

const NAV_ITEMS = ['Dashboard', 'Vehicle Registry', 'Trip Dispatcher', 'Maintenance', 'Trip & Expense', 'Performance', 'Analytics', 'User Management'];

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
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [masterPhone, setMasterPhone] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedRows, setSelectedRows] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [modalOpen, setModalOpen] = useState(null); // 'vehicle' | 'driver' | 'trip' | 'maintenance' | 'expense' | null
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form states
  const [vehicleForm, setVehicleForm] = useState({ vehicle_number: '', make: '', model: '', license_plate: '', holding_capacity: '', mileage: '', status: 'active', driver_phone: '' });
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', email: '', license_number: '', license_expiry: '', status: 'available' });
  const [tripForm, setTripForm] = useState({ vehicle_number: '', driver_phone: '', origin: '', destination: '', date: '', distance: '', fuel_type: 'petrol' });
  const [maintenanceForm, setMaintenanceForm] = useState({ vehicle_number: '', type: '', description: '', date: '', cost: '' });
  const [maintenanceRecords, setMaintenanceRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem('maintenanceRecords')) || []; }
    catch { return []; }
  });
  const [tripRecords, setTripRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tripRecords')) || []; }
    catch { return []; }
  });
  const [expenseForm, setExpenseForm] = useState({ vehicle_number: '', category: '', amount: '', date: '', notes: '', distance: '', mileage: '' });

  const openModal = (type) => { setModalError(''); setModalOpen(type); };
  const closeModal = () => { setModalOpen(null); setModalError(''); setModalLoading(false); };

  // CSV Export helper
  const exportToCSV = (data, headers, filename) => {
    if (!data || data.length === 0) return;
    const csvRows = [headers.join(',')];
    data.forEach(row => {
      const values = headers.map(h => {
        const val = row[h] ?? '';
        // Escape commas and quotes
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      });
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const handleExport = () => {
    if (!isAdmin) return;
    let data, headers, filename;
    if (activeTab === 'Vehicle Registry') {
      data = filteredVehicles; headers = ['vehicle_number', 'make', 'model', 'license_plate', 'status']; filename = 'vehicles';
    } else if (activeTab === 'Maintenance') {
      data = filteredMaintenance; headers = ['vehicle_number', 'type', 'description', 'date', 'cost']; filename = 'maintenance';
    } else if (activeTab === 'User Management') {
      data = filteredUsers.map(u => ({ ...u, created_at: new Date(u.created_at).toLocaleDateString() })); headers = ['phone', 'username', 'email', 'role', 'created_at']; filename = 'users';
    } else if (activeTab === 'Trip Dispatcher') {
      data = []; headers = ['vehicle_number', 'driver_phone', 'origin', 'destination', 'date', 'distance']; filename = 'trips';
    } else if (activeTab === 'Trip & Expense') {
      data = []; headers = ['vehicle_number', 'category', 'amount', 'date', 'notes']; filename = 'expenses';
    } else {
      data = filteredDrivers; headers = ['name', 'email', 'license_number', 'status']; filename = 'drivers';
    }
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }
    exportToCSV(data, headers, filename);
  };

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const response = await vehicleService.getAll();
      setVehicles(response.data.vehicles || []);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally { setLoadingVehicles(false); }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true); setModalError('');
    try {
      await vehicleService.create({
        vehicle_number: vehicleForm.vehicle_number,
        make: vehicleForm.make || null,
        model: vehicleForm.model || null,
        license_plate: vehicleForm.license_plate || null,
        holding_capacity: vehicleForm.holding_capacity ? parseInt(vehicleForm.holding_capacity) : null,
        mileage: vehicleForm.mileage ? parseInt(vehicleForm.mileage) : 0,
        status: vehicleForm.status,
        driver_phone: vehicleForm.driver_phone || null,
      });
      await fetchVehicles();
      setVehicleForm({ vehicle_number: '', make: '', model: '', license_plate: '', holding_capacity: '', mileage: '', status: 'active', driver_phone: '' });
      closeModal();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create vehicle');
    } finally { setModalLoading(false); }
  };

  const removeVehicle = async (vehicleNumber) => {
    try {
      await vehicleService.delete(vehicleNumber);
      setVehicles(prev => prev.filter(v => v.vehicle_number !== vehicleNumber));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove vehicle');
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true); setModalError('');
    try {
      await driverService.create({
        name: driverForm.name,
        phone: driverForm.phone,
        email: driverForm.email || null,
        license_number: driverForm.license_number,
        license_expiry: driverForm.license_expiry || null,
        status: driverForm.status,
      });
      setDriverForm({ name: '', phone: '', email: '', license_number: '', license_expiry: '', status: 'available' });
      closeModal();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create driver');
    } finally { setModalLoading(false); }
  };

  // Fuel rates: price per unit, efficiency (km/unit), unit label
  const FUEL_RATES = {
    cng:    { label: 'CNG',    price: 77.09,  efficiency: 22.5, unit: 'kg' },
    petrol: { label: 'Petrol', price: 99.00,  efficiency: 16.5, unit: 'L' },
    diesel: { label: 'Diesel', price: 88.82,  efficiency: 20.0, unit: 'L' },
  };

  const calcFuelCost = (distance, fuelType) => {
    const rate = FUEL_RATES[fuelType];
    if (!rate || !distance || parseFloat(distance) <= 0) return { costPerKm: 0, totalCost: 0 };
    const costPerKm = rate.price / rate.efficiency;
    const totalCost = parseFloat(distance) * costPerKm;
    return { costPerKm: +costPerKm.toFixed(2), totalCost: +totalCost.toFixed(2) };
  };

  const handleTripSubmit = async (e) => {
    e.preventDefault();
    const { costPerKm, totalCost } = calcFuelCost(tripForm.distance, tripForm.fuel_type);
    const driverObj = drivers.find(d => (d.phone || d.id?.toString()) === tripForm.driver_phone);
    const newTrip = {
      id: Date.now(),
      vehicle_number: tripForm.vehicle_number,
      driver_phone: tripForm.driver_phone,
      driver_name: driverObj ? driverObj.name : tripForm.driver_phone,
      origin: tripForm.origin,
      destination: tripForm.destination,
      date: tripForm.date || new Date().toISOString().split('T')[0],
      distance: tripForm.distance ? parseFloat(tripForm.distance) : 0,
      fuel_type: tripForm.fuel_type,
      cost_per_km: costPerKm,
      fuel_cost: totalCost,
    };
    setTripRecords(prev => {
      const updated = [newTrip, ...prev];
      localStorage.setItem('tripRecords', JSON.stringify(updated));
      return updated;
    });
    setTripForm({ vehicle_number: '', driver_phone: '', origin: '', destination: '', date: '', distance: '', fuel_type: 'petrol' });
    closeModal();
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    const newRecord = {
      id: Date.now(),
      ...maintenanceForm,
      date: maintenanceForm.date || new Date().toISOString().split('T')[0],
    };
    setMaintenanceRecords(prev => {
      const updated = [newRecord, ...prev];
      localStorage.setItem('maintenanceRecords', JSON.stringify(updated));
      return updated;
    });
    setMaintenanceForm({ vehicle_number: '', type: '', description: '', date: '', cost: '' });
    closeModal();
  };

  const removeMaintenanceRecord = (id) => {
    setMaintenanceRecords(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('maintenanceRecords', JSON.stringify(updated));
      return updated;
    });
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setExpenseForm({ vehicle_number: '', category: '', amount: '', date: '', notes: '', distance: '', mileage: '' });
    closeModal();
  };

  // Fetch vehicles + drivers from backend on mount
  useEffect(() => {
    fetchVehicles();
    const fetchDrivers = async () => {
      try {
        const response = await driverService.getAll();
        setDrivers(response.data.drivers || response.data);
      } catch (err) {
        console.error('Failed to fetch drivers:', err);
      }
    };
    fetchDrivers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await userService.getAll();
      setUsers(response.data.users);
      setMasterPhone(response.data.master_phone);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'User Management') {
      fetchUsers();
    }
  }, [activeTab]);

  // Toggle user role between admin and user
  const handleToggleRole = async (userPhone, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await userService.updateRole(userPhone, newRole);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating role:', error);
      alert(error.response?.data?.message || 'Failed to update user role');
    }
  };

  // Calculate trip cost based on distance and mileage
  const calculateTripCost = (distance, mileage, fuelPrice = 3.5) => {
    if (!distance || !mileage || mileage <= 0) return 0;
    const fuelNeeded = parseFloat(distance) / parseFloat(mileage);
    return (fuelNeeded * fuelPrice).toFixed(2);
  };

  // Auto-calculate expense amount when distance or mileage changes
  useEffect(() => {
    if (expenseForm.distance && expenseForm.mileage && expenseForm.category === 'fuel') {
      const calculatedCost = calculateTripCost(expenseForm.distance, expenseForm.mileage);
      setExpenseForm(prev => ({ ...prev, amount: calculatedCost }));
    }
  }, [expenseForm.distance, expenseForm.mileage, expenseForm.category]);

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

  // Generic sort helper
  const sortData = useCallback((data, key, dir) => {
    if (!key) return data;
    return [...data].sort((a, b) => {
      const aVal = (a[key] ?? '').toString().toLowerCase();
      const bVal = (b[key] ?? '').toString().toLowerCase();
      if (aVal < bVal) return dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, []);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  // Reset filters when switching tabs
  useEffect(() => {
    setStatusFilter('all');
    setSortBy('');
    setSortDir('asc');
    setSearchTerm('');
  }, [activeTab]);

  const filteredVehicles = useMemo(() => {
    let data = vehicles.filter(v => [v.vehicle_number, v.make, v.model, v.license_plate, v.status].join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== 'all') data = data.filter(v => v.status === statusFilter);
    return sortData(data, sortBy, sortDir);
  }, [vehicles, searchTerm, statusFilter, sortBy, sortDir, sortData]);

  const filteredDrivers = useMemo(() => {
    let data = drivers.filter(d => [d.name, d.email, d.license_number, d.status].join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== 'all') data = data.filter(d => d.status === statusFilter);
    return sortData(data, sortBy, sortDir);
  }, [drivers, searchTerm, statusFilter, sortBy, sortDir, sortData]);

  const filteredUsers = useMemo(() => {
    let data = users.filter(u => [u.username, u.phone, u.email, u.role].join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== 'all') data = data.filter(u => u.role === statusFilter);
    return sortData(data, sortBy, sortDir);
  }, [users, searchTerm, statusFilter, sortBy, sortDir, sortData]);

  const filteredMaintenance = useMemo(() => {
    let data = maintenanceRecords.filter(r => [r.vehicle_number, r.type, r.description, r.date].join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== 'all') data = data.filter(r => r.type === statusFilter);
    return sortData(data, sortBy, sortDir);
  }, [maintenanceRecords, searchTerm, statusFilter, sortBy, sortDir, sortData]);

  const filteredTrips = useMemo(() => {
    let data = tripRecords.filter(r => [r.vehicle_number, r.driver_name, r.origin, r.destination, r.fuel_type, r.date].join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    return sortData(data, sortBy, sortDir);
  }, [tripRecords, searchTerm, sortBy, sortDir, sortData]);

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
    filterSelect: {
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '6px 10px',
      fontSize: '12px',
      background: '#fff',
      cursor: 'pointer',
      outline: 'none',
      color: '#333',
    },
    sortableTh: {
      padding: '10px 14px',
      textAlign: 'left',
      fontWeight: 600,
      color: '#888',
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
      borderBottom: '1px solid #eee',
      background: '#fafafa',
      cursor: 'pointer',
      userSelect: 'none',
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
  const isUsers = activeTab === 'User Management';

  return (
    <div style={styles.root}>
      {/* Profile Popup Overlay */}
      {showProfile && <div style={styles.overlay} onClick={() => setShowProfile(false)} />}

      {/* Profile Popup */}
      {showProfile && (
        <div style={styles.profilePopup}>
          <button style={styles.closeBtn} onClick={() => setShowProfile(false)}>×</button>
          <div style={styles.profileHeader}>
            <div style={styles.profileInfo}>
              <div style={styles.profileName}>
                {user?.display_name || user?.username || 'Account'}
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
          {user?.display_name || user?.username || 'Account'}
        </button>
      </header>

      {/* Body */}
      <div style={styles.body}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          {NAV_ITEMS.map(item => {
            // Hide User Management from drivers
            if (item === 'User Management' && user?.role === 'driver') {
              return null;
            }
            return (
              <button
                key={item}
                style={styles.navItem(activeTab === item)}
                onClick={() => setActiveTab(item)}
              >
                {item}
              </button>
            );
          })}
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
                {/* Show button only for allowed roles and tabs */}
                {activeTab === 'Vehicle Registry' && user?.role !== 'admin' ? (
                  <div style={{ padding: '8px 16px', fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
                    Only available to admins
                  </div>
                ) : (activeTab === 'Trip Dispatcher' || activeTab === 'Trip & Expense') && user?.role === 'driver' ? (
                  <div style={{ padding: '8px 16px', fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
                    Only available to managers
                  </div>
                ) : activeTab === 'Performance' ? (
                  <div></div>
                ) : (
                  <button style={styles.addBtn} onClick={() => {
                    if (activeTab === 'Vehicle Registry') openModal('vehicle');
                    else if (activeTab === 'Trip Dispatcher') openModal('trip');
                    else if (activeTab === 'Maintenance') openModal('maintenance');
                    else if (activeTab === 'Trip & Expense') openModal('expense');
                    else openModal('driver');
                  }}>+ Add {activeTab === 'Vehicle Registry' ? 'Vehicle' : activeTab === 'Trip Dispatcher' ? 'Trip' : activeTab === 'Maintenance' ? 'Record' : activeTab === 'Trip & Expense' ? 'Expense' : 'Item'}</button>
                )}
              </div>
              <div style={styles.filterRow}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    style={styles.filterSelect}
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    {isVehicles && <><option value="active">Active</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></>}
                    {activeTab === 'Drivers' && <><option value="available">Available</option><option value="assigned">Assigned</option><option value="inactive">Inactive</option></>}
                    {isUsers && <><option value="admin">Admin</option><option value="user">User</option></>}
                    {activeTab === 'Maintenance' && <><option value="oil_change">Oil Change</option><option value="tire_rotation">Tire Rotation</option><option value="brake_service">Brake Service</option><option value="engine_repair">Engine Repair</option><option value="general">General</option></>}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    style={styles.searchInput}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {isAdmin && <button style={{ ...styles.chip, margin: 0 }} onClick={handleExport}>↗ Export</button>}
                </div>
              </div>
              <div style={styles.tableCard}>
                {isVehicles && (
                  loadingVehicles ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                      Loading vehicles…
                    </div>
                  ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}><input type="checkbox" /></th>
                        <th style={styles.sortableTh} onClick={() => handleSort('vehicle_number')}>Vehicle # {sortBy === 'vehicle_number' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                        <th style={styles.sortableTh} onClick={() => handleSort('make')}>Make {sortBy === 'make' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                        <th style={styles.sortableTh} onClick={() => handleSort('model')}>Model {sortBy === 'model' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                        <th style={styles.sortableTh} onClick={() => handleSort('license_plate')}>Plate {sortBy === 'license_plate' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                        <th style={styles.sortableTh} onClick={() => handleSort('status')}>Status {sortBy === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                        {user?.role === 'admin' && <th style={styles.th}>Action</th>}
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
                          {user?.role === 'admin' && (
                            <td style={styles.td}>
                              <button
                                style={{ ...styles.addBtn, padding: '5px 12px', fontSize: '12px', background: '#dc2626' }}
                                onClick={() => { if (window.confirm(`Remove vehicle ${v.vehicle_number}?`)) removeVehicle(v.vehicle_number); }}
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {isUsers && (
                  loadingUsers ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                      Loading users...
                    </div>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.sortableTh} onClick={() => handleSort('phone')}>Phone {sortBy === 'phone' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                          <th style={styles.sortableTh} onClick={() => handleSort('username')}>Username {sortBy === 'username' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                          <th style={styles.sortableTh} onClick={() => handleSort('email')}>Email {sortBy === 'email' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                          <th style={styles.sortableTh} onClick={() => handleSort('role')}>Role {sortBy === 'role' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                          <th style={styles.sortableTh} onClick={() => handleSort('created_at')}>Joined {sortBy === 'created_at' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                          <th style={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u.phone}>
                            <td style={styles.td}>{u.phone}</td>
                            <td style={styles.td}>{u.username || 'N/A'}</td>
                            <td style={styles.td}>{u.email}</td>
                            <td style={styles.td}>
                              <span style={styles.statusBadge(u.role === 'admin' ? 'active' : 'available')}>
                                {u.is_master ? '👑 Master' : u.role}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td style={styles.td}>
                              {u.is_master ? (
                                <span style={{ fontSize: '12px', color: '#888' }}>Protected</span>
                              ) : (
                                <button
                                  style={{
                                    ...styles.addBtn,
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    background: u.role === 'admin' ? '#dc2626' : '#16a34a',
                                  }}
                                  onClick={() => handleToggleRole(u.phone, u.role)}
                                >
                                  {u.role === 'admin' ? 'Demote' : 'Promote'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
                {!isVehicles && !isUsers && activeTab === 'Maintenance' && (
                  filteredMaintenance.length === 0 && maintenanceRecords.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                      No maintenance records yet. Click "+ Add Record" to add one.
                    </div>
                  ) : filteredMaintenance.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                      No records match your filters.
                    </div>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.sortableTh} onClick={() => handleSort('vehicle_number')}>Vehicle # {sortBy === 'vehicle_number' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                          <th style={styles.sortableTh} onClick={() => handleSort('type')}>Type {sortBy === 'type' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                          <th style={styles.th}>Description</th>
                          <th style={styles.sortableTh} onClick={() => handleSort('date')}>Date {sortBy === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                          <th style={styles.sortableTh} onClick={() => handleSort('cost')}>Cost ($) {sortBy === 'cost' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                          <th style={styles.th}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaintenance.map(r => (
                          <tr key={r.id}>
                            <td style={styles.td}>{r.vehicle_number}</td>
                            <td style={styles.td}>{r.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td>
                            <td style={styles.td}>{r.description || '—'}</td>
                            <td style={styles.td}>{r.date}</td>
                            <td style={styles.td}>{r.cost ? `$${r.cost}` : '—'}</td>
                            <td style={styles.td}>
                              <button
                                style={{ ...styles.addBtn, padding: '5px 12px', fontSize: '12px', background: '#16a34a' }}
                                onClick={() => removeMaintenanceRecord(r.id)}
                              >
                                ✓ Done
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
                {!isVehicles && !isUsers && activeTab === 'Performance' && (() => {
                  const totalTrips = tripRecords.length;
                  const totalDist = tripRecords.reduce((s, r) => s + (r.distance || 0), 0);
                  const totalFuel = tripRecords.reduce((s, r) => s + (r.fuel_cost || 0), 0);
                  const avgCostPerKm = totalDist > 0 ? (totalFuel / totalDist) : 0;
                  const FUEL_COLORS = { cng: '#16a34a', petrol: '#d97706', diesel: '#2563eb' };
                  return (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '16px 16px 0' }}>
                        {[
                          { label: 'Total Trips', value: totalTrips },
                          { label: 'Total Distance', value: `${totalDist.toFixed(1)} km` },
                          { label: 'Total Fuel Cost', value: `₹${totalFuel.toFixed(2)}` },
                          { label: 'Avg Cost / km', value: `₹${avgCostPerKm.toFixed(2)}` },
                        ].map(c => (
                          <div key={c.label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px' }}>
                            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 500 }}>{c.label}</div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111' }}>{c.value}</div>
                          </div>
                        ))}
                      </div>
                      {filteredTrips.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                          No trips recorded yet. Dispatch a trip from the Trip Dispatcher tab.
                        </div>
                      ) : (
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.sortableTh} onClick={() => handleSort('date')}>Date {sortBy === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                              <th style={styles.sortableTh} onClick={() => handleSort('vehicle_number')}>Vehicle {sortBy === 'vehicle_number' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                              <th style={styles.sortableTh} onClick={() => handleSort('driver_name')}>Driver {sortBy === 'driver_name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                              <th style={styles.th}>Route</th>
                              <th style={styles.sortableTh} onClick={() => handleSort('distance')}>Distance {sortBy === 'distance' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                              <th style={styles.sortableTh} onClick={() => handleSort('fuel_type')}>Fuel {sortBy === 'fuel_type' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                              <th style={styles.sortableTh} onClick={() => handleSort('cost_per_km')}>₹/km {sortBy === 'cost_per_km' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                              <th style={styles.sortableTh} onClick={() => handleSort('fuel_cost')}>Fuel Cost {sortBy === 'fuel_cost' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTrips.map(r => (
                              <tr key={r.id}>
                                <td style={styles.td}>{r.date}</td>
                                <td style={styles.td}>{r.vehicle_number}</td>
                                <td style={styles.td}>{r.driver_name || r.driver_phone}</td>
                                <td style={styles.td}>{r.origin} → {r.destination}</td>
                                <td style={styles.td}>{r.distance} km</td>
                                <td style={styles.td}>
                                  <span style={{ ...styles.statusBadge('active'), background: FUEL_COLORS[r.fuel_type] || '#888', color: '#fff', fontSize: '11px' }}>
                                    {r.fuel_type?.toUpperCase()}
                                  </span>
                                </td>
                                <td style={styles.td}>₹{r.cost_per_km}</td>
                                <td style={styles.td}><strong>₹{r.fuel_cost}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  );
                })()}
                {!isVehicles && !isUsers && activeTab !== 'Maintenance' && activeTab !== 'Performance' && activeTab !== 'Analytics' && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                    {activeTab} — coming soon
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ========== MODAL OVERLAY ========== */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-popup" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            {/* ---- Add Vehicle ---- */}
            {modalOpen === 'vehicle' && (
              <form onSubmit={handleVehicleSubmit}>
                <h2 className="modal-title">Add Vehicle</h2>
                {modalError && <div className="modal-error">{modalError}</div>}
                <label className="modal-label">Vehicle Number *
                  <input className="modal-input" required value={vehicleForm.vehicle_number} onChange={e => setVehicleForm({...vehicleForm, vehicle_number: e.target.value})} placeholder="e.g. V006" />
                </label>
                <label className="modal-label">Make
                  <input className="modal-input" value={vehicleForm.make} onChange={e => setVehicleForm({...vehicleForm, make: e.target.value})} placeholder="e.g. Ford" />
                </label>
                <label className="modal-label">Model
                  <input className="modal-input" value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} placeholder="e.g. Transit" />
                </label>
                <label className="modal-label">License Plate
                  <input className="modal-input" value={vehicleForm.license_plate} onChange={e => setVehicleForm({...vehicleForm, license_plate: e.target.value})} placeholder="e.g. ABC123" />
                </label>
                <label className="modal-label">Holding Capacity
                  <input className="modal-input" type="number" value={vehicleForm.holding_capacity} onChange={e => setVehicleForm({...vehicleForm, holding_capacity: e.target.value})} placeholder="Passengers / Cargo" />
                </label>
                <label className="modal-label">Mileage
                  <input className="modal-input" type="number" value={vehicleForm.mileage} onChange={e => setVehicleForm({...vehicleForm, mileage: e.target.value})} placeholder="0" />
                </label>
                <label className="modal-label">Status
                  <select className="modal-input" value={vehicleForm.status} onChange={e => setVehicleForm({...vehicleForm, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <label className="modal-label">Driver Phone
                  <input className="modal-input" value={vehicleForm.driver_phone} onChange={e => setVehicleForm({...vehicleForm, driver_phone: e.target.value})} placeholder="Optional" />
                </label>
                <button className="modal-submit" type="submit" disabled={modalLoading}>{modalLoading ? 'Creating…' : 'Add Vehicle'}</button>
              </form>
            )}

            {/* ---- Add Driver ---- */}
            {modalOpen === 'driver' && (
              <form onSubmit={handleDriverSubmit}>
                <h2 className="modal-title">Add Driver</h2>
                {modalError && <div className="modal-error">{modalError}</div>}
                <label className="modal-label">Full Name *
                  <input className="modal-input" required value={driverForm.name} onChange={e => setDriverForm({...driverForm, name: e.target.value})} placeholder="John Doe" />
                </label>
                <label className="modal-label">Phone *
                  <input className="modal-input" required value={driverForm.phone} onChange={e => setDriverForm({...driverForm, phone: e.target.value})} placeholder="+1234567890" />
                </label>
                <label className="modal-label">Email
                  <input className="modal-input" type="email" value={driverForm.email} onChange={e => setDriverForm({...driverForm, email: e.target.value})} placeholder="driver@fleet.com" />
                </label>
                <label className="modal-label">License Number *
                  <input className="modal-input" required value={driverForm.license_number} onChange={e => setDriverForm({...driverForm, license_number: e.target.value})} placeholder="DL-XXXXX" />
                </label>
                <label className="modal-label">License Expiry
                  <input className="modal-input" type="date" value={driverForm.license_expiry} onChange={e => setDriverForm({...driverForm, license_expiry: e.target.value})} />
                </label>
                <label className="modal-label">Status
                  <select className="modal-input" value={driverForm.status} onChange={e => setDriverForm({...driverForm, status: e.target.value})}>
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <button className="modal-submit" type="submit" disabled={modalLoading}>{modalLoading ? 'Creating…' : 'Add Driver'}</button>
              </form>
            )}

            {/* ---- Add Trip ---- */}
            {modalOpen === 'trip' && (() => {
              const fuelPreview = calcFuelCost(tripForm.distance, tripForm.fuel_type);
              const rate = FUEL_RATES[tripForm.fuel_type];
              return (
                <form onSubmit={handleTripSubmit}>
                  <h2 className="modal-title">Dispatch Trip</h2>
                  {modalError && <div className="modal-error">{modalError}</div>}
                  <label className="modal-label">Vehicle Number *
                    <input className="modal-input" required value={tripForm.vehicle_number} onChange={e => setTripForm({...tripForm, vehicle_number: e.target.value})} placeholder="V001" />
                  </label>
                  <label className="modal-label">Driver *
                    <select className="modal-input" required value={tripForm.driver_phone} onChange={e => setTripForm({...tripForm, driver_phone: e.target.value})}>
                      <option value="">Select available driver…</option>
                      {drivers.filter(d => d.status === 'available').map(d => (
                        <option key={d.id} value={d.phone || d.id}>{d.name} — {d.license_number}</option>
                      ))}
                    </select>
                  </label>
                  <label className="modal-label">Origin *
                    <input className="modal-input" required value={tripForm.origin} onChange={e => setTripForm({...tripForm, origin: e.target.value})} placeholder="City A" />
                  </label>
                  <label className="modal-label">Destination *
                    <input className="modal-input" required value={tripForm.destination} onChange={e => setTripForm({...tripForm, destination: e.target.value})} placeholder="City B" />
                  </label>
                  <label className="modal-label">Date
                    <input className="modal-input" type="date" value={tripForm.date} onChange={e => setTripForm({...tripForm, date: e.target.value})} />
                  </label>
                  <label className="modal-label">Distance (km) *
                    <input className="modal-input" type="number" min="0" required value={tripForm.distance} onChange={e => setTripForm({...tripForm, distance: e.target.value})} placeholder="0" />
                  </label>
                  <label className="modal-label">Fuel Type *
                    <select className="modal-input" value={tripForm.fuel_type} onChange={e => setTripForm({...tripForm, fuel_type: e.target.value})}>
                      <option value="petrol">Petrol — ₹99/L, ~16.5 km/L</option>
                      <option value="diesel">Diesel — ₹88.82/L, ~20 km/L</option>
                      <option value="cng">CNG — ₹77.09/kg, ~22.5 km/kg</option>
                    </select>
                  </label>
                  {tripForm.distance > 0 && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px' }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px', color: '#166534' }}>Estimated Fuel Cost</div>
                      <div style={{ color: '#15803d' }}>₹{fuelPreview.costPerKm}/km × {tripForm.distance} km = <strong>₹{fuelPreview.totalCost}</strong></div>
                      <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>{rate?.label}: ₹{rate?.price}/{rate?.unit} @ {rate?.efficiency} km/{rate?.unit}</div>
                    </div>
                  )}
                  <button className="modal-submit" type="submit" disabled={modalLoading}>{modalLoading ? 'Dispatching…' : 'Dispatch Trip'}</button>
                </form>
              );
            })()}

            {/* ---- Add Maintenance ---- */}
            {modalOpen === 'maintenance' && (
              <form onSubmit={handleMaintenanceSubmit}>
                <h2 className="modal-title">Add Maintenance Record</h2>
                {modalError && <div className="modal-error">{modalError}</div>}
                <label className="modal-label">Vehicle *
                  <select className="modal-input" required value={maintenanceForm.vehicle_number} onChange={e => setMaintenanceForm({...maintenanceForm, vehicle_number: e.target.value})}>
                    <option value="">Select vehicle…</option>
                    {vehicles.map(v => (
                      <option key={v.vehicle_number} value={v.vehicle_number}>
                        {v.vehicle_number}{v.make ? ` — ${v.make}` : ''}{v.model ? ` ${v.model}` : ''}{v.license_plate ? ` (${v.license_plate})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="modal-label">Type *
                  <select className="modal-input" required value={maintenanceForm.type} onChange={e => setMaintenanceForm({...maintenanceForm, type: e.target.value})}>
                    <option value="">Select type…</option>
                    <option value="oil_change">Oil Change</option>
                    <option value="tire_rotation">Tire Rotation</option>
                    <option value="brake_service">Brake Service</option>
                    <option value="engine_repair">Engine Repair</option>
                    <option value="general">General Service</option>
                  </select>
                </label>
                <label className="modal-label">Description
                  <textarea className="modal-input modal-textarea" value={maintenanceForm.description} onChange={e => setMaintenanceForm({...maintenanceForm, description: e.target.value})} placeholder="Details…" />
                </label>
                <label className="modal-label">Date
                  <input className="modal-input" type="date" value={maintenanceForm.date} onChange={e => setMaintenanceForm({...maintenanceForm, date: e.target.value})} />
                </label>
                <label className="modal-label">Cost ($)
                  <input className="modal-input" type="number" value={maintenanceForm.cost} onChange={e => setMaintenanceForm({...maintenanceForm, cost: e.target.value})} placeholder="0" />
                </label>
                <button className="modal-submit" type="submit" disabled={modalLoading}>{modalLoading ? 'Saving…' : 'Add Record'}</button>
              </form>
            )}

            {/* ---- Add Expense ---- */}
            {modalOpen === 'expense' && (
              <form onSubmit={handleExpenseSubmit}>
                <h2 className="modal-title">Add Trip Expense</h2>
                {modalError && <div className="modal-error">{modalError}</div>}
                <label className="modal-label">Vehicle Number *
                  <input className="modal-input" required value={expenseForm.vehicle_number} onChange={e => setExpenseForm({...expenseForm, vehicle_number: e.target.value})} placeholder="V001" />
                </label>
                <label className="modal-label">Category *
                  <select className="modal-input" required value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                    <option value="">Select category…</option>
                    <option value="fuel">Fuel (Trip)</option>
                    <option value="toll">Toll</option>
                    <option value="parking">Parking</option>
                    <option value="repair">Repair</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                {expenseForm.category === 'fuel' && (
                  <>
                    <label className="modal-label">Distance (km) *
                      <input className="modal-input" type="number" step="0.1" required value={expenseForm.distance} onChange={e => setExpenseForm({...expenseForm, distance: e.target.value})} placeholder="100" />
                    </label>
                    <label className="modal-label">Vehicle Mileage (km/L) *
                      <input className="modal-input" type="number" step="0.1" required value={expenseForm.mileage} onChange={e => setExpenseForm({...expenseForm, mileage: e.target.value})} placeholder="15" />
                    </label>
                  </>
                )}
                <label className="modal-label">Amount ($) {expenseForm.category === 'fuel' ? '(Auto-calculated)' : '*'}
                  <input className="modal-input" type="number" step="0.01" required value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} placeholder="0.00" readOnly={expenseForm.category === 'fuel' && expenseForm.distance && expenseForm.mileage} />
                </label>
                <label className="modal-label">Date
                  <input className="modal-input" type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} />
                </label>
                <label className="modal-label">Notes
                  <textarea className="modal-input modal-textarea" value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} placeholder="Optional notes…" />
                </label>
                <button className="modal-submit" type="submit" disabled={modalLoading}>{modalLoading ? 'Saving…' : 'Add Expense'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
