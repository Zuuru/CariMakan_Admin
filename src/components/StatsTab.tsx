'use client';

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  CreditCard, 
  ShoppingBag, 
  UtensilsCrossed, 
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';

interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  restoName: string;
  amount: number;
  method: 'GOPAY' | 'OVO' | 'QRIS' | 'BANK' | 'SHOPEEPAY';
  status: 'success' | 'pending' | 'failed';
  date: string;
}

interface PopularFood {
  name: string;
  resto: string;
  ordersCount: number;
  revenue: string;
}

export default function StatsTab() {
  const [txs, setTxs] = React.useState<Transaction[]>([
    { id: 'TX001', orderId: 'ORD-9874', customerName: 'M. Oksa Setyarso', restoName: 'Ideologist Cafe', amount: 85000, method: 'GOPAY', status: 'success', date: '18/12/2026 14:23' },
    { id: 'TX002', orderId: 'ORD-9875', customerName: 'Adila Dimaz', restoName: 'Parjo Sipodang', amount: 120000, method: 'QRIS', status: 'success', date: '18/12/2026 14:31' },
    { id: 'TX003', orderId: 'ORD-9876', customerName: 'Zulfikri Arya', restoName: 'Nyctiphilly Cafe', amount: 45000, method: 'OVO', status: 'pending', date: '18/12/2026 14:45' },
    { id: 'TX004', orderId: 'ORD-9877', customerName: 'Paulus Ale', restoName: 'Burjo Idaman', amount: 25000, method: 'BANK', status: 'success', date: '18/12/2026 14:50' },
    { id: 'TX005', orderId: 'ORD-9878', customerName: 'Budi Santoso', restoName: 'Ideologist Cafe', amount: 65000, method: 'SHOPEEPAY', status: 'failed', date: '18/12/2026 15:02' },
    { id: 'TX006', orderId: 'ORD-9879', customerName: 'Siti Rahma', restoName: 'Parjo Mulawarman', amount: 95000, method: 'GOPAY', status: 'success', date: '18/12/2026 15:15' },
    { id: 'TX007', orderId: 'ORD-9880', customerName: 'Dewi Lestari', restoName: 'Nyctiphilly Cafe', amount: 155000, method: 'QRIS', status: 'success', date: '18/12/2026 15:30' },
  ]);

  const [search, setSearch] = React.useState('');
  const [methodFilter, setMethodFilter] = React.useState<'ALL' | 'GOPAY' | 'QRIS' | 'OVO' | 'BANK'>('ALL');

  const popularFoods: PopularFood[] = [
    { name: 'Nasi Goreng Spesial', resto: 'Burjo Idaman', ordersCount: 1420, revenue: 'Rp 35.5jt' },
    { name: 'Es Kopi Susu Aren', resto: 'Ideologist Cafe', ordersCount: 980, revenue: 'Rp 19.6jt' },
    { name: 'Ayam Geprek Mozzarella', resto: 'Parjo Sipodang', ordersCount: 850, revenue: 'Rp 21.2jt' },
    { name: 'Matcha Latte Premium', resto: 'Nyctiphilly Cafe', ordersCount: 620, revenue: 'Rp 15.5jt' },
  ];

  // Filter transactions
  const filteredTxs = txs.filter((tx) => {
    const matchesSearch = 
      tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
      tx.restoName.toLowerCase().includes(search.toLowerCase()) ||
      tx.orderId.toLowerCase().includes(search.toLowerCase());
    
    const matchesMethod = methodFilter === 'ALL' || tx.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '32px 32px 32px 32px' }}>
      
      {/* Top 3 Quick Stats Cards for Financials */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '28px' }}>
        <div className="premium-widget" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(96,240,170,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-mint)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Volume Transaksi</span>
            <h4 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', marginTop: '2px' }}>Rp 3,450,000,000</h4>
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '500' }}>+12.4% dari bulan lalu</span>
          </div>
        </div>

        <div className="premium-widget" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(73, 11, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-purple)' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Pembayaran Sukses</span>
            <h4 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', marginTop: '2px' }}>98.2% Rate</h4>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Rata-rata payout 2 menit</span>
          </div>
        </div>

        <div className="premium-widget" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(214,17,86,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-magenta)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Rata-rata Keranjang</span>
            <h4 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)', marginTop: '2px' }}>Rp 78,500</h4>
            <span style={{ fontSize: '11px', color: 'var(--color-purple)', fontWeight: '500' }}>Didominasi menu Cafe</span>
          </div>
        </div>
      </div>

      {/* Grid: Popular foods vs Payment methods breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: Transaction list */}
        <div
          className="premium-widget"
          style={{
            gridColumn: 'span 2',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '28px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
                Log Transaksi Keuangan
              </h3>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Detail pembayaran order real-time terintegrasi dengan Midtrans API.
              </span>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '6px 12px 6px 28px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    fontSize: '12px',
                    outline: 'none',
                    backgroundColor: 'var(--bg-layout)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>ID Tx</th>
                  <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Order ID</th>
                  <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Pelanggan</th>
                  <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Restoran</th>
                  <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Total</th>
                  <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Metode</th>
                  <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: '1px solid var(--border-color)', fontSize: '13.5px', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-layout)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px', fontWeight: '600', color: 'var(--color-purple)' }}>{tx.id}</td>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{tx.orderId}</td>
                    <td style={{ padding: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{tx.customerName}</td>
                    <td style={{ padding: '14px', color: 'var(--text-primary)' }}>{tx.restoName}</td>
                    <td style={{ padding: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Rp {tx.amount.toLocaleString('id-ID')}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#F0F1F4', padding: '3px 8px', borderRadius: '4px', color: 'var(--text-primary)' }}>
                        {tx.method}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      {tx.status === 'success' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#10B981', fontWeight: '600', fontSize: '12px' }}>
                          <CheckCircle size={14} /> Berhasil
                        </span>
                      )}
                      {tx.status === 'pending' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontWeight: '600', fontSize: '12px' }}>
                          <Clock size={14} /> Pending
                        </span>
                      )}
                      {tx.status === 'failed' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#EF4444', fontWeight: '600', fontSize: '12px' }}>
                          <XCircle size={14} /> Gagal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Top Foods & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Top Selling Foods */}
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
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
                Menu Terlaris (Platform)
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Daftar menu dengan total pesanan tertinggi
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {popularFoods.map((food, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(214,17,86,0.08)',
                        color: 'var(--color-magenta)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>{food.name}</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Resto: {food.resto}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>{food.ordersCount} Ord</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rev: {food.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Ratio Breakdown */}
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
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
                Metode Pembayaran (Ratio)
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Distribusi pemakaian gateway pembayaran
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* GoPay */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                  <span>GoPay</span>
                  <span style={{ color: 'var(--color-purple)' }}>45%</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '50px', backgroundColor: 'var(--bg-layout)', overflow: 'hidden' }}>
                  <div style={{ width: '45%', height: '100%', borderRadius: '50px', background: 'var(--grad-purple)' }} />
                </div>
              </div>

              {/* QRIS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                  <span>QRIS (M-Banking)</span>
                  <span style={{ color: 'var(--color-mint)' }}>30%</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '50px', backgroundColor: 'var(--bg-layout)', overflow: 'hidden' }}>
                  <div style={{ width: '30%', height: '100%', borderRadius: '50px', backgroundColor: 'var(--color-mint)' }} />
                </div>
              </div>

              {/* OVO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                  <span>OVO / ShopeePay</span>
                  <span style={{ color: 'var(--color-magenta)' }}>15%</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '50px', backgroundColor: 'var(--bg-layout)', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', borderRadius: '50px', background: 'var(--grad-magenta)' }} />
                </div>
              </div>

              {/* Bank Transfer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                  <span>Transfer Bank (Midtrans Virtual Account)</span>
                  <span style={{ color: 'var(--color-yellow)' }}>10%</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '50px', backgroundColor: 'var(--bg-layout)', overflow: 'hidden' }}>
                  <div style={{ width: '10%', height: '100%', borderRadius: '50px', background: 'var(--grad-yellow)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
