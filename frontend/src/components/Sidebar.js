import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, Layers, Terminal, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/batch', label: 'Batch', icon: Layers },
  { to: '/logs', label: 'Logs', icon: Terminal },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'IC';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">IC</div>
        <div className="logo-text">
          <h2>IntelliCore</h2>
          <p>Smart File Analytics</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-badge">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user.name || 'User'}</div>
              <div className="user-phone">{user.phone}</div>
            </div>
          </div>
        )}
        <button className="sign-out" onClick={toggle} style={{ marginTop: 4 }}>
          {dark ? <Sun size={14} /> : <Moon size={14} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="sign-out" onClick={handleLogout}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
