import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  const userNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/books', label: 'Browse Books', icon: '📚' },
    { path: '/my-books', label: 'My Books', icon: '📖' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/books', label: 'Manage Books', icon: '📚' },
    { path: '/admin/users', label: 'Manage Users', icon: '👥' },
    { path: '/admin/issued', label: 'Issued Books', icon: '📤' },
    { path: '/admin/strikes', label: 'User Strikes', icon: '⚠️' },
  ];

  const navItems = user?.userType === 'admin' ? adminNavItems : userNavItems;
  const initials = user?.username?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">📚 LibraryMS</div>
        <div className="sidebar-subtitle">College Library System</div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.username || 'User'}</div>
          <div className="user-role">{user?.userType || 'user'}</div>
        </div>
      </div>

      <nav>
        <ul className="nav-menu">
          {navItems.map(item => (
            <li key={item.path} className="nav-item">
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
          <li className="nav-item">
            <button 
              onClick={handleLogout}
              className="nav-link"
              style={{ 
                width: '100%', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '14px'
              }}
            >
              <span style={{ fontSize: '18px' }}>🚪</span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
