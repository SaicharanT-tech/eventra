import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function ApproverDashboard() {
    const [events, setEvents] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [actionType, setActionType] = useState('approve'); // approve or reject
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const { user } = useContext(AuthContext);

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

    const openModal = (ev, type) => {
        setSelectedEvent(ev);
        setActionType(type);
        setReason('');
        setError('');
        setModalOpen(true);
    };

    const handleAction = async () => {
        try {
            setError('');
            if (actionType === 'approve') {
                await api.put(`/events/${selectedEvent._id}/approve`, { reason });
            } else {
                await api.put(`/events/${selectedEvent._id}/reject`, { reason });
            }
            setModalOpen(false);
            fetchEvents();
        } catch (err) {
            setError(err.response?.data?.message || `Error attempting to ${actionType} event`);
        }
    };

    // Determine which pending status this role should review
    const getActionableStatus = () => {
        if (user.role === 'HOD') return 'Pending';
        if (user.role === 'Dean') return 'HOD Approved';
        if (user.role === 'Institutional Head') return 'Dean Approved';
        return '';
    };

    const actionableStatus = getActionableStatus();

    // Events waiting for THIS user's approval
    const pendingActions = events.filter(e => e.status === actionableStatus);
    console.log("Filtered Pending Actions for", user.role, actionableStatus, pendingActions);

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>{user.role} Dashboard</h1>

            <div className="dashboard-cards">
                <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <h3>Awaiting Your Approval</h3>
                    <p>{pendingActions.length}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--primary-light)' }}>
                    <h3>All Scoped Events</h3>
                    <p>{events.length}</p>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem', color: 'var(--text-dark)', fontSize: '1.25rem' }}>Action Required</h2>
                {pendingActions.length === 0 ? (
                    <div style={{ padding: '2rem', background: 'var(--white)', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--text-light)', border: '1px dashed var(--border-color)' }}>
                        No events currently require your approval.
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Event Details</th>
                                    <th>Resources Requested</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingActions.map(ev => (
                                    <tr key={ev._id}>
                                        <td>
                                            <strong>{ev.title}</strong><br />
                                            <span style={{ fontSize: '0.85rem' }}>Dept: {ev.department}</span><br />
                                            <span style={{ fontSize: '0.85rem' }}>Date: {new Date(ev.date).toLocaleDateString()} ({ev.startTime} - {ev.endTime})</span><br />
                                            <span style={{ fontSize: '0.85rem' }}>Venue: {ev.venueId ? ev.venueId.name : 'N/A'} (Pax: {ev.participants})</span>
                                        </td>
                                        <td>
                                            <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.85rem' }}>
                                                {ev.resources.map((r, i) => (
                                                    <li key={i}>{r.resourceId?.name} - {r.quantity}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${ev.status.split(' ')[0]}`}>{ev.status}</span>
                                        </td>
                                        <td>
                                            <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => openModal(ev, 'approve')}>Approve</button>
                                            <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openModal(ev, 'reject')}>Reject</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div>
                <h2 style={{ marginBottom: '1rem', color: 'var(--text-dark)', fontSize: '1.25rem' }}>All Events Overview</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Event Title</th>
                                <th>Date</th>
                                <th>Venue</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(ev => (
                                <tr key={ev._id}>
                                    <td>{ev.title}</td>
                                    <td>{new Date(ev.date).toLocaleDateString()} <br /><small>{ev.startTime} - {ev.endTime}</small></td>
                                    <td>{ev.venueId ? ev.venueId.name : 'Unknown Venue'}</td>
                                    <td>
                                        <span className={`status-badge status-${ev.status.split(' ')[0]}`}>{ev.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>{actionType} Event</h3>
                        <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Are you sure you want to {actionType} <strong>{selectedEvent?.title}</strong>?
                        </p>

                        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

                        <div className="form-group">
                            <label>Reason / Comments (optional but recommended)</label>
                            <textarea
                                rows="3"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder={`Please provide a reason for ${actionType === 'approve' ? 'approval' : 'rejection'}...`}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button
                                className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                onClick={handleAction}
                            >
                                Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
