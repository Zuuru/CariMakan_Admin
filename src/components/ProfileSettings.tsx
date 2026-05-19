'use client';

import React from 'react';
import { Camera, Key, Check } from 'lucide-react';

interface ProfileSettingsProps {
  isOpen: boolean;
}

export default function ProfileSettings({ isOpen }: ProfileSettingsProps) {
  const [fullName, setFullName] = React.useState('Jett Heartcliff');
  const [username, setUsername] = React.useState('admin');
  const [email, setEmail] = React.useState('admin@carimakan.id.');
  const [division, setDivision] = React.useState('Technical Informatics Engineering');
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div
      style={{
        maxHeight: isOpen ? '900px' : '0px',
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        width: '100%',
      }}
    >
      <main
        style={{
          padding: '20px 32px 32px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            padding: '40px 48px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
            width: '100%',
            maxWidth: '650px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
            position: 'relative',
          }}
        >
          {/* Header Title */}
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-outfit)',
              margin: 0,
              textAlign: 'center',
              letterSpacing: '-0.5px',
            }}
          >
            Pengaturan Akun
          </h2>

          {/* Centered Avatar Frame */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                border: '4px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                backgroundColor: 'var(--bg-layout)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
                alt="Profile Large"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            
            {/* Camera badge trigger */}
            <button
              type="button"
              style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Camera size={18} />
            </button>
          </div>

          {/* Form Fields */}
          <form
            onSubmit={handleSave}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Nama Lengkap */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-outfit)',
                  paddingLeft: '4px',
                }}
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: '600',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-purple)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-outfit)',
                  paddingLeft: '4px',
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: '600',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-purple)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-outfit)',
                  paddingLeft: '4px',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: '600',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-purple)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {/* Divisi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-outfit)',
                  paddingLeft: '4px',
                }}
              >
                Divisi
              </label>
              <input
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: '600',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-purple)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              {/* Change Password */}
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '50px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FF2E00 0%, #FFA800 100%)',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: '700',
                  fontFamily: 'var(--font-outfit)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(255, 46, 0, 0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Key size={16} /> Change Password
              </button>

              {/* Save Change */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '50px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #60F0AA 0%, #66B5FF 100%)',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: '700',
                  fontFamily: 'var(--font-outfit)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(96, 240, 170, 0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {saved ? <Check size={16} /> : null}
                {saved ? 'Changes Saved!' : 'Save Change'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
