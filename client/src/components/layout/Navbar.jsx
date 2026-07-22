import { NavLink } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineDocumentText, HiOutlineShare, HiOutlineChatAlt2, HiOutlineCog, HiOutlineShieldCheck, HiOutlineLightBulb, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const navItems = [
  { path: '/', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
  { path: '/documents', icon: <HiOutlineDocumentText />, label: 'Documents' },
  { path: '/knowledge', icon: <HiOutlineShare />, label: 'Graph' },
  { path: '/copilot', icon: <HiOutlineChatAlt2 />, label: 'Copilot' },
  { path: '/maintenance', icon: <HiOutlineCog />, label: 'Maintenance' },
  { path: '/compliance', icon: <HiOutlineShieldCheck />, label: 'Compliance' },
  { path: '/lessons', icon: <HiOutlineLightBulb />, label: 'Lessons' },
];

export default function Navbar({ theme, toggleTheme }) {
  return (
    <nav className="top-navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="navbar-brand-icon">IP</div>
          <span className="navbar-brand-text">IntelliPlant</span>
        </div>
        <div className="navbar-links">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span className="icon">{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="navbar-right">
        <button className="theme-toggle btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>
      </div>
    </nav>
  );
}
