'use client';

import React from 'react';
import { Search, UserCheck, UserX, Award, Star, Mail, Phone, Calendar, Edit2, Trash2, Plus, Lock, Eye, EyeOff } from 'lucide-react';
import UserModal from './UserModal';

interface UserData {
  uid: string;
  nama: string;
  email: string;
  phone: string;
  url_whatsapp: string;
  role: 'customer' | 'owner' | 'admin';
  poin_reward: number;
  status: 'aktif' | 'suspend';
  password?: string;
  foto_url?: string;
  fcm_token?: string;
  created_at: string;
}

interface UsersTabProps {
  searchQuery: string;
}

export default function UsersTab({ searchQuery }: UsersTabProps) {
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserData | null>(null);
  const [visiblePasswords, setVisiblePasswords] = React.useState<Set<string>>(new Set());

  const togglePasswordVisibility = (uid: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };
  
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { fetchUsers } = await import('@/app/actions');
      const res = await fetchUsers();
      if (res.success && res.data) {
        const formatted = res.data.map((u: any) => ({
          uid: u.id,
          nama: u.nama || 'Tanpa Nama',
          email: u.email || '-',
          phone: u.url_whatsapp || u.phone || '-',
          url_whatsapp: u.url_whatsapp || u.phone || '',
          role: u.role,
          poin_reward: u.poin_reward || 0,
          status: u.status || 'aktif',
          password: u.password || '',
          foto_url: u.foto_url || '',
          fcm_token: u.fcm_token || '',
          created_at: u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-',
        }));
        setUsers(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const [roleFilter, setRoleFilter] = React.useState<'semua' | 'customer' | 'owner' | 'admin'>('semua');

  const handleToggleStatus = async (uid: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'aktif' ? 'suspend' : 'aktif';
      const { updateUser } = await import('@/app/actions');
      const res = await updateUser(uid, { status: newStatus });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.uid === uid) {
              return { ...u, status: newStatus as 'aktif' | 'suspend' };
            }
            return u;
          })
        );
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      const { deleteUser } = await import('@/app/actions');
      const res = await deleteUser(uid);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.uid !== uid));
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserData) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: any) => {
    try {
      if (editingUser) {
        const { updateUser } = await import('@/app/actions');
        // Only update password if it's provided
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        const res = await updateUser(editingUser.uid, updateData);
        if (res.success) {
          loadData();
          setIsModalOpen(false);
        } else {
          alert(`Gagal memperbarui user: ${res.error}`);
        }
      } else {
        const { createUser } = await import('@/app/actions');
        const res = await createUser(formData);
        if (res.success) {
          loadData();
          setIsModalOpen(false);
        } else {
          alert(`Gagal membuat user: ${res.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Terjadi kesalahan tak terduga saat menyimpan user.');
    }
  };

  // Filter users based on query and role tabs
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'semua' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'aktif').length;
  const suspendedUsers = users.filter((u) => u.status === 'suspend').length;
  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  const totalOwners = users.filter((u) => u.role === 'owner').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '32px 32px 32px 32px' }}>
      
      {/* Overview Cards specifically for Users management */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="premium-widget" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Total Pengguna</span>
            <h4 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', marginTop: '4px' }}>{totalUsers}</h4>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50px', backgroundColor: 'rgba(73, 11, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-purple)' }}>
            <Award size={20} />
          </div>
        </div>

        <div className="premium-widget" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Total Customer</span>
            <h4 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', marginTop: '4px' }}>{totalCustomers}</h4>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50px', backgroundColor: 'rgba(214, 17, 86, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-magenta)' }}>
            <Award size={20} />
          </div>
        </div>

        <div className="premium-widget" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Total Owner Resto</span>
            <h4 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', marginTop: '4px' }}>{totalOwners}</h4>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50px', backgroundColor: 'rgba(255, 184, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-yellow)' }}>
            <Award size={20} />
          </div>
        </div>

        <div className="premium-widget" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Status Aktif / Suspend</span>
            <h4 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', marginTop: '6px' }}>
              <span style={{ color: '#10B981' }}>{activeUsers} A</span> / <span style={{ color: '#EF4444' }}>{suspendedUsers} S</span>
            </h4>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <UserCheck size={20} />
          </div>
        </div>
      </div>

      {/* Main Content card */}
      <div
        className="premium-widget"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '28px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Title, Filters Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
              Manajemen Pengguna Platform
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Moderasi status akun, hak akses role, dan monitoring data reward poin.
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-layout)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
              {(['semua', 'customer', 'owner', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: roleFilter === role ? '700' : '500',
                    cursor: 'pointer',
                    backgroundColor: roleFilter === role ? 'var(--color-purple)' : 'transparent',
                    color: roleFilter === role ? '#FFFFFF' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-outfit)',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s',
                  }}
                >
                  {role}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenAddModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'var(--font-outfit)',
              }}
            >
              <Plus size={16} /> Tambah User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Hubungi</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Password</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Poin Reward</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase', textAlign: 'center' }}>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr>
                   <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                     Memuat data pengguna...
                   </td>
                 </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.uid}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-layout)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* User Info */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>{user.nama}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-purple)', fontFamily: 'var(--font-outfit)' }}>UID: {user.uid}</span>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {user.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {user.phone}</span>
                      </div>
                    </td>

                    {/* Password Field */}
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={14} />
                        <span style={{ fontFamily: 'monospace', letterSpacing: visiblePasswords.has(user.uid) ? 'normal' : '2px' }}>
                          {user.password
                            ? (visiblePasswords.has(user.uid) ? user.password : '••••••••')
                            : <span style={{ color: 'var(--text-muted)', fontFamily: 'inherit', letterSpacing: 'normal' }}>Tidak tersimpan</span>
                          }
                        </span>
                        {user.password && (
                          <button
                            onClick={() => togglePasswordVisibility(user.uid)}
                            title={visiblePasswords.has(user.uid) ? 'Sembunyikan password' : 'Lihat password'}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              display: 'inline-flex',
                              padding: '2px',
                            }}
                          >
                            {visiblePasswords.has(user.uid) ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td style={{ padding: '16px', fontSize: '13px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontWeight: '600',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          backgroundColor:
                            user.role === 'admin'
                              ? 'rgba(73, 11, 255, 0.1)'
                              : user.role === 'owner'
                              ? 'rgba(255, 184, 0, 0.1)'
                              : 'rgba(214, 17, 86, 0.1)',
                          color:
                            user.role === 'admin'
                              ? 'var(--color-purple)'
                              : user.role === 'owner'
                              ? '#D97706'
                              : 'var(--color-magenta)',
                          fontFamily: 'var(--font-outfit)',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Poin Reward */}
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', fontFamily: 'var(--font-outfit)' }}>
                      {user.role === 'customer' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-yellow)' }}>
                          <Star size={14} fill="currentColor" /> {user.poin_reward} Pts
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '16px' }}>
                      {user.status === 'aktif' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10B981', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' }}>
                          Aktif
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#EF4444', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '3px 8px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' }}>
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(user.uid, user.status)}
                            title={user.status === 'aktif' ? 'Suspend' : 'Aktifkan'}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: user.status === 'aktif' ? '#EF4444' : '#10B981',
                              cursor: 'pointer',
                              display: 'inline-flex',
                            }}
                          >
                            {user.status === 'aktif' ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          title="Edit"
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--color-purple)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                          }}
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(user.uid)}
                          title="Delete"
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: '#EF4444',
                            cursor: 'pointer',
                            display: 'inline-flex',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingUser}
      />
    </div>
  );
}
