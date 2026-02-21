import { siteColor } from '../utils/colors';

const DriverTable = ({ drivers, selectedRows, onToggleRow }) => (
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
      {drivers.length === 0 ? (
        <tr><td colSpan="10" className="empty-row">No drivers found</td></tr>
      ) : (
        drivers.map((d) => {
          const pk = d.license_number;
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
);

export default DriverTable;
