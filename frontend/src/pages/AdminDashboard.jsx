import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import api from '../api.js';
import PlaceForm from '../components/PlaceForm.jsx';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'manage', label: 'Manage Places', icon: 'list' },
  { key: 'add', label: 'Add Place', icon: 'plus' },
  { key: 'profile', label: 'Profile', icon: 'user' }
];

export default function AdminDashboard() {
  const [places, setPlaces] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [section, setSection] = useState('dashboard');
  const [editingPlace, setEditingPlace] = useState(null);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedIds, setSelectedIds] = useState([]);

  function loadPlaces() {
    setLoading(true);
    api.get('/places')
      .then((res) => setPlaces(res.data))
      .catch(() => setError('Could not load places.'))
      .finally(() => setLoading(false));
  }

  function loadStats() {
    api.get('/visit-plans/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }

  useEffect(() => {
    loadPlaces();
    loadStats();
  }, []);

  let filteredPlaces = places.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );
  filteredPlaces = [...filteredPlaces];
  if (sortBy === 'name') filteredPlaces.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === 'distance') filteredPlaces.sort((a, b) => a.distance_km - b.distance_km);
  else if (sortBy === 'category') filteredPlaces.sort((a, b) => a.category.localeCompare(b.category));

  function toggleSelect(placeId) {
    setSelectedIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  }

  async function handleBulkDelete() {
    if (!window.confirm(`Delete ${selectedIds.length} selected place(s)? This cannot be undone.`)) return;
    try {
      for (const id of selectedIds) {
        await api.delete(`/places/${id}`);
      }
      setNotice(`${selectedIds.length} place(s) deleted.`);
      setSelectedIds([]);
      loadPlaces();
    } catch (err) {
      setError('Could not delete one or more selected places.');
    }
  }

  function handleExportCSV() {
    const headers = ['ID', 'Name', 'Category', 'Distance (km)', 'Verified', 'Opening Times', 'Description'];
    const rows = places.map((p) => [
      p.place_id, p.name, p.category, p.distance_km,
      p.is_verified ? 'Yes' : 'No', p.opening_times,
      (p.description || '').replace(/,/g, ';').replace(/\n/g, ' ')
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `places-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleAdd(payload) {
    await api.post('/places', payload);
    setNotice('Place added successfully.');
    setSection('manage');
    loadPlaces();
    loadStats();
  }

  async function handleEdit(payload) {
    await api.put(`/places/${editingPlace.place_id}`, payload);
    setNotice('Place updated successfully.');
    setSection('manage');
    setEditingPlace(null);
    loadPlaces();
  }

  async function handleDelete(place) {
    const confirmed = window.confirm(`Delete "${place.name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await api.delete(`/places/${place.place_id}`);
      setNotice(`"${place.name}" was deleted.`);
      loadPlaces();
      loadStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete this place.');
    }
  }

  function goTo(key) {
    setSection(key);
    setEditingPlace(null);
    setNotice(null);
    setError(null);
    setSelectedIds([]);
  }

  const statCards = (
    <div className="stat-cards">
      <div className="stat-card"><span className="stat-value">{places.length}</span><span className="stat-label">Total places</span></div>
      <div className="stat-card"><span className="stat-value">{new Set(places.map((p) => p.category)).size}</span><span className="stat-label">Categories used</span></div>
      <div className="stat-card"><span className="stat-value">{places.filter((p) => p.is_verified).length}</span><span className="stat-label">Field-verified</span></div>
      <div className="stat-card"><span className="stat-value">{places.filter((p) => p.image_url).length}</span><span className="stat-label">With a photo</span></div>
      {stats && (
        <div className="stat-card"><span className="stat-value">{stats.total_plans}</span><span className="stat-label">Visit plans saved</span></div>
      )}
    </div>
  );

  const placesTable = (rows, selectable = false) => (
    <table className="admin-table">
      <thead>
        <tr>
          {selectable && (
            <th style={{ width: '2rem' }}>
              <input
                type="checkbox"
                checked={selectedIds.length === rows.length && rows.length > 0}
                onChange={(e) => setSelectedIds(e.target.checked ? rows.map((r) => r.place_id) : [])}
              />
            </th>
          )}
          <th>Name</th>
          <th>Category</th>
          <th>Distance</th>
          <th>Verified</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((place) => (
          <tr key={place.place_id}>
            {selectable && (
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(place.place_id)}
                  onChange={() => toggleSelect(place.place_id)}
                />
              </td>
            )}
            <td>{place.name}</td>
            <td>{place.category}</td>
            <td>{Number(place.distance_km).toFixed(1)} km</td>
            <td>{place.is_verified ? 'Yes' : 'Approximate'}</td>
            <td>
              <div className="table-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditingPlace(place); setSection('edit'); }}>Edit</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(place)}>Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Admin Panel</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button key={item.key} type="button" className={`admin-nav-item ${section === item.key || (item.key === 'manage' && section === 'edit') ? 'active' : ''}`} onClick={() => goTo(item.key)}>
              <span className="admin-nav-icon"><Icon name={item.icon} size={18} /></span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-content">
        {notice && <div className="success-banner">{notice}</div>}
        {error && <div className="error-banner">{error}</div>}

        {section === 'dashboard' && (
          <>
            <h2>Dashboard</h2>
            {statCards}

            {stats && stats.popular_places?.length > 0 && (
              <div className="popular-places-block">
                <h3>Most-added to visit plans</h3>
                <ol className="popular-places-list">
                  {stats.popular_places.map((p, i) => {
                    const maxCount = stats.popular_places[0].times_added;
                    const pct = Math.max(12, Math.round((p.times_added / maxCount) * 100));
                    return (
                      <li key={p.place_id}>
                        <span className="popular-rank">{i + 1}</span>
                        <div className="popular-info">
                          <div className="popular-info-top">
                            <span className="popular-name">{p.name}</span>
                            <span className="popular-count">{p.times_added}×</span>
                          </div>
                          <div className="popular-bar-track">
                            <div className="popular-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            <div className="admin-toolbar">
              <h3 style={{ margin: 0 }}>Recent places</h3>
              <button type="button" className="btn btn-gold" onClick={() => goTo('add')}><Icon name="plus" size={15} className="icon-lead" />Add place</button>
            </div>
            {loading && <p className="loading-note">Loading places…</p>}
            {!loading && placesTable(places.slice(0, 5))}
            {!loading && places.length > 5 && (
              <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: '0.9rem' }} onClick={() => goTo('manage')}>
                View all {places.length} places<Icon name="arrowRight" size={14} className="icon-after" />
              </button>
            )}
          </>
        )}

        {section === 'manage' && (
          <>
            <div className="admin-toolbar">
              <h2 style={{ margin: 0 }}>Manage places ({filteredPlaces.length})</h2>
              <div className="admin-actions">
                <button type="button" onClick={handleExportCSV} className="btn btn-outline btn-sm"><Icon name="download" size={15} className="icon-lead" />Export CSV</button>
                <button type="button" onClick={handleBulkDelete} disabled={selectedIds.length === 0} className="btn btn-danger btn-sm">
                  <Icon name="trash" size={15} className="icon-lead" />Delete selected ({selectedIds.length})
                </button>
                <button type="button" className="btn btn-gold btn-sm" onClick={() => goTo('add')}><Icon name="plus" size={15} className="icon-lead" />Add place</button>
              </div>
            </div>

            <div className="admin-filters">
              <input
                type="search"
                placeholder="Search places by name or category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-search"
              />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by name</option>
                <option value="distance">Sort by distance</option>
                <option value="category">Sort by category</option>
              </select>
            </div>

            {loading && <p className="loading-note">Loading places…</p>}
            {!loading && filteredPlaces.length === 0 && <p className="info-note">No places match your search.</p>}
            {!loading && filteredPlaces.length > 0 && placesTable(filteredPlaces, true)}
          </>
        )}

        {section === 'add' && (
          <>
            <h2>Add a new place</h2>
            <PlaceForm onSubmit={handleAdd} onCancel={() => goTo('manage')} submitLabel="Add place" />
          </>
        )}

        {section === 'edit' && editingPlace && (
          <>
            <h2>Edit &ldquo;{editingPlace.name}&rdquo;</h2>
            <PlaceForm initial={editingPlace} onSubmit={handleEdit} onCancel={() => goTo('manage')} submitLabel="Save changes" />
          </>
        )}

        {section === 'profile' && (
          <>
            <h2>Admin profile</h2>
            <div className="profile-card">
              <p><strong>Logged in as:</strong> {localStorage.getItem('admin_username') || 'admin'}</p>
              <p className="info-note">
                This is a single-administrator system, as defined in the project's SRS (Section 2.5) — there is
                one admin account, set up via the backend's <code>.env</code> file.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}