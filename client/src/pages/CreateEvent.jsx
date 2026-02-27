import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function CreateEvent() {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        department: user?.department || 'Computer Science',
        date: '',
        startTime: '',
        endTime: '',
        participants: '',
        venueId: '',
        resources: []
    });

    const [venues, setVenues] = useState([]);
    const [availableResources, setAvailableResources] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            const [vRes, rRes] = await Promise.all([
                api.get('/venues'),
                api.get('/resources')
            ]);
            setVenues(vRes.data);
            setAvailableResources(rRes.data);
            if (vRes.data.length > 0) {
                setFormData(prev => ({ ...prev, venueId: vRes.data[0]._id }));
            }
        } catch (err) {
            console.error('Failed to fetch form data', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleResourceChange = (resourceId, quantity) => {
        let newResources = [...formData.resources];
        const existingIndex = newResources.findIndex(r => r.resourceId === resourceId);

        if (quantity === 0 || quantity === '') {
            if (existingIndex > -1) newResources.splice(existingIndex, 1);
        } else {
            if (existingIndex > -1) {
                newResources[existingIndex].quantity = parseInt(quantity);
            } else {
                newResources.push({ resourceId, quantity: parseInt(quantity) });
            }
        }
        setFormData({ ...formData, resources: newResources });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/events', formData);
            navigate('/coordinator');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Create New Event</h1>

            <div className="form-container" style={{ maxWidth: '100%' }}>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Event Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input type="text" name="department" value={formData.department} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Expected Participants</label>
                            <input type="number" name="participants" value={formData.participants} onChange={handleChange} required min="1" />
                        </div>
                        <div className="form-group">
                            <label>Start Time</label>
                            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Select Venue</label>
                        <select name="venueId" value={formData.venueId} onChange={handleChange} required>
                            <option value="">-- Select Venue --</option>
                            {venues.map(v => (
                                <option key={v._id} value={v._id}>{v.name} (Capacity: {v.capacity})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Required Resources</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {availableResources.map(res => {
                                const selected = formData.resources.find(r => r.resourceId === res._id);
                                return (
                                    <div key={res._id} style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem', background: '#f8fafc' }}>
                                        <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>{res.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: '0.5rem', textTransform: 'capitalize' }}>{res.type}</span></div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Available: {res.quantityAvailable}</div>
                                        <input
                                            type="number"
                                            min="0"
                                            max={res.quantityAvailable}
                                            placeholder="Qty"
                                            value={selected ? selected.quantity : ''}
                                            onChange={(e) => handleResourceChange(res._id, e.target.value)}
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Submit Event Request'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/coordinator')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
