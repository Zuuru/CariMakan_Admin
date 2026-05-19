'use client';

import React from 'react';
import { Calendar, Bell, ChevronDown, ChevronUp } from 'lucide-react';

interface HeaderProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onFilterClick?: () => void;
  onProfileClick?: () => void;
  isProfileOpen?: boolean;
}

export default function Header({ searchQuery, setSearchQuery, onFilterClick, onProfileClick, isProfileOpen }: HeaderProps) {
  const [currentDate, setCurrentDate] = React.useState('29 Apr 2026');

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
        <button 
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
        </button>

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
