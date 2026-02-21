import { siteColor } from '../utils/colors';

const VehicleTable = ({ vehicles, selectedRows, onToggleRow }) => (
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
      {vehicles.length === 0 ? (
        <tr><td colSpan="10" className="empty-row">No vehicles found</td></tr>
      ) : (
        vehicles.map((v) => {
          const pk = v.vehicle_number;
          const selected = selectedRows.includes(pk);
          return (
            <tr key={pk} className={selected ? 'row-selected' : ''}>
              <td className="td-check">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleRow(pk)}
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
);

export default VehicleTable;
