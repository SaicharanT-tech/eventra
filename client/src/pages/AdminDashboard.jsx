import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminDashboard() {
    const [venues, setVenues] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [newVenue, setNewVenue] = useState({ name: '', capacity: '' });
    const [newResource, setNewResource] = useState({ name: '', type: 'equipment', quantityAvailable: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [vRes, rRes] = await Promise.all([
                api.get('/venues'),
                api.get('/resources')
            ]);
            setVenues(vRes.data);
            setResources(rRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateVenue = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await api.post('/venues', { name: newVenue.name, capacity: parseInt(newVenue.capacity) });
            setNewVenue({ name: '', capacity: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create venue');
        } finally { setLoading(false); }
    };

    const handleCreateResource = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await api.post('/resources', {
                name: newResource.name,
                type: newResource.type,
                quantityAvailable: parseInt(newResource.quantityAvailable)
            });
            setNewResource({ name: '', type: 'equipment', quantityAvailable: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create resource');
        } finally { setLoading(false); }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Administration / ITC Dashboard</h1>

            {error && <div style={{ color: 'var(--white)', marginBottom: '1rem', background: 'var(--danger)', padding: '0.75rem', borderRadius: '4px' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                {/* Venues Section */}
                <div>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Manage Venues</h2>

                    <div className="form-container" style={{ padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 'none' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add New Venue</h3>
                        <form onSubmit={handleCreateVenue} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ margin: 0, flex: 2 }}>
                                <label style={{ fontSize: '0.85rem' }}>Venue Name</label>
                                <input type="text" value={newVenue.name} onChange={e => setNewVenue({ ...newVenue, name: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ margin: 0, flex: 1 }}>
                                <label style={{ fontSize: '0.85rem' }}>Capacity</label>
                                <input type="number" value={newVenue.capacity} onChange={e => setNewVenue({ ...newVenue, capacity: e.target.value })} required min="1" />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>Add</button>
                        </form>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Capacity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {venues.map(v => (
                                    <tr key={v._id}>
                                        <td><strong>{v.name}</strong></td>
                                        <td>{v.capacity} pax</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Resources Section */}
                <div>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Manage Resources</h2>

                    <div className="form-container" style={{ padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 'none' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add New Resource</h3>
                        <form onSubmit={handleCreateResource} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ margin: 0, flex: 2, minWidth: '150px' }}>
                                <label style={{ fontSize: '0.85rem' }}>Resource Name</label>
                                <input type="text" value={newResource.name} onChange={e => setNewResource({ ...newResource, name: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '100px' }}>
                                <label style={{ fontSize: '0.85rem' }}>Type</label>
                                <select value={newResource.type} onChange={e => setNewResource({ ...newResource, type: e.target.value })}>
                                    <option value="equipment">Equipment</option>
                                    <option value="facility">Facility</option>
                                    <option value="ITC">ITC</option>
                                    <option value="food">Food</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '80px' }}>
                                <label style={{ fontSize: '0.85rem' }}>Qty</label>
                                <input type="number" value={newResource.quantityAvailable} onChange={e => setNewResource({ ...newResource, quantityAvailable: e.target.value })} required min="0" />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>Add</button>
                        </form>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Available Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map(r => (
                                    <tr key={r._id}>
                                        <td><strong>{r.name}</strong></td>
                                        <td style={{ textTransform: 'capitalize' }}>{r.type}</td>
                                        <td>
                                            <input
                                                type="number"
                                                defaultValue={r.quantityAvailable}
                                                min="0"
                                                style={{ width: '80px', padding: '0.25rem' }}
                                                onBlur={async (e) => {
                                                    const newAmt = parseInt(e.target.value);
                                                    if (newAmt !== r.quantityAvailable) {
                                                        try {
                                                            await api.put(`/resources/${r._id}`, { quantityAvailable: newAmt });
                                                            // update local state smoothly
                                                            setResources(prev => prev.map(res => res._id === r._id ? { ...res, quantityAvailable: newAmt } : res));
                                                        } catch (err) {
                                                            setError('Failed to update resource quantity');
                                                        }
                                                    }
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
