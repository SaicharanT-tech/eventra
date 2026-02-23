import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Event Coordinator');
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password, role });
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    // Seed helpful info
    const fillSampleData = (sampleRole) => {
        setRole(sampleRole);
        setPassword('password123');
        switch (sampleRole) {
            case 'Event Coordinator': setEmail('coordinator@inst.edu'); break;
            case 'HOD': setEmail('hod@inst.edu'); break;
            case 'Dean': setEmail('dean@inst.edu'); break;
            case 'Institutional Head': setEmail('head@inst.edu'); break;
            case 'Admin/ITC': setEmail('admin@inst.edu'); break;
            default: break;
        }
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
            <div className="form-container" style={{ width: '100%', maxWidth: '450px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary-color)' }}>Institution Login</h2>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter email" />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter password (password123)" />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select value={role} onChange={e => setRole(e.target.value)}>
                            <option value="Event Coordinator">Event Coordinator</option>
                            <option value="HOD">HOD</option>
                            <option value="Dean">Dean</option>
                            <option value="Institutional Head">Institutional Head</option>
                            <option value="Admin/ITC">Admin/ITC</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Login to Dashboard</button>
                </form>

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.85rem' }}>
                    <p style={{ marginBottom: '0.5rem', color: 'var(--text-light)' }}>Demo Accounts:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <button type="button" onClick={() => fillSampleData('Event Coordinator')} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Coord</button>
                        <button type="button" onClick={() => fillSampleData('HOD')} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>HOD</button>
                        <button type="button" onClick={() => fillSampleData('Dean')} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Dean</button>
                        <button type="button" onClick={() => fillSampleData('Institutional Head')} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Head</button>
                        <button type="button" onClick={() => fillSampleData('Admin/ITC')} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Admin</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
