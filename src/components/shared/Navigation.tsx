import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navigation.css';

interface NavigationTab {
  path: string;
  label: string;
  icon: string;
}

const navigationTabs: NavigationTab[] = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/dates', label: 'Unsere Daten', icon: '📅' },
];

export function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="shared-nav">
      <div className="nav-content">
        <div className="nav-left">
          {navigationTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`nav-tab ${location.pathname === tab.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="nav-right">
          <span className="nav-user">
            Hallo {user?.email === 'sina.alker9@gmail.com' ? 'Mein Schatz <3' : user?.email}
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Abmelden
          </button>
        </div>
      </div>
    </nav>
  );
} 