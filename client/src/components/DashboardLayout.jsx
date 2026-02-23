import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function DashboardLayout() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="app-container">
            <aside className="sidebar">
                <h2>EventSystem</h2>
                <nav className="sidebar-nav">
                    <Link to="/" className={`sidebar-link ${location.pathname === '/' || location.pathname.includes('dashboard') ? 'active' : ''}`}>
                        Dashboard ({user.role.split('/')[0]})
                    </Link>
                    {user.role === 'Event Coordinator' && (
                        <Link to="/create-event" className={`sidebar-link ${location.pathname === '/create-event' ? 'active' : ''}`}>
                            Create Event
                        </Link>
                    )}
                </nav>
            </aside>
            <main className="main-content">
                <header className="navbar">
                    <div>Welcome, <strong>{user.name}</strong></div>
                    <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Logout</button>
                </header>
                <section className="page-container">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}
