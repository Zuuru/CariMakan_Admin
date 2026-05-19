'use client';

import React from 'react';
import { Search, Check, X, ShieldAlert, Store, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import RestoDetailPage from './RestoDetailPage';

interface RestoDetail {
  id: string;
  nama: string;
  ownerName: string;
  ownerEmail: string;
  lat: number;
  lng: number;
  jam_buka: string;
  status: 'pending' | 'aktif' | 'suspend';
  url_whatsapp: string;
  avg_rating: number;
  total_review: number;
  created_at: string;
  badges: string[];
}

interface RestosTabProps {
  searchQuery: string;
}

export default function RestosTab({ searchQuery }: RestosTabProps) {
  const [restos, setRestos] = React.useState<RestoDetail[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRestoId, setSelectedRestoId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    async function loadData() {
      try {
        const { fetchRestaurants } = await import('@/app/actions');
        const res = await fetchRestaurants();
        if (res.success && res.data) {
          const formatted = res.data.map((r: any) => ({
            id: r.id,
            nama: r.nama || 'Tanpa Nama',
            ownerName: r.ownerName,
            ownerEmail: r.ownerEmail,
            lat: r.lokasi ? r.lokasi._latitude : 0,
            lng: r.lokasi ? r.lokasi._longitude : 0,
            jam_buka: r.jam_buka || '-',
            status: r.status || 'pending',
            url_whatsapp: r.url_whatsapp || '-',
            avg_rating: r.avg_rating || 0,
            total_review: r.total_review || 0,
            created_at: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-',
            badges: r.badges || [], // We might need to fetch resto_badges separately but we can mock for now
          }));
          setRestos(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const [statusFilter, setStatusFilter] = React.useState<'semua' | 'pending' | 'aktif' | 'suspend'>('semua');

  const handleVerify = (id: string, action: 'approve' | 'reject') => {
    setRestos((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, status: action === 'approve' ? 'aktif' : 'suspend' };
        }
        return r;
      })
    );
  };

  const handleToggleSuspend = (id: string) => {
    setRestos((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, status: r.status === 'aktif' ? 'suspend' : 'aktif' };
        }
        return r;
      })
    );
  };

  const filteredRestos = restos.filter((r) => {
    const matchesSearch =
      r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'semua' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingRestos = restos.filter((r) => r.status === 'pending');
  const activeCount = restos.filter((r) => r.status === 'aktif').length;
  const suspendCount = restos.filter((r) => r.status === 'suspend').length;

  if (selectedRestoId) {
    return <RestoDetailPage restoId={selectedRestoId} onBack={() => setSelectedRestoId(null)} />;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '32px 32px 32px 32px' }}>
      
      {/* Pending Verifications Cards Row */}
      {pendingRestos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#B45309', fontFamily: 'var(--font-outfit)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={18} /> Butuh Verifikasi Segera ({pendingRestos.length} Restoran)
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {pendingRestos.map((resto) => (
              <div
                key={resto.id}
                className="premium-widget"
                style={{
                  backgroundColor: '#FFFDF5',
                  border: '1px solid #FCD34D',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-purple)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-outfit)' }}>{resto.id}</span>
                    <h5 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', marginTop: '2px' }}>{resto.nama}</h5>
                  </div>
                  <span style={{ fontSize: '10px', color: '#B45309', backgroundColor: '#FEF3C7', padding: '4px 8px', borderRadius: '50px', fontWeight: '600' }}>PENDING</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={14} /> Jam Buka: {resto.jam_buka}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} /> Koordinat: {resto.lat}, {resto.lng}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> WhatsApp: {resto.url_whatsapp}</span>
                  <div style={{ borderTop: '1px solid #FCD34D', paddingTop: '8px', marginTop: '4px', fontSize: '12px' }}>
                    <span style={{ fontWeight: '600', display: 'block', color: 'var(--text-primary)' }}>Data Owner:</span>
                    <span>{resto.ownerName} ({resto.ownerEmail})</span>
                  </div>
                </div>

                {/* Badges preview */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {resto.badges.map((b) => (
                    <span key={b} style={{ fontSize: '11px', backgroundColor: 'rgba(251,191,36,0.15)', color: '#B45309', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                      {b}
                    </span>
                  ))}
                </div>

                {/* Approve/Reject Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    onClick={() => handleVerify(resto.id, 'approve')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#10B981',
                      border: 'none',
                      color: '#FFF',
                      fontWeight: '600',
                      fontSize: '13px',
                      fontFamily: 'var(--font-outfit)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
                  >
                    <Check size={16} /> Setujui Resto
                  </button>
                  <button
                    onClick={() => handleVerify(resto.id, 'reject')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'transparent',
                      border: '1px solid #EF4444',
                      color: '#EF4444',
                      fontWeight: '600',
                      fontSize: '13px',
                      fontFamily: 'var(--font-outfit)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EF4444';
                      e.currentTarget.style.color = '#FFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#EF4444';
                    }}
                  >
                    <X size={16} /> Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main interactive Table Card */}
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
        {/* Title & Filter pill bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
              Daftar Seluruh Restoran Mitra
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Total Resto Aktif: <strong style={{ color: '#10B981' }}>{activeCount}</strong> | Suspended: <strong style={{ color: '#EF4444' }}>{suspendCount}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-layout)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            {(['semua', 'aktif', 'pending', 'suspend'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: statusFilter === status ? '700' : '500',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === status ? 'var(--color-purple)' : 'transparent',
                  color: statusFilter === status ? '#FFFFFF' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-outfit)',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>ID Resto</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Nama Restoran</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Owner Details</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Jam Kerja</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Fasilitas / Badges</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Rating</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase', textAlign: 'center' }}>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestos.length > 0 ? (
                filteredRestos.map((resto) => (
                  <tr
                    key={resto.id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-layout)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* ID */}
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: 'var(--color-purple)', fontFamily: 'var(--font-outfit)' }}>
                      {resto.id}
                    </td>

                    {/* Name */}
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Store size={16} style={{ color: 'var(--text-secondary)' }} />
                        {resto.nama}
                      </div>
                    </td>

                    {/* Owner */}
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{resto.ownerName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>WA: {resto.url_whatsapp}</span>
                      </div>
                    </td>

                    {/* Jam Buka */}
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-outfit)' }}>
                      {resto.jam_buka}
                    </td>

                    {/* Badges list */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '180px' }}>
                        {resto.badges.map((b) => (
                          <span key={b} style={{ fontSize: '10px', backgroundColor: 'rgba(73, 11, 255, 0.08)', color: 'var(--color-purple)', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Rating cache */}
                    <td style={{ padding: '16px', fontSize: '13px', fontFamily: 'var(--font-outfit)' }}>
                      {resto.total_review > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '700', color: 'var(--color-yellow)' }}>★ {resto.avg_rating.toFixed(1)}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{resto.total_review} Ulasan</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Belum ada</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '16px' }}>
                      {resto.status === 'aktif' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10B981', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '50px', fontSize: '11px', fontWeight: '600' }}>
                          Aktif
                        </span>
                      )}
                      {resto.status === 'pending' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#F59E0B', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '3px 8px', borderRadius: '50px', fontSize: '11px', fontWeight: '600' }}>
                          Pending
                        </span>
                      )}
                      {resto.status === 'suspend' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#EF4444', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '3px 8px', borderRadius: '50px', fontSize: '11px', fontWeight: '600' }}>
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* Detail Button */}
                        <button
                          onClick={() => setSelectedRestoId(resto.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--color-purple)',
                            border: 'none',
                            color: '#FFF',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-outfit)',
                          }}
                        >
                          Detail
                        </button>
                        {resto.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleVerify(resto.id, 'approve')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#10B981',
                                border: 'none',
                                color: '#FFF',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleVerify(resto.id, 'reject')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'transparent',
                                border: '1px solid #EF4444',
                                color: '#EF4444',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Tolak
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleToggleSuspend(resto.id)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              border: '1px solid',
                              borderColor: resto.status === 'aktif' ? '#EF4444' : '#10B981',
                              backgroundColor: 'transparent',
                              color: resto.status === 'aktif' ? '#EF4444' : '#10B981',
                              fontSize: '11px',
                              fontWeight: '600',
                              fontFamily: 'var(--font-outfit)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = resto.status === 'aktif' ? '#EF4444' : '#10B981';
                              e.currentTarget.style.color = '#FFFFFF';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = resto.status === 'aktif' ? '#EF4444' : '#10B981';
                            }}
                          >
                            {resto.status === 'aktif' ? 'Suspend' : 'Aktifkan'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada restoran ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
