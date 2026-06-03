'use client';

import React from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function UserModal({ isOpen, onClose, onSubmit, initialData }: UserModalProps) {
  const [formData, setFormData] = React.useState({
    nama: '',
    email: '',
    url_whatsapp: '',
    password: '',
    role: 'customer',
    poin_reward: 0,
    status: 'aktif',
    foto_url: '',
    fcm_token: '',
  });
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama || '',
        email: initialData.email || '',
        url_whatsapp: initialData.url_whatsapp || initialData.phone || '',
        password: initialData.password || '',
        role: initialData.role || 'customer',
        poin_reward: initialData.poin_reward || 0,
        status: initialData.status || 'aktif',
        foto_url: initialData.foto_url || '',
        fcm_token: initialData.fcm_token || '',
      });
    } else {
      setFormData({
        nama: '',
        email: '',
        url_whatsapp: '',
        password: '',
        role: 'customer',
        poin_reward: 0,
        status: 'aktif',
        foto_url: '',
        fcm_token: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{initialData ? 'Edit User' : 'Tambah User'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Role</label>
            <select 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-layout)', color: 'var(--text-primary)' }}
            >
              <option value="customer">Customer</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Nama Lengkap</label>
            <input 
              type="text" 
              required
              value={formData.nama}
              onChange={e => setFormData({...formData, nama: e.target.value})}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-layout)', color: 'var(--text-primary)' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-layout)', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>No. WhatsApp / Telepon</label>
            <input 
              type="text" 
              value={formData.url_whatsapp}
              onChange={e => setFormData({...formData, url_whatsapp: e.target.value})}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-layout)', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                required={!initialData}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder={initialData ? "Biarkan kosong jika tidak ingin mengubah password" : "Password user"}
                style={{ padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-layout)', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', display: 'inline-flex', padding: '2px',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Foto Profile (URL)</label>
            <input 
              type="url" 
              value={formData.foto_url}
              onChange={e => setFormData({...formData, foto_url: e.target.value})}
              placeholder="https://..."
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-layout)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* FCM Token usually read-only or not modified manually, but visible */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>FCM Token (Device Push ID)</label>
            <input 
              type="text" 
              value={formData.fcm_token}
              onChange={e => setFormData({...formData, fcm_token: e.target.value})}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-layout)', color: 'var(--text-primary)' }}
            />
          </div>

          {formData.role === 'customer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Poin Reward (Khusus Customer)</label>
              <input 
                type="number" 
                value={formData.poin_reward}
                onChange={e => setFormData({...formData, poin_reward: Number(e.target.value)})}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-layout)', color: 'var(--text-primary)' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Status Akun</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-layout)', color: 'var(--text-primary)' }}
            >
              <option value="aktif">Aktif</option>
              <option value="suspend">Suspend</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}>
              Batal
            </button>
            <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-purple)', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
