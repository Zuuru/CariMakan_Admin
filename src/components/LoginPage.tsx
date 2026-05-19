'use client';

import React from 'react';
import { Mail, Lock, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = React.useState('admin@carimakan.app');
  const [password, setPassword] = React.useState('password123');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Harap isi semua bidang!');
      return;
    }
    setError('');
    setIsLoading(true);
    
    try {
      const { verifyAdminLogin } = await import('@/app/actions');
      const res = await verifyAdminLogin(email, password);
      
      if (res.success && res.data) {
        // Save user detail to localStorage optionally, but at least trigger login state
        localStorage.setItem('adminName', res.data.nama);
        onLogin();
      } else {
        setError(res.error || 'Login gagal.');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#EFECE7', // Exact soft cream/grey background color from mockup
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-outfit), sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Huge bottom-left orange crescent/circle decorative shape */}
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          backgroundColor: '#CA4915', // CariMakan/Foodle brand deep orange
          zIndex: 1,
          opacity: 0.95,
          transition: 'all 0.5s ease',
        }}
      />

      {/* Medium orange circle behind the top-right of the login card */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '32%',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          backgroundColor: '#CA4915',
          zIndex: 1,
          opacity: 0.95,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Abstract white circle nested inside to mimic the design precisely */}
        <div 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '8px solid #EFECE7',
          }}
        />
      </div>

      {/* Main Container wrapping Left Form Card & Right Burger Graphic */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1200px',
          zIndex: 10,
          gap: '40px',
        }}
      >
        {/* Left Side: Premium Login Card */}
        <div
          className="animate-fade-in"
          style={{
            flex: '0 0 450px',
            backgroundColor: '#FFFFFF',
            borderRadius: '40px', // Very large rounded corners
            padding: '50px 48px',
            boxShadow: '0 20px 50px rgba(26, 26, 29, 0.06)',
            border: '3px dashed #CA4915', // Dashed orange border from the mockup
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 5,
            width: '100%',
            maxWidth: '450px',
            animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Logo Brand Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <img 
              src="/images/icon_carimakan.png" 
              alt="Foodle Logo"
              style={{
                width: '180px',
                height: 'auto',
                objectFit: 'contain',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#1A1A1D',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Login
            </h1>
            <span
              style={{
                fontSize: '24px',
                fontWeight: '300',
                color: '#707070',
                display: 'block',
                marginTop: '4px',
              }}
            >
              in as Admin
            </span>
          </div>

          {/* Error Message Box */}
          {error && (
            <div
              style={{
                width: '100%',
                backgroundColor: '#FFF2F2',
                border: '1px solid #FFCDD2',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
                color: '#D32F2F',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email Field */}
            <div style={{ position: 'relative', width: '100%' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#CA4915',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Enter Email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px 16px 54px',
                  borderRadius: '25px', // Pill shaped inputs
                  border: 'none',
                  backgroundColor: '#FFF5F2', // Soft peach/orange tint background
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#1A1A1D',
                  outline: 'none',
                  fontFamily: 'var(--font-outfit), sans-serif',
                  transition: 'all 0.3s ease',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.01)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFEFEA';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(202, 73, 21, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFF5F2';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ position: 'relative', width: '100%' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#CA4915',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px 16px 54px',
                  borderRadius: '25px', // Pill shaped
                  border: 'none',
                  backgroundColor: '#FFF5F2', // Soft peach/orange background
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#1A1A1D',
                  outline: 'none',
                  fontFamily: 'var(--font-outfit), sans-serif',
                  transition: 'all 0.3s ease',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.01)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFEFEA';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(202, 73, 21, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFF5F2';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Helper Credentials Tip */}
            <div 
              style={{
                fontSize: '12px',
                color: '#8C8C8C',
                textAlign: 'center',
                marginTop: '4px',
                backgroundColor: 'rgba(202, 73, 21, 0.04)',
                padding: '8px',
                borderRadius: '12px',
                border: '1px dashed rgba(202, 73, 21, 0.15)',
              }}
            >
              🔒 Terkoneksi dengan <strong>Firestore Database</strong>. Hanya akun Role Admin yang diizinkan.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '25px', // Pill shaped button
                border: 'none',
                backgroundColor: '#CA4915', // Solid orange color
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '10px',
                boxShadow: '0 6px 20px rgba(202, 73, 21, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#E05319';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(202, 73, 21, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#CA4915';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(202, 73, 21, 0.3)';
                }
              }}
            >
              {isLoading ? (
                <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Gigantic delicious burger graphic */}
        <div
          className="animate-fade-in"
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            animation: 'burgerBounce 6s ease-in-out infinite',
          }}
        >
          {/* Main Burger Image Element */}
          <img
            src="/images/burger.png"
            alt="Foodle Splash Burger"
            style={{
              width: '100%',
              maxWidth: '650px',
              height: 'auto',
              objectFit: 'contain',
              zIndex: 3,
              filter: 'drop-shadow(0 20px 40px rgba(26, 26, 29, 0.12))',
            }}
          />

          {/* Subtle background glow effect behind the burger */}
          <div
            style={{
              position: 'absolute',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(202, 73, 21, 0.12) 0%, rgba(255,255,255,0) 70%)',
              zIndex: 1,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      </div>

      {/* Embedded CSS for custom keyframe animations */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes burgerBounce {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(1.5deg);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Layout Settings */
        @media (max-width: 1024px) {
          img[alt="Foodle Splash Burger"] {
            max-width: 450px !important;
          }
        }
        
        @media (max-width: 900px) {
          div[style*="justify-content: space-between"] {
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 50px !important;
          }
          div[style*="flex: 0 0 450px"] {
            flex: 1 1 auto !important;
          }
          img[alt="Foodle Splash Burger"] {
            max-width: 350px !important;
          }
        }
      `}</style>
    </div>
  );
}
