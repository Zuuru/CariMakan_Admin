'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Coins, 
  Percent, 
  LogOut,
  Moon,
  Sun,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User', icon: Users },
    { id: 'restaurants', label: 'Restoran', icon: Store },
    { id: 'financial', label: 'Finansial', icon: Coins },
    { id: 'promos', label: 'Promo', icon: Percent },
  ];

  return (
    <div 
      className="animate-slide-in"
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-layout)', // unified background!
        borderRight: 'none', // border removed!
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        padding: '24px 20px',
        justifyContent: 'space-between',
        zIndex: 50,
        transition: 'background-color 0.3s ease',
      }}
    >
      <div>
        {/* Logo / Brand */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '36px',
            padding: '0 8px',
          }}
        >
          {/* Circular/Square White CariMakan Logo Frame */}
          <div 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.02)',
              overflow: 'hidden',
            }}
          >
            <img 
              src="/images/icon_carimakan.png" 
              alt="CariMakan Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div>
            <h1 
              style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: '22px',
                fontWeight: '800',
                letterSpacing: '-0.5px',
                color: 'var(--text-primary)',
              }}
            >
              CariMakan
            </h1>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--bg-card)' : 'transparent', // pure white capsule!
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', // black text for active!
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  fontWeight: isActive ? '700' : '600',
                  fontFamily: 'var(--font-outfit)',
                  fontSize: '15px',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={19} style={{ transition: 'transform 0.2s', color: isActive ? 'var(--text-primary)' : 'inherit' }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-outfit)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {theme === 'light' ? (
            <>
              <Moon size={16} />
              <span>Mode Gelap</span>
            </>
          ) : (
            <>
              <Sun size={16} />
              <span>Mode Terang</span>
            </>
          )}
        </button>

        {/* Log Out */}
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#FF5252',
            cursor: 'pointer',
            fontWeight: '500',
            fontFamily: 'var(--font-outfit)',
            fontSize: '15px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 82, 82, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={19} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}
