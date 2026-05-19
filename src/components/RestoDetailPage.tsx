'use client';

import React from 'react';
import {
  ArrowLeft, Store, Star, ShoppingBag, TrendingUp, Clock, Phone, MapPin,
  Wifi, AirVent, ParkingSquare, Toilet, Baby, CigaretteOff, ShieldCheck,
  Utensils, CheckCircle, XCircle, ChevronRight, Users
} from 'lucide-react';

interface RestoDetailPageProps {
  restoId: string;
  onBack: () => void;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi size={12} />,
  ac: <AirVent size={12} />,
  parking: <ParkingSquare size={12} />,
  toilet: <Toilet size={12} />,
  child_friendly: <Baby size={12} />,
  no_smoking: <CigaretteOff size={12} />,
};

export default function RestoDetailPage({ restoId, onBack }: RestoDetailPageProps) {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeMenuTab, setActiveMenuTab] = React.useState<'semua' | 'tersedia' | 'habis'>('semua');

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { fetchRestoDetail } = await import('@/app/actions');
        const res = await fetchRestoDetail(restoId);
        if (res.success && res.data) setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [restoId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-purple)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-outfit)', fontSize: '14px' }}>Memuat data restoran...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-outfit)' }}>
        Restoran tidak ditemukan.
      </div>
    );
  }

  // Build SVG mini-chart for profit
  const chartData: { day: string; profit: number }[] = data.profitChartData || [];
  const maxProfit = Math.max(...chartData.map((d: any) => d.profit), 1);
  const chartW = 600;
  const chartH = 120;
  const padX = 10;
  const padY = 10;

  const points = chartData.map((d: any, i: number) => ({
    x: padX + (i * (chartW - 2 * padX)) / Math.max(chartData.length - 1, 1),
    y: chartH - padY - (d.profit / maxProfit) * (chartH - 2 * padY),
    day: d.day,
    profit: d.profit,
  }));

  const svgPath = points.length > 1
    ? points.reduce((acc, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = points[i - 1];
        const cpx1 = prev.x + (p.x - prev.x) / 3;
        const cpx2 = prev.x + (2 * (p.x - prev.x)) / 3;
        return acc + ` C ${cpx1} ${prev.y}, ${cpx2} ${p.y}, ${p.x} ${p.y}`;
      }, '')
    : '';
  const svgFill = svgPath
    ? `${svgPath} L ${points[points.length - 1].x} ${chartH - padY} L ${points[0].x} ${chartH - padY} Z`
    : '';

  // Filter menus
  const filteredMenus = (data.menus || []).filter((m: any) => {
    if (activeMenuTab === 'tersedia') return m.tersedia;
    if (activeMenuTab === 'habis') return !m.tersedia;
    return true;
  });

  // Review tag labels — use tag_id as display for now
  const reviewTagEntries = Object.entries(data.reviewTagCounts || {}) as [string, number][];
  const totalTagCount = reviewTagEntries.reduce((s, [, c]) => s + c, 0);

  const statusColor = data.status === 'aktif' ? '#10B981' : data.status === 'pending' ? '#F59E0B' : '#EF4444';
  const statusBg = data.status === 'aktif' ? '#ECFDF5' : data.status === 'pending' ? '#FFFBEB' : '#FEF2F2';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '32px' }}>
      {/* ─── Back + Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)',
            fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-outfit)', cursor: 'pointer',
            transition: 'all 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-purple)'; e.currentTarget.style.color = 'var(--color-purple)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <ArrowLeft size={14} /> Kembali
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #FF2E00, #FFA800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={24} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', margin: 0 }}>
                  {data.nama}
                </h2>
                <span style={{ fontSize: '11px', color: statusColor, backgroundColor: statusBg, padding: '3px 10px', borderRadius: '50px', fontWeight: '700', border: `1px solid ${statusColor}40` }}>
                  {data.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-outfit)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {data.jam_buka}</span>
                {data.lokasi && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {data.lokasi.lat.toFixed(4)}, {data.lokasi.lng.toFixed(4)}</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {data.url_whatsapp}</span>
                <span>Bergabung: {data.created_at}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          {data.badges?.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
              {data.badges.map((b: any) => (
                <span key={b.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', backgroundColor: 'rgba(73, 11, 255, 0.08)', color: 'var(--color-purple)', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', border: '1px solid rgba(73,11,255,0.15)' }}>
                  {BADGE_ICONS[b.icon] || <ShieldCheck size={12} />} {b.nama}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── KPI Cards Row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Profit Aplikasi', value: data.totalProfitFormatted, sub: '7% dari setiap transaksi', gradient: 'linear-gradient(135deg, #00D65A, #00F0FF)', icon: <TrendingUp size={20} color="#fff" /> },
          { label: 'Total Pendapatan Resto', value: data.totalRevenueFormatted, sub: 'Akumulasi harga semua order', gradient: 'linear-gradient(135deg, #FF2E00, #FFA800)', icon: <ShoppingBag size={20} color="#fff" /> },
          { label: 'Total Order', value: String(data.totalOrders), sub: 'Order selesai', gradient: 'linear-gradient(135deg, #490BFF, #00A3FF)', icon: <Store size={20} color="#fff" /> },
          { label: 'Rating', value: data.avg_rating > 0 ? `★ ${Number(data.avg_rating).toFixed(1)}` : 'Belum ada', sub: `${data.total_review} ulasan`, gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', icon: <Star size={20} color="#fff" /> },
        ].map((card, i) => (
          <div key={i} className="premium-widget" style={{
            backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
            padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-outfit)', fontWeight: '600' }}>{card.label}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', letterSpacing: '-0.5px' }}>{card.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Mini Profit Chart + Owner Info ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Profit Chart Card */}
        <div className="premium-widget" style={{
          backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
          padding: '24px', boxShadow: 'var(--shadow-sm)',
        }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', margin: '0 0 4px' }}>
            Tren Profit Harian (30 Hari)
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 20px', fontFamily: 'var(--font-outfit)' }}>
            Akumulasi 7% profit per hari dari restoran ini
          </p>

          {chartData.length > 0 ? (
            <div style={{ position: 'relative', width: '100%' }}>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D65A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00D65A" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map(v => {
                  const y = padY + v * (chartH - 2 * padY) / 3;
                  return <line key={v} x1={padX} y1={y} x2={chartW - padX} y2={y} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 6" opacity="0.5" />;
                })}
                {svgFill && <path d={svgFill} fill="url(#chartGrad)" />}
                {svgPath && <path d={svgPath} fill="none" stroke="#00D65A" strokeWidth="2.5" strokeLinecap="round" />}
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#00D65A" strokeWidth="2" />
                ))}
                {/* X Labels - only show a few */}
                {points.filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1).map((p, i) => (
                  <text key={i} x={p.x} y={chartH + 2} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-outfit)">{p.day}</text>
                ))}
              </svg>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Belum ada data transaksi untuk grafik ini.
            </div>
          )}
        </div>

        {/* Owner + Review Tags Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Owner Info */}
          <div className="premium-widget" style={{
            backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
            padding: '20px', boxShadow: 'var(--shadow-sm)',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} /> Informasi Owner
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nama</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{data.owner?.nama}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{data.owner?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>WhatsApp</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{data.owner?.url_whatsapp || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Owner ID</span>
                <span style={{ fontWeight: '600', color: 'var(--color-purple)', fontSize: '11px' }}>{data.owner?.id}</span>
              </div>
            </div>
          </div>

          {/* Review Tag Cloud */}
          <div className="premium-widget" style={{
            backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
            padding: '20px', boxShadow: 'var(--shadow-sm)', flex: 1,
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', margin: '0 0 14px' }}>
              Top Review Tags
            </h4>
            {reviewTagEntries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reviewTagEntries.sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tagId, count]) => {
                  const pct = totalTagCount > 0 ? Math.round((count / totalTagCount) * 100) : 0;
                  return (
                    <div key={tagId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-outfit)' }}>{tagId}</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-purple)' }}>{count}×</span>
                      </div>
                      <div style={{ height: '5px', borderRadius: '4px', backgroundColor: 'var(--bg-layout)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: 'linear-gradient(90deg, #490BFF, #00A3FF)', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Belum ada review tag.</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Menu Showcase + Recent Orders ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Menu Grid */}
        <div className="premium-widget" style={{
          backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
          padding: '24px', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Utensils size={16} /> Showcase Menu ({data.menus?.length || 0})
            </h4>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-layout)', padding: '3px', borderRadius: '8px' }}>
              {(['semua', 'tersedia', 'habis'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveMenuTab(tab)} style={{
                  padding: '4px 10px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: activeMenuTab === tab ? '700' : '500',
                  cursor: 'pointer', backgroundColor: activeMenuTab === tab ? 'var(--color-purple)' : 'transparent',
                  color: activeMenuTab === tab ? '#fff' : 'var(--text-muted)', fontFamily: 'var(--font-outfit)', textTransform: 'capitalize', transition: 'all 0.15s',
                }}>{tab}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {filteredMenus.length > 0 ? filteredMenus.map((menu: any) => (
              <div key={menu.id} style={{
                borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden',
                backgroundColor: 'var(--bg-layout)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Placeholder image */}
                <div style={{
                  height: '80px', background: 'linear-gradient(135deg, rgba(73,11,255,0.08), rgba(0,163,255,0.08))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Utensils size={28} color="var(--text-muted)" />
                </div>
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', marginBottom: '2px' }}>{menu.nama}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                    {menu.deskripsi || '-'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-purple)', fontFamily: 'var(--font-outfit)' }}>
                      Rp {Number(menu.harga).toLocaleString('id-ID')}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '600', color: menu.tersedia ? '#10B981' : '#EF4444' }}>
                      {menu.tersedia ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {menu.tersedia ? 'Ada' : 'Habis'}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Tidak ada menu untuk filter ini.
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="premium-widget" style={{
          backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
          padding: '24px', boxShadow: 'var(--shadow-sm)',
        }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingBag size={16} /> 10 Transaksi Terbaru
          </h4>
          {data.recentOrders?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 70px', gap: '8px', padding: '8px 10px', borderBottom: '1.5px solid var(--border-color)' }}>
                {['Pelanggan', 'Tipe', 'Total', 'Profit'].map(h => (
                  <span key={h} style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', fontFamily: 'var(--font-outfit)', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>
              {data.recentOrders.map((o: any) => (
                <div key={o.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 90px 70px', gap: '8px',
                  padding: '10px', borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-layout)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>{o.customerName}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{o.created_at}</div>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: '600', alignSelf: 'center',
                    color: o.tipe === 'dine_in' ? '#10B981' : '#F59E0B',
                    backgroundColor: o.tipe === 'dine_in' ? '#ECFDF5' : '#FFFBEB',
                    padding: '2px 6px', borderRadius: '6px', textAlign: 'center', whiteSpace: 'nowrap',
                  }}>
                    {o.tipe === 'dine_in' ? 'Dine In' : 'Take Away'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', alignSelf: 'center' }}>
                    Rp {Number(o.total_price).toLocaleString('id-ID')}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#00D65A', fontFamily: 'var(--font-outfit)', alignSelf: 'center' }}>
                    +Rp {Number(o.app_profit).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Belum ada transaksi yang selesai.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
