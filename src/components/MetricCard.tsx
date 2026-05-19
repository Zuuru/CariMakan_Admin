'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  index: number;
}

export default function MetricCard({ label, value, icon: Icon, gradient, iconColor, index }: MetricCardProps) {
  return (
    <div
      className="animate-fade-in"
      style={{
        background: gradient,
        borderRadius: '20px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'row', // Icon on the left!
        alignItems: 'center',
        gap: '16px',
        color: '#FFFFFF',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        animationDelay: `${index * 100}ms`,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.02)';
      }}
    >
      {/* Decorative background blur shapes */}
      <div 
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          filter: 'blur(10px)',
          pointerEvents: 'none',
        }}
      />

      {/* Circular Icon Badge on the Left */}
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <Icon size={20} style={{ color: iconColor }} />
      </div>

      {/* Text Info on the Right */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 2 }}>
        <span 
          style={{ 
            fontSize: '13px', 
            fontWeight: '400', 
            opacity: 0.9,
            fontFamily: 'var(--font-outfit)',
            letterSpacing: '0.2px',
          }}
        >
          {label}
        </span>
        <span 
          style={{ 
            fontSize: '28px', 
            fontWeight: '800',
            fontFamily: 'var(--font-outfit)',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
