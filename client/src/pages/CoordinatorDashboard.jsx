import { useState, useEffect } from 'react';
import api from '../api';

export default function CoordinatorDashboard() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get('/events');
            setEvents(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'start') {
                await api.put(`/events/${id}/start`);
            } else if (action === 'complete') {
                await api.put(`/events/${id}/complete`);
            }
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.message || 'Error executing action');
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Coordinator Dashboard</h1>

            <div className="dashboard-cards">
                <div className="card">
                    <h3>Total Events</h3>
                    <p>{events.length}</p>
                </div>
                <div className="card">
                    <h3>Pending Approvals</h3>
                    <p>{events.filter(e => e.status.includes('Approved') === false && e.status !== 'Rejected' && e.status !== 'Completed').length}</p>
                </div>
                <div className="card">
                    <h3>Active/Running</h3>
                    <p>{events.filter(e => e.status === 'Running').length}</p>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Event Title</th>
                            <th>Date</th>
                            <th>Venue</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)' }}>No events created yet.</td></tr>
                        )}
                        {events.map(ev => (
                            <tr key={ev._id}>
                                <td>{ev.title}</td>
                                <td>{new Date(ev.date).toLocaleDateString()} <br /><small>{ev.startTime} - {ev.endTime}</small></td>
                                <td>{ev.venueId ? ev.venueId.name : 'Unknown Venue'}</td>
                                <td>
                                    <span className={`status-badge status-${ev.status.split(' ')[0]}`}>{ev.status}</span>
                                </td>
                                <td>
                                    {ev.status === 'Approved' && (
                                        <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleAction(ev._id, 'start')}>Start</button>
                                    )}
                                    {ev.status === 'Running' && (
                                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleAction(ev._id, 'complete')}>Complete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
