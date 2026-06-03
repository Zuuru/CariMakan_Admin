'use client';

import React from 'react';
import { Search, Plus, Ticket, Calendar, ToggleLeft, ToggleRight, Check, Trash2, Percent, DollarSign, Users } from 'lucide-react';

interface PromoVoucher {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  nilai_diskon: number;
  is_percent: boolean;
  mulai: string;
  berakhir: string;
  is_active: boolean;
  scope: 'global' | 'restoran';
  targetResto?: string;
}

export default function PromosTab() {
  const [promos, setPromos] = React.useState<PromoVoucher[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const { fetchPromos } = await import('@/app/actions');
        const res = await fetchPromos();
        if (res.success && res.data) {
          const formatted = res.data.map((p: any) => ({
            id: p.id,
            kode: p.kode || '',
            nama: p.nama || '',
            deskripsi: p.deskripsi || '',
            nilai_diskon: p.nilai_diskon || 0,
            is_percent: p.is_percent || false,
            mulai: p.mulai ? new Date(p.mulai).toISOString().split('T')[0] : '',
            berakhir: p.berakhir ? new Date(p.berakhir).toISOString().split('T')[0] : '',
            is_active: p.is_active !== undefined ? p.is_active : true,
            scope: (p.resto_id ? 'restoran' : 'global') as 'global' | 'restoran',
            targetResto: p.resto_id || undefined,
          }));
          setPromos(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Form State
  const [formKode, setFormKode] = React.useState('');
  const [formNama, setFormNama] = React.useState('');
  const [formDeskripsi, setFormDeskripsi] = React.useState('');
  const [formNilai, setFormNilai] = React.useState(0);
  const [formIsPercent, setFormIsPercent] = React.useState(true);
  const [formMulai, setFormMulai] = React.useState('');
  const [formBerakhir, setFormBerakhir] = React.useState('');
  const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);

  const handleToggleActive = async (id: string) => {
    try {
      const promo = promos.find((p) => p.id === id);
      if (!promo) return;
      const newActive = !promo.is_active;
      const { updatePromo } = await import('@/app/actions');
      const res = await updatePromo(id, { is_active: newActive });
      if (res.success) {
        setPromos((prev) =>
          prev.map((p) => {
            if (p.id === id) {
              return { ...p, is_active: newActive };
            }
            return p;
          })
        );
      } else {
        alert('Gagal mengubah status promo: ' + res.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengubah status promo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus voucher ini?')) return;
    try {
      const { deletePromo } = await import('@/app/actions');
      const res = await deletePromo(id);
      if (res.success) {
        setPromos((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert('Gagal menghapus voucher: ' + res.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus voucher');
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKode || !formNama || !formNilai || !formMulai || !formBerakhir) return;

    try {
      const { createPromo } = await import('@/app/actions');
      const promoData = {
        kode: formKode.toUpperCase().replace(/\s+/g, ''),
        nama: formNama,
        deskripsi: formDeskripsi || 'Promo global CariMakan',
        nilai_diskon: Number(formNilai),
        is_percent: formIsPercent,
        mulai: formMulai,
        berakhir: formBerakhir,
        is_active: true,
      };
      
      const res = await createPromo(promoData);
      if (res.success && res.id) {
        const newPromo: PromoVoucher = {
          id: res.id,
          ...promoData,
          scope: 'global',
        };
        setPromos((prev) => [newPromo, ...prev]);

        // Reset Form
        setFormKode('');
        setFormNama('');
        setFormDeskripsi('');
        setFormNilai(0);
        setFormMulai('');
        setFormBerakhir('');

        // Success Alert
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      } else {
        alert('Gagal menambahkan voucher: ' + res.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menambahkan voucher');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', padding: '32px 32px 32px 32px', alignItems: 'start' }}>
      
      {/* Left Column: Promo list table */}
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
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
            Daftar Promo & Voucher Aktif
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Daftar semua voucher platform baik promo global (dibuat Admin) maupun promo lokal (dibuat Owner).
          </span>
        </div>

        {/* Promo Code list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {promos.map((promo) => (
            <div
              key={promo.id}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: promo.is_active ? 'var(--bg-card)' : 'var(--bg-layout)',
                opacity: promo.is_active ? 1 : 0.75,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {/* Visual Ticket Icon */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: promo.is_active ? 'rgba(73, 11, 255, 0.1)' : '#EBECEF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: promo.is_active ? 'var(--color-purple)' : 'var(--text-muted)',
                  }}
                >
                  <Ticket size={24} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-outfit)',
                        fontWeight: '700',
                        fontSize: '16px',
                        color: 'var(--text-primary)',
                        letterSpacing: '0.5px',
                        backgroundColor: '#F0F1F4',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {promo.kode}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: promo.scope === 'global' ? 'rgba(96,240,170,0.15)' : 'rgba(255,184,0,0.15)',
                        color: promo.scope === 'global' ? '#11683E' : '#B45309',
                      }}
                    >
                      {promo.scope === 'global' ? 'Global' : `Resto: ${promo.targetResto}`}
                    </span>
                  </div>
                  <h5 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '6px' }}>{promo.nama}</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{promo.deskripsi}</p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {promo.mulai} s/d {promo.berakhir}</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-purple)' }}>
                      Diskon: {promo.is_percent ? `${promo.nilai_diskon}%` : `Rp ${promo.nilai_diskon.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Toggle switch */}
                <button
                  onClick={() => handleToggleActive(promo.id)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: promo.is_active ? 'var(--color-mint)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  title={promo.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  {promo.is_active ? <ToggleRight size={38} style={{ color: '#10B981' }} /> : <ToggleLeft size={38} />}
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(promo.id)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    borderRadius: '50px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Hapus Voucher"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Form to create new promo */}
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
          gap: '20px',
          position: 'sticky',
          top: '24px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
            Buat Voucher Baru
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Tambahkan voucher diskon baru berskala global.
          </span>
        </div>

        {showSuccessAlert && (
          <div
            className="animate-fade-in"
            style={{
              padding: '12px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #10B981',
              color: '#065F46',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Check size={16} /> Promo berhasil ditambahkan!
          </div>
        )}

        <form onSubmit={handleCreatePromo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Kode Promo *</label>
            <input
              type="text"
              placeholder="CONTOH: DISKONBARU"
              value={formKode}
              onChange={(e) => setFormKode(e.target.value)}
              required
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                outline: 'none',
                textTransform: 'uppercase',
                backgroundColor: 'var(--bg-layout)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Nama Voucher *</label>
            <input
              type="text"
              placeholder="Nama display voucher..."
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              required
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'var(--bg-layout)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Deskripsi *</label>
            <textarea
              placeholder="Tulis detail diskon voucher..."
              value={formDeskripsi}
              onChange={(e) => setFormDeskripsi(e.target.value)}
              rows={3}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                backgroundColor: 'var(--bg-layout)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Discount type toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Tipe & Nilai Diskon *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setFormIsPercent(true)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: formIsPercent ? 'var(--color-purple)' : 'var(--border-color)',
                  backgroundColor: formIsPercent ? 'rgba(73, 11, 255, 0.08)' : 'transparent',
                  color: formIsPercent ? 'var(--color-purple)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Percent size={14} /> Persentase (%)
              </button>
              <button
                type="button"
                onClick={() => setFormIsPercent(false)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: !formIsPercent ? 'var(--color-purple)' : 'var(--border-color)',
                  backgroundColor: !formIsPercent ? 'rgba(73, 11, 255, 0.08)' : 'transparent',
                  color: !formIsPercent ? 'var(--color-purple)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <DollarSign size={14} /> Nominal Tetap
              </button>
            </div>
            
            <input
              type="number"
              placeholder={formIsPercent ? "Nilai diskon (contoh: 10 untuk 10%)" : "Nilai diskon rupiah (contoh: 10000)"}
              value={formNilai || ''}
              onChange={(e) => setFormNilai(Number(e.target.value))}
              required
              min={1}
              max={formIsPercent ? 100 : 1000000}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'var(--bg-layout)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>Mulai Berlaku *</label>
              <input
                type="date"
                value={formMulai}
                onChange={(e) => setFormMulai(e.target.value)}
                required
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  outline: 'none',
                  backgroundColor: 'var(--bg-layout)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>Berakhir Pada *</label>
              <input
                type="date"
                value={formBerakhir}
                onChange={(e) => setFormBerakhir(e.target.value)}
                required
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  outline: 'none',
                  backgroundColor: 'var(--bg-layout)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-purple)',
              color: '#FFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '14px',
              fontFamily: 'var(--font-outfit)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 10px rgba(73,11,255,0.2)',
              marginTop: '10px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3800D6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-purple)'}
          >
            <Plus size={18} /> Simpan Voucher
          </button>
        </form>
      </div>
    </div>
  );
}
