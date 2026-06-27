'use client';

import React from 'react';
import { Calendar, Bell, ChevronDown, ChevronUp } from 'lucide-react';

interface HeaderProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onFilterClick?: () => void;
  onProfileClick?: () => void;
  isProfileOpen?: boolean;
  onNotificationClick?: () => void;
}

export default function Header({ searchQuery, setSearchQuery, onFilterClick, onProfileClick, isProfileOpen, onNotificationClick }: HeaderProps) {
  const [currentDate, setCurrentDate] = React.useState('29 Apr 2026');
  const [pendingRestos, setPendingRestos] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  React.useEffect(() => {
    const today = new Date();
    try {
      const formatted = today.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      setCurrentDate(formatted);
    } catch (e) {
      // fallback
    }

    // Fetch pending restaurants for notifications
    async function fetchPending() {
      try {
        const { fetchRestaurants } = await import('@/app/actions');
        const res = await fetchRestaurants();
        if (res.success && res.data) {
          const pending = res.data.filter((r: any) => r.status === 'pending');
          setPendingRestos(pending);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchPending();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      className="animate-fade-in"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        margin: '0 32px 0 32px',
        backgroundColor: 'var(--bg-card)',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        border: '1px solid var(--border-color)',
        borderTop: 'none',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Welcome Title and Subtitle */}
      <div>
        <h2 
          style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-outfit)',
            letterSpacing: '-0.3px',
            margin: 0,
          }}
        >
          Good Morning, Jett!!
        </h2>
        <p 
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginTop: '4px',
            margin: 0,
            fontFamily: 'var(--font-outfit)',
          }}
        >
          Kamu disini bisa ngeliat user app kamu ngapain aja
        </p>
      </div>

      {/* Action Controls: Calendar Date capsule, Bell, and Profile Avatar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Date Capsule Badge (Clean circle for icon + Date text next to it) */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-card)',
            padding: '5px 16px 5px 5px',
            borderRadius: '100px', // Pill Shape!
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Calendar Icon Container */}
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50px',
              backgroundColor: 'var(--bg-layout)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <Calendar size={16} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
            {currentDate}
          </span>
        </div>

        {/* Circular Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <Bell size={18} />
            {pendingRestos.length > 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-card)',
                }}
              >
                {pendingRestos.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                width: '320px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--border-color)',
                zIndex: 1000,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Notifikasi
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {pendingRestos.length > 0 ? (
                  pendingRestos.map((resto, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setShowNotifications(false);
                        if (onNotificationClick) onNotificationClick();
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-layout)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        Request Menjadi Restoran
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {resto.ownerName} mendaftar restoran "{resto.nama}".
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Tidak ada notifikasi baru.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Circular Profile Avatar J with dropdown arrow */}
        <div 
          onClick={onProfileClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          {/* Avatar frame */}
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50px',
              border: '1.5px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F3F0FF',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              position: 'relative',
            }}
          >
            {/* Mock picture of a woman using a high-quality stylized placeholder */}
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" 
              alt="Profile" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          {/* Dropdown Chevron */}
          {isProfileOpen ? (
            <ChevronUp size={16} style={{ color: 'var(--text-primary)' }} />
          ) : (
            <ChevronDown size={16} style={{ color: 'var(--text-primary)' }} />
          )}
        </div>
      </div>
    </header>
  );
}
